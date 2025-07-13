import { Routes, Route } from 'react-router-dom';
import Layout from '../Header/layout';
import Home from '../page/Home';
import SanPham from '../page/SanPham';
import Menu from '../page/Menu';
import ProductDetail from '../page/ProductDetail';
import Error from '../page/Error';
import Cart from "../content/Cart";
import Checkout from '../page/ThanhToan'; // Đổi tên import thành Checkout để nhất quán
import MomoReturn from '../page/MomoReturn'; // Đổi tên import thành MomoReturn để nhất quán
import Contact from '../page/Contact';
// import NewsSection from '../components/NewsSection'; // block trên trang chủ
import AllNewsPage from '../page/AllNewsPage';       // trang /news
import NewspaperDetail from '../page/NewspaperDetail';
// import VnpayReturn from '../page/VnpayReturn';
import Order from '../Admin/Orders'; // Thêm trang Order nếu cần
import AboutUs from '../content/AboutUs';
import RevenueChartPage from '../Admin/RevenueChartPage';
import UserOrderDetail from '../page/UserOrderDetail'; // Trang chi tiết đơn hàng của người dùng
import UserManagementPage from '../Admin/UserManagementPage';
import ThankYouPage from '../page/ThankYouPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/sanpham" element={<SanPham />} />
        <Route path="/sanpham/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/momo-return" element={<MomoReturn />} />
        <Route path="/checkout/thank-you" element={<ThankYouPage />} />
        {/* <Route path="/checkout/vnpay-return" element={<VnpayReturn />} /> */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/news" element={<AllNewsPage />} />
        <Route path="/newspaper/:id" element={<NewspaperDetail />} />
        <Route path="/order" element={<Order />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/admin/revenue" element={<RevenueChartPage />} />
        <Route path="/don-hang/:orderCode" element={<UserOrderDetail />} />
        <Route path="/admin/users" element={<UserManagementPage />} />

        
        {/* Route cho các trang không tìm thấy */}
        <Route path="*" element={<Error/>} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;