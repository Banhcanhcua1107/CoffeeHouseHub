import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Đặt URL backend Railway ở đây (dùng HTTPS, KHÔNG có port để tránh lỗi SSL)
const API_BASE_URL = 'https://coffeehousehub-production.up.railway.app';
import { message } from 'antd'; // Sử dụng message của antd để thông báo đẹp hơn

export const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  // =================================================================
  // 1. STATES - QUẢN LÝ TOÀN BỘ DỮ LIỆU CỦA ỨNG DỤNG
  // =================================================================
  
  // Dữ liệu người dùng
  const [user, setUser] = useState(null);
  
  // Dữ liệu giỏ hàng và thông báo
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dữ liệu sản phẩm và menu
  const [products, setProducts] = useState([]);
  const [cafes, setCafes] = useState([]);
  
  // Trạng thái loading
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // =================================================================
  // 2. AUTHENTICATION & USER FUNCTIONS - CÁC HÀM LIÊN QUAN ĐẾN NGƯỜI DÙNG
  // =================================================================

  // Hàm cập nhật state người dùng
  const updateUser = (newUser) => {
    setUser(newUser);
    if (!newUser) {
      // Khi đăng xuất, xóa token và reset các state liên quan
      localStorage.removeItem('token');
      setCart([]);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Hàm kiểm tra token và lấy thông tin user khi tải lại trang
  const checkUserStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    setIsAuthLoading(true);
    if (token) {
      try {
        const res = await axios.get(`${API_BASE_URL}/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        updateUser(res.data);
      } catch (error) {
        console.error("Token không hợp lệ hoặc đã hết hạn.", error);
        updateUser(null); // Xóa user nếu token hỏng
      }
    } else {
      updateUser(null); // Không có token
    }
    setIsAuthLoading(false);
  }, []);

  // Gọi hàm kiểm tra user MỘT LẦN DUY NHẤT khi app khởi động
  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);


  // =================================================================
  // 3. DATA FETCHING FUNCTIONS - CÁC HÀM LẤY DỮ LIỆU TỪ SERVER
  // =================================================================

  const fetchProducts = useCallback(() => {
    axios.get(`${API_BASE_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Lỗi khi tải sản phẩm:", err));
  }, []);

  const fetchCafes = useCallback(() => {
    axios.get(`${API_BASE_URL}/cafe`)
      .then((res) => setCafes(res.data))
      .catch((err) => console.error("Lỗi khi tải menu cafe:", err));
  }, []);
  
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
        const res = await axios.get(`${API_BASE_URL}/cart/select`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCart(res.data);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi tải giỏ hàng:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
            updateUser(null); // Token hết hạn, tự động đăng xuất
        }
        setCart([]);
        return [];
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
        const res = await axios.get(`${API_BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
        setNotifications([]);
        setUnreadCount(0);
        return [];
    }
  }, []);

  // useEffect để tải dữ liệu chung (Sản phẩm, Menu) khi app khởi động
  useEffect(() => {
    fetchProducts();
    fetchCafes();
  }, [fetchProducts, fetchCafes]);

  // useEffect để tải dữ liệu riêng (Giỏ hàng, Thông báo) chỉ khi user đã đăng nhập
  useEffect(() => {
    if (user && !isAuthLoading) {
      fetchCart();
      fetchNotifications();
    }
  }, [user, isAuthLoading, fetchCart, fetchNotifications]);


  // =================================================================
  // 4. ACTION FUNCTIONS - CÁC HÀM TƯƠNG TÁC
  // =================================================================
  
  const addToCart = (productId, type, quantity = 1, image = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    
    axios.post(`${API_BASE_URL}/cart/add`, { productId, type, quantity, image }, { 
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      message.success("Đã thêm vào giỏ hàng!");
      fetchCart(); // Tải lại giỏ hàng sau khi thêm
    })
    .catch(err => message.error(err.response?.data?.error || "Không thể thêm vào giỏ hàng"));
  };

  const updateCartQuantity = (cartId, quantity) => {
    const token = localStorage.getItem('token');
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    axios.put(`${API_BASE_URL}/cart/${cartId}`, { quantity }, { 
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchCart())
      .catch((err) => message.error("Lỗi khi cập nhật giỏ hàng: " + err.message));
  };

  const removeFromCart = (cartId) => {
    const token = localStorage.getItem('token');
    axios.delete(`${API_BASE_URL}/cart/${cartId}`, { 
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        message.info("Đã xóa sản phẩm khỏi giỏ hàng.");
        fetchCart();
      })
      .catch((err) => message.error("Lỗi khi xóa sản phẩm: " + err.message));
  };

  const markNotificationsAsRead = () => {
    // Cập nhật UI ngay lập tức
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);

    // Gọi API nền
    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/notifications/mark-read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => {
        console.error("Lỗi khi đánh dấu đã đọc:", err);
        message.error("Không thể đồng bộ trạng thái thông báo.");
        fetchNotifications(); // Rollback nếu lỗi
    });
  };

  const markOneNotificationAsRead = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.is_read) return;

    // Cập nhật UI ngay lập tức
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: 1 } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Gọi API nền
    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/notifications/${notificationId}/mark-one-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    }).catch(err => {
        console.error("Lỗi khi đánh dấu 1 thông báo đã đọc:", err);
        message.error("Không thể cập nhật trạng thái thông báo.");
        fetchNotifications(); // Rollback nếu lỗi
    });
  };

  // =================================================================
  // 5. CONTEXT VALUE - CUNG CẤP STATE VÀ HÀM CHO TOÀN BỘ ỨNG DỤNG
  // =================================================================
  const contextValue = {
    // States
    user,
    cart,
    products, // Đã có lại
    cafes,    // Đã có lại
    notifications,
    unreadCount,
    isAuthLoading,

    // Hàm cập nhật
    updateUser,

    // Hàm fetch dữ liệu
    fetchCart,
    fetchProducts,
    fetchCafes,
    fetchNotifications,

    // Hàm tương tác
    addToCart,
    updateCartQuantity,
    removeFromCart,
    markNotificationsAsRead,
    markOneNotificationAsRead,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export const ShopContextProvider = ShopProvider;