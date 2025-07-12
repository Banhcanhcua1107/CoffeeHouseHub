import { useContext, useState, useEffect } from "react";
import { ShopContext } from "@/components/context/ShopContext";
import { useNavigate, useLocation } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    user, 
    fetchCart 
  } = useContext(ShopContext);

  const [showCart, setShowCart] = useState(false);
  const [localCart, setLocalCart] = useState([]);

  useEffect(() => {
    setLocalCart(cart || []);
  }, [cart]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLocalCart([]);
    }
  }, [user, fetchCart]);

  const totalQuantity = localCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutClick = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  const isCheckoutPage = location.pathname === '/checkout'; 

  return (
    <>
      {/* CHỈ HIỂN THỊ ICON GIỎ HÀNG NẾU KHÔNG PHẢI TRANG THANH TOÁN */}
      {!isCheckoutPage && (
        // --- THAY ĐỔI VỊ TRÍ ICON ---
        <div className="fixed bottom-7 right-7 z-50"> 
          <button
            onClick={() => setShowCart((s) => !s)}
            className="relative w-14 h-14 bg-[#A47148] rounded-full flex items-center justify-center shadow-lg hover:bg-[#D9A074] transition-all duration-300 transform hover:scale-110"
            title="Xem giỏ hàng"
            style={{ outline: "none", border: "none" }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              strokeWidth={1.8} 
              stroke="white" 
              className="w-7 h-7"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3.375 5.25h1.372a2.25 2.25 0 0 1 2.193 1.765l.11.49M7.5 14.25h7.875a2.25 2.25 0 0 0 2.193-1.765l1.383-6.221A1.125 1.125 0 0 0 17.868 5.25H5.857M7.5 14.25l-1.5 6h9.75M7.5 14.25l-2.25-9M7.5 14.25h-4.125m12.75 6a1.5 1.5 0 1 0 3 0m-12 0a1.5 1.5 0 1 0 3 0" 
              />
            </svg>
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      )}

      {/* CHỈ HIỂN THỊ POPUP GIỎ HÀNG NẾU showCart LÀ TRUE VÀ KHÔNG PHẢI TRANG THANH TOÁN */}
      {showCart && !isCheckoutPage && ( 
        // --- THAY ĐỔI VỊ TRÍ POPUP ---
        <div className="fixed bottom-24 right-7 w-72 bg-white text-[#3E2C24] shadow-2xl rounded-lg z-50 border border-[#f2e9df]">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold">Giỏ hàng của bạn</h3>
            {!user && (
              <p className="text-xs text-gray-500 mt-1">
                Đăng nhập để lưu giỏ hàng và thanh toán
              </p>
            )}
          </div>
          <div className="p-4">
            {localCart.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có sản phẩm nào.</p>
            ) : (
              <>
                <ul className="mb-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                  {localCart.map((item) => (
                    <li key={item.cartid} className="pb-3 border-b border-gray-100 last:border-none">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-grow">
                          <span className="block font-semibold text-sm leading-tight">{item.name}</span>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => updateCartQuantity(item.cartid, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-lg font-bold text-[#A47148]"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.cartid, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-lg font-bold text-[#A47148]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="block text-[#A47148] font-semibold text-sm">
                            {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                          </span>
                          <button
                            onClick={() => removeFromCart(item.cartid)}
                            className="text-xs text-red-500 hover:underline font-medium mt-2"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="font-bold text-base text-right mb-4 border-t border-gray-200 pt-3">
                  Tổng cộng: {totalPrice.toLocaleString('vi-VN')} đ
                </div>
                {user && localCart.length > 0 && (
                  <button 
                    className="w-full bg-[#A47148] hover:bg-[#D9A074] text-white py-2.5 rounded-lg font-semibold text-sm transition-colors duration-300"
                    onClick={handleCheckoutClick} 
                  >
                    Tiến hành thanh toán
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;