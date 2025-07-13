# Hướng dẫn cấu hình môi trường (Environment Setup Guide)

## 1. File .env cho Frontend (Thư mục gốc)

Tạo file `.env` trong thư mục gốc của project với nội dung:

```bash
# Frontend Environment Variables
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

**Hướng dẫn lấy Geoapify API Key:**
1. Đăng ký miễn phí tại: https://www.geoapify.com/
2. Tạo project mới và lấy API key
3. Paste API key vào file .env

## 2. File .env cho Backend (Thư mục backend/)

Tạo file `.env` trong thư mục `backend/` với nội dung:

```bash
# Backend Environment Variables

# Database Configuration (Railway MySQL)
DB_HOST=your_railway_mysql_host
DB_USER=your_railway_mysql_user
DB_PASSWORD=your_railway_mysql_password
DB_DATABASE=railway
DB_PORT=3306

# Alternative: Railway auto-injected MySQL variables
MYSQL_URL=mysql://user:password@host:port/database
MYSQLHOST=your_mysql_host
MYSQLUSER=your_mysql_user
MYSQLPASSWORD=your_mysql_password
MYSQLDATABASE=railway
MYSQLPORT=3306

# Email Configuration (Gmail)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# MoMo Payment Configuration
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_REDIRECT_URL=https://coffeehousehub-production.up.railway.app/checkout/momo-return
MOMO_IPN_URL=https://coffeehousehub-production.up.railway.app/momo/verify-and-send-mail

# Environment
NODE_ENV=production
PORT=3000
```

## 3. Cấu hình Railway

Trong Railway Dashboard, thêm các biến môi trường sau:

### Database (Railway tự động inject):
- MYSQL_URL
- MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT

### Email (Gmail):
- EMAIL_USER=your_gmail_address@gmail.com
- EMAIL_PASS=your_gmail_app_password (tạo trong Gmail Settings > App passwords)

### Cloudinary:
- CLOUDINARY_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

### MoMo Payment:
- MOMO_PARTNER_CODE
- MOMO_ACCESS_KEY
- MOMO_SECRET_KEY
- MOMO_REDIRECT_URL=https://coffeehousehub-production.up.railway.app/checkout/momo-return
- MOMO_IPN_URL=https://coffeehousehub-production.up.railway.app/momo/verify-and-send-mail

## 4. Kiểm tra cấu hình

Sau khi cấu hình, kiểm tra:
- Tính năng quên mật khẩu (cần EMAIL_USER, EMAIL_PASS)
- Tìm kiếm địa chỉ (cần VITE_GEOAPIFY_API_KEY)
- Thanh toán MoMo (cần các biến MOMO_*)
- Upload ảnh (cần Cloudinary config)

## 5. Vấn đề thường gặp

- **Quên mật khẩu không hoạt động**: Kiểm tra EMAIL_USER, EMAIL_PASS
- **Tìm kiếm địa chỉ không hoạt động**: Kiểm tra VITE_GEOAPIFY_API_KEY
- **Thanh toán lỗi**: Kiểm tra cấu hình MoMo
- **Database connection failed**: Kiểm tra MySQL config

## 6. URL đã được cập nhật

- VNPay return URL: https://coffeehousehub-production.up.railway.app/vnpay/vnpay_return
- Frontend return URL: https://coffeehousehub-production.up.railway.app/checkout/vnpay-return
- MoMo URLs: Đã cập nhật trong template .env 