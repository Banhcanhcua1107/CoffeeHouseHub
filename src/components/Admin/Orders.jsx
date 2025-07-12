// --- START OF FILE Orders.jsx ---

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '@/components/context/ShopContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { message, Select, Spin, Button, Modal, Input, Tag, Card, Table, Pagination, Space, Badge } from 'antd';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import { SearchOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const Orders = () => {
  const { user, isAuthLoading } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [currentOrderToCancel, setCurrentOrderToCancel] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Khôi phục trạng thái lọc từ location.state nếu có, hoặc dùng giá trị mặc định
  const [searchText, setSearchText] = useState(location.state?.searchText || '');
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || null);
  const [pagination, setPagination] = useState(location.state?.pagination || {
    current: 1,
    pageSize: 10,
  });

  // Đặt URL backend Railway ở đây (có thể chuyển sang biến môi trường nếu cần)
  const API_BASE_URL = 'https://coffeehousehub-production.up.railway.app';
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Sắp xếp đơn hàng mới nhất lên đầu
        const sortedOrders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sortedOrders);
      } else {
        throw new Error(data.error || 'Lỗi khi tải đơn hàng');
      }
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.role !== 'admin') {
      message.error('Bạn không có quyền truy cập trang này.');
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, isAuthLoading, navigate]);

  const handleUpdateStatus = async (orderId, field, value, extraData = {}) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [field]: value, ...extraData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật');
      message.success('Cập nhật trạng thái thành công!');
      fetchOrders(); // Tải lại danh sách đơn hàng để cập nhật giao diện
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const showCancelModal = (order) => {
    setCurrentOrderToCancel(order);
    setIsCancelModalVisible(true);
  };

  const handleCancelOk = () => {
    if (!cancellationReason.trim()) {
      message.error('Vui lòng nhập lý do hủy đơn.');
      return;
    }
    handleUpdateStatus(
      currentOrderToCancel.id, 'order_status', 'cancelled',
      { cancellation_reason: cancellationReason }
    );
    handleCancelModalClose();
  };

  const handleCancelModalClose = () => {
    setIsCancelModalVisible(false);
    setCancellationReason('');
    setCurrentOrderToCancel(null);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

  const getOrderStatusTag = (status) => {
    const statuses = {
      processing: <Badge status="processing" text="Đang xử lý" />,
      shipped: <Badge status="processing" text="Đang giao" color="blue" />,
      delivered: <Badge status="success" text="Đã giao" />,
      cancelled: <Badge status="error" text="Đã hủy" />,
    };
    return statuses[status] || <Tag>{status}</Tag>;
  }

  const getPaymentStatusTag = (paymentStatus, paymentMethod) => (
    <Tag color={paymentStatus === 'paid' ? 'green' : 'orange'}>
      {paymentMethod.toUpperCase()} - {paymentStatus === 'paid' ? 'Đã trả' : 'Chưa trả'}
    </Tag>
  );

  // Sử dụng useMemo để tối ưu hóa việc lọc, chỉ chạy lại khi dependency thay đổi
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchTextLower = searchText.toLowerCase();
      const matchesSearch =
        order.order_code.toLowerCase().includes(searchTextLower) ||
        order.fullname.toLowerCase().includes(searchTextLower) ||
        order.phone.includes(searchText);
      const matchesStatus = statusFilter ? order.order_status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'order_code',
      key: 'order_code',
      render: (text, record) => (
        <Link
          to={`/don-hang/${record.order_code}`}
          state={{
            fromAdmin: true,
            filterState: { searchText, statusFilter, pagination }
          }}
          className="font-medium text-[#3E2C24] hover:underline"
        >
          #{text}
        </Link>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatDate(text),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullname',
      key: 'customer',
      render: (text, record) => (
        <div>
          <p className="font-medium">{text}</p>
          <p className="text-sm text-gray-500">{record.phone}</p>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) => `${Number(text).toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {getOrderStatusTag(record.order_status)}
          {getPaymentStatusTag(record.payment_status, record.payment_method)}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Select
            value={record.order_status}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateStatus(record.id, 'order_status', value)}
            disabled={record.order_status === 'cancelled' || isUpdating}
          >
            <Select.Option value="processing">Đang xử lý</Select.Option>
            <Select.Option value="shipped">Đang giao</Select.Option>
            <Select.Option value="delivered">Đã giao</Select.Option>
          </Select>
          {record.order_status !== 'cancelled' && (
            <Button
              danger size="small"
              onClick={() => showCancelModal(record)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isAuthLoading || loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin tip="Đang tải dữ liệu..." size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <AdminSidebar user={user} activePage="orders" />
        </aside>
        <main className="lg:col-span-9">
          <div className="space-y-6">
            <Card title="Bộ lọc đơn hàng">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
                  <Input
                    placeholder="Mã đơn, tên KH, SĐT..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    prefix={<SearchOutlined />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Tất cả trạng thái"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    allowClear
                  >
                    <Select.Option value="processing">Đang xử lý</Select.Option>
                    <Select.Option value="shipped">Đang giao</Select.Option>
                    <Select.Option value="delivered">Đã giao</Select.Option>
                    <Select.Option value="cancelled">Đã hủy</Select.Option>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-gray-500">Tổng đơn hàng</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.order_status === 'delivered').length}
                </div>
                <div className="text-gray-500">Đã giao</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.order_status === 'processing').length}
                </div>
                <div className="text-gray-500">Đang xử lý</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.order_status === 'cancelled').length}
                </div>
                <div className="text-gray-500">Đã hủy</div>
              </Card>
            </div>

            <Card title={`Danh sách đơn hàng (${filteredOrders.length})`}>
              <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="id"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: filteredOrders.length,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  onChange: (page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize });
                  },
                }}
                loading={loading}
                scroll={{ x: true }}
              />
            </Card>
          </div>
        </main>
      </div>

      <Modal
        title={`Hủy đơn hàng #${currentOrderToCancel?.order_code}`}
        visible={isCancelModalVisible}
        onOk={handleCancelOk}
        onCancel={handleCancelModalClose}
        confirmLoading={isUpdating}
        okText="Xác nhận hủy"
        cancelText="Bỏ qua"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-2">Vui lòng nhập lý do hủy đơn hàng. Lý do này sẽ được gửi đến khách hàng.</p>
        <TextArea
          rows={4} value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Ví dụ: Hết hàng, sai thông tin khách hàng,..."
        />
      </Modal>
    </div>
  );
};

export default Orders;