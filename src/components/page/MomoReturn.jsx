// --- START OF FILE MomoReturn.jsx ---

import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShopContext } from '@/components/context/ShopContext';

function MomoReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCart, fetchNotifications } = useContext(ShopContext);

  const isProcessing = useRef(false);

  const [pageStatus, setPageStatus] = useState({
    isLoading: true,
    isSuccess: false,
    message: "Đang xử lý kết quả thanh toán...",
  });

  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    amount: 0,
  });

  useEffect(() => {
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;

    const processPaymentResult = async () => {
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      setOrderDetails({ orderId, amount: Number(amount) || 0 });

      try {
        const response = await fetch('http://localhost:3000/momo/verify-and-send-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(searchParams)),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPageStatus({
            isLoading: false,
            isSuccess: true,
            message: "Thanh toán và xử lý đơn hàng thành công!",
          });
          fetchCart();
          fetchNotifications();
        } else {
          setPageStatus({
            isLoading: false,
            isSuccess: false,
            message: data.error || "Có lỗi xảy ra, vui lòng thử lại.",
          });
        }
      } catch (error) {
        setPageStatus({
          isLoading: false,
          isSuccess: false,
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng và thử lại.",
        });
      }
    };

    processPaymentResult();
    
  }, [searchParams, fetchCart, fetchNotifications]);

  // Hàm điều hướng người dùng sau khi có kết quả
  const handleNavigation = () => {
    if (pageStatus.isSuccess) {
      // Nếu thành công, về trang chủ
      navigate("/");
    } else {
      // Nếu thất bại, về lại trang thanh toán
      navigate("/checkout");
    }
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
              <svg className="w-20 h-20 mx-auto text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-white mt-4">Thành Công!</h1>
            </div>
          )}

          {!pageStatus.isLoading && !pageStatus.isSuccess && (
            <div className="relative z-10">
              <svg className="w-20 h-20 mx-auto text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-white mt-4">Giao dịch không thành công</h1>
            </div>
          )}
        </div>

        {!pageStatus.isLoading && (
          <div className="p-6 text-center">
            <h2 className={`text-xl font-semibold mb-2 ${pageStatus.isSuccess ? "text-[#A47148]" : "text-red-600"}`}>
              {pageStatus.message}
            </h2>

            {(pageStatus.isSuccess || orderDetails.orderId) && (
              <div className="bg-[#F9F5F0] rounded-lg p-4 my-6 text-left">
                <h3 className="font-medium text-[#A47148] mb-2">Thông tin giao dịch</h3>
                <p className="text-sm text-gray-600">• Mã đơn hàng: <span className="font-semibold">{orderDetails.orderId || 'N/A'}</span></p>
                <p className="text-sm text-gray-600">• Tổng tiền: <span className="font-semibold">{orderDetails.amount.toLocaleString('vi-VN')}đ</span></p>
              </div>
            )}

            <button
              onClick={handleNavigation}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-300 ${pageStatus.isSuccess ? "bg-[#A47148] hover:bg-[#8a5f3a]" : "bg-red-500 hover:bg-red-600"}`}
            >
              {pageStatus.isSuccess ? "Tiếp tục mua sắm" : "Thử lại thanh toán"}
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

export default MomoReturn;