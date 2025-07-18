import React, { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSearch, FaUserShield, FaUser, FaChevronLeft, FaChevronRight, FaEdit } from 'react-icons/fa';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import { ShopContext } from '@/components/context/ShopContext';

const UserManagementPage = () => {
  const { user } = useContext(ShopContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullname: '', email: '', password: '' });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại');
      }
      console.log('Fetching users with token:', token);
      const response = await axios.get('https://coffeehousehub-production.up.railway.app/api/admin/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Users data received:', response.data);
      setUsers(response.data);
    } catch (err) {
      console.error("Error details:", err.response || err);
      setError(err.response?.data?.message || err.message || "Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setError("Vui lòng đăng nhập để truy cập trang này");
      return;
    }
    if (user.role !== 'admin') {
      setError("Bạn không có quyền truy cập trang này");
      return;
    }
    fetchUsers();
  }, [user]);

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
    if (userId === user.id) {
      alert("Bạn không thể thay đổi vai trò của chính mình.");
      return;
    }
    try {
      await axios.put(`/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('Cập nhật vai trò thành công!');
    } catch (err) {
      console.error("Lỗi khi cập nhật vai trò:", err);
      alert(err.response?.data?.error || "Có lỗi xảy ra, không thể cập nhật vai trò.");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ fullname: user.fullname || '', email: user.email || '', password: '' });
  };

  const handleEditSave = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Thêm xác nhận nếu có thay đổi mật khẩu
    if (editForm.password && !window.confirm('Bạn chắc chắn muốn đổi mật khẩu của người này?')) {
      return;
    }

    await axios.put(`https://coffeehousehub-production.up.railway.app/api/admin/users/${editingUser.id}`,
      editForm,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert('Cập nhật thông tin user thành công!');
    setEditingUser(null);
    fetchUsers();
  } catch (err) {
    console.error("Lỗi khi cập nhật user:", err);
    alert(err.response?.data?.error || "Có lỗi xảy ra.");
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
                <p className="text-gray-500 mb-6">Tìm kiếm, chỉnh sửa, đổi mật khẩu và quản lý vai trò.</p>

                <div className="relative mb-6">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaSearch className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email, username..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Họ tên</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr><td colSpan="4" className="text-center py-10">Đang tải...</td></tr>
                      ) : error ? (
                        <tr><td colSpan="4" className="text-center py-10 text-red-500">{error}</td></tr>
                      ) : currentUsers.length > 0 ? (
                        currentUsers.map(u => (
                          <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            <td className="px-6 py-4">{u.fullname || u.username}</td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button onClick={() => handleRoleChange(u.id, 'admin')} className={`p-2 rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`} title="Admin"><FaUserShield /></button>
                                <button onClick={() => handleRoleChange(u.id, 'user')} className={`p-2 rounded-full ${u.role === 'user' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`} title="User"><FaUser /></button>
                                <span className={`px-2 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => openEditModal(u)} className="text-blue-600 hover:underline flex items-center space-x-1">
                                <FaEdit /><span>Chỉnh sửa</span>
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center py-10 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="py-4 flex items-center justify-between">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50">
                      <FaChevronLeft className="mr-2 h-4 w-4" /> Trước
                    </button>
                    <span className="text-sm">Trang {currentPage} / {totalPages}</span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50">
                      Sau <FaChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa {editingUser.fullname || editingUser.username}</h2>
            <input type="text" placeholder="Họ tên" value={editForm.fullname} onChange={e => setEditForm({ ...editForm, fullname: e.target.value })} className="w-full mb-3 p-2 border rounded" />
            <input type="email" placeholder="Email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full mb-3 p-2 border rounded" />
            <input type="password" placeholder="Đặt lại mật khẩu (nếu muốn)" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full mb-3 p-2 border rounded" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
              <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
