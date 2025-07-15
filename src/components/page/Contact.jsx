import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { ShopContext } from '@/components/context/ShopContext';
import { Button, Modal, Form, Input, message, Tag, Empty, Spin } from 'antd';
import AdminSidebar from '@/components/Admin/AdminSidebar';

// Import Parallax và CSS
import ParallaxBG from "@/components/img/Heros/slider4.jpeg";
import "@/components/css/Parallax.css";

// --- COMPONENT CHO KHÁCH HÀNG ---
const UserContactForm = () => {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://coffeehousehub-production.up.railway.app/contact/send", formState);
      if (res.data.success) {
        message.success(res.data.message);
        setSuccessMsg(res.data.message); // thêm dòng này
        setFormState({ name: "", email: "", message: "" });
      } else {
        message.error(res.data.error || "Gửi liên hệ thất bại!");
        setSuccessMsg("");
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      setSuccessMsg("");
    }
    setLoading(false);
  };

  return (
    // Bọc trong React Fragment để thêm Parallax Header
    <>
      <section
        className="parallax-section flex items-center justify-center"
        style={{ backgroundImage: `url(${ParallaxBG})` }}
      >
        <h2 className="text-white text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">
          LIÊN HỆ
        </h2>
      </section>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Bên trái: Form liên hệ */}
          <div>
            <h2 className="text-3xl font-bold mb-2 text-[#3E2C24]">GỬI TIN NHẮN CHO CHÚNG TÔI</h2>
            <p className="text-gray-500 mb-8">
              Nếu bạn có bất kỳ câu hỏi, góp ý hoặc cần hỗ trợ, hãy để lại thông tin bên dưới.
              Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input name="name" type="text" placeholder="Họ và tên của bạn" value={formState.name} onChange={handleChange} required className="w-full border border-gray-200 rounded px-4 py-3 bg-[#f7f3ee] focus:outline-none focus:ring-2 focus:ring-[#C0B09B]" />
              <input name="email" type="email" placeholder="Email liên hệ" value={formState.email} onChange={handleChange} required className="w-full border border-gray-200 rounded px-4 py-3 bg-[#f7f3ee] focus:outline-none focus:ring-2 focus:ring-[#C0B09B]" />
              <textarea name="message" rows={5} placeholder="Nội dung tin nhắn..." value={formState.message} onChange={handleChange} required className="w-full border border-gray-200 rounded px-4 py-3 bg-[#f7f3ee] focus:outline-none focus:ring-2 focus:ring-[#C0B09B]" />
              {successMsg && (
                <p className="text-green-600 font-semibold">{successMsg}</p>
              )}
              <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }} size="large">
                GỬI NGAY
              </Button>
            </form>
          </div>

          {/* Bên phải: Thông tin liên hệ và chi nhánh */}
          <div>
            <h2 className="text-3xl font-bold mb-2 text-[#3E2C24]">THÔNG TIN LIÊN HỆ</h2>
            <p className="text-gray-500 mb-8">
              CoffeeHouse luôn sẵn sàng lắng nghe và phục vụ bạn.
            </p>
            <div className="space-y-6">
              {/* Chi nhánh 1 */}
              <div>
                <h3 className="font-semibold text-lg text-[#4A372D] mb-2">Chi nhánh Nguyễn Trãi</h3>
                <p className="text-gray-600"><b>Địa chỉ:</b> 736 Nguyễn Trãi, P.11, Q.5, TP. Hồ Chí Minh</p>
                <p className="text-gray-600"><b>Điện thoại:</b> 028 1234 5678</p>
                <p className="text-gray-600"><b>Email:</b> info.q5@coffeehouse.com</p>
              </div>
              {/* Chi nhánh 2 */}
              <div>
                <h3 className="font-semibold text-lg text-[#4A372D] mb-2">Chi nhánh Ngô Quyền</h3>
                <p className="text-gray-600"><b>Địa chỉ:</b> 28-30 Ngô Quyền, P.6, Q.5, TP. Hồ Chí Minh</p>
                <p className="text-gray-600"><b>Điện thoại:</b> 028 5678 1234</p>
                <p className="text-gray-600"><b>Email:</b> info.ngoquyen@coffeehouse.com</p>
              </div>
            </div>
          </div>
        </div>
        {/* Google Map */}
        <div>
          <iframe title="Bản đồ CoffeeHouse" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.668673891438!2d106.6644023758066!3d10.76011385949219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b312b686d%3A0x3ff3c70f7193b82a!2zQ8O0bmcgVHkgVE5ISCBD4XBo4buBIFAh!5e0!3m2!1svi!2s!4v1683878436440!5m2!1svi!2s" className="w-full h-96" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </>
  );
};

// --- COMPONENT CHO ADMIN ---
const AdminContactManager = () => {
    const { user } = useContext(ShopContext);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [replyLoading, setReplyLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://coffeehousehub-production.up.railway.app/contacts', { headers: { Authorization: `Bearer ${token}` } });
            setContacts(res.data);
        } catch (error) {
            message.error("Không thể tải danh sách liên hệ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const showReplyModal = async (contact) => {
        setSelectedContact(contact);
        setIsModalVisible(true);
        form.resetFields();
        if (contact.status === 'new') {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`https://coffeehousehub-production.up.railway.app/contacts/${contact.id}/status`, { status: 'read' }, { headers: { Authorization: `Bearer ${token}` } });
                fetchContacts();
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã đọc:", error);
            }
        }
    };
    
    const handleReply = async (values) => {
        setReplyLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://coffeehousehub-production.up.railway.app/contacts/${selectedContact.id}/reply`, values, { headers: { Authorization: `Bearer ${token}` } });
            message.success("Đã gửi phản hồi thành công!");
            setIsModalVisible(false);
            fetchContacts();
        } catch (error) {
            message.error(error.response?.data?.error || "Gửi phản hồi thất bại.");
        } finally {
            setReplyLoading(false);
        }
    };

    const getStatusTag = (status) => {
        if (status === 'replied') return <Tag color="green">Đã trả lời</Tag>;
        if (status === 'read') return <Tag color="blue">Đã xem</Tag>;
        return <Tag color="gold">Mới</Tag>;
    };

    return (
        <div className="bg-gray-100 min-h-screen">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 px-4 sm:px-6 lg:px-8">
              <aside className="lg:col-span-3">
                  <AdminSidebar user={user} activePage="contact" />
              </aside>
              <main className="lg:col-span-9">
                  <div className="bg-white rounded-lg shadow p-6 sm:p-8">
                      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hòm thư Liên hệ</h1>
                      {loading ? <div className="text-center py-10"><Spin size="large" /></div> : contacts.length === 0 ? <Empty description="Chưa có tin nhắn liên hệ nào." /> : (
                          <div className="space-y-4">
                              {contacts.map(contact => (
                                  <div key={contact.id} className={`p-4 border-l-4 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${contact.status === 'new' ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-white'}`} onClick={() => showReplyModal(contact)}>
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <p className="font-semibold text-gray-800">{contact.name} - <span className="font-normal text-gray-600">{contact.email}</span></p>
                                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{contact.message}</p>
                                          </div>
                                          <div className="text-right flex-shrink-0 ml-4">
                                              {getStatusTag(contact.status)}
                                              <p className="text-xs text-gray-400 mt-1">{new Date(contact.created_at).toLocaleString('vi-VN')}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </main>
          </div>
          {selectedContact && (
              <Modal title={`Phản hồi cho ${selectedContact.name}`} visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={600}>
                  <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-200">
                      <p className="font-semibold">Nội dung từ khách:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                  {selectedContact.status === 'replied' ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                           <p className="font-semibold text-green-800">Bạn đã trả lời:</p>
                           <p className="text-green-700 whitespace-pre-wrap">{selectedContact.admin_reply}</p>
                           <p className="text-xs text-green-500 mt-1">vào lúc {new Date(selectedContact.replied_at).toLocaleString('vi-VN')}</p>
                      </div>
                  ) : (
                      <Form form={form} layout="vertical" onFinish={handleReply}>
                          <Form.Item name="admin_reply" label="Nội dung phản hồi" rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi!' }]}>
                              <Input.TextArea rows={5} />
                          </Form.Item>
                          <Form.Item>
                              <Button type="primary" htmlType="submit" loading={replyLoading} style={{ backgroundColor: '#A47148', borderColor: '#A47148' }}>Gửi phản hồi</Button>
                          </Form.Item>
                      </Form>
                  )}
              </Modal>
          )}
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const Contact = () => {
    const { user } = useContext(ShopContext);

    // Dựa vào vai trò của user để render component tương ứng
    if (user && user.role === 'admin') {
        return <AdminContactManager />;
    }

    return <UserContactForm />;
};

export default Contact;