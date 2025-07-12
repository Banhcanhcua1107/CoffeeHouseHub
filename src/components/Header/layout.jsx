import Header from './Header';
import Footer from '../Footer/Footer';
import { Outlet } from "react-router-dom";
import ToggleCartButton from '../content/Cart'; // Đường dẫn chính xác đến file bạn tạo

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
