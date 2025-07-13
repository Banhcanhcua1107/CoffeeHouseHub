// --- START OF FILE ThankYouPage.jsx ---

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông tin đơn hàng được truyền qua state khi chuyển hướng
  const orderDetails = location.state || {};
  // Nếu là thanh toán momo thì lấy từ state momoSuccess, nếu không thì lấy orderCode và amount
  const { orderCode, amount, momoSuccess } = orderDetails;

  // Nếu người dùng truy cập trực tiếp vào trang này mà không có thông tin đơn hàng,
  // chuyển hướng họ về trang chủ.
  useEffect(() => {
    // Nếu không có thông tin đơn hàng (cả momo và cod), chuyển hướng về trang chủ
    if ((!orderCode || !amount) && !momoSuccess) {
      console.log("Không có thông tin đơn hàng, đang chuyển hướng...");
      navigate('/');
    }
  }, [orderCode, amount, momoSuccess, navigate]);

  // Nếu chưa có thông tin, không render gì để chờ chuyển hướng
  if ((!orderCode || !amount) && !momoSuccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F5F0] to-[#E8D9C5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-md">
        {/* Header thành công */}
        <div className="bg-[#A47148] p-6 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] opacity-20"></div>
          <div className="relative z-10">
            <svg className="w-20 h-20 mx-auto text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-white mt-4">Đặt Hàng Thành Công!</h1>
          </div>
        </div>

        {/* Body hiển thị thông tin */}
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-[#A47148]">
            Cảm ơn bạn đã tin tưởng và đặt hàng.
          </h2>
          <p className="text-gray-600 mb-6">Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>

          <div className="bg-[#F9F5F0] rounded-lg p-4 my-6 text-left">
            <h3 className="font-medium text-[#A47148] mb-2">Thông tin đơn hàng</h3>
            <p className="text-sm text-gray-600">• Mã đơn hàng: <span className="font-semibold">{orderCode}</span></p>
            <p className="text-sm text-gray-600">• Tổng tiền: <span className="font-semibold">{(amount || 0).toLocaleString('vi-VN')}đ</span></p>
            <p className="text-sm text-gray-600">• Hình thức: <span className="font-semibold">{momoSuccess ? 'Thanh toán MoMo' : 'Thanh toán khi nhận hàng (COD)'}</span></p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-300 bg-[#A47148] hover:bg-[#8a5f3a]"
          >
            Tiếp tục mua sắm
          </button>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Cần hỗ trợ?</p>
            <p className="text-sm font-medium text-[#A47148]">info@coffeehouse.com | 028 7100 1888</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;