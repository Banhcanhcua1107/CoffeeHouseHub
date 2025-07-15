import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '@/components/context/ShopContext';

function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart, fetchNotifications } = useContext(ShopContext);
  const isProcessing = useRef(false);

  const [orderDetails, setOrderDetails] = useState({ orderCode: '', amount: 0 });
  const [pageStatus, setPageStatus] = useState({
    isLoading: true,
    isSuccess: false,
    message: "Đang xử lý kết quả thanh toán...",
  });

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    let foundOrder = false;
    let code, amt;

    if (location.state?.orderCode && location.state?.amount) {
      code = location.state.orderCode;
      amt = location.state.amount;
      localStorage.setItem('thankYouOrder', JSON.stringify({ orderCode: code, amount: amt }));
      foundOrder = true;
    } else {
      const saved = localStorage.getItem('thankYouOrder');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          code = parsed.orderCode;
          amt = parsed.amount;
          foundOrder = true;
        } catch (e) {
          console.error("Lỗi đọc localStorage thankYouOrder:", e);
        }
      }
    }

    if (foundOrder) {
      setOrderDetails({ orderCode: code, amount: amt });
      setPageStatus({
        isLoading: false,
        isSuccess: true,
        message: "Thanh toán và xử lý đơn hàng thành công!"
      });
      fetchCart && fetchCart();
      fetchNotifications && fetchNotifications();
    } else {
      setPageStatus({
        isLoading: false,
        isSuccess: false,
        message: "Không tìm thấy thông tin đơn hàng. Vui lòng đặt lại."
      });
      setTimeout(() => navigate('/checkout', { replace: true }), 3000);
    }

  }, [location.state, navigate, fetchCart, fetchNotifications]);

  const handleNavigation = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F5F0] to-[#E8D9C5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-md">
        <div className="bg-[#A47148] p-6 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] opacity-20"></div>
          {pageStatus.isLoading && (
            <div className="relative z-10">
              <svg className="animate-spin h-20 w-20 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h1 className="text-2xl font-bold text-white mt-4">Vui lòng đợi...</h1>
            </div>
          )}
          {!pageStatus.isLoading && pageStatus.isSuccess && (
            <div className="relative z-10">
              <svg className="w-20 h-20 mx-auto text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-white mt-4">Thành Công!</h1>
            </div>
          )}
          {!pageStatus.isLoading && !pageStatus.isSuccess && (
            <div className="relative z-10">
              <svg className="w-20 h-20 mx-auto text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-white mt-4">Đặt hàng không thành công</h1>
            </div>
          )}
        </div>
        {!pageStatus.isLoading && (
          <div className="p-6 text-center">
            <h2 className={`text-xl font-semibold mb-2 ${pageStatus.isSuccess ? "text-[#A47148]" : "text-red-600"}`}>
              {pageStatus.message}
            </h2>
            {pageStatus.isSuccess && orderDetails.orderCode && (
              <div className="bg-[#F9F5F0] rounded-lg p-4 my-6 text-left">
                <h3 className="font-medium text-[#A47148] mb-2">Thông tin giao dịch</h3>
                <p className="text-sm text-gray-600">• Mã đơn hàng: <span className="font-semibold">{orderDetails.orderCode}</span></p>
                <p className="text-sm text-gray-600">• Tổng tiền: <span className="font-semibold">{Number(orderDetails.amount).toLocaleString('vi-VN')}đ</span></p>
              </div>
            )}
            <button
              onClick={handleNavigation}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-300 ${pageStatus.isSuccess ? "bg-[#A47148] hover:bg-[#8a5f3a]" : "bg-red-500 hover:bg-red-600"}`}
            >
              {pageStatus.isSuccess ? "Tiếp tục mua sắm" : "Quay lại giỏ hàng"}
            </button>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Cần hỗ trợ?</p>
              <p className="text-sm font-medium text-[#A47148]">info@coffeehouse.com | 028 7100 1888</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThankYouPage;
