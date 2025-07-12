// src/pages/admin/UserManagementPage.jsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSearch, FaUserShield, FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import AdminSidebar from '@/components/Admin/AdminSidebar'; // Chỉnh lại đường dẫn nếu cần
import { ShopContext } from '@/components/context/ShopContext'; // Chỉnh lại đường dẫn nếu cần

const UserManagementPage = () => {
  const { user, token } = useContext(ShopContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
        const response = await axios.get('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
        } catch (err) {
        console.error("Lỗi khi lấy danh sách người dùng:", err);
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
        } finally {
        setLoading(false);
        }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);
  
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleRoleChange = async (userId, newRole) => {
    // Ngăn admin tự đổi vai trò của mình
    if (userId === user.id) {
        alert("Bạn không thể thay đổi vai trò của chính mình.");
        return;
    }
    
    try {
        await axios.put(`/api/admin/users/${userId}/role`, 
            { role: newRole },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // Cập nhật lại state để giao diện thay đổi ngay lập tức
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert('Cập nhật vai trò thành công!');
    } catch (err) {
        console.error("Lỗi khi cập nhật vai trò:", err);
        alert(err.response?.data?.error || "Có lỗi xảy ra, không thể cập nhật vai trò.");
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <AdminSidebar user={user} />
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Quản lý Tài khoản</h1>
                <p className="text-gray-500 mb-6">Xem, tìm kiếm và quản lý vai trò của người dùng.</p>

                <div className="relative mb-6">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaSearch className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, hoặc username..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr><td colSpan="3" className="text-center py-10">Đang tải...</td></tr>
                      ) : error ? (
                        <tr><td colSpan="3" className="text-center py-10 text-red-500">{error}</td></tr>
                      ) : currentUsers.length > 0 ? (
                        currentUsers.map(u => (
                          <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{u.fullname || u.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button onClick={() => handleRoleChange(u.id, 'admin')} className={`p-2 rounded-full transition-colors ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`} title="Đặt làm Admin">
                                    <FaUserShield />
                                </button>
                                <button onClick={() => handleRoleChange(u.id, 'user')} className={`p-2 rounded-full transition-colors ${u.role === 'user' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`} title="Đặt làm User">
                                    <FaUser />
                                </button>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                  {u.role}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="text-center py-10 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="py-4 flex items-center justify-between">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                      <FaChevronLeft className="mr-2 h-4 w-4" />
                      Trước
                    </button>
                    <span className="text-sm text-gray-700">
                      Trang {currentPage} trên {totalPages}
                    </span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                      Sau
                      <FaChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;