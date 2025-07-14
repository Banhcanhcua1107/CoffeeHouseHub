import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { UserAddOutlined } from '@ant-design/icons';
import { Button, Space, message } from 'antd';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShopContext } from '@/components/context/ShopContext';

// Đặt URL backend Railway ở đây (có thể chuyển sang biến môi trường nếu cần)
const API_BASE_URL = 'https://coffeehousehub-production.up.railway.app';
import { FaBell } from 'react-icons/fa';

// --- Helper function để gọi API và quản lý state loading/error ---
const apiCall = async (method, url, data, setLoading, onSuccess, onError) => {
  setLoading(true);
  try {
    const response = await axios[method](url, data);
    onSuccess(response.data);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Đã có lỗi xảy ra';
    message.error(errorMessage);
    if (onError) onError(error);
  } finally {
    setLoading(false);
  }
};

function BTN() {
  const { 
    updateUser, 
    user: contextUser,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    fetchNotifications,
    markOneNotificationAsRead
  } = useContext(ShopContext);

  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', fullname: '',
    resetCode: '', newPassword: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const notificationRef = useRef(null);
  const authRef = useRef(null);

  useEffect(() => {
    if (contextUser) {
      fetchNotifications();
    }
  }, [contextUser, fetchNotifications]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
      if (authRef.current && !authRef.current.contains(event.target)) setShowForm(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   const handleNotificationClick = (notification) => {
    // Gọi hàm để đánh dấu đã đọc
    markOneNotificationAsRead(notification.id);
    // Đóng dropdown
    setIsNotificationOpen(false);
    // React Router's <Link> sẽ tự động xử lý việc điều hướng
  };
  const resetFormState = () => {
    setFormData({
      username: '', email: '', password: '', fullname: '',
      resetCode: '', newPassword: '', confirmPassword: ''
    });
    setResetStep(1);
    setResendCooldown(0);
  }

  const toggleForm = (type) => {
    if (showForm === type) {
      setShowForm(null);
    } else {
      setShowForm(type);
      resetFormState();
    }
  };

  const handleLogout = () => {
    updateUser(null);
    message.success('Đăng xuất thành công');
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- VALIDATION FOR REGISTER ---
  const validateRegister = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = "Vui lòng nhập tên đăng nhập";
    if (!formData.fullname.trim()) errors.fullname = "Vui lòng nhập họ và tên";
    if (!formData.email.trim()) errors.email = "Vui lòng nhập email";
    else if (!/^[\w-.]+@gmail\.com$/.test(formData.email.trim())) errors.email = "Email phải là địa chỉ @gmail.com hợp lệ";
    if (!formData.password) errors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    else if (!/[A-Z]/.test(formData.password)) errors.password = "Mật khẩu phải có ít nhất 1 ký tự viết hoa";
    else if (!/[^A-Za-z0-9]/.test(formData.password)) errors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    return errors;
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});
    setRegisterSuccess(false);

    if (showForm === 'register') {
      const errors = validateRegister();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }

    const endpoint = showForm === 'login' ? '/login' : '/register';
    const data = showForm === 'login'
      ? { email: formData.email, password: formData.password }
      : { username: formData.username, fullname: formData.fullname, email: formData.email, password: formData.password };

    apiCall('post', `${API_BASE_URL}${endpoint}`, data, setLoading, (responseData) => {
      if (showForm === 'register') {
        setRegisterSuccess(true);
        setFormData({ username: '', email: '', password: '', fullname: '', resetCode: '', newPassword: '', confirmPassword: '' });
        return;
      }
      message.success(responseData.message);
      localStorage.setItem('token', responseData.token);
      updateUser(responseData.user);
      setShowForm(null);
      navigate('/');
    }, (error) => {
      if (showForm === 'register') {
        setFormErrors({ general: error.response?.data?.error || "Đăng ký thất bại" });
      }
      if (showForm === 'login') {
        setFormErrors({ login: error.response?.data?.error || "Email hoặc mật khẩu sai" });
      }
    });
  };
  
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (resetStep === 1) {
        apiCall('post', `${API_BASE_URL}/request-password-reset`, { email: formData.email }, setLoading, (data) => {
          message.success(data.message);
          setResetStep(2);
        });
    } else if (resetStep === 2) {
        apiCall('post', `${API_BASE_URL}/verify-reset-code`, { email: formData.email, code: formData.resetCode }, setLoading, (data) => {
            message.success(data.message);
            setResetStep(3);
        });
    } else if (resetStep === 3) {
        if (formData.newPassword !== formData.confirmPassword) {
            message.error('Mật khẩu mới không khớp');
            return;
        }
        const data = { email: formData.email, code: formData.resetCode, newPassword: formData.newPassword };
        apiCall('post', `${API_BASE_URL}/reset-password`, data, setLoading, (responseData) => {
            message.success(responseData.message);
            toggleForm('login');
        });
    }
  };

  const handleResendCode = useCallback(() => {
    if (resendCooldown > 0) return;
    apiCall('post', `${API_BASE_URL}/request-password-reset`, { email: formData.email }, setLoading, (data) => {
        message.success(data.message);
        setResendCooldown(30);
    });
  }, [formData.email, resendCooldown]);

  const handleMarkAllRead = () => markNotificationsAsRead();

  // --- RENDER FUNCTIONS FOR FORMS ---
  const renderLoginForm = () => (
    <form className="space-y-3" onSubmit={handleAuthSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 bg-[#FFF7ED] border border-[#D9A074] rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074]"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-2 bg-[#FFF7ED] border border-[#D9A074] rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074]"
        required
      />
      {/* Thông báo lỗi tiếng Việt căn trái, đều với input và nút */}
      {formErrors.login && (
        <div className="text-red-500 text-sm w-full text-left pl-1">{formErrors.login === "Invalid email or password" ? "Email hoặc mật khẩu không đúng" : formErrors.login}</div>
      )}
      <button type="submit" className="w-full bg-[#A47148] text-white py-2 rounded hover:bg-[#D9A074] transition font-semibold" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
      <div className="text-center">
        <button type="button" className="text-[#A47148] hover:underline text-sm" onClick={() => toggleForm('reset')}>
          Quên mật khẩu?
        </button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form className="space-y-3" onSubmit={handleAuthSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Tên đăng nhập"
        value={formData.username}
        onChange={handleChange}
        className={`w-full p-2 bg-[#FFF7ED] border rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074] ${formErrors.username ? 'border-red-500' : 'border-[#D9A074]'}`}
        required
      />
      {formErrors.username && <div className="text-red-500 text-xs">{formErrors.username}</div>}
      <input
        type="text"
        name="fullname"
        placeholder="Họ và tên"
        value={formData.fullname}
        onChange={handleChange}
        className={`w-full p-2 bg-[#FFF7ED] border rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074] ${formErrors.fullname ? 'border-red-500' : 'border-[#D9A074]'}`}
        required
      />
      {formErrors.fullname && <div className="text-red-500 text-xs">{formErrors.fullname}</div>}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className={`w-full p-2 bg-[#FFF7ED] border rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074] ${formErrors.email ? 'border-red-500' : 'border-[#D9A074]'}`}
        required
      />
      {formErrors.email && <div className="text-red-500 text-xs">{formErrors.email}</div>}
      <input
        type="password"
        name="password"
        placeholder="Mật khẩu"
        value={formData.password}
        onChange={handleChange}
        className={`w-full p-2 bg-[#FFF7ED] border rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074] ${formErrors.password ? 'border-red-500' : 'border-[#D9A074]'}`}
        required
        minLength="6"
      />
      {formErrors.password && <div className="text-red-500 text-xs">{formErrors.password}</div>}
      {/* Thông báo lỗi tiếng Việt ngay trên nút */}
      {formErrors.general && (
        <div className="text-red-500 text-sm mb-2 text-center">{formErrors.general}</div>
      )}
      {registerSuccess && (
        <div className="text-green-600 text-sm mb-2 text-center font-semibold">Đăng ký thành công!</div>
      )}
      <button
        type="submit"
        className="w-full bg-[#A47148] text-white py-2 rounded hover:bg-[#D9A074] transition font-semibold"
        disabled={loading}
      >
        {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
      </button>
    </form>
  );

  const renderResetForm = () => (
    <form className="space-y-3" onSubmit={handleResetSubmit}>
      {resetStep === 1 && <>
        <p className="text-sm text-gray-600">Nhập email của bạn để nhận mã xác nhận.</p>
        <input type="email" name="email" placeholder="Email đăng ký" value={formData.email} onChange={handleChange} className="w-full p-2 bg-[#FFF7ED] border border-[#D9A074] rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074]" required />
        <button type="submit" className="w-full bg-[#A47148] text-white py-2 rounded hover:bg-[#D9A074] transition font-semibold" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi mã'}</button>
        <div className="text-center"><button type="button" className="text-[#A47148] hover:underline text-sm" onClick={() => toggleForm('login')}>Quay lại đăng nhập</button></div>
      </>}
      {resetStep === 2 && <>
        <div className="flex items-center space-x-2">
            <input type="text" name="resetCode" placeholder="Mã xác nhận" value={formData.resetCode} onChange={handleChange} className="flex-grow w-full p-2 bg-[#FFF7ED] border border-[#D9A074] rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074]" required />
            <button type="button" onClick={handleResendCode} disabled={resendCooldown > 0 || loading} className="px-3 py-2 text-sm text-[#A47148] bg-transparent border border-[#A47148] rounded hover:bg-[#FFF7ED] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition">
              {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại'}
            </button>
        </div>
        <button type="submit" className="w-full bg-[#A47148] text-white py-2 rounded hover:bg-[#D9A074] transition font-semibold" disabled={loading}>{loading ? 'Đang xác nhận...' : 'Xác nhận'}</button>
      </>}
      {resetStep === 3 && <>
        <input type="password" name="newPassword" placeholder="Mật khẩu mới (ít nhất 6 ký tự)" value={formData.newPassword} onChange={handleChange} className="w-full p-2 bg-[#FFF7ED] border border-[#D9A074] rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074]" required minLength="6" />
        <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu mới" value={formData.confirmPassword} onChange={handleChange} className="w-full p-2 bg-[#FFF7ED] border border-[#D9A074] rounded focus:outline-none focus:ring-1 focus:ring-[#D9A074]" required minLength="6" />
        <button type="submit" className="w-full bg-[#A47148] text-white py-2 rounded hover:bg-[#D9A074] transition font-semibold" disabled={loading}>{loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}</button>
      </>}
    </form>
  );

  // --- MAIN COMPONENT RENDER ---
  return (
    <div className="flex items-center">
      {contextUser ? (
        <div className="flex items-center space-x-4">
          <span className="text-white hidden sm:inline">
            {contextUser.role === 'admin' ? 'Chào Admin' : `Chào, ${contextUser.fullname || contextUser.username}`}
          </span>
          <Button size="middle" className="bg-[#FFF7ED] text-[#4B2E2E] hover:!text-[#A47148] hover:!border-[#A47148] font-medium transition" onClick={handleLogout}>Đăng xuất</Button>
          
          <div className="relative" ref={notificationRef}>
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative text-white hover:text-[#FFD8A9] transition text-xl p-2">
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute top-full right-0 mt-4 w-80 bg-[#4B2E2E] rounded-lg shadow-xl z-50 p-4 border border-[#5A3A3A]">
                <div className='flex justify-between items-center border-b border-[#5A3A3A] pb-2 mb-3'>
                    <h4 className="font-bold text-[#FFD8A9] text-lg">Thông báo</h4>
                    {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-[#FFD8A9] hover:underline">Đánh dấu đã đọc</button>}
                </div>
                <div className="text-white text-sm space-y-1 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(noti => (
                       <Link 
                         to={noti.link || '#'} 
                         key={noti.id} 
                         // SỬA ĐỔI QUAN TRỌNG: Gọi hàm handleNotificationClick
                         onClick={() => handleNotificationClick(noti)} 
                       >
                          <div className={`p-2 rounded cursor-pointer ${noti.is_read ? 'opacity-60 hover:bg-[#3E2C24]' : 'bg-[#5f4444] hover:bg-[#6a4d4d]'}`}>
                            <p className={`font-semibold ${!noti.is_read ? 'text-white' : 'text-gray-300'}`}>{noti.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(noti.created_at).toLocaleString('vi-VN')}</p>
                          </div>
                       </Link>
                    )) : (
                        <div className="p-4 text-center text-gray-400">Không có thông báo mới.</div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative" ref={authRef}>
          <Space>
            <Button type="primary" size="middle" icon={<UserAddOutlined />} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }} className="hover:!bg-[#D2B48C] hover:!text-[#4B2E2E] font-semibold transition" onClick={() => toggleForm('register')}>Đăng ký</Button>
            <Button size="middle" className="bg-[#FFF7ED] text-[#4B2E2E] hover:!text-[#A47148] hover:!border-[#A47148] font-medium transition" onClick={() => toggleForm('login')}>Đăng nhập</Button>
          </Space>
          
          {showForm && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#D9A074] rounded shadow-lg p-5 z-50 text-[#3E2C24]">
              <h3 className="text-lg font-bold mb-4">
                {showForm === 'login' ? 'Đăng nhập' : 
                 showForm === 'register' ? 'Đăng ký' : 
                 resetStep === 1 ? 'Quên mật khẩu' : 
                 resetStep === 2 ? 'Nhập mã xác nhận' : 
                 'Đặt lại mật khẩu'}
              </h3>
              
              {showForm === 'login' && renderLoginForm()}
              {showForm === 'register' && renderRegisterForm()}
              {showForm === 'reset' && renderResetForm()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BTN;