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
  
  // Debug logging
  console.log('🔍 Momo Payment Request Debug:');
  console.log('orderId:', orderId);
  console.log('amount:', amount);
  console.log('orderInfo:', orderInfo);
  console.log('redirectUrl:', redirectUrl);
  console.log('ipnUrl:', ipnUrl);
  console.log('partnerCode:', partnerCode);
  console.log('accessKey:', accessKey);
  console.log('secretKey length:', secretKey ? secretKey.length : 0);
  
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

  // Debug raw signature
  console.log('🔑 Raw Signature String:', rawSignature);
  console.log('🗝️ Secret Key:', secretKey);
  console.log('📏 Secret Key Length:', secretKey ? secretKey.length : 'MISSING');

  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  console.log('🔐 Generated Signature:', signature);

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

  console.log('📤 Momo Request Body:', JSON.stringify(requestBody, null, 2));

  try {
    const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
    console.log('✅ Momo Response:', momoRes.data);
    return res.json({ payUrl: momoRes.data.payUrl });
  } catch (err) {
    console.error("❌ Lỗi khi tạo thanh toán MoMo:", err.response?.data || err.message);
    if (err.response?.data) {
      console.error("❌ Full Momo Error Response:", JSON.stringify(err.response.data, null, 2));
    }
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

// Test endpoint to check momo configuration
router.get('/test-config', (req, res) => {
  res.json({
    partnerCode: partnerCode || 'MISSING',
    accessKey: accessKey || 'MISSING',
    secretKey: secretKey ? 'SET' : 'MISSING',
    redirectUrl: redirectUrl || 'MISSING',
    ipnUrl: ipnUrl || 'MISSING',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
