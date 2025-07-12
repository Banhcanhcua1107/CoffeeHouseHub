// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // Lấy ra pathname (ví dụ: "/", "/about", "/products/1") từ location object
  const { pathname } = useLocation();

  // Sử dụng useEffect để thực hiện một side-effect mỗi khi pathname thay đổi
  useEffect(() => {
    // Cuộn cửa sổ lên vị trí (0, 0) - tức là lên đầu trang
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Thêm thuộc tính này để cuộn mượt
    });
    
  }, [pathname]); // Dependency array là [pathname], nghĩa là effect này sẽ chạy lại mỗi khi URL thay đổi

  // Component này không render ra bất kỳ UI nào
  return null;
}