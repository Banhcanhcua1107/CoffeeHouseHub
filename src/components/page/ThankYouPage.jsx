import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';
import { ShopContext } from '@/components/context/ShopContext';
import { CheckCircle } from 'lucide-react';

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
      setTimeout(() => navigate('/cart', { replace: true }), 3000);
    }

  }, [location.state, navigate, fetchCart, fetchNotifications]);

  if (pageStatus.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-[#A47148] mb-3 text-lg font-semibold">Đang xử lý đơn hàng...</h2>
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (!pageStatus.isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-red-500 mb-3 text-lg font-semibold">Lỗi</h2>
          <p>{pageStatus.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f6f1] px-4 py-8">
      <div className="bg-[#fefaf5] rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-[#A47148] text-center p-8 rounded-t-3xl">
          <div className="flex justify-center mb-4">
            <div className="bg-[#fefaf5] rounded-full p-3">
              <CheckCircle size={48} className="text-[#A47148]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Thành Công!</h2>
        </div>

        <div className="p-8 text-center text-[#5a4735]">
          <p className="mb-4 text-lg font-medium">Thanh toán và xử lý đơn hàng thành công!</p>
          <div className="bg-[#f8f5f0] border-l-4 border-[#A47148] p-4 rounded-lg mb-6 text-left">
            <p><span className="font-semibold">• Mã đơn hàng:</span> <span className="font-bold text-[#A47148]">{orderDetails.orderCode}</span></p>
            <p><span className="font-semibold">• Tổng tiền:</span> <span className="text-[#A47148]">{Number(orderDetails.amount).toLocaleString('vi-VN')}đ</span></p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-[#A47148] hover:bg-[#8d5e3f] text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Tiếp tục mua sắm
          </button>
          <div className="mt-8 text-sm">
            <p>Cần hỗ trợ?</p>
            <p className="mt-1 font-semibold">info@coffeehouse.com | 028 7100 1888</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;
