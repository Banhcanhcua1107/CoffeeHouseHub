// --- START OF FILE AllNewsPage.jsx ---

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = 'https://coffeehousehub-production.up.railway.app';
import BlogSidebar from "@/components/page/BlogSidebar";

import ParallaxBG from "@/components/img/Heros/slider4.jpeg";
import "@/components/css/Parallax.css";

export default function AllNewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/news`)
      .then(res => setNews(res.data))
      .catch(() => setNews([]));
  }, []);

  return (
    <>
      <section
        className="parallax-section flex items-center justify-center"
        style={{ backgroundImage: `url(${ParallaxBG})` }}
      >
        <h2 className="text-white text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg">
          TIN TỨC & SỰ KIỆN
        </h2>
      </section>

      <section className="bg-[#FBF9F6] text-[#3E2C24] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold uppercase mb-10 text-left border-b-2 border-[#D9A074] pb-4">
              Tất cả tin tức
            </h2>
            <div className="flex flex-col gap-y-12">
              {news.map(item => (
                <div
                  key={item.id}
                  className="md:flex gap-8 bg-white p-6 rounded-2xl shadow-sm transition-shadow hover:shadow-lg"
                >
                  {/* --- KHỐI CODE ĐƯỢC THAY ĐỔI --- */}
                  <Link to={`/newspaper/${item.id}`} className="block w-full md:w-5/12 flex-shrink-0">
                    {/* 1. Tạo một div wrapper với chiều cao cố định */}
                    <div className="w-full h-64 overflow-hidden rounded-lg"> 
                      {/* 2. Thêm class vào thẻ img */}
                      <img
                        src={item.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  {/* --- KẾT THÚC KHỐI THAY ĐỔI --- */}

                  <div className="flex-1 flex flex-col justify-between mt-6 md:mt-0">
                    <div>
                      <p className="text-sm italic text-[#b48a64] mb-2">
                        {item.category} / {new Date(item.date).toLocaleDateString("vi-VN")}
                      </p>
                      <h3 className="font-bold text-xl md:text-2xl mb-3 text-[#4A372D] hover:text-[#D9A074] transition-colors">
                         <Link to={`/newspaper/${item.id}`}>{item.title}</Link>
                      </h3>
                      <p className="text-base text-gray-600 mb-5 line-clamp-3">{item.description}</p>
                    </div>
                    <div className="mt-auto">
                      <Link
                        to={`/newspaper/${item.id}`}
                        className="text-[#b48a64] text-sm font-semibold hover:text-[#3E2C24] inline-flex items-center gap-2 group"
                      >
                        ĐỌC TIẾP <span className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="w-full lg:w-80 flex-shrink-0">
            <BlogSidebar />
          </aside>
        </div>
      </section>
    </>
  );
}