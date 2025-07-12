// backend/migrate_images.js
//node backend/migrate_images.js
const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Đảm bảo đọc file .env đúng chỗ

// --- Cấu hình ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "1234",
    database: "coffee_website",
};

// !!! QUAN TRỌNG: KIỂM TRA ĐƯỜNG DẪN NÀY !!!
// Đây là đường dẫn đến thư mục chứa các ảnh sản phẩm (s1.jpg, s2.jpg,...)
// Script này chạy từ thư mục gốc, nên đường dẫn sẽ là 'src/IMG/Shop'
const localImagesBasePath = path.join(process.cwd(), 'src','components', 'IMG', 'Shop');

// --- Kịch bản chính ---
async function migrateImages() {
    let dbPool;
    console.log("🚀 Bắt đầu kịch bản di dời hình ảnh...");

    try {
        dbPool = await mysql.createPool(dbConfig);
        console.log("✅ Đã kết nối DB thành công.");

        // 1. Lấy tất cả sản phẩm chưa được di dời (ảnh không phải là URL)
        const [productsToMigrate] = await dbPool.query(
            "SELECT id, image, sku FROM products WHERE image IS NOT NULL AND image NOT LIKE 'http%'"
        );

        if (productsToMigrate.length === 0) {
            console.log("✨ Không có sản phẩm nào cần di dời. Mọi thứ đã được cập nhật!");
            return;
        }

        console.log(`🔍 Tìm thấy ${productsToMigrate.length} sản phẩm cần di dời.`);
        console.log(`📂 Đường dẫn đến thư mục ảnh cục bộ: ${localImagesBasePath}`);


        // 2. Lặp qua từng sản phẩm và xử lý
        for (const product of productsToMigrate) {
            const imageName = product.image; // vd: "s1.jpg"
            const localImagePath = path.join(localImagesBasePath, imageName);

            // Kiểm tra xem file ảnh có tồn tại không
            if (!fs.existsSync(localImagePath)) {
                console.warn(`❌ [ID: ${product.id}] Không tìm thấy file ảnh: ${localImagePath}. Bỏ qua...`);
                continue;
            }

            try {
                // 3. Tải ảnh lên Cloudinary
                console.log(`... [ID: ${product.id}] Đang tải lên ${imageName}...`);
                const result = await cloudinary.uploader.upload(localImagePath, {
                    folder: 'coffee_house/products', // Thư mục trên Cloudinary
                    public_id: product.sku || path.parse(imageName).name // Dùng SKU hoặc tên file làm public_id
                });

                const newImageUrl = result.secure_url;
                
                // 4. Cập nhật database với URL mới
                await dbPool.query(
                    "UPDATE products SET image = ? WHERE id = ?",
                    [newImageUrl, product.id]
                );
                
                console.log(`✅ [ID: ${product.id}] Di dời thành công! URL mới: ${newImageUrl}`);

            } catch (uploadError) {
                console.error(`💥 [ID: ${product.id}] Lỗi khi tải lên ${imageName}:`, uploadError.message);
            }
        }
        
        console.log("🎉 Hoàn tất quá trình di dời!");

    } catch (error) {
        console.error("🔥 Đã xảy ra lỗi nghiêm trọng:", error.message);
    } finally {
        if (dbPool) {
            await dbPool.end();
            console.log("🔌 Đã đóng kết nối DB.");
        }
    }
}

// Chạy kịch bản
migrateImages();