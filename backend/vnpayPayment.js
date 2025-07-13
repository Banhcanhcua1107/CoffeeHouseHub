const express = require('express');
const router = express.Router();
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const config = require('config');
const mysql = require('mysql2');
const { sendReceiptEmail } = require('./sendMailHelper'); // Import hàm gửi mail

// Kết nối DB sử dụng biến môi trường
let dbConfig;
if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: url.port || 3306,
        ssl: { rejectUnauthorized: false }
    };
} else if (process.env.MYSQL_URL) {
    const url = new URL(process.env.MYSQL_URL);
    dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: url.port || 3306,
        ssl: { rejectUnauthorized: false }
    };
} else if (process.env.MYSQLHOST) {
    dbConfig = {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: parseInt(process.env.MYSQLPORT) || 3306,
        ssl: { rejectUnauthorized: false }
    };
} else {
    // Fallback to hardcoded Railway values
    dbConfig = {
        host: 'shortline.proxy.rlwy.net',
        user: 'root',
        password: 'KdzwBLtuALXhcyhypAILUdOUmimnmKOM',
        database: 'railway',
        port: 43930,
        ssl: { rejectUnauthorized: false }
    };
}

const db = mysql.createPool(dbConfig).promise();

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// === TẠO URL THANH TOÁN VÀ LƯU ĐƠN HÀNG ===
router.post('/create_payment_url', async function (req, res, next) {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        
        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnpUrl = config.get('vnp_Url');
        let returnUrl = config.get('vnp_ReturnUrl');
        
        let orderId = moment(date).format('DDHHmmss');
        const { amount, orderDescription, language, bankCode, userId, fullname, email, phone, address, cart } = req.body;

        // Lưu đơn hàng vào cơ sở dữ liệu với trạng thái 'pending'
        const orderData = {
            order_id: orderId,
            user_id: userId,
            customer_name: fullname,
            customer_email: email,
            customer_phone: phone,
            customer_address: address,
            total_amount: amount,
            payment_method: 'vnpay',
            order_items: JSON.stringify(cart),
            status: 'pending'
        };
        await db.query('INSERT INTO orders SET ?', orderData);

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId + '. Noi dung: ' + orderDescription;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.json({ paymentUrl: vnpUrl });

    } catch (error) {
        console.error("Lỗi khi tạo thanh toán VNPAY:", error);
        res.status(500).json({ error: 'Lỗi hệ thống khi tạo thanh toán.' });
    }
});


// === XỬ LÝ KHI VNPAY GỌI VỀ (RETURN URL) ===
router.get('/vnpay_return', function (req, res, next) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let paramsToVerify = { ...vnp_Params };
    delete paramsToVerify['vnp_SecureHash'];
    delete paramsToVerify['vnp_SecureHashType'];

    let sortedParams = sortObject(paramsToVerify);
    let secretKey = config.get('vnp_HashSecret');
    let signData = querystring.stringify(sortedParams, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    const frontendReturnUrl = 'https://coffeehousehub-production.up.railway.app/checkout/vnpay-return';
    const queryParams = querystring.stringify(req.query, { encode: true });

    if (secureHash === signed) {
        res.redirect(`${frontendReturnUrl}?${queryParams}&success=true`);
    } else {
        res.redirect(`${frontendReturnUrl}?success=false`);
    }
});

// === API MỚI: XÁC THỰC VÀ GỬI EMAIL ===
router.post('/verify-and-send-mail', async (req, res) => {
    try {
        const vnp_Params = req.body;
        const secureHash = vnp_Params['vnp_SecureHash'];

        let paramsToVerify = { ...vnp_Params };
        delete paramsToVerify['vnp_SecureHash'];
        delete paramsToVerify['vnp_SecureHashType'];
        
        let sortedParams = sortObject(paramsToVerify);
        let secretKey = config.get('vnp_HashSecret');
        let signData = querystring.stringify(sortedParams, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash !== signed) {
            return res.status(400).json({ success: false, error: 'Chữ ký không hợp lệ.' });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        // Lấy thông tin đơn hàng từ DB
        const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng.' });
        }
        const order = orders[0];

        // Chỉ xử lý khi đơn hàng đang chờ và thanh toán thành công
        if (order.status === 'pending' && responseCode === '00') {
            // Cập nhật trạng thái đơn hàng
            await db.query('UPDATE orders SET status = ? WHERE order_id = ?', ['completed', orderId]);

            // Gửi email biên lai
            await sendReceiptEmail({
                to: order.customer_email,
                orderId: order.order_id,
                amount: order.total_amount,
                time: new Date().toLocaleString('vi-VN'),
                orderInfo: JSON.parse(order.order_items), // Giả sử order_items là JSON
                fullname: order.customer_name,
                phone: order.customer_phone,
                address: order.customer_address,
            });

            console.log(`(VNPAY Verify) Đã gửi biên lai cho ${order.customer_email}`);
            return res.json({ success: true, message: 'Đã gửi email thành công.' });

        } else if (order.status === 'completed') {
            return res.json({ success: true, message: 'Đơn hàng đã được xử lý trước đó.' });
        } else {
            await db.query('UPDATE orders SET status = ? WHERE order_id = ?', ['failed', orderId]);
            return res.status(400).json({ success: false, error: 'Giao dịch không thành công.' });
        }

    } catch (error) {
        console.error('(VNPAY Verify) Lỗi hệ thống:', error);
        res.status(500).json({ success: false, error: 'Lỗi hệ thống khi xác thực giao dịch.' });
    }
});


// === XỬ LÝ KHI VNPAY GỌI VỀ (IPN URL) ===
router.get('/vnpay_ipn', async (req, res, next) => {
    // Tương tự, bạn có thể tích hợp logic cập nhật DB và gửi mail ở đây
    // để đảm bảo ngay cả khi người dùng không quay lại trang return thì đơn hàng vẫn được xử lý.
    // Mã IPN hiện tại đã ổn, có thể nâng cấp sau.
    res.status(200).json({ RspCode: '00', Message: 'Success' });
});


module.exports = router;