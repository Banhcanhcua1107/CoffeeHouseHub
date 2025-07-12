// backend/generate-fake-orders.js
//node generate-fake-orders.js
const mysql = require('mysql2/promise');

// === CÁC THAM SỐ ĐỂ BẠN TÙY CHỈNH ===
const NUMBER_OF_ORDERS = 100; // Số lượng đơn hàng muốn tạo
const DAYS_BACK = 90; // Tạo đơn hàng trong vòng 90 ngày trở lại đây
const STATUS_DISTRIBUTION = {
    delivered_paid: 0.70,     // 70% đơn đã giao và thanh toán (đây là doanh thu thật)
    processing_paid: 0.10,    // 10% đơn đã thanh toán, đang xử lý
    processing_pending: 0.10, // 10% đơn COD, đang xử lý
    shipped_pending: 0.05,    // 5% đơn COD, đang giao
    cancelled: 0.05           // 5% đơn bị hủy
};
const ITEMS_PER_ORDER_MIN = 1;
const ITEMS_PER_ORDER_MAX = 5;

// ==========================================

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (daysBack) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - randomInt(0, daysBack));
    pastDate.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
    return pastDate;
};

async function generateOrders() {
    let connection;
    try {
        console.log("Đang kết nối đến cơ sở dữ liệu...");
        // Điền trực tiếp thông tin kết nối
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log("✅ Kết nối thành công!");

        console.log("Đang lấy dữ liệu nguồn (users, products, cafes)...");
        // SỬA LỖI: Chỉ lấy các cột có tồn tại trong bảng `users`
        const [users] = await connection.execute("SELECT id, fullname, email FROM users WHERE role = 'user'");
        const [products] = await connection.execute("SELECT id, name, price, image FROM products");
        const [cafes] = await connection.execute("SELECT id, name, price, img as image FROM cafe");

        if (users.length === 0 || (products.length === 0 && cafes.length === 0)) {
            console.error("❌ Lỗi: Không có đủ dữ liệu nguồn. Cần có ít nhất 1 user (với role='user') và 1 sản phẩm/cafe.");
            return;
        }

        const allItems = [
            ...products.map(p => ({ ...p, type: 'product' })),
            ...cafes.map(c => ({ ...c, type: 'cafe' }))
        ];
        console.log(`✅ Đã lấy được ${users.length} users và ${allItems.length} loại sản phẩm.`);

        console.log(`\nBắt đầu tạo ${NUMBER_OF_ORDERS} đơn hàng ảo...`);

        for (let i = 0; i < NUMBER_OF_ORDERS; i++) {
            const user = randomElement(users);
            const numberOfItems = randomInt(ITEMS_PER_ORDER_MIN, ITEMS_PER_ORDER_MAX);
            const cart = [];
            let totalAmount = 0;
            for (let j = 0; j < numberOfItems; j++) {
                const item = randomElement(allItems);
                const quantity = randomInt(1, 3);
                cart.push({ ...item, quantity });
                totalAmount += item.price * quantity;
            }

            const orderDate = randomDate(DAYS_BACK);
            const orderCode = `FAKE-${Date.now()}-${randomInt(100, 999)}`;

            const rand = Math.random();
            let cumulative = 0;
            let orderStatus = 'processing';
            let paymentStatus = 'pending';
            let paymentMethod = 'cod';

            cumulative += STATUS_DISTRIBUTION.delivered_paid;
            if (rand < cumulative) {
                orderStatus = 'delivered'; paymentStatus = 'paid'; paymentMethod = Math.random() < 0.5 ? 'cod' : 'momo';
            } else {
                cumulative += STATUS_DISTRIBUTION.processing_paid;
                if (rand < cumulative) {
                    orderStatus = 'processing'; paymentStatus = 'paid'; paymentMethod = 'momo';
                } else {
                    cumulative += STATUS_DISTRIBUTION.processing_pending;
                    if (rand < cumulative) {
                        orderStatus = 'processing'; paymentStatus = 'pending'; paymentMethod = 'cod';
                    } else {
                        cumulative += STATUS_DISTRIBUTION.shipped_pending;
                        if (rand < cumulative) {
                            orderStatus = 'shipped'; paymentStatus = 'pending'; paymentMethod = 'cod';
                        } else { orderStatus = 'cancelled'; paymentStatus = 'pending'; paymentMethod = 'cod'; }
                    }
                }
            }

            await connection.beginTransaction();
            try {
                // SỬA LỖI: Sử dụng địa chỉ và SĐT giả mặc định vì bảng `users` không có các cột này
                const [orderResult] = await connection.execute(
                    `INSERT INTO orders (user_id, order_code, fullname, email, phone, address, total_amount, payment_method, payment_status, order_status, order_date)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user.id, orderCode, user.fullname, user.email,
                        '0987654321', '123 Đường Demo, P. ABC, Q. XYZ, TP.HCM', // Địa chỉ và SĐT giả
                        totalAmount, paymentMethod, paymentStatus, orderStatus, orderDate
                    ]
                );
                const newOrderId = orderResult.insertId;

                const itemPromises = cart.map(item => {
                    return connection.execute(
                        `INSERT INTO order_items (order_id, product_id, product_type, product_name, quantity, price)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [newOrderId, item.id, item.type, item.name, item.quantity, item.price]
                    );
                });
                await Promise.all(itemPromises);

                await connection.commit();
                console.log(`   -> Đã tạo đơn hàng #${newOrderId} (${orderStatus}, ${paymentStatus}) cho user ${user.fullname}`);
            } catch (err) {
                await connection.rollback();
                console.error(`   -> ❌ Lỗi khi tạo đơn hàng: `, err.message);
            }
        }

        console.log(`\n✅ HOÀN TẤT! Đã tạo xong ${NUMBER_OF_ORDERS} đơn hàng.`);

    } catch (err) {
        console.error("❌ Lỗi nghiêm trọng:", err.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log("\nĐã đóng kết nối database.");
        }
    }
}

// Chạy hàm chính
generateOrders();