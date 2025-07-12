import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '@/components/context/ShopContext';
import { P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12 } from '@/components/img/Product/';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 } from '@/components/img/Shop/';
import WrappedAddressAutoComplete from '@/components/page/AddressAutoComplete';

function Checkout() {
  const { cart, user, fetchCart } = useContext(ShopContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    paymentMethod: 'cod',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allProductImageMap = {
    "P1": P1, "P2": P2, "P3": P3, "P4": P4, "P5": P5, "P6": P6,
    "P7": P7, "P8": P8, "P9": P9, "P10": P10, "P11": P11, "P12": P12,
    "s1.jpg": S1, "s2.jpg": S2, "s3.jpg": S3, "s4.jpg": S4, "s5.jpg": S5,
    "s6.jpg": S6, "s7.jpg": S7, "s8.jpg": S8, "s9.jpg": S9, "s10.jpg": S10,
    "s11.jpg": S11, "s12.jpg": S12
  };

  useEffect(() => {
    if (!user) {
      navigate('/dang-nhap');
    }
  }, [user, navigate]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const sortedCart = [...cart].sort((a, b) => {
    if (a.type === 'cafe' && b.type !== 'cafe') return -1;
    if (a.type !== 'cafe' && b.type === 'cafe') return 1;
    return 0;
  });

  const getProductImage = (item) => {
    return allProductImageMap[item.image] || "https://via.placeholder.com/50";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const commonOrderData = {
        amount: totalPrice,
        userId: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: formData.phone,
        address: formData.address,
        cart: cart,
    };

    try {
        if (formData.paymentMethod === 'cod' || formData.paymentMethod === 'transfer') {
            fetchCart();
            navigate('/cam-on');
        } else if (formData.paymentMethod === 'momo') {
            const orderCode = `COFFEE${new Date().getTime()}`;
            const res = await fetch('https://coffeehousehub-production.up.railway.app/momo/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...commonOrderData,
                    orderId: orderCode,
                    orderInfo: `Thanh toán đơn hàng CoffeeHouse #${orderCode}`,
                })
            });
            const data = await res.json();
            if (data.payUrl) window.location.href = data.payUrl;
            else alert('Không thể tạo thanh toán MoMo.');
        } else if (formData.paymentMethod === 'vnpay') {
            const orderCode = `COFFEE${new Date().getTime()}`;
            const res = await fetch('https://coffeehousehub-production.up.railway.app/vnpay/create_payment_url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...commonOrderData,
                    orderId: orderCode,
                    orderDescription: `Thanh toán đơn hàng CoffeeHouse #${orderCode}`,
                    language: 'vn',
                    bankCode: ''
                })
            });
            const data = await res.json();
            if (data.paymentUrl) window.location.href = data.paymentUrl;
            else alert('Không thể tạo thanh toán VNPAY.');
        }
    } catch (error) {
        alert('Lỗi thanh toán: ' + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white text-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Thanh Toán</h1>

        {/* SỬA LỖI GIAO DIỆN: Cấu trúc 3 cột chính */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Cột 1: Đơn hàng (40%) */}
          <div className="lg:w-2/12 w-full border rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng ({cart.length} sản phẩm)</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Giỏ hàng của bạn đang trống.</p>
            ) : (
              <div className="space-y-4">
                {sortedCart.map((item) => (
                  <div key={item.cartid || item.id} className="flex items-start border-b pb-4 last:border-b-0">
                    <div className="w-16 h-16 mr-4 flex-shrink-0">
                      <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover rounded" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600 mb-1">Loại: {item.type === 'cafe' ? 'Cà phê' : 'Sản phẩm'}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        <p className="font-semibold text-gray-800">{Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="space-y-2 pt-4 border-t mt-4">
                  <div className="flex justify-between text-gray-600"><span>Tạm tính:</span><span>{totalPrice.toLocaleString('vi-VN')}đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Phí vận chuyển:</span><span>Miễn phí</span></div>
                  <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold text-lg">Tổng cộng:</span><span className="font-bold text-lg text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Cột 2: Thanh toán (25%) */}
          <div className="lg:w-3/12 w-full border rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thanh toán</h2>
            <div className="space-y-3">
              {[
                { value: 'cod', label: 'Thanh toán khi giao hàng (COD)' },
                { value: 'transfer', label: 'Chuyển khoản ngân hàng' },
                { value: 'momo', label: 'Thanh toán qua Ví MoMo' },
                { value: 'vnpay', label: 'Thanh toán qua VNPAY' }
              ].map(({value, label}) => (
                <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                  <input type="radio" name="paymentMethod" value={value} checked={formData.paymentMethod === value} onChange={handleInputChange} className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span className="font-medium text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cột 3: Thông tin khách hàng (35%) */}
          <div className="lg:w-2/12 w-full border rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin mua hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Họ và tên*</label>
                <input type="text" name="fullname" value={user?.fullname || ''} readOnly className="w-full p-2 border rounded bg-gray-100 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email*</label>
                <input type="email" name="email" value={user?.email || ''} readOnly className="w-full p-2 border rounded bg-gray-100 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Số điện thoại*</label>
                <input type="tel" name="phone" placeholder="Nhập số điện thoại" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" required value={formData.phone} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Địa chỉ*</label>
                <WrappedAddressAutoComplete value={formData.address} onChange={(address) => setFormData((prev) => ({ ...prev, address }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Ghi chú</label>
                <textarea name="note" rows="3" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" value={formData.note} onChange={handleInputChange} placeholder="Ghi chú về đơn hàng..." />
              </div>
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