// --- START OF FILE ThanhToan.jsx ---

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '@/components/context/ShopContext';
import WrappedAddressAutoComplete from '@/components/page/AddressAutoComplete';
import { message, Spin } from 'antd';

function Checkout() {
  const { cart, user, isAuthLoading, fetchCart, fetchNotifications } = useContext(ShopContext);
  const navigate = useNavigate();

  const [addressInput, setAddressInput] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    paymentMethod: 'cod',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect để bảo vệ và chuyển hướng
  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }
    if (!user) {
      message.error("Vui lòng đăng nhập để thanh toán.");
      navigate('/dang-nhap', { replace: true });
      return;
    }
    if (cart.length === 0) {
      fetchCart().then(latestCart => {
        if (latestCart && latestCart.length === 0) {
            message.info("Giỏ hàng của bạn đang trống.");
            navigate('/checkout/thank-you', { replace: true });
        }
      });
    }
  }, [isAuthLoading, user, cart, navigate, fetchCart]);


  // useEffect để khôi phục form từ localStorage
  useEffect(() => {
    if (!isAuthLoading && user) {
        const savedFormData = localStorage.getItem('checkoutFormData');
        if (savedFormData) {
            try {
                const parsedData = JSON.parse(savedFormData);
                setFormData((prev) => ({
                    ...prev,
                    phone: parsedData.phone || '',
                    note: parsedData.note || '',
                    paymentMethod: parsedData.paymentMethod || 'cod',
                }));
                setAddressInput(parsedData.addressInput || '');
            } catch (e) {
                console.error("Lỗi khi đọc checkout form data:", e);
                localStorage.removeItem('checkoutFormData');
            }
        }
    }
  }, [isAuthLoading, user]);


  // useEffect để lưu form vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        'checkoutFormData',
        JSON.stringify({
          phone: formData.phone,
          note: formData.note,
          paymentMethod: formData.paymentMethod,
          addressInput: addressInput,
        })
      );
    }
  }, [formData, addressInput, user]);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getProductImage = (item) => item.image || "https://via.placeholder.com/50";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (value) => {
    const displayValue = (typeof value === 'object' && value?.description) ? value.description : value;
    setAddressInput(displayValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addressInput || !formData.phone) {
      message.error("Vui lòng nhập đầy đủ số điện thoại và địa chỉ.");
      return;
    }
    setIsSubmitting(true);

    const orderCode = `COFFEE${new Date().getTime()}`;
    const token = localStorage.getItem('token');
    const cartForOrder = cart.map((item) => ({
      productId: item.productId, type: item.type, name: item.name,
      quantity: item.quantity, price: item.price,
    }));

    const commonOrderData = {
      amount: totalPrice, fullname: user.fullname, email: user.email,
      phone: formData.phone, address: addressInput, note: formData.note,
      cart: cartForOrder,
    };

    try {
      if (formData.paymentMethod === 'cod') {
        const paymentResponse = await fetch('https://coffeehousehub-production.up.railway.app/orders/create-cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...commonOrderData, orderCode, paymentMethod: 'cod' }),
        });
        
        const data = await paymentResponse.json();
        if (!paymentResponse.ok) throw new Error(data.error || 'Giao dịch thất bại');

        // Logic chuyển hướng mới cho COD
        message.success('Đặt hàng thành công!');
        localStorage.removeItem('checkoutFormData');
        await fetchCart();
        await fetchNotifications();
        
        navigate('/checkout/thank-you', { 
            state: { 
                orderCode: data.orderCode, 
                amount: totalPrice 
            } 
        });

      } else if (formData.paymentMethod === 'momo') {
        const paymentResponse = await fetch('https://coffeehousehub-production.up.railway.app/momo/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...commonOrderData, orderId: orderCode, orderInfo: `Thanh toán đơn hàng CoffeeHouse #${orderCode}`, userId: user.id }),
        });
        const data = await paymentResponse.json();
        if (!paymentResponse.ok) throw new Error(data.error || 'Giao dịch thất bại');

        if (data.payUrl) {
            window.location.href = data.payUrl;
        } else {
            throw new Error(data.error || 'Không thể tạo thanh toán MoMo.');
        }

      } else {
        message.info("Phương thức thanh toán này đang được phát triển.");
      }

    } catch (error) {
      message.error('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
        <Spin tip="Đang tải dữ liệu..." size="large" />
      </div>
    );
  }

  if (!user || cart.length === 0) {
    return null; 
  }

  return (
    <section className="bg-white text-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Thanh Toán</h1>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          <div className="lg:w-5/12 w-full border rounded-lg shadow-md p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng ({cart.length} sản phẩm)</h2>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
              {cart.map((item) => (
                <div key={item.cartid} className="flex items-center border-b pb-4 last:border-b-0">
                  <div className="w-16 h-16 mr-4 flex-shrink-0"><img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover rounded"/></div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">{Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t mt-4">
              <div className="flex justify-between text-gray-600"><span>Tạm tính:</span><span>{totalPrice.toLocaleString('vi-VN')}đ</span></div>
              <div className="flex justify-between text-gray-600"><span>Phí vận chuyển:</span><span>Miễn phí</span></div>
              <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold text-lg">Tổng cộng:</span><span className="font-bold text-lg text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span></div>
            </div>
          </div>

          <div className="lg:w-3/12 w-full border rounded-lg shadow-md p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Thanh toán</h2>
            <div className="space-y-3">
              {[{ value: 'cod', label: 'Thanh toán khi giao hàng (COD)' }, { value: 'momo', label: 'Thanh toán qua Ví MoMo' }].map(({ value, label }) => (
                <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                  <input type="radio" name="paymentMethod" value={value} checked={formData.paymentMethod === value} onChange={handleInputChange} className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                  <span className="font-medium text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="lg:w-4/12 w-full border rounded-lg shadow-md p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Thông tin mua hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Họ và tên*</label><input type="text" value={user.fullname} readOnly className="w-full p-2 border rounded bg-gray-100 focus:outline-none"/></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Email*</label><input type="email" value={user.email} readOnly className="w-full p-2 border rounded bg-gray-100 focus:outline-none"/></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Số điện thoại*</label><input type="tel" name="phone" placeholder="Nhập số điện thoại" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" required value={formData.phone} onChange={handleInputChange}/></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Địa chỉ*</label><WrappedAddressAutoComplete value={addressInput} onChange={handleAddressChange}/></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Ghi chú</label><textarea name="note" rows="3" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" value={formData.note} onChange={handleInputChange} placeholder="Ghi chú về đơn hàng..."/></div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-4 disabled:opacity-50 font-medium transition-colors" disabled={isSubmitting || cart.length === 0}>
                {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đơn hàng'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Checkout;