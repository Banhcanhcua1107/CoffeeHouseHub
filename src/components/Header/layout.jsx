import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Outlet } from "react-router-dom";
import ToggleCartButton from '@/components/content/Cart'; // Đường dẫn chính xác đến file bạn tạo

function Layout() {
  return (
    <>
      <Header />
      <ToggleCartButton />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
