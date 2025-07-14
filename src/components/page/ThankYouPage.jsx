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

    // Lấy thông tin đơn hàng từ location.state hoặc localStorage
    let stateOrder = location.state;
    let orderCode = '';
    let amount = 0;
    if (stateOrder && stateOrder.orderCode && stateOrder.amount) {
      orderCode = stateOrder.orderCode;
      amount = stateOrder.amount;
      localStorage.setItem('/thankYouOrder', JSON.stringify({ orderCode, amount }));
    } else {
      const saved = localStorage.getItem('thankYouOrder');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          orderCode = parsed.orderCode;
          amount = parsed.amount;
        } catch (e) {}
      }
    }

    if (!orderCode || !amount) {
      setPageStatus({
        isLoading: false,
        isSuccess: false,
        message: 'Không tìm thấy thông tin đơn hàng. Vui lòng đặt lại đơn hàng.'
      });
      setTimeout(() => navigate('/thankYouOrder', { replace: true }), 2000);
      return;
    }

    setOrderDetails({ orderCode, amount });
    setPageStatus({
      isLoading: false,
      isSuccess: true,
      message: 'Đặt hàng thành công!'
    });
    // Cập nhật lại giỏ hàng và thông báo
    fetchCart && fetchCart();
    fetchNotifications && fetchNotifications();
    // Xóa localStorage sau khi hiển thị
    setTimeout(() => {
      localStorage.removeItem('thankYouOrder');
    }, 3000);
  }, [location.state, navigate, fetchCart, fetchNotifications]);

  if (pageStatus.isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0001', textAlign: 'center' }}>
          <h2 style={{ color: '#A47148', marginBottom: 12 }}>Đang xử lý đơn hàng...</h2>
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (!pageStatus.isSuccess) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0001', textAlign: 'center' }}>
          <h2 style={{ color: '#E03E2D', marginBottom: 12 }}>Lỗi</h2>
          <p>{pageStatus.message}</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông tin đơn hàng thành công
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0001', textAlign: 'center', maxWidth: 420 }}>
        <h2 style={{ color: '#27ae60', fontSize: 28, marginBottom: 8 }}>🎉 Đặt hàng thành công!</h2>
        <p style={{ fontSize: 18, marginBottom: 10 }}>
          Mã đơn hàng: <strong>{orderDetails.orderCode}</strong><br />
          Số tiền: <strong>{Number(orderDetails.amount).toLocaleString('vi-VN')}đ</strong><br />
          Cảm ơn bạn đã mua hàng tại Coffee House!<br />
          Vui lòng đợi xác nhận đơn hàng của bạn.
        </p>
        <button style={{ marginTop: 18, padding: '8px 24px', background: '#A47148', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >Về trang chủ</button>
      </div>
    </div>
  );
}

export default ThankYouPage;
