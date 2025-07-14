import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';
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
    message: 'Đang xử lý đơn hàng...'
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
        } catch {}
      }
    }

    if (foundOrder) {
      setOrderDetails({ orderCode: code, amount: amt });
      setPageStatus({
        isLoading: false,
        isSuccess: true,
        message: 'Đặt hàng thành công!'
      });
      fetchCart && fetchCart();
      fetchNotifications && fetchNotifications();
    } else {
      setPageStatus({
        isLoading: false,
        isSuccess: false,
        message: 'Không tìm thấy thông tin đơn hàng. Vui lòng đặt lại.'
      });
      setTimeout(() => navigate('/gio-hang', { replace: true }), 3000);
    }

  }, [location.state, navigate, fetchCart, fetchNotifications]);

  if (pageStatus.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="loader mb-4"></div>
          <h2 className="text-[#A47148] font-semibold">Đang xử lý đơn hàng...</h2>
        </div>
      </div>
    );
  }

  if (!pageStatus.isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-red-600 font-semibold mb-4">Lỗi</h2>
          <p>{pageStatus.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f8f5f0]">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        <div className="bg-[#A47148] text-white p-8 flex flex-col items-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Thành Công!</h2>
        </div>
        <div className="p-6 text-[#A47148]">
          <p className="text-center text-lg mb-4">Thanh toán và xử lý đơn hàng thành công!</p>
          <div className="bg-[#fdf9f6] border border-[#e8ddd3] rounded-lg p-4 mb-6">
            <p className="mb-2"><span className="font-semibold">• Mã đơn hàng:</span> <span className="text-gray-800">{orderDetails.orderCode}</span></p>
            <p><span className="font-semibold">• Tổng tiền:</span> <span className="text-gray-800">{Number(orderDetails.amount).toLocaleString('vi-VN')}đ</span></p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#A47148] text-white py-3 rounded-lg font-semibold hover:bg-[#8c5d3e] transition"
          >
            Tiếp tục mua sắm
          </button>
          <div className="mt-6 text-center text-sm text-[#A47148] border-t pt-4">
            <p>Cần hỗ trợ?</p>
            <p className="font-medium">info@coffeehouse.com | 028 7100 1888</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;
