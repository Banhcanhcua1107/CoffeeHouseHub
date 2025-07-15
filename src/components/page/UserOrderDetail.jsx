// --- START OF FILE UserOrderDetail.jsx ---

import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '@/components/context/ShopContext';
import { Spin, message, Button, Alert, Modal, Tag, Select, Space, Input } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const UserOrderDetail = () => {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthLoading } = useContext(ShopContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission control

  // State cho modal hủy của admin và user
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isUserCancelModalVisible, setIsUserCancelModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchOrder = async () => {
    // Không reset loading ở đây để tránh giật màn hình khi admin cập nhật
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://coffeehousehub-production.up.railway.app/order/${orderCode}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tải đơn hàng');
      setOrder(data);
    } catch (error) {
      message.error(error.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      message.error('Vui lòng đăng nhập để xem đơn hàng.');
      navigate('/dang-nhap');
      return;
    }
    setLoading(true);
    fetchOrder();
  }, [orderCode, user, isAuthLoading, navigate]);

  const handleBack = () => {
    if (location.state?.fromAdmin) {
      navigate('/order', { state: location.state.filterState });
    } else {
      navigate('/');
    }
  };

  // ----- CÁC HÀM XỬ LÝ CHO ADMIN -----
  const handleAdminUpdateStatus = async (field, value, extraData = {}) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://coffeehousehub-production.up.railway.app/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [field]: value, ...extraData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật');
      message.success('Cập nhật trạng thái thành công!');
      await fetchOrder(); // Tải lại dữ liệu mới nhất cho trang
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const showAdminCancelModal = () => setIsCancelModalVisible(true);

  const handleAdminCancelOk = () => {
    if (!cancellationReason.trim()) {
      message.error('Vui lòng nhập lý do hủy đơn.');
      return;
    }
    handleAdminUpdateStatus('order_status', 'cancelled', { cancellation_reason: cancellationReason });
    setIsCancelModalVisible(false);
    setCancellationReason('');
  };

  // // ----- CÁC HÀM XỬ LÝ CHO USER -----
  // const canUserCancel = useMemo(() => {
  //   if (!order) return false;
  //   const timeDiffMinutes = (new Date() - new Date(order.order_date)) / (1000 * 60);
  //   return order.order_status === 'processing' && timeDiffMinutes < 10;
  // }, [order]);

  const handleUserCancelOrder = () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Validation checks
    if (!order || !order.id) {
      message.error('Lỗi: Không tìm thấy ID của đơn hàng để hủy.');
      return;
    }

    // Hiển thị modal cho người dùng nhập lý do hủy
    setIsUserCancelModalVisible(true);
  };

  const handleUserCancelConfirm = async () => {
    if (!cancellationReason.trim()) {
      message.error('Vui lòng nhập lý do hủy đơn.');
      return;
    }

    setIsSubmitting(true);
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = `https://coffeehousehub-production.up.railway.app/orders/user-cancel/${order.id}`;

      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellation_reason: cancellationReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("API trả về lỗi:", data);
        throw new Error(data.error || 'Lỗi khi hủy đơn hàng');
      }

      message.success('Đã hủy đơn hàng thành công!');
      setIsUserCancelModalVisible(false);
      setCancellationReason('');
      await fetchOrder();
    } catch (error) {
      console.error("Lỗi trong khối catch:", error);
      message.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsUpdating(false);
    }
  };

  // Các hàm helper
  const getStatusTag = (status) => {
    const statuses = {
        processing: <Tag color="blue">Đang xử lý</Tag>,
        shipped: <Tag color="geekblue">Đang giao</Tag>,
        delivered: <Tag color="green">Đã giao</Tag>,
        cancelled: <Tag color="red">Đã hủy</Tag>,
    };
    return statuses[status] || <Tag>{status}</Tag>;
  };
  const getProductImage = (item) => item.image || 'https://via.placeholder.com/100';
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

  if (isAuthLoading || loading) {
    return <div className="min-h-screen flex justify-center items-center"><Spin tip="Đang tải đơn hàng..." size="large" /></div>;
  }

  if (!user || !order) {
    return <div className="min-h-screen flex justify-center items-center"><p>Không tìm thấy thông tin đơn hàng.</p></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng #{order.order_code}</h1>
              <p className="text-sm text-gray-500">Ngày đặt: {formatDate(order.order_date)}</p>
            </div>
            <div className="mt-2 sm:mt-0">{getStatusTag(order.order_status)}</div>
          </div>

          {order.order_status === 'cancelled' && order.cancellation_reason && (
            <Alert
              message="Đơn hàng đã được hủy"
              description={`Lý do: ${order.cancellation_reason}`}
              type="error"
              showIcon
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="text-sm space-y-2">
              <h3 className="font-semibold text-lg mb-2">Thông tin giao hàng</h3>
              <p><span className="font-medium text-gray-600">Họ tên:</span> {order.fullname}</p>
              <p><span className="font-medium text-gray-600">Email:</span> {order.email}</p>
              <p><span className="font-medium text-gray-600">SĐT:</span> {order.phone}</p>
              <p><span className="font-medium text-gray-600">Địa chỉ:</span> {order.address}</p>
              {order.note && <p><span className="font-medium text-gray-600">Ghi chú:</span> <i className="text-gray-500">{order.note}</i></p>}
            </div>
            <div className="text-sm space-y-2">
              <h3 className="font-semibold text-lg mb-2">Thông tin thanh toán</h3>
              <p><span className="font-medium text-gray-600">Phương thức:</span> {order.payment_method.toUpperCase()}</p>
              <p><span className="font-medium text-gray-600">Trạng thái:</span> <Tag color={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag></p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Các sản phẩm trong đơn</h3>
            <ul className="space-y-4">
              {order.items && order.items.map((item) => (
                <li key={`${item.product_id}-${item.product_type}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={getProductImage(item)} alt={item.product_name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-medium leading-tight">{item.product_name}</p>
                      <p className="text-xs text-gray-500">SL: {item.quantity} x {Number(item.price).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">{Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-xl font-bold">
              <p>Tổng cộng:</p>
              <p className="text-[#A47148]">{Number(order.total_amount).toLocaleString('vi-VN')} đ</p>
            </div>
          </div>
          
          {/* ========================================================================= */}
          {/* KHU VỰC THAO TÁC (CẢI THIỆN GIAO DIỆN) */}
          {/* ========================================================================= */}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Thao tác của Admin - Được đẩy sang bên trái */}
            <div className="w-full sm:w-auto">
              {user.role === 'admin' && (
                <Space wrap>
                  <Select
                    value={order.order_status}
                    style={{ width: 140 }}
                    onChange={(value) => handleAdminUpdateStatus('order_status', value)}
                    disabled={order.order_status === 'cancelled' || isUpdating}
                    loading={isUpdating}
                  >
                    <Select.Option value="processing">Đang xử lý</Select.Option>
                    <Select.Option value="shipped">Đang giao</Select.Option>
                    <Select.Option value="delivered">Đã giao</Select.Option>
                  </Select>
                  {order.order_status !== 'cancelled' && (
                    <Button
                      danger
                      onClick={showAdminCancelModal}
                      disabled={isUpdating}
                      loading={isUpdating}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </Space>
              )}
            </div>

            {/* Các nút điều hướng chung - Được đẩy sang bên phải */}
            <div className="flex justify-end gap-4 w-full sm:w-auto">
              {location.state?.fromAdmin ? (
                <Button type="primary" onClick={handleBack}>
                  Quay về trang Quản lý
                </Button>
              ) : (
                <Button onClick={() => navigate('/')}>Quay về trang chủ</Button>
              )}

              {user.role !== 'admin' && order.can_be_cancelled && (
                <Button 
                    type="primary" 
                    danger 
                    onClick={handleUserCancelOrder} 
                    loading={isUpdating || isSubmitting}
                    disabled={isUpdating || isSubmitting}
                >
                    Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={`Hủy đơn hàng #${order?.order_code}`}
        visible={isCancelModalVisible}
        onOk={handleAdminCancelOk}
        onCancel={() => setIsCancelModalVisible(false)}
        confirmLoading={isUpdating}
        okText="Xác nhận hủy"
        cancelText="Bỏ qua"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-2">Vui lòng nhập lý do hủy. Lý do này sẽ được gửi đến khách hàng.</p>
        <TextArea
          rows={4}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Ví dụ: Hết hàng, sai thông tin khách hàng,..."
        />
      </Modal>

      {/* Modal cho người dùng hủy đơn hàng */}
      <Modal
        title={`Hủy đơn hàng #${order?.order_code}`}
        visible={isUserCancelModalVisible}
        onOk={handleUserCancelConfirm}
        onCancel={() => {
          setIsUserCancelModalVisible(false);
          setCancellationReason('');
        }}
        confirmLoading={isSubmitting}
        okText="Xác nhận hủy"
        cancelText="Không"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-2">Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng:</p>
        <TextArea
          rows={4}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Nhập lý do hủy đơn hàng..."
        />
      </Modal>
    </div>
  );
};

export default UserOrderDetail;