// --- START OF FILE ProductDetail.jsx ---

import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Xóa import ảnh local không cần thiết
// import { S1, S2, ... } from "../IMG/Shop/"; 
import { ShopContext } from "@/components/context/ShopContext";
import axios from 'axios';
import { shuffle } from 'lodash';
import "@/components/css/Parallax.css";
import ParallaxBG from "@/components/img/Heros/slider4.jpeg";

// Xóa imageMap vì không còn dùng
// const imageMap = { ... };

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Lấy thêm hàm fetchProducts để cập nhật lại context nếu cần
  const { addToCart, products, fetchProducts } = useContext(ShopContext); 
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // Reset state khi ID thay đổi để hiển thị loading
    setProduct(null); 
    setQuantity(1);
    
    const fetchProductFromAPI = async () => {
      try {
        const response = await axios.get(`https://coffeehousehub-production.up.railway.app/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        navigate('/sanpham');
      }
    };
    
    // Luôn fetch dữ liệu mới nhất từ API khi vào trang chi tiết
    fetchProductFromAPI();
    
    // Cập nhật lại danh sách sản phẩm trong context
    if (fetchProducts) {
      fetchProducts();
    }
  }, [id, navigate, fetchProducts]); // Thêm fetchProducts vào dependency array

  useEffect(() => {
    if (products && products.length > 0 && product) {
      const filtered = products.filter(p => p.id !== product.id);
      const shuffled = shuffle(filtered).slice(0, 4);
      setRelatedProducts(shuffled);
    }
  }, [products, product]); // Chạy lại khi có sản phẩm mới hoặc danh sách sản phẩm thay đổi

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }
    if (product) {
      // Cập nhật addToCart, truyền 'product' và ảnh để đồng bộ với các component khác
      addToCart(product.id, 'product', quantity, product.image);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!product) {
    return <div className="text-center py-20">Đang tải sản phẩm...</div>;
  }

  return (
    <>
      <section
        className="parallax-section flex items-center justify-center"
        style={{ backgroundImage: `url(${ParallaxBG})` }}
      >
        <h2 className="text-white text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">
          SẢN PHẨM
        </h2>
      </section>
    <section className="bg-white text-[#3E2C24] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative">
            {/* Sử dụng trực tiếp URL từ product.image */}
            <img
              src={product.image || "https://via.placeholder.com/600x600?text=No+Image"}
              alt={product.name}
              className="w-full h-auto rounded-lg shadow-md"
            />
            {(product.sale === true || product.sale === 1) && (
              <span className="absolute top-4 left-4 bg-[#D9A074] text-white text-sm font-semibold px-3 py-1 rounded-full">
                KHUYẾN MÃI
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="mb-4 text-sm text-gray-500">
              <span>(2 đánh giá của khách hàng)</span>
            </div>
            <div className="mb-6">
              {product.original ? (
                <>
                  <span className="text-2xl font-bold text-[#A47148]">
                    {Number(product.price).toLocaleString('vi-VN')}đ
                  </span>
                  <span className="ml-2 text-lg line-through text-gray-400">
                    {Number(product.original).toLocaleString('vi-VN')}đ
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-[#3E2C24]">
                  {Number(product.price).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
            {/* Hiển thị short_description */}
            <p className="mb-6 text-gray-600">{product.short_description || "Chưa có mô tả ngắn..."}</p>
            <div className="flex items-center mb-8">
              <div className="flex items-center border rounded-md mr-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-lg"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-lg"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-[#D9A074] text-white font-semibold px-8 py-3 rounded-md hover:bg-[#c98b50] transition"
              >
                THÊM VÀO GIỎ HÀNG
              </button>
            </div>
            <div className="border-t border-b py-4 mb-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 font-semibold w-32">Mã sản phẩm:</td>
                    <td>{product.sku || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Danh mục:</td>
                    <td>{product.category || 'Cà phê'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Tags:</td>
                    <td>{product.tags || 'Cà phê'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center">
              <span className="mr-2 font-semibold">Chia sẻ:</span>
              <div className="flex space-x-2">
                <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm">F</span>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm">T</span>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm">P</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'description' ? 'border-[#D9A074] text-[#D9A074]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                MÔ TẢ
              </button>
              <button
                onClick={() => setActiveTab('information')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'information' ? 'border-[#D9A074] text-[#D9A074]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                THÔNG TIN BỔ SUNG
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'reviews' ? 'border-[#D9A074] text-[#D9A074]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                ĐÁNH GIÁ (2)
              </button>
            </nav>
          </div>
          <div className="py-8">
            {activeTab === 'description' && (
              <div>
                <p>{product.description || "Chưa có mô tả chi tiết."}</p>
              </div>
            )}
            {/* Các tab khác giữ nguyên */}
          </div>
        </div>
      </div>
      <hr className="my-12 mx-auto w-[1152px] border-t border-gray-350" />
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-8 text-center">SẢN PHẨM LIÊN QUAN</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-[1152px] mx-auto">
          {relatedProducts.map((item) => (
            <div key={item.id} className="border rounded-lg shadow hover:shadow-lg p-4 text-center relative">
              {(item.sale === true || item.sale === 1) && (
                <span className="absolute top-2 left-2 bg-[#D9A074] text-white text-xs px-2 py-1 rounded">
                  KHUYẾN MÃI
                </span>
              )}
              <Link to={`/sanpham/${item.id}`} onClick={scrollToTop}>
                {/* Sử dụng trực tiếp URL từ item.image */}
                <img
                  src={item.image || "https://via.placeholder.com/300x300?text=No+Image"}
                  alt={item.name}
                  className="w-full h-40 object-cover mb-4 rounded"
                />
                <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
              </Link>
              <div className="text-sm">
                {item.original ? (
                  <>
                    <span className="line-through text-gray-400 mr-1">
                      {Number(item.original).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[#A47148] font-semibold">
                      {Number(item.price).toLocaleString('vi-VN')}đ
                    </span>
                  </>
                ) : (
                  <span className="text-[#3E2C24] font-semibold">
                    {Number(item.price).toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

export default ProductDetail;