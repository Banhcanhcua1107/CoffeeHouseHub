// --- START OF FILE Body4Product.jsx ---

import { useContext } from "react";
// Xóa các import ảnh local vì không còn cần thiết
// import { P1, P2, ... } from "../IMG/Product/"; 
import { ShopContext } from "@/components/context/ShopContext";

function Product() {
  // Xóa imageMap vì chúng ta sẽ dùng URL trực tiếp
  const { addToCart, cafes } = useContext(ShopContext);
  
  return (
    <section className="relative bg-[#1a1a1a] text-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-2xl uppercase text-[#d6bfa3] mb-2">Điều tuyệt vời diễn ra tại đây</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-10">CÁC LOẠI CÀ PHÊ ĐƯỢC YÊU THÍCH</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-left ">
          {/* Sử dụng .slice(0, 12) để chỉ lấy 12 sản phẩm đầu tiên */}
          {cafes.slice(0, 12).map((item) => (
            <div key={item.id} className="flex items-start border-b border-gray-700 pb-4">
              <div className="flex gap-4 items-start flex-grow">
                {/* Sử dụng trực tiếp item.img là URL từ Cloudinary */}
                <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
              <div className="text-right pr-4">
                <p className="text-lg font-semibold text-[#D9A074] whitespace-nowrap mb-1">
                  {Number(item.price).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ
                </p>
                <button
                  className="bg-[#A47148] text-white px-4 py-1 rounded-full hover:bg-[#D9A074] hover:text-[#3E2C24] transition duration-200 shadow"
                  // Cập nhật addToCart để truyền đủ thông tin, bao gồm cả ảnh cho giỏ hàng
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
                      return;
                    }
                    addToCart(item.id, "cafe", 1, item.img);
                  }}
                >
                  + Thêm
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Product;