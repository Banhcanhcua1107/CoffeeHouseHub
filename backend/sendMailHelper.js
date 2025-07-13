// --- START OF FILE sendMailHelper.js ---

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

function sendReceiptEmail({ to, orderId, amount, time, orderInfo, fullname, phone, address }) {
  const mailOptions = {
    from: `"Coffee House" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[Coffee House] Biên lai thanh toán đơn hàng #${orderId}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0e6; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #e8e8e8;">
          <div style="background: linear-gradient(135deg, #4B2E2E 0%, #A47148 100%); padding: 30px; text-align: center;">
            <img src="cid:logo-bien-lai" alt="Coffee House Logo" style="height: 50px;" /> 
            <h1 style="color: #fff; margin: 15px 0 0; font-weight: 300; letter-spacing: 1px;">XÁC NHẬN THANH TOÁN</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #555; margin-bottom: 25px;">Xin chào${fullname ? ' <span style="font-weight:600;color:#4B2E2E;">' + fullname + '</span>' : ' Quý khách'},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">Cảm ơn bạn đã đặt hàng tại <span style="color: #A47148; font-weight:600;">Coffee House</span>! Dưới đây là thông tin đơn hàng của bạn:</p>
            <div style="background: #f9f5f0; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #A47148;">
              <h3 style="color: #4B2E2E; margin-top: 0; font-size: 18px;">THÔNG TIN ĐƠN HÀNG #${orderId}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #777; width: 120px;">Mã đơn hàng:</td><td style="padding: 8px 0; font-weight: 600;">${orderId}</td></tr>
                <tr><td style="padding: 8px 0; color: #777;">Số tiền:</td><td style="padding: 8px 0; color: #E03E2D; font-weight: 600;">${Number(amount).toLocaleString('vi-VN')}đ</td></tr>
                <tr><td style="padding: 8px 0; color: #777;">Thời gian:</td><td style="padding: 8px 0;">${time}</td></tr>
                <tr><td style="padding: 8px 0; color: #777; vertical-align: top;">Nội dung:</td><td style="padding: 8px 0;">
                    ${Array.isArray(orderInfo) ? 
                        orderInfo.map(item => `<div style="margin-bottom: 5px;">- ${item.name} x ${item.quantity}</div>`).join('') 
                        : orderInfo}
                </td></tr>
                ${phone ? `<tr><td style="padding: 8px 0; color: #777;">Điện thoại:</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
                ${address ? `<tr><td style="padding: 8px 0; color: #777;">Địa chỉ:</td><td style="padding: 8px 0;">${address}</td></tr>` : ''}
              </table>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="font-size: 14px; color: #888;">Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <a href="tel:02871001888" style="color: #A47148; text-decoration: none; font-weight: 600;">028 7100 1888</a></p>
              <p style="font-size: 12px; color: #aaa; margin-top: 20px;">© ${new Date().getFullYear()} Coffee House. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    attachments: [{
        filename: 'bienlaigmail.png',
        path: path.join(__dirname, '..', 'src', 'components', 'img', 'LOGOCOFFE', 'bienlaigmail.png'),
        cid: 'logo-bien-lai'
    }]
  };
  return transporter.sendMail(mailOptions);
}

const sendCancellationEmail = async ({ to, orderId, reason }) => {
    const mailOptions = {
        from: `"Coffee House" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Thông báo hủy đơn hàng #${orderId}`,
        html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0e6; padding: 40px 0;">
                <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #e8e8e8;">
                    <div style="background: linear-gradient(135deg, #4B2E2E 0%, #A47148 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-weight: 300; letter-spacing: 1px;">THÔNG BÁO HỦY ĐƠN HÀNG</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; color: #555; margin-bottom: 25px;">Xin chào Quý khách,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong style="color: #4B2E2E;">#${orderId}</strong> của bạn tại Coffee House đã được hủy.</p>
                        <div style="background: #fbe9e7; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #e53935;">
                            <h3 style="color: #c62828; margin-top: 0; font-size: 18px;">Lý do hủy đơn:</h3>
                            <p style="color: #555; font-size: 16px; margin-bottom: 0;">${reason}</p>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Nếu bạn đã thanh toán trước cho đơn hàng này, chúng tôi sẽ tiến hành hoàn tiền trong thời gian sớm nhất. Xin lỗi vì sự bất tiện này.</p>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="font-size: 14px; color: #888;">Cần hỗ trợ? Vui lòng liên hệ hotline: <a href="tel:02871001888" style="color: #A47148; text-decoration: none; font-weight: 600;">028 7100 1888</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `,
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { 
    transporter, 
    sendReceiptEmail,
    sendCancellationEmail 
};