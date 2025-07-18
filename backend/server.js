// server.js
const express = require("express");
const mysql = require("mysql2/promise"); // Sử dụng promise-based
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const momoPayment = require('./momoPayment');
// const sendMailHelper = require('./sendMailHelper');
const { sendReceiptEmail, sendCancellationEmail } = require('./sendMailHelper');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
// const { Order } = require('./models');



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình bộ nhớ lưu trữ cho Multer sử dụng Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'coffee_house',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});
const upload = multer({ storage: cloudinaryStorage });


const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.csv')
    }
});
const uploadCsv = multer({ storage: diskStorage });

const app = express();


const allowedOrigins = [
  'https://coffeehousehub-production.up.railway.app',
  'https://coffee-backend.up.railway.app',
  'https://coffeehousehub.vercel.app',
  'https://coffe-website-steel.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log origin for debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Request origin:', origin);
  }
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  } else if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Origin not allowed:', origin);
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const saltRounds = 10;
const jwtSecret = 'your_jwt_secret_key';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Đảm bảo đây là Mật khẩu ứng dụng (App Password)
    },
    tls: {
        rejectUnauthorized: false
    }
});



let dbPool;

async function initializeDatabase() {
    try {
        // Debug: Log all environment variables
        console.log('🔍 Environment Variables Debug:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'MISSING');
        console.log('DB_DATABASE:', process.env.DB_DATABASE);
        console.log('DB_PORT:', process.env.DB_PORT);
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('PORT:', process.env.PORT);
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'MISSING');
        
        // Check for Railway's MySQL variables
        console.log('MYSQL_URL:', process.env.MYSQL_URL ? '***SET***' : 'MISSING');
        console.log('MYSQLHOST:', process.env.MYSQLHOST);
        console.log('MYSQLUSER:', process.env.MYSQLUSER);
        console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '***SET***' : 'MISSING');
        console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
        console.log('MYSQLPORT:', process.env.MYSQLPORT);

        let dbConfig;

        // Priority 1: Check for DATABASE_URL
        if (process.env.DATABASE_URL) {
            console.log('📡 Using DATABASE_URL connection string');
            try {
                const url = new URL(process.env.DATABASE_URL);
                dbConfig = {
                    host: url.hostname,
                    user: url.username,
                    password: url.password,
                    database: url.pathname.slice(1),
                    port: parseInt(url.port) || 3306,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    ssl: {
                        rejectUnauthorized: false
                    }
                };
            } catch (urlError) {
                console.error('❌ Error parsing DATABASE_URL:', urlError);
                throw new Error('Invalid DATABASE_URL format');
            }
        } 
        // Priority 2: Check for MYSQL_URL (Railway's format)
        else if (process.env.MYSQL_URL) {
            console.log('📡 Using MYSQL_URL connection string');
            try {
                const url = new URL(process.env.MYSQL_URL);
                dbConfig = {
                    host: url.hostname,
                    user: url.username,
                    password: url.password,
                    database: url.pathname.slice(1),
                    port: parseInt(url.port) || 3306,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    ssl: {
                        rejectUnauthorized: false
                    }
                };
            } catch (urlError) {
                console.error('❌ Error parsing MYSQL_URL:', urlError);
                throw new Error('Invalid MYSQL_URL format');
            }
        }
        // Priority 3: Check for Railway's individual MySQL variables
        else if (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLPASSWORD && process.env.MYSQLDATABASE) {
            console.log('📡 Using Railway MySQL individual variables');
            dbConfig = {
                host: process.env.MYSQLHOST,
                user: process.env.MYSQLUSER,
                password: process.env.MYSQLPASSWORD,
                database: process.env.MYSQLDATABASE,
                port: parseInt(process.env.MYSQLPORT) || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                ssl: {
                    rejectUnauthorized: false
                }
            };
        }
        // Priority 4: Check for custom DB_ variables
        else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_DATABASE) {
            console.log('📡 Using custom DB_ environment variables');
            dbConfig = {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                port: parseInt(process.env.DB_PORT) || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                ssl: {
                    rejectUnauthorized: false
                }
            };
        }
        // Priority 5: Fallback to hardcoded values for Railway (temporary)
        else {
            console.log('⚠️  Using fallback configuration - this should be temporary!');
            dbConfig = {
                host: 'shortline.proxy.rlwy.net',
                user: 'root',
                password: 'KdzwBLtuALXhcyhypAILUdOUmimnmKOM',
                database: 'railway',
                port: 43930,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                ssl: {
                    rejectUnauthorized: false
                }
            };
        }

        console.log('📡 Database configuration:', {
            host: dbConfig.host,
            user: dbConfig.user,
            database: dbConfig.database,
            port: dbConfig.port,
            ssl: dbConfig.ssl ? 'enabled' : 'disabled'
        });

        dbPool = mysql.createPool(dbConfig);
        
        // Test connection with simple query
        console.log('🔄 Testing database connection...');
        const testQuery = await Promise.race([
            dbPool.query("SELECT 1 as test"),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 15000)
            )
        ]);
        
        console.log("✅ Database connection successful!");
        console.log("📊 Test query result:", testQuery[0]);
        
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        console.error("📄 Full error details:", err);
        
        // In production, retry after a delay
        if (process.env.NODE_ENV === 'production') {
            console.log('⏳ Retrying database connection in 10 seconds...');
            setTimeout(() => {
                initializeDatabase();
            }, 10000);
        } else {
            console.log('💀 Exiting due to database connection failure in development mode');
            process.exit(1);
        }
    }
}

initializeDatabase();




const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
};

app.get('/api/admin/revenue', async (req, res) => {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
    }

    try {
        // Sử dụng dbPool và SQL thuần, giống như phần còn lại của ứng dụng
        const sql = `
            SELECT
                DAY(order_date) AS day,
                SUM(total_amount) AS dailyTotal
            FROM
                orders
            WHERE
                payment_status = 'paid'
                AND YEAR(order_date) = ?
                AND MONTH(order_date) = ?
            GROUP BY
                DAY(order_date)
            ORDER BY
                day ASC;
        `;

        // Thực thi câu lệnh SQL với dbPool
        const [orders] = await dbPool.query(sql, [year, month]);

        // Xử lý dữ liệu để trả về cho frontend
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = {};
        for (let i = 1; i <= daysInMonth; i++) {
            dailyData[i] = 0; // Khởi tạo tất cả các ngày trong tháng với doanh thu = 0
        }

        let totalMonthlyRevenue = 0;
        orders.forEach(order => {
            // 'day' và 'dailyTotal' là tên cột trả về từ câu SQL
            dailyData[order.day] = parseFloat(order.dailyTotal);
            totalMonthlyRevenue += parseFloat(order.dailyTotal);
        });

        res.json({
            dailyRevenue: dailyData,
            total: totalMonthlyRevenue
        });

    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/orders/user-cancel/:orderId', authenticateJWT, async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    try {
        // Lấy thông tin đơn hàng để kiểm tra
        const [[order]] = await dbPool.query('SELECT user_id, order_status, order_date FROM orders WHERE id = ?', [orderId]);

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
        }

        // Kiểm tra quyền: Phải là chủ đơn hàng
        if (order.user_id !== userId) {
            return res.status(403).json({ error: 'Bạn không có quyền hủy đơn hàng này.' });
        }

        // Kiểm tra trạng thái: Chỉ được hủy khi đang 'processing'
        if (order.order_status !== 'processing') {
            return res.status(400).json({ error: `Không thể hủy đơn hàng ở trạng thái "${order.order_status}".` });
        }

        // Kiểm tra thời gian: Chỉ được hủy trong 10 phút
        const timeDiffMinutes = (new Date() - new Date(order.order_date)) / (1000 * 60);
        if (timeDiffMinutes > 10) {
            return res.status(400).json({ error: 'Đã quá thời gian cho phép hủy đơn (10 phút).' });
        }

        // Nếu tất cả điều kiện đều ổn, tiến hành hủy
        const cancellation_reason = 'Người dùng tự hủy.';
        await dbPool.query(
            'UPDATE orders SET order_status = "cancelled", cancellation_reason = ? WHERE id = ?',
            [cancellation_reason, orderId]
        );

        res.json({ success: true, message: 'Đã hủy đơn hàng thành công.' });
    } catch (error) {
        console.error("Lỗi khi user hủy đơn hàng:", error);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
});


// Helper Functions
const createNotification = async (userId, message, link = null) => {
    try {
        await dbPool.query(
            'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
            [userId, message, link]
        );
        console.log(`Đã tạo thông báo cho user ${userId}: ${message}`);
    } catch (error) {
        console.error(`Lỗi khi tạo thông báo cho user ${userId}:`, error);
    }
};



const createOrderInDb = async (orderData) => {
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // Bước 1: Luôn tạo bản ghi chính trong bảng 'orders'
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, order_code, fullname, email, phone, address, note, total_amount, payment_method, payment_status, order_status, cancellation_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                orderData.userId,
                orderData.orderCode,
                orderData.fullname,
                orderData.email,
                orderData.phone,
                orderData.address,
                orderData.note,
                orderData.amount,
                orderData.paymentMethod,
                orderData.paymentStatus || 'pending',
                orderData.orderStatus || 'processing',
                orderData.cancellationReason || null
            ]
        );
        const newOrderId = orderResult.insertId;

        // Bước 2: Luôn lưu các sản phẩm vào 'order_items'
        if (orderData.cart && Array.isArray(orderData.cart)) {
            const itemPromises = orderData.cart.map(item => {
                return connection.query(
                    'INSERT INTO order_items (order_id, product_id, product_type, product_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
                    [newOrderId, item.productId, item.type, item.name, item.quantity, item.price]
                );
            });
            await Promise.all(itemPromises);
        }

        // =================================================================
        // THAY ĐỔI LOGIC XÓA GIỎ HÀNG TẠI ĐÂY
        // Xóa giỏ hàng cho mọi đơn hàng được đặt thành công (không bị hủy).
        // =================================================================
        if (orderData.orderStatus !== 'cancelled' && orderData.userId) {
            await connection.query('DELETE FROM cart WHERE user_id = ?', [orderData.userId]);
        }

        await connection.commit();
        return { success: true, orderId: newOrderId, orderCode: orderData.orderCode };
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi tạo đơn hàng (DB Transaction):', error);
        throw error;
    } finally {
        connection.release();
    }
};

// Main Routes
app.get("/", (req, res) => {
    res.send("Coffee House API");
});

app.use('/momo', momoPayment);

// Order & Payment Routes
app.get('/orders', authenticateJWT, adminOnly, async (req, res) => {
    try {
        const [orders] = await dbPool.query(
            `SELECT o.*, oi.product_id, oi.product_type, oi.product_name, oi.quantity, oi.price,
              CASE 
                WHEN oi.product_type = 'product' THEN p.image
                WHEN oi.product_type = 'cafe' THEN c.img
                ELSE NULL
              END AS image
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id AND oi.product_type = 'product'
       LEFT JOIN cafe c ON oi.product_id = c.id AND oi.product_type = 'cafe'`
        );

        // Nhóm các mục trong đơn hàng
        const groupedOrders = [];
        const orderMap = {};

        for (const row of orders) {
            if (!orderMap[row.id]) {
                orderMap[row.id] = {
                    id: row.id,
                    order_code: row.order_code,
                    created_at: row.order_date,
                    fullname: row.fullname,
                    email: row.email,
                    phone: row.phone,
                    address: row.address,
                    payment_method: row.payment_method,
                    payment_status: row.payment_status,
                    order_status: row.order_status,
                    total_amount: row.total_amount,
                    items: [],
                };
                groupedOrders.push(orderMap[row.id]);
            }
            if (row.product_id) {
                orderMap[row.id].items.push({
                    id: row.product_id,
                    product_name: row.product_name,
                    quantity: row.quantity,
                    price: row.price,
                    image: row.image,
                });
            }
        }

        res.json(groupedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/orders/create-cod', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderCode, fullname, email, phone, address, note, amount, cart } = req.body;

        const result = await createOrderInDb({
            userId, orderCode, fullname, email, phone, address, note,
            amount: Number(amount),
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderStatus: 'processing',
            cart
        });

        await createNotification(userId, `Bạn đã đặt thành công đơn hàng #${result.orderCode}.`, `/don-hang/${result.orderCode}`);
        await sendReceiptEmail({
            to: email, orderId: result.orderCode, amount: Number(amount),
            time: new Date().toLocaleString('vi-VN'),
            orderInfo: cart, fullname, phone, address
        });

        // =============================================================
        // THAY ĐỔI Ở ĐÂY: Trả về thêm orderCode
        // =============================================================
        res.status(201).json({
            success: true,
            message: 'Đặt hàng COD thành công.',
            orderId: result.orderId,
            orderCode: result.orderCode // Thêm dòng này
        });

    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng COD:', error);
        res.status(500).json({ error: 'Lỗi hệ thống khi tạo đơn hàng.' });
    }
});
app.get('/order/:orderCode', authenticateJWT, async (req, res) => {
    const { orderCode } = req.params;
    const { id: userId, role } = req.user;

    try {
        // 1. Lấy thông tin cơ bản của đơn hàng
        const [[order]] = await dbPool.query('SELECT * FROM orders WHERE order_code = ?', [orderCode]);

        // 2. Kiểm tra xem đơn hàng có tồn tại không
        if (!order) {
            console.log(`[404] Không tìm thấy đơn hàng với code: ${orderCode}`); // Thêm log để debug
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
        }

        // 3. Kiểm tra quyền: Hoặc là admin, hoặc là chủ đơn hàng
        if (role !== 'admin' && order.user_id !== userId) {
            console.log(`[403] User ${userId} không có quyền xem đơn hàng ${orderCode} của user ${order.user_id}`); // Thêm log
            return res.status(403).json({ error: 'Bạn không có quyền xem đơn hàng này.' });
        }

        // 4. Lấy các sản phẩm trong đơn hàng
        const [items] = await dbPool.query(`
            SELECT oi.*,
                   CASE 
                     WHEN oi.product_type = 'product' THEN p.image
                     WHEN oi.product_type = 'cafe' THEN c.img
                     ELSE NULL
                   END AS image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id AND oi.product_type = 'product'
            LEFT JOIN cafe c ON oi.product_id = c.id AND oi.product_type = 'cafe'
            WHERE oi.order_id = ?
        `, [order.id]);

        const timeDiffMinutes = (new Date() - new Date(order.order_date)) / (1000 * 60);

        // Tạo một trường boolean để cho frontend biết có được phép hủy hay không
        const can_be_cancelled_by_user =
            order.order_status === 'processing' && timeDiffMinutes < 10;
        // ===================================================================

        // 5. Gộp lại và trả về kết quả (bao gồm cả trường mới)
        const result = {
            ...order,
            items,
            can_be_cancelled: can_be_cancelled_by_user // Thêm trường này vào response
        };
        console.log(`[200] Đã trả về chi tiết đơn hàng ${orderCode} cho user ${userId}`);
        res.json(result);

    } catch (err) {
        console.error(`[500] Lỗi khi lấy chi tiết đơn hàng ${orderCode}:`, err);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
});

app.put('/orders/:id/status', authenticateJWT, adminOnly, async (req, res) => {
    const { id } = req.params;
    // Thêm cancellation_reason vào body
    const { order_status, payment_status, cancellation_reason } = req.body;

    if (!order_status && !payment_status) {
        return res.status(400).json({ error: 'Không có trạng thái nào được cung cấp để cập nhật.' });
    }

    try {
        // Lấy thông tin đơn hàng để gửi mail/thông báo
        const [[order]] = await dbPool.query('SELECT user_id, order_code, email FROM orders WHERE id = ?', [id]);
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
        }

        let sql = 'UPDATE orders SET ';
        const params = [];

        if (order_status) {
            sql += 'order_status = ? ';
            params.push(order_status);
        }

        if (payment_status) {
            sql += (params.length > 0 ? ', ' : '') + 'payment_status = ? ';
            params.push(payment_status);
        }

        // Logic cho việc hủy đơn
        if (order_status === 'cancelled') {
            const reason = cancellation_reason || 'Bị hủy bởi quản trị viên.';
            sql += (params.length > 0 ? ', ' : '') + 'cancellation_reason = ? ';
            params.push(reason);

            // Gửi email và thông báo cho người dùng
            await sendCancellationEmail({ // <-- SỬ DỤNG HÀM MỚI
                to: order.email,
                orderId: order.order_code,
                reason: reason
            });
            await createNotification(
                order.user_id,
                `Đơn hàng #${order.order_code} của bạn đã bị hủy. Lý do: ${reason}`,
                `/don-hang/${order.order_code}`
            );
        } else if (order_status) { // Gửi thông báo cho các trạng thái khác
            await createNotification(
                order.user_id,
                `Trạng thái đơn hàng #${order.order_code} đã được cập nhật thành: ${order_status}.`,
                `/don-hang/${order.order_code}`
            );
        }


        sql += 'WHERE id = ?';
        params.push(id);

        const [result] = await dbPool.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng để cập nhật.' });
        }

        res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng thành công.' });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
});

app.post('/momo/verify-and-send-mail', async (req, res) => {
    const { orderId, amount, extraData, resultCode, message } = req.body;

    try {
        // Luôn kiểm tra đơn hàng trùng lặp
        const [[existingOrder]] = await dbPool.query('SELECT id FROM orders WHERE order_code = ?', [orderId]);
        if (existingOrder) {
            console.log(`[INFO] Đơn hàng ${orderId} đã tồn tại. Bỏ qua xử lý.`);
            return res.json({ success: true, message: 'Đơn hàng đã được xử lý trước đó.' });
        }

        const customerInfo = JSON.parse(Buffer.from(extraData, 'base64').toString());

        // Xử lý khi giao dịch MoMo thất bại hoặc bị hủy
        if (resultCode != 0) {
            const reason = `Giao dịch MoMo thất bại: ${message}`;
            const failedOrderData = {
                userId: customerInfo.userId,
                orderCode: orderId,
                fullname: customerInfo.fullname,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                note: customerInfo.note,
                amount: Number(amount),
                paymentMethod: 'momo',
                paymentStatus: 'failed',      // Trạng thái thanh toán thất bại
                orderStatus: 'cancelled',     // Trạng thái đơn hàng bị hủy
                cancellationReason: reason,   // Lý do hủy
                cart: customerInfo.cart       // Vẫn truyền cart để log nếu cần, nhưng sẽ không insert items
            };

            // Tạo một bản ghi đơn hàng "hủy" trong DB
            await createOrderInDb(failedOrderData);

            // Gửi thông báo cho người dùng
            if (customerInfo.userId) {
                await createNotification(customerInfo.userId, `Đơn hàng #${orderId} đã bị hủy do thanh toán không thành công.`, `/don-hang/${orderId}`);
            }

            // Trả về lỗi cho frontend để hiển thị trang thất bại
            return res.status(400).json({ success: false, error: message });
        }

        // Xử lý khi giao dịch thành công
        const successfulOrderData = {
            userId: customerInfo.userId,
            orderCode: orderId,
            fullname: customerInfo.fullname,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
            note: customerInfo.note,
            amount: Number(amount),
            paymentMethod: 'momo',
            paymentStatus: 'paid',         // Trạng thái thanh toán thành công
            orderStatus: 'processing',     // Trạng thái đơn hàng đang xử lý
            cart: customerInfo.cart
        };

        // Tạo đơn hàng thành công trong DB
        const result = await createOrderInDb(successfulOrderData);

        // Tạo thông báo và gửi email
        await createNotification(customerInfo.userId, `Bạn đã đặt thành công đơn hàng #${result.orderCode}.`, `/don-hang/${result.orderCode}`);
        await sendReceiptEmail({
            to: customerInfo.email,
            orderId: result.orderCode,
            amount: successfulOrderData.amount,
            time: new Date().toLocaleString('vi-VN'),
            orderInfo: customerInfo.cart,
            fullname: customerInfo.fullname,
            phone: customerInfo.phone,
            address: customerInfo.address
        });

        console.log(`[SUCCESS] Đã xử lý thành công đơn hàng mới ${orderId}.`);
        console.log(`[INFO] Giỏ hàng của user ${customerInfo.userId} đã được clear.`);
        return res.json({ success: true, message: 'Đã tạo đơn hàng và gửi email thành công.' });

    } catch (err) {
        console.error(`[FATAL ERROR] Lỗi khi xử lý đơn hàng ${orderId}:`, err);
        return res.status(500).json({ success: false, error: 'Lỗi hệ thống khi xử lý đơn hàng của bạn.' });
    }
});

// Authentication Routes
app.post("/register", async (req, res) => {
    const { username, email, password, fullname } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = 'INSERT INTO users (username, email, password, fullname, role) VALUES (?, ?, ?, ?, "user")';
        await dbPool.query(sql, [username, email, hashedPassword, fullname]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const sql = 'SELECT id, username, email, password, role, fullname FROM users WHERE email = ?';
        const [results] = await dbPool.query(sql, [email]);
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '1h' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email, fullname: user.fullname, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User & Admin Routes
app.get("/user", authenticateJWT, async (req, res) => {
    try {
        const sql = 'SELECT id, username, email, fullname, role FROM users WHERE id = ?';
        const [results] = await dbPool.query(sql, [req.user.id]);
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/admin/users", authenticateJWT, adminOnly, async (req, res) => {
    try {
        const sql = 'SELECT id, username, email, fullname, role FROM users';
        const [results] = await dbPool.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/admin/users', authenticateJWT, adminOnly, async (req, res) => {
    try {
        console.log('Fetching users list - Admin request from:', req.user.id);
        const [users] = await dbPool.query(
            'SELECT id, username, email, fullname, role FROM users WHERE role != "admin" ORDER BY id DESC'
        );

        console.log(`Found ${users.length} users`);
        res.json(users);
    } catch (err) {
        console.error('Error in /api/admin/users:', err);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách người dùng',
            error: err.message
        });
    }
});

app.put('/api/admin/users/:id', authenticateJWT, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { fullname, email, password } = req.body;

    try {
        let sql = 'UPDATE users SET ';
        const values = [];

        if (fullname) {
            sql += 'fullname = ?, ';
            values.push(fullname);
        }
        if (email) {
            sql += 'email = ?, ';
            values.push(email);
        }
        if (password) {
            const hashed = await bcrypt.hash(password, saltRounds);
            sql += 'password = ?, ';
            values.push(hashed);
        }

        if (values.length === 0) {
            return res.status(400).json({ error: "Không có trường nào để cập nhật." });
        }

        sql = sql.slice(0, -2) + ' WHERE id = ?';
        values.push(id);

        await dbPool.query(sql, values);
        res.json({ success: true, message: "Đã cập nhật thông tin user." });
    } catch (err) {
        console.error("Lỗi khi cập nhật user:", err);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
});


// Thêm vào file server.js

app.put('/api/admin/users/:id/role', authenticateJWT, adminOnly, async (req, res) => {
    const { id: targetUserId } = req.params; // Lấy ID của user cần thay đổi
    const { id: adminUserId } = req.user;    // Lấy ID của admin đang thực hiện hành động
    const { role } = req.body;

    // Ngăn admin tự thay đổi vai trò của chính mình
    if (targetUserId == adminUserId) {
        return res.status(403).json({ error: 'Bạn không thể thay đổi vai trò của chính mình.' });
    }

    // Kiểm tra xem vai trò được gửi lên có hợp lệ không
    if (!role || (role !== 'admin' && role !== 'user')) {
        return res.status(400).json({ error: 'Vai trò không hợp lệ. Chỉ chấp nhận "admin" hoặc "user".' });
    }

    try {
        const [result] = await dbPool.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, targetUserId]
        );

        // Nếu không có dòng nào được cập nhật, nghĩa là không tìm thấy user
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        res.json({ success: true, message: 'Đã cập nhật vai trò người dùng thành công.' });
    } catch (error) {
        console.error("Lỗi khi cập nhật vai trò:", error);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
});

// Product & Cafe Routes
app.get("/cafe", async (req, res) => {
    try {
        const [result] = await dbPool.query("SELECT * FROM cafe ORDER BY id DESC");
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post("/cafes", authenticateJWT, adminOnly, upload.single('img'), async (req, res) => {
    try {
        // Multer sẽ xử lý file và đưa vào req.file, các trường text vào req.body
        const { name, price, desc } = req.body;

        // Bắt buộc phải có file ảnh
        if (!req.file) {
            return res.status(400).json({ error: "Vui lòng cung cấp hình ảnh cho món." });
        }
        // Bắt buộc phải có tên và giá
        if (!name || !price) {
            return res.status(400).json({ error: "Tên và giá là các trường bắt buộc." });
        }

        // Lấy URL ảnh sau khi Cloudinary xử lý xong
        const imageUrl = req.file.path;

        const [result] = await dbPool.query(
            "INSERT INTO cafe (name, price, `desc`, img) VALUES (?, ?, ?, ?)",
            [name, price, desc || null, imageUrl]
        );
        res.status(201).json({ message: "Đã thêm món mới thành công", id: result.insertId });
    } catch (err) {
        console.error("Lỗi khi thêm món trong /cafes:", err);
         res.status(500).json({ 
            error: "Lỗi server khi thêm món mới.",
            details: err.message,
            stack: err.stack,        // Xem ngắn gọn cũng đủ rồi
            body: req.body,          // Thử in ra body gửi lên để debug
            file: req.file           // Xem file nhận được có đúng không
        });
    }
});

app.put("/cafes/:id", authenticateJWT, adminOnly, upload.single('img'), async (req, res) => {
    const { id } = req.params;
    const { name, price, desc } = req.body;
    let imageUrl = req.body.img_url; // Lấy URL ảnh cũ nếu không có ảnh mới

    if (req.file) { // Nếu có ảnh mới được tải lên
        imageUrl = req.file.path;
    }

    if (!name || !price) {
        return res.status(400).json({ error: "Tên và giá là bắt buộc." });
    }

    try {
        await dbPool.query(
            "UPDATE cafe SET name = ?, price = ?, `desc` = ?, img = ? WHERE id = ?",
            [name, price, desc, imageUrl, id]
        );
        res.json({ message: "Đã cập nhật món thành công." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete("/cafes/:id", authenticateJWT, adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        await dbPool.query("DELETE FROM cafe WHERE id = ?", [id]);
        res.json({ message: "Đã xóa món thành công." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/products", async (req, res) => {
    try {
        const [result] = await dbPool.query("SELECT * FROM products ORDER BY id DESC");
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post("/products", authenticateJWT, adminOnly, upload.single('image'), async (req, res) => {
    try {
        // Multer đã xử lý và đưa các trường vào req.body và req.file
        const {
            name,
            price,
            original,
            description,
            sale,
            short_description,
            sku,
            category,
            tags
        } = req.body;

        // Bắt buộc phải có file ảnh
        if (!req.file) {
            return res.status(400).json({ error: "Vui lòng cung cấp hình ảnh cho sản phẩm." });
        }
        // Bắt buộc phải có tên và giá
        if (!name || !price) {
            return res.status(400).json({ error: "Tên và giá bán là các trường bắt buộc." });
        }

        const imageUrl = req.file.path; // URL từ Cloudinary
        const isSale = sale === 'true' ? 1 : 0;

        const sql = `
            INSERT INTO products 
            (name, price, original, description, image, sale, short_description, sku, category, tags) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            name,
            price,
            original || null,
            description || null,
            imageUrl,
            isSale,
            short_description || null,
            sku || null,
            category || null,
            tags || null
        ];

        const [result] = await dbPool.query(sql, values);

        res.status(201).json({ message: "Đã thêm sản phẩm mới thành công", id: result.insertId });
    } catch (err) {
        console.error("Lỗi khi thêm sản phẩm trong /products:", err);
        res.status(500).json({ error: "Lỗi server khi thêm sản phẩm mới.", details: err.message });
    }
});
app.post("/products/import", authenticateJWT, adminOnly, uploadCsv.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Không có file nào được tải lên.' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;
    const filePath = req.file.path;

    // Sử dụng stream để đọc file lớn mà không tốn nhiều bộ nhớ
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            // data là một object đại diện cho 1 dòng trong file CSV
            // Ví dụ: { name: 'Cà phê Robusta', price: '120000', ... }
            results.push(data);
        })
        .on('end', async () => {
            // Sau khi đọc xong file, bắt đầu thêm vào DB
            const connection = await dbPool.getConnection();
            try {
                await connection.beginTransaction();

                for (const [index, product] of results.entries()) {
                    // Kiểm tra dữ liệu cơ bản
                    if (!product.name || !product.price) {
                        errors.push({ row: index + 2, error: 'Thiếu Tên hoặc Giá bán' });
                        continue; // Bỏ qua dòng này
                    }

                    // Dữ liệu từ file CSV
                    const sql = `
                        INSERT INTO products 
                        (name, price, original, description, image, sale, short_description, sku, category, tags) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    // Vì không thể upload ảnh qua CSV, ta dùng 1 ảnh placeholder
                    // Admin sẽ vào sửa ảnh sau nếu cần
                    const placeholderImage = 'https://res.cloudinary.com/dzug6i8vq/image/upload/v1719920194/coffee_house/placeholder_product_image.png';

                    const imageUrl = product.image_url || placeholderImage;

                    const values = [
                        product.name,
                        parseFloat(product.price) || 0,
                        product.original ? parseFloat(product.original) : null,
                        product.description || null,
                        imageUrl, // Sử dụng giá trị imageUrl đã được xác định
                        product.sale === '1' || product.sale?.toLowerCase() === 'true' ? 1 : 0,
                        product.short_description || null,
                        product.sku || null,
                        product.category || null,
                        product.tags || null
                    ];

                    await connection.query(sql, values);
                    processedCount++;
                }

                await connection.commit();
                res.json({
                    success: true,
                    message: `Hoàn tất! Đã nhập thành công ${processedCount} sản phẩm.`,
                    errors: errors
                });

            } catch (error) {
                await connection.rollback();
                console.error('Lỗi khi nhập hàng loạt:', error);
                res.status(500).json({ error: 'Lỗi server khi xử lý file.' });
            } finally {
                connection.release();
                // Xóa file tạm sau khi xử lý xong
                fs.unlinkSync(filePath);
            }
        });
});

app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const [results] = await dbPool.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/products/:id", authenticateJWT, adminOnly, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, price, original, description, sale, short_description, sku, category, tags } = req.body;
    let imageUrl = req.body.image_url; // Lấy URL ảnh cũ

    if (req.file) { // Nếu có ảnh mới
        imageUrl = req.file.path;
    }

    const isSale = sale === 'true' || sale === '1' ? 1 : 0;

    try {
        const sql = `
            UPDATE products SET 
            name = ?, price = ?, original = ?, description = ?, image = ?, sale = ?, 
            short_description = ?, sku = ?, category = ?, tags = ? 
            WHERE id = ?
        `;
        const values = [name, price, original || null, description, imageUrl, isSale, short_description, sku, category, tags, id];
        await dbPool.query(sql, values);
        res.json({ message: "Đã cập nhật sản phẩm thành công." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MỚI: Route để XÓA một sản phẩm ---
app.delete("/products/:id", authenticateJWT, adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        await dbPool.query("DELETE FROM products WHERE id = ?", [id]);
        res.json({ message: "Đã xóa sản phẩm thành công." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cart Routes
app.post("/cart/add", authenticateJWT, async (req, res) => {
    try {
        const { productId, type, quantity = 1, image } = req.body;
        const userId = req.user.id;

        const table = type === 'cafe' ? 'cafe' : 'products';
        const [results] = await dbPool.query(`SELECT id, name, price, ${type === 'cafe' ? 'img' : 'image'} as image FROM ${table} WHERE id = ?`, [productId]);
        if (results.length === 0) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

        const condition = type === 'cafe'
            ? 'id_cafe = ? AND type = "cafe" AND user_id = ?'
            : 'id_product = ? AND type = "product" AND user_id = ?';

        const [cartResults] = await dbPool.query(`SELECT cartid, quantity FROM cart WHERE ${condition}`, [productId, userId]);

        if (cartResults.length > 0) {
            const newQuantity = cartResults[0].quantity + quantity;
            await dbPool.query(`UPDATE cart SET quantity = ? WHERE cartid = ?`, [newQuantity, cartResults[0].cartid]);
            res.json({ message: "Đã cập nhật giỏ hàng" });
        } else {
            const insertData = {
                [type === 'cafe' ? 'id_cafe' : 'id_product']: productId,
                type, quantity, user_id: userId, image: image || results[0].image
            };
            await dbPool.query(`INSERT INTO cart SET ?`, insertData);
            res.json({ message: "Đã thêm vào giỏ hàng" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/cart/select", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const sql = `
            SELECT cart.cartid, cart.quantity, cart.type, cart.image as cart_image,
                   COALESCE(cafe.id, products.id) as productId,
                   COALESCE(cafe.name, products.name) as name,
                   COALESCE(cafe.price, products.price) as price,
                   COALESCE(cafe.img, products.image) as product_image
            FROM cart
            LEFT JOIN cafe ON cart.id_cafe = cafe.id AND cart.type = 'cafe'
            LEFT JOIN products ON cart.id_product = products.id AND cart.type = 'product'
            WHERE cart.user_id = ?`;
        const [results] = await dbPool.query(sql, [userId]);
        const processedResults = results.map(item => ({ ...item, image: item.cart_image || item.product_image }));
        res.json(processedResults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/cart/:id", authenticateJWT, async (req, res) => {
    try {
        const { quantity } = req.body;
        await dbPool.query("UPDATE cart SET quantity = ? WHERE cartid = ? AND user_id = ?", [quantity, req.params.id, req.user.id]);
        res.json({ message: "Quantity updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/cart/:id", authenticateJWT, async (req, res) => {
    try {
        await dbPool.query("DELETE FROM cart WHERE cartid = ? AND user_id = ?", [req.params.id, req.user.id]);
        res.json({ message: "Item removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Password Reset Routes
app.post("/request-password-reset", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        console.log(`[1] Nhận được yêu cầu đặt lại mật khẩu cho email: ${email}`);
        const [results] = await dbPool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (results.length === 0) {
            console.log(`[!] Email không tồn tại trong DB: ${email}`);
            return res.status(404).json({ error: 'Email not found' });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await dbPool.query('UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE email = ?', [resetCode, expiresAt, email]);
        console.log(`[2] Đã tạo mã reset (${resetCode}) và lưu vào DB cho ${email}`);

        const mailOptions = {
            from: `"Coffee House" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã xác nhận đặt lại mật khẩu',
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0e6; padding: 40px 0;">
                <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #4B2E2E 0%, #A47148 100%); padding: 30px; text-align: center;">
                    <img src="cid:logo-bien-lai" alt="Coffee House Logo" style="height: 50px;" /> 
                    <h1 style="color: #fff; margin: 15px 0 0; font-weight: 600; letter-spacing: 2px;">KHÔI PHỤC MẬT KHẨU</h1>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    Mã xác nhận đặt lại mật khẩu của bạn là:
                    </p>
                    <div style="font-size: 32px; font-weight: bold, letter-spacing: 10px; margin: 25px 0; background: #f9f5f0; color: #A47148; padding: 18px; border-radius: 10px; text-align: center;">
                    ${resetCode}
                    </div>
                    <p style="color: #888; font-size: 15px;">Mã này có hiệu lực trong 5 phút.</p>
                </div>
                </div>
            </div>`,
            attachments: [{
                filename: 'bienlaigmail.png',
                path: path.join(__dirname, '..', 'src', 'components', 'img', 'LOGOCOFFE', 'bienlaigmail.png'),
                cid: 'logo-bien-lai'
            }]
        };

        console.log(`[3] Đang chuẩn bị gửi mail tới: ${email} với thông tin từ user: ${process.env.EMAIL_USER}`);
        await transporter.sendMail(mailOptions);
        console.log(`[4] Đã gửi mail thành công tới: ${email}`);

        res.json({ message: 'Mã xác nhận đã được gửi đến email của bạn.' });

    } catch (err) {
        // Log lỗi chi tiết ra terminal để debug
        console.error("!!!!!!!!!!!! LỖI CHI TIẾT TRONG /request-password-reset !!!!!!!!!!!!");
        console.error(err);

        // Trả về một lỗi chung chung hơn cho phía client
        res.status(500).json({ error: 'Lỗi hệ thống khi gửi email. Vui lòng kiểm tra log server.' });
    }
});

app.post("/verify-reset-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });
    try {
        const sql = 'SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_code_expires > NOW()';
        const [results] = await dbPool.query(sql, [email, code]);
        if (results.length === 0) return res.status(400).json({ error: 'Invalid or expired reset code' });

        res.json({ message: 'Reset code is valid' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'All fields are required' });

    try {
        const checkSql = 'SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_code_expires > NOW()';
        const [results] = await dbPool.query(checkSql, [email, code]);
        if (results.length === 0) return res.status(400).json({ error: 'Invalid or expired reset code' });

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const updateSql = 'UPDATE users SET password = ?, reset_code = NULL, reset_code_expires = NULL WHERE email = ?';
        await dbPool.query(updateSql, [hashedPassword, email]);

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contact & News Routes
app.post('/contact/send', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' });
        }

        // 1. Lưu liên hệ vào database
        await dbPool.query(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );

        // 2. Gửi email xác nhận cho khách hàng
        const customerMailOptions = {
            from: `"Coffee House" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Cảm ơn bạn đã liên hệ với Coffee House',
            html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0e6; padding: 40px 0;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4B2E2E 0%, #A47148 100%); padding: 30px; text-align: center;">
              <h1 style="color: #fff; margin: 15px 0 0; font-weight: 600; letter-spacing: 2px;">CẢM ƠN BẠN</h1>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 0;">Coffee House trân trọng sự quan tâm của bạn</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Xin chào <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Cảm ơn bạn đã liên hệ với Coffee House. Chúng tôi đã nhận được thông tin của bạn và sẽ phản hồi trong thời gian sớm nhất.
              </p>
              
              <div style="background: #f9f5f0; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #A47148;">
                <p style="font-weight: 600; margin-top: 0; color: #4B2E2E;">Nội dung bạn đã gửi:</p>
                <p style="color: #555; white-space: pre-line;">${message}</p>
              </div>
              
              <p style="font-size: 16px; color: #555;">
                Nếu bạn có bất kỳ câu hỏi nào khác, vui lòng liên hệ qua email này hoặc gọi đến hotline: <strong>028 1234 5678</strong>.
              </p>
              
              <p style="font-size: 16px; color: #555; margin-bottom: 0;">
                Trân trọng,<br>
                <strong>Đội ngũ Coffee House</strong>
              </p>
            </div>
          </div>
        </div>
      `
        };

        // 3. Gửi email thông báo cho admin
        const adminMailOptions = {
            from: `"Khách hàng Coffee House" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: `[Coffee House] Liên hệ mới từ ${name}`,
            html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0e6; padding: 40px 0;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4B2E2E 0%, #A47148 100%); padding: 30px; text-align: center;">
              <h1 style="color: #fff; margin: 15px 0 0; font-weight: 600; letter-spacing: 2px;">LIÊN HỆ MỚI</h1>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 0;">Từ khách hàng: ${name}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 5px; font-weight: 600; color: #4B2E2E;">Thông tin khách hàng:</p>
                <p style="margin: 0; color: #555;"><strong>Họ tên:</strong> ${name}</p>
                <p style="margin: 0; color: #555;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0; color: #555;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              </div>
              
              <div style="background: #f9f5f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #A47148;">
                <p style="font-weight: 600; margin-top: 0; color: #4B2E2E;">Nội dung liên hệ:</p>
                <p style="color: #555; white-space: pre-line;">${message}</p>
              </div>
              
              <p style="font-size: 16px; color: #555; margin-bottom: 0;">
                Vui lòng phản hồi khách hàng trong vòng 24 giờ.
              </p>
            </div>
          </div>
        </div>
      `
        };

        // Gửi cả 2 email
        await Promise.all([
            transporter.sendMail(customerMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);

        res.json({ success: true, message: 'Đã gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!' });
    } catch (err) {
        console.error('Gửi liên hệ thất bại:', err);
        res.status(500).json({ error: 'Lỗi hệ thống khi gửi liên hệ.' });
    }
});

app.get('/contacts', authenticateJWT, adminOnly, async (req, res) => {
    try {
        const [contacts] = await dbPool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin trả lời một liên hệ
app.put('/contacts/:id/reply', authenticateJWT, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { admin_reply } = req.body;

    if (!admin_reply) {
        return res.status(400).json({ error: 'Nội dung trả lời không được để trống.' });
    }

    try {
        // 1. Lấy thông tin email của người dùng
        const [[contact]] = await dbPool.query('SELECT email, name, message FROM contacts WHERE id = ?', [id]);
        if (!contact) {
            return res.status(404).json({ error: 'Không tìm thấy liên hệ.' });
        }

        // 2. Cập nhật database
        await dbPool.query(
            'UPDATE contacts SET admin_reply = ?, status = "replied", replied_at = NOW() WHERE id = ?',
            [admin_reply, id]
        );

        // 3. Gửi email phản hồi cho người dùng
        const mailOptionsToUser = {
            from: `"Coffee House Support" <${process.env.EMAIL_USER}>`,
            to: contact.email,
            subject: 'Phản hồi về liên hệ của bạn tại Coffee House',
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0e6; padding: 40px 0;">
                  <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #4B2E2E 0%, #A47148 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #fff; margin: 15px 0 0; font-weight: 600; letter-spacing: 2px;">PHẢN HỒI CỦA CHÚNG TÔI</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px;">
                      <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                        Xin chào <strong>${contact.name}</strong>,
                      </p>
                      
                      <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                        Cảm ơn bạn đã liên hệ với Coffee House. Dưới đây là phản hồi của chúng tôi:
                      </p>
                      
                      <div style="background: #f9f5f0; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #A47148;">
                        <p style="font-weight: 600; margin-top: 0; color: #4B2E2E;">Nội dung phản hồi:</p>
                        <p style="color: #555; white-space: pre-line;">${admin_reply}</p>
                      </div>
                      
                      <div style="background: #f5f5f5; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                        <p style="font-weight: 600; margin-top: 0; color: #4B2E2E;">Nội dung ban đầu của bạn:</p>
                        <p style="color: #555; white-space: pre-line;">${contact.message}</p>
                      </div>
                      
                      <p style="font-size: 16px; color: #555;">
                        Nếu bạn cần thêm thông tin, vui lòng liên hệ lại với chúng tôi.
                      </p>
                      
                      <p style="font-size: 16px; color: #555; margin-bottom: 0;">
                        Trân trọng,<br>
                        <strong>Đội ngũ Coffee House</strong>
                      </p>
                    </div>
                  </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptionsToUser);

        res.json({ success: true, message: 'Đã gửi phản hồi thành công.' });
    } catch (err) {
        console.error('Lỗi khi trả lời liên hệ:', err);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
});

// Cập nhật trạng thái (ví dụ: đánh dấu đã đọc)
app.put('/contacts/:id/status', authenticateJWT, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await dbPool.query('UPDATE contacts SET status = ? WHERE id = ? AND status != "replied"', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/news", async (req, res) => {
    try {
        const [result] = await dbPool.query("SELECT * FROM news ORDER BY date DESC");
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/news/:id", async (req, res) => {
    try {
        const [results] = await dbPool.query("SELECT * FROM news WHERE id = ?", [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: "Not found" });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/news", authenticateJWT, adminOnly, async (req, res) => {
    try {
        const { title, category, date, description, content, image } = req.body;
        if (!title || !category || !date || !description || !content) {
            return res.status(400).json({ error: "Thiếu thông tin" });
        }
        const [result] = await dbPool.query(
            "INSERT INTO news (title, category, date, description, content, image) VALUES (?, ?, ?, ?, ?, ?)",
            [title, category, date, description, content, image]
        );
        res.json({ message: "Đã thêm tin tức", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/notifications/:id/mark-one-read", authenticateJWT, async (req, res) => {
    const { id } = req.params; // Lấy notification ID từ URL
    const userId = req.user.id;

    try {
        const [result] = await dbPool.query(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
            [id, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Đã đánh dấu thông báo là đã đọc." });
        } else {
            // Trường hợp không tìm thấy thông báo hoặc nó không thuộc về user này
            res.status(404).json({ error: "Không tìm thấy thông báo." });
        }
    } catch (err) {
        console.error("Lỗi khi đánh dấu 1 thông báo là đã đọc:", err);
        res.status(500).json({ error: err.message });
    }
});


// Notification Routes
app.get("/notifications", authenticateJWT, async (req, res) => {
    try {
        const [notifications] = await dbPool.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            [req.user.id]
        );
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/notifications/mark-read", authenticateJWT, async (req, res) => {
    try {
        await dbPool.query(
            "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
            [req.user.id]
        );
        res.json({ success: true, message: "Đã đánh dấu tất cả thông báo là đã đọc." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}. Nếu deploy Railway, hãy dùng domain Railway để truy cập API.`);
});