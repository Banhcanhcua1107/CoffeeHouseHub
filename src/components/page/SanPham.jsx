import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShopContext } from "@/components/context/ShopContext";
import ParallaxBG from "@/components/img/Heros/slider4.jpeg";
import "@/components/css/Parallax.css";
import { Button, Modal, Form, Input, InputNumber, Switch, message, Upload, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined, FileExcelOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminSidebar from '@/components/Admin/AdminSidebar';

const { Dragger } = Upload;

const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg> );

function SanPham() {
  const { user, products, fetchProducts } = useContext(ShopContext);

  // States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // File states
  const [fileList, setFileList] = useState([]);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    if(fetchProducts) fetchProducts();
  }, [fetchProducts]);

  // --- HÀM THÊM MỚI SẢN PHẨM ---
  const handleAddProduct = async (values) => {
    if (fileList.length === 0) { message.error('Vui lòng chọn hình ảnh cho sản phẩm!'); return; }
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach(key => formData.append(key, values[key] ?? ''));
    formData.append('sale', values.sale || false);
    formData.append('image', fileList[0].originFileObj);
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://coffeehousehub-production.up.railway.app/products', formData, { headers: { 'Authorization': `Bearer ${token}` } });
      message.success('Thêm sản phẩm thành công!');
      setIsAddModalVisible(false);
      addForm.resetFields();
      setFileList([]);
      if(fetchProducts) fetchProducts();
    } catch (error) { message.error(error.response?.data?.error || 'Thêm sản phẩm thất bại!'); } 
    finally { setLoading(false); }
  };

  // --- HÀM CẬP NHẬT SẢN PHẨM ---
  const handleUpdateProduct = async (values) => {
    if (!editingItem) return;
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach(key => formData.append(key, values[key] ?? ''));
    formData.append('sale', values.sale || false);
    formData.append('image_url', editingItem.image);
    if (fileList.length > 0) {
        formData.append('image', fileList[0].originFileObj);
    }
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://coffeehousehub-production.up.railway.app/products/${editingItem.id}`, formData, { headers: { 'Authorization': `Bearer ${token}` } });
      message.success('Cập nhật sản phẩm thành công!');
      setIsEditModalVisible(false);
      if(fetchProducts) fetchProducts();
    } catch (error) { message.error(error.response?.data?.error || 'Cập nhật thất bại!'); }
    finally { setLoading(false); setFileList([]); setEditingItem(null); }
  };

  // --- HÀM XÓA SẢN PHẨM ---
  const handleDeleteProduct = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://coffeehousehub-production.up.railway.app/products/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      message.success('Xóa sản phẩm thành công!');
      setIsEditModalVisible(false);
      if(fetchProducts) fetchProducts();
    } catch (error) { message.error(error.response?.data?.error || 'Xóa thất bại!'); }
  };

  // --- HÀM NHẬP HÀNG LOẠT ---
  const handleManualImport = async () => {
    if (!importFile) { message.error("Vui lòng chọn một file CSV."); return; }
    const formData = new FormData();
    formData.append('file', importFile);
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('https://coffeehousehub-production.up.railway.app/products/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
        setIsImportModalVisible(false);
        setImportFile(null);
        message.success(`Đã xử lý file thành công.`);
        if (response.data.success) {
            Modal.success({
                title: 'Nhập hàng loạt thành công!',
                content: (
                    <div>
                        <p>{response.data.message}</p>
                        {response.data.errors && response.data.errors.length > 0 && (
                            <>
                                <p className="font-bold mt-2">Chi tiết lỗi:</p>
                                <ul>
                                    {response.data.errors.map((e, i) => (
                                        <li key={i}>Dòng {e.row}: {e.error}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                ),
            });
        }
        if (fetchProducts) fetchProducts();
    } catch (error) {
        message.error(error.response?.data?.error || "Tải lên thất bại.");
        console.error("Lỗi khi nhập hàng loạt:", error);
    } finally { setLoading(false); }
  };

  const handleDownloadTemplate = () => {
    const headers = ["name", "price", "original", "sale", "image_url", "short_description", "description", "sku", "category", "tags"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importProps = {
    name: 'file',
    multiple: false,
    accept: ".csv",
    fileList: importFile ? [importFile] : [],
    beforeUpload: (file) => { setImportFile(file); return false; },
    onRemove: () => { setImportFile(null); },
  };
  
  const showEditModal = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({ ...item, sale: item.sale === 1 || item.sale === true });
    setIsEditModalVisible(true);
  };
  
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const renderAdminView = () => (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <AdminSidebar user={user} activePage="sanpham" /> 
        </aside>
        <main className="lg:col-span-9">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
              <div className="flex items-center gap-2">
                <Input placeholder="Tìm kiếm sản phẩm..." prefix={<SearchOutlined />} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-56" />
                <Tooltip title="Thêm từng sản phẩm"><Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }} /></Tooltip>
                <Tooltip title="Nhập hàng loạt từ file CSV"><Button type="default" icon={<FileExcelOutlined />} onClick={() => setIsImportModalVisible(true)} /></Tooltip>
              </div>
            </div>
            <div className="space-y-4">
              {filteredProducts.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div><h3 className="font-semibold text-lg">{item.name}</h3><div className="text-md text-gray-600">{item.original ? (<><span className="line-through text-gray-400 mr-2">{Number(item.original).toLocaleString('vi-VN')}đ</span><span className="text-[#A47148] font-semibold">{Number(item.price).toLocaleString('vi-VN')}đ</span></>) : ( <span className="text-[#3E2C24] font-semibold">{Number(item.price).toLocaleString('vi-VN')}đ</span> )}</div></div>
                  </div>
                  <button onClick={() => showEditModal(item)} className="p-2 rounded-full hover:bg-gray-200"><EditIcon /></button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Thêm Mới */}
      <Modal 
        title="Thêm sản phẩm mới" 
        visible={isAddModalVisible} 
        onCancel={() => {setIsAddModalVisible(false); setFileList([])}} 
        width={900} 
        footer={[ 
          <Button key="back" onClick={() => {setIsAddModalVisible(false); setFileList([])}}>Hủy</Button>, 
          <Button key="submit" type="primary" loading={loading} onClick={() => addForm.submit()} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }}>
            Thêm Sản Phẩm
          </Button> 
        ]}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">

              {/* === Cột bên trái === */}
              <div className="col-span-1">
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}><Input /></Form.Item>
                
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: "Vui lòng nhập giá bán!" }]}><InputNumber className="w-full" min={0} /></Form.Item>
                    <Form.Item name="original" label="Giá gốc (nếu có)"><InputNumber className="w-full" min={0} /></Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="sku" label="Mã SKU"><Input /></Form.Item>
                    <Form.Item name="category" label="Danh mục"><Input placeholder="Vd: Cà phê hạt" /></Form.Item>
                </div>

                <Form.Item name="tags" label="Tags (cách nhau bởi dấu phẩy)"><Input placeholder="Vd: robusta, arabica" /></Form.Item>
                
                 <Form.Item name="sale" label="Khuyến mãi" valuePropName="checked">
                    <Switch />
                </Form.Item>
              </div>

              {/* === Cột bên phải === */}
              <div className="col-span-1">
                 <Form.Item name="short_description" label="Mô tả ngắn">
                    <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn, hấp dẫn về sản phẩm..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả chi tiết sản phẩm">
                    <Input.TextArea rows={7} placeholder="Mô tả đầy đủ về nguồn gốc, hương vị, cách sử dụng..." />
                </Form.Item>

                <Form.Item label="Hình ảnh sản phẩm" required>
                    <Upload listType="picture" fileList={fileList} onChange={({ fileList: newFileList }) => setFileList(newFileList)} beforeUpload={() => false} onRemove={() => setFileList([])}>
                        {fileList.length < 1 && <Button icon={<UploadOutlined />}>Chọn ảnh</Button>}
                    </Upload>
                </Form.Item>
              </div>

            </div>
        </Form>
      </Modal>

      {/* Modal Chỉnh Sửa */}
      {editingItem && (
        <Modal 
          title={`Chỉnh sửa: ${editingItem.name}`} 
          visible={isEditModalVisible} 
          onCancel={() => { setIsEditModalVisible(false); setFileList([]); }} 
          width={900} // Tăng nhẹ chiều rộng để có không gian cho 2 cột
          footer={
            <div className="flex justify-end w-full gap-2">
              <Popconfirm key="delete" title="Bạn có chắc muốn xóa sản phẩm này?" onConfirm={() => handleDeleteProduct(editingItem.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} placement="topRight">
                  <Button danger icon={<DeleteOutlined />}>Xóa Sản Phẩm</Button>
              </Popconfirm>
              <Button key="back" onClick={() => { setIsEditModalVisible(false); setFileList([]); }}>Hủy</Button>
              <Button key="submit" type="primary" loading={loading} onClick={() => editForm.submit()} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }}>
                Lưu thay đổi
              </Button>
            </div>
          }
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateProduct}>
            {/* Sử dụng grid layout để chia form thành 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">

              {/* === Cột bên trái === */}
              <div className="col-span-1">
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item>
                
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}><InputNumber className="w-full" min={0} /></Form.Item>
                    <Form.Item name="original" label="Giá gốc (nếu có)"><InputNumber className="w-full" min={0} /></Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="sku" label="Mã SKU"><Input /></Form.Item>
                    <Form.Item name="category" label="Danh mục"><Input /></Form.Item>
                </div>

                <Form.Item name="tags" label="Tags (cách nhau bởi dấu phẩy)"><Input /></Form.Item>

                <Form.Item name="sale" label="Khuyến mãi" valuePropName="checked">
                    <Switch />
                </Form.Item>
              </div>

              {/* === Cột bên phải === */}
              <div className="col-span-1">
                <Form.Item name="short_description" label="Mô tả ngắn">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="description" label="Mô tả chi tiết">
                    <Input.TextArea rows={5} />
                </Form.Item>

                <Form.Item label="Thay đổi hình ảnh (tùy chọn)">
                    <div className="flex items-start gap-4">
                        <img src={editingItem?.image} alt="Current" className="w-24 h-24 object-cover rounded" />
                        <Upload listType="picture" fileList={fileList} onChange={({ fileList: newFileList }) => setFileList(newFileList)} beforeUpload={() => false} onRemove={() => setFileList([])}>
                            {fileList.length < 1 && <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>}
                        </Upload>
                    </div>
                </Form.Item>
              </div>

            </div>
          </Form>
        </Modal>
      )}

      {/* Modal Nhập hàng loạt */}
      <Modal 
        title="Nhập sản phẩm từ file CSV" 
        visible={isImportModalVisible} 
        onCancel={() => { setIsImportModalVisible(false); setImportFile(null); }}
        footer={[
            <Button key="back" onClick={() => { setIsImportModalVisible(false); setImportFile(null); }}>Hủy</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={handleManualImport} disabled={!importFile} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }}>Bắt đầu nhập</Button>,
        ]}
      >
        <p className="mb-4">
          Tải file mẫu để đảm bảo đúng định dạng cột. Nếu file CSV có cột `image_url`, hệ thống sẽ dùng link đó, nếu không sẽ dùng ảnh mặc định.
        </p>
        <Button 
            icon={<DownloadOutlined />} 
            onClick={handleDownloadTemplate}
            className="mb-6"
        >
            Tải file mẫu
        </Button>
        <Dragger {...importProps}>
            <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{color: '#A47148'}} />
            </p>
            <p className="ant-upload-text">Nhấn hoặc kéo file .csv vào khu vực này</p>
            <p className="ant-upload-hint">File sẽ không được tải lên ngay. Hãy nhấn "Bắt đầu nhập" sau khi chọn.</p>
        </Dragger>
      </Modal>
    </div>
  );

  const renderUserView = () => (
    <>
      <section className="parallax-section flex items-center justify-center" style={{ backgroundImage: `url(${ParallaxBG})` }}><h2 className="text-white text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">SẢN PHẨM</h2></section>
      <section className="bg-white text-[#3E2C24] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold uppercase mb-8 text-center">Danh sách sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((item) => (
              <div key={item.id} className="border rounded-lg shadow hover:shadow-lg p-4 text-center relative">
                {(item.sale === true || item.sale === 1) && (<span className="absolute top-2 left-2 bg-[#D9A074] text-white text-xs px-2 py-1 rounded">KHUYẾN MÃI</span>)}
                <Link to={`/sanpham/${item.id}`}>
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover mb-4 rounded" />
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                </Link>
                <div className="text-sm">
                  {item.original ? (<><span className="line-through text-gray-400 mr-1">{Number(item.original).toLocaleString('vi-VN')}đ</span><span className="text-[#A47148] font-semibold">{Number(item.price).toLocaleString('vi-VN')}đ</span></>) : (<span className="text-[#3E2C24] font-semibold">{Number(item.price).toLocaleString('vi-VN')}đ</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  return user && user.role === 'admin' ? renderAdminView() : renderUserView();
}

export default SanPham;