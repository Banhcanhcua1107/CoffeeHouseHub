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
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px #0001', textAlign: 'center' }}>
          <div className="loader" />
          <h2 style={{ color: '#A47148', marginTop: 16 }}>Đang xử lý đơn hàng...</h2>
        </div>
      </div>
    );
  }

  if (!pageStatus.isSuccess) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px #0001', textAlign: 'center' }}>
          <h2 style={{ color: '#E03E2D', marginBottom: 12 }}>Lỗi</h2>
          <p>{pageStatus.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: 400
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#e0f7ec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <span style={{ fontSize: 42, color: '#27ae60' }}>✓</span>
        </div>
        <h2 style={{ color: '#27ae60', fontSize: 24, marginBottom: 12 }}>Thanh toán thành công!</h2>
        <div style={{ fontSize: 16, color: '#555', lineHeight: '1.6' }}>
          <div><strong>Mã đơn:</strong> {orderDetails.orderCode}</div>
          <div><strong>Số tiền:</strong> {Number(orderDetails.amount).toLocaleString('vi-VN')}đ</div>
          <div style={{ marginTop: 8 }}>Cảm ơn bạn đã mua hàng tại Coffee House!</div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 24,
            padding: '12px 36px',
            background: '#A47148',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

export default ThankYouPage;
