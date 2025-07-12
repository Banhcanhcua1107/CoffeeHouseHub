// src/components/Admin/AdminSidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Avatar from "@/components/img/LOGOCOFFE/bienlaigmail.png";

// Icons cho Sidebar Admin
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ProductIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const OrderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ContactIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

// --- THÊM ICON MỚI CHO QUẢN LÝ TÀI KHOẢN ---
const UserManagementIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const AdminSidebar = ({ user }) => {
  const location = useLocation();

  // --- SẮP XẾP LẠI MẢNG NAVITEMS THEO YÊU CẦU ---
  const navItems = [
    { name: 'Quản lý Tài khoản', icon: <UserManagementIcon />, href: '/admin/users' },
    { name: 'Thống kê Doanh thu', icon: <RevenueIcon />, href: '/admin/revenue' },
    { name: 'Quản lý Menu', icon: <MenuIcon />, href: '/menu' },
    { name: 'Quản lý Sản phẩm', icon: <ProductIcon />, href: '/sanpham' },
    { name: 'Quản lý Đơn hàng', icon: <OrderIcon />, href: '/order' },
    { name: 'Thư Liên hệ', icon: <ContactIcon />, href: '/contact' },
  ];

  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
      <div className="flex flex-col items-center mb-6 text-center border-b pb-6">
        <img src={user?.avatar || Avatar} alt="Admin Avatar" className="w-24 h-24 rounded-full mb-4 border-2 border-white object-cover shadow-md" />
        <h2 className="text-xl font-bold text-gray-800">{user?.fullname || 'Admin'}</h2>
        <p className="text-sm text-gray-500">{user?.email || 'admin@coffeehouse.com'}</p>
      </div>
      <nav className="flex-grow">
        <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Chức năng</h3>
        <ul>
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.href);
            return (
                <li key={item.name}>
                <Link 
                    to={item.href} 
                    className={`flex items-center px-4 py-3 my-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                        ? 'bg-[#A47148] text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#A47148]'
                    }`}
                >
                    {item.icon} {item.name}
                </Link>
                </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;