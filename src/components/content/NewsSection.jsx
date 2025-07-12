import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function NewsSection() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get("https://coffeehousehub-production.up.railway.app/news")
      .then(res => setNews(res.data.slice(0, 3)))
      .catch(() => setNews([]));
  }, []);

  return (
    <section className="bg-[#F9F5F0] text-[#3E2C24] pt-[50px] pb-[50px]">
      <div className="container mx-auto px-6 text-center">
        <p className="text-2xl uppercase text-[#b48a64] mb-2">Điều tuyệt vời diễn ra tại đây</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">TIN TỨC & BLOG</h2>
        <div className="w-24 h-1 bg-[#D9A074] mx-auto mb-16"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {news.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
              <Link to={`/newspaper/${item.id}`} className="block">
                <img src={item.image} alt={item.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-xs italic text-[#b48a64] mb-2 uppercase">
                  {item.category} / {new Date(item.date).toLocaleDateString("vi-VN")}
                </p>
                <h3 className="font-bold text-lg mb-3 flex-grow">
                   <Link to={`/newspaper/${item.id}`} className="hover:text-[#D9A074] transition-colors">{item.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                <div className="mt-auto">
                  <Link
                    to={`/newspaper/${item.id}`}
                    className="text-[#b48a64] text-sm font-semibold hover:text-[#3E2C24] inline-flex items-center gap-1"
                  >
                    XEM THÊM →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Link to="/news" className="inline-block bg-[#D9A074] text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-[#c98b50] transition-all duration-300 transform hover:scale-105">
            XEM TẤT CẢ TIN TỨC
          </Link>
        </div>
      </div>
    </section>
  );
}