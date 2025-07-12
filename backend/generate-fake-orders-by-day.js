// backend/generate-fake-orders-by-day.js
// node generate-fake-orders-by-day.js
const mysql = require('mysql2/promise');

// === CÁC THAM SỐ ĐỂ BẠN TÙY CHỈNH ===

// 1. Năm và Tháng mục tiêu
const TARGET_YEAR = 2024;
const TARGET_MONTH = 6; // Tháng 6

// 2. Số lượng đơn hàng mỗi ngày (sẽ ngẫu nhiên trong khoảng này)
const ORDERS_PER_DAY_MIN = 2;
const ORDERS_PER_DAY_MAX = 10;

// 3. Tỉ lệ các loại đơn hàng (giữ nguyên hoặc tùy chỉnh)
const STATUS_DISTRIBUTION = {
    delivered_paid: 0.80,     // 80% đơn đã giao và thanh toán (tạo doanh thu chính)
    processing_paid: 0.10,    // 10% đơn đã thanh toán, đang xử lý
    cancelled: 0.05,          // 5% đơn bị hủy
    processing_pending: 0.05, // 5% đơn COD, đang xử lý
};

// 4. Số lượng sản phẩm mỗi đơn
const ITEMS_PER_ORDER_MIN = 1;
const ITEMS_PER_ORDER_MAX = 5;

// ==========================================

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Hàm tạo một thời điểm ngẫu nhiên trong một ngày cụ thể
const randomTimeInDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
    return newDate;
};

async function generateOrders() {
    let connection;
    try {
        console.log("Đang kết nối đến cơ sở dữ liệu...");
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
        const [users] = await connection.execute("SELECT id, fullname, email FROM users WHERE role = 'user'");
        const [products] = await connection.execute("SELECT id, name, price, image FROM products");
        const [cafes] = await connection.execute("SELECT id, name, price, img as image FROM cafe");

        if (users.length === 0 || (products.length === 0 && cafes.length === 0)) {
            console.error("❌ Lỗi: Không có đủ dữ liệu nguồn. Cần có ít nhất 1 user (role='user') và 1 sản phẩm/cafe.");
            return;
        }

        const allItems = [
            ...products.map(p => ({ ...p, type: 'product' })),
            ...cafes.map(c => ({ ...c, type: 'cafe' }))
        ];
        console.log(`✅ Đã lấy được ${users.length} users và ${allItems.length} loại sản phẩm.`);

        // --- Bắt đầu tạo đơn hàng theo từng ngày của tháng mục tiêu ---
        const daysInMonth = new Date(TARGET_YEAR, TARGET_MONTH, 0).getDate();
        console.log(`\nBắt đầu tạo đơn hàng ảo cho ${daysInMonth} ngày của tháng ${TARGET_MONTH}/${TARGET_YEAR}...`);

        // Lặp qua từng ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(TARGET_YEAR, TARGET_MONTH - 1, day);
            const numberOfOrdersForDay = randomInt(ORDERS_PER_DAY_MIN, ORDERS_PER_DAY_MAX);

            console.log(`\n--- Ngày ${day}/${TARGET_MONTH}/${TARGET_YEAR}: Tạo ${numberOfOrdersForDay} đơn hàng ---`);

            // Tạo số lượng đơn hàng ngẫu nhiên cho ngày này
            for (let i = 0; i < numberOfOrdersForDay; i++) {
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

                const orderDate = randomTimeInDay(currentDate); // Thời gian ngẫu nhiên trong ngày
                const orderCode = `FAKE-${orderDate.getTime()}-${randomInt(100, 999)}`;

                // Quyết định trạng thái đơn hàng
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
                        cumulative += STATUS_DISTRIBUTION.cancelled;
                        if (rand < cumulative) {
                            orderStatus = 'cancelled'; paymentStatus = 'pending'; paymentMethod = 'cod';
                        } else { orderStatus = 'processing'; paymentStatus = 'pending'; paymentMethod = 'cod'; }
                    }
                }

                await connection.beginTransaction();
                try {
                    const [orderResult] = await connection.execute(
                        `INSERT INTO orders (user_id, order_code, fullname, email, phone, address, total_amount, payment_method, payment_status, order_status, order_date)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            user.id, orderCode, user.fullname, user.email,
                            '0987654321', '123 Đường Demo, P. ABC, Q. XYZ, TP.HCM',
                            totalAmount, paymentMethod, paymentStatus, orderStatus, orderDate
                        ]
                    );
                    const newOrderId = orderResult.insertId;

                    const itemPromises = cart.map(item => connection.execute(
                        `INSERT INTO order_items (order_id, product_id, product_type, product_name, quantity, price)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [newOrderId, item.id, item.type, item.name, item.quantity, item.price]
                    ));
                    await Promise.all(itemPromises);

                    await connection.commit();
                    process.stdout.write(` .`); // In dấu chấm để thể hiện tiến trình
                } catch (err) {
                    await connection.rollback();
                    console.error(`\n   -> ❌ Lỗi khi tạo đơn hàng: `, err.message);
                }
            }
        }

        console.log(`\n\n✅ HOÀN TẤT! Đã tạo xong dữ liệu cho tháng ${TARGET_MONTH}/${TARGET_YEAR}.`);

    } catch (err) {
        console.error("❌ Lỗi nghiêm trọng:", err.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log("\nĐã đóng kết nối database.");
        }
    }
}

generateOrders();