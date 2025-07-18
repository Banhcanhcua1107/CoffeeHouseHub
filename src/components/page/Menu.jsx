import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import "@/components/css/Parallax.css";
import ParallaxBG from "@/components/img/Heros/slider4.jpeg";
import { ShopContext } from "@/components/context/ShopContext";
import { Button, Modal, Form, Input, InputNumber, message, Upload, Popconfirm, Tooltip } from 'antd'; // Thêm Tooltip
import { PlusOutlined, SearchOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminSidebar from '@/components/Admin/AdminSidebar';

const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg> );

function Menu() {
  const { cafes, user, fetchCafes, addToCart } = useContext(ShopContext);

  // States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // File states
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (fetchCafes) fetchCafes();
  }, [fetchCafes]);

  // --- HÀM THÊM MỚI ---
  const handleAddMenuItem = async (values) => {
    if (fileList.length === 0) { message.error('Vui lòng chọn hình ảnh!'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('desc', values.desc || '');
    formData.append('img', fileList[0].originFileObj);
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://coffeehousehub-production.up.railway.app/cafes', formData, { headers: { 'Authorization': `Bearer ${token}` } });
      message.success('Thêm món thành công!');
      setIsAddModalVisible(false);
      addForm.resetFields();
      setFileList([]);
      if (fetchCafes) fetchCafes();
    } catch (error) { message.error(error.response?.data?.error || 'Thêm món thất bại!'); } 
    finally { setLoading(false); }
  };
  
  // --- HÀM CẬP NHẬT ---
  const handleUpdateMenuItem = async (values) => {
    if (!editingItem) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('desc', values.desc || '');
    formData.append('img_url', editingItem.img);
    if (fileList.length > 0) {
        formData.append('img', fileList[0].originFileObj);
    }
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://coffeehousehub-production.up.railway.app/cafes/${editingItem.id}`, formData, { headers: { 'Authorization': `Bearer ${token}` } });
      message.success('Cập nhật món thành công!');
      setIsEditModalVisible(false);
      setEditingItem(null);
      setFileList([]);
      if (fetchCafes) fetchCafes();
    } catch (error) { message.error(error.response?.data?.error || 'Cập nhật thất bại!'); } 
    finally { setLoading(false); }
  };
  
  // --- HÀM XÓA ---
  const handleDeleteMenuItem = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://coffeehousehub-production.up.railway.app/cafes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      message.success('Xóa món thành công!');
      setIsEditModalVisible(false); // Đóng modal sau khi xóa
      if (fetchCafes) fetchCafes();
    } catch (error) { message.error(error.response?.data?.error || 'Xóa thất bại!'); }
  };

  const showEditModal = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue(item);
    setIsEditModalVisible(true);
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const beforeUpload = () => false;

  const filteredCafes = cafes.filter(cafe => cafe.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Giao diện Admin cho Menu
  const renderAdminView = () => (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3"><AdminSidebar user={user} activePage="menu" /></aside>
        <main className="lg:col-span-9">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Menu</h1>
              <div className="flex items-center gap-2">
                <Input placeholder="Tìm kiếm món..." prefix={<SearchOutlined />} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64" />
                <Tooltip title="Thêm món mới"><Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }} /></Tooltip>
              </div>
            </div>
            <div className="space-y-4">
              {filteredCafes.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-md text-[#A47148] font-semibold">{Number(item.price).toLocaleString("vi-VN")}đ</p>
                    </div>
                  </div>
                  <button onClick={() => showEditModal(item)} className="p-2 rounded-full hover:bg-gray-200"><EditIcon /></button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* --- Modal Thêm Mới với giao diện cải tiến --- */}
      <Modal 
        title="Thêm món mới vào menu" 
        visible={isAddModalVisible} 
        onCancel={() => {setIsAddModalVisible(false); setFileList([])}} 
        width={600}
        footer={null} // Tự custom footer để kiểm soát tốt hơn
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddMenuItem}>
          <div className="grid grid-cols-1 gap-4">
            <Form.Item 
              name="name" 
              label="Tên món" 
              rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}
            >
              <Input placeholder="Ví dụ: Latte Caramel" />
            </Form.Item>
            
            <div className="grid grid-cols-2 gap-4">
              <Form.Item 
                name="price" 
                label="Giá bán" 
                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
              >
                <InputNumber 
                  className="w-full" 
                  min={0} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="50,000"
                />
              </Form.Item>
            </div>
            
            <Form.Item 
              name="desc" 
              label="Mô tả ngắn"
            >
              <Input.TextArea 
                rows={2} 
                placeholder="Mô tả ngắn gọn về hương vị, thành phần..." 
                showCount 
                maxLength={100}
              />
            </Form.Item>
            
            <Form.Item 
              label="Hình ảnh món" 
              required
              help="Kích thước ảnh đề xuất: 1:1 (vuông)"
            >
              <Upload 
                listType="picture-card"
                fileList={fileList} 
                onChange={handleUploadChange} 
                beforeUpload={beforeUpload}
                onRemove={() => setFileList([])}
                accept="image/*"
              >
                {fileList.length < 1 && (
                  <div className="flex flex-col items-center">
                    <PlusOutlined />
                    <div className="mt-2">Tải lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => {setIsAddModalVisible(false); setFileList([])}}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              loading={loading} 
              onClick={() => addForm.submit()} 
              style={{ backgroundColor: '#A47148', borderColor: '#A47148' }}
            >
              Thêm món
            </Button>
          </div>
        </Form>
      </Modal>

      {/* --- Modal Chỉnh Sửa với giao diện cải tiến --- */}
      {editingItem && (
        <Modal 
          title={`Chỉnh sửa: ${editingItem.name}`} 
          visible={isEditModalVisible} 
          onCancel={() => { setIsEditModalVisible(false); setFileList([]); }} 
          width={600}
          footer={
            <div className="flex justify-end w-full gap-2">
              <Popconfirm 
                title="Bạn có chắc muốn xóa món này?" 
                onConfirm={() => handleDeleteMenuItem(editingItem.id)} 
                okText="Xóa" 
                cancelText="Hủy" 
                okButtonProps={{ danger: true }}
                placement="topRight" // Hướng Popconfirm
              >
                  <Button danger icon={<DeleteOutlined />}>Xóa</Button>
              </Popconfirm>
              <Button key="back" onClick={() => { setIsEditModalVisible(false); setFileList([]); }}>Hủy</Button>
              <Button key="submit" type="primary" loading={loading} onClick={() => editForm.submit()} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }}>
                Lưu thay đổi
              </Button>
            </div>
          }
          footerStyle={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateMenuItem}>
              <Form.Item name="name" label="Tên món" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="price" label="Giá" rules={[{ required: true }]}><InputNumber className="w-full" min={0} /></Form.Item>
              <Form.Item name="desc" label="Mô tả ngắn"><Input.TextArea rows={3} /></Form.Item>
              <Form.Item label="Thay đổi hình ảnh (tùy chọn)">
                  <img src={editingItem?.img} alt="Current" className="w-24 h-24 object-cover rounded mb-2" />
                  <Upload listType="picture" fileList={fileList} onChange={handleUploadChange} beforeUpload={beforeUpload} onRemove={() => setFileList([])}>
                    {fileList.length < 1 && <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>}
                  </Upload>
              </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );

  const renderUserView = () => (
    <>
      <section className="parallax-section flex items-center justify-center" style={{ backgroundImage: `url(${ParallaxBG})` }}>
        <h2 className="text-white text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">MENU CÀ PHÊ</h2>
      </section>
      
      <div className="max-w-6xl mx-auto text-center py-10 px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-10 uppercase">Thực đơn cà phê</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-left">
          {cafes.map((item) => (
            <div key={item.id} className="border rounded-lg shadow hover:shadow-lg p-4 bg-white flex flex-col justify-between">
              <img src={item.img} alt={item.name} className="w-full h-64 object-cover rounded mb-4" />
              <div>
                <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <p className="text-lg font-semibold text-[#A47148]">{Number(item.price).toLocaleString("vi-VN")}đ</p>
                <button onClick={() => addToCart(item.id, 'cafe', 1, item.img)} className="bg-[#A47148] text-white px-4 py-1 rounded-full hover:bg-[#D9A074] transition shadow">+ Thêm</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return user && user.role === 'admin' ? renderAdminView() : renderUserView();
}

export default Menu;