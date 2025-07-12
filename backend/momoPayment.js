const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const redirectUrl = process.env.MOMO_REDIRECT_URL;
const ipnUrl = process.env.MOMO_IPN_URL;
const requestType = 'captureWallet';

const { sendReceiptEmail } = require('./sendMailHelper');

router.post('/create', async (req, res) => {
  const { amount, orderInfo, orderId, email, fullname, phone, address, note, userId, cart } = req.body;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Thiếu mã đơn hàng (orderId).' });
  }

  const extraDataPayload = { email, fullname, phone, address, note, userId, cart };
  const extraData = Buffer.from(JSON.stringify(extraDataPayload)).toString('base64');

  const requestId = partnerCode + new Date().getTime();
  const rawSignature =
    "accessKey=" + accessKey +
    "&amount=" + amount +
    "&extraData=" + extraData +
    "&ipnUrl=" + ipnUrl +
    "&orderId=" + orderId +
    "&orderInfo=" + orderInfo +
    "&partnerCode=" + partnerCode +
    "&redirectUrl=" + redirectUrl +
    "&requestId=" + requestId +
    "&requestType=" + requestType;

  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi'
  };

  try {
    const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
    return res.json({ payUrl: momoRes.data.payUrl });
  } catch (err) {
    console.error("Lỗi khi tạo thanh toán MoMo:", err.response?.data || err.message);
    return res.status(500).json({ error: 'Tạo thanh toán thất bại!', details: err.response?.data });
  }
});

router.post('/ipn', async (req, res) => {
  const { orderId, resultCode, message } = req.body;
  
  console.log(`[IPN] Nhận được cho đơn hàng ${orderId} | Kết quả: ${resultCode} | Message: ${message}`);
  
  if (resultCode == 0) {
      console.log(`(IPN) Thanh toán thành công cho đơn hàng ${orderId}.`);
  } else {
      console.log(`(IPN) Thanh toán thất bại cho đơn hàng ${orderId}.`);
  }
  
  res.status(204).send();
});

module.exports = router;
