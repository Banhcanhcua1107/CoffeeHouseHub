import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BlogSidebar from "@/components/page/BlogSidebar";

export default function NewspaperDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://coffeehousehub-production.up.railway.app/news/${id}`)
      .then((res) => setNews(res.data))
      .catch(() => setNews(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">Đang tải...</div>
    );
  if (!news)
    return (
      <div className="text-center py-20 text-gray-400">
        Không tìm thấy bài viết.
      </div>
    );

  return (
    <section className="bg-[#FBF9F6] text-[#3E2C24] py-16 px-4 sm:px-6 lg:px-8">
      {/* Giảm khoảng cách giữa 2 cột từ gap-12 xuống gap-8 */}
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-8">
        <main className="flex-1 min-w-0">
          {/* 
            --- THAY ĐỔI CHÍNH Ở ĐÂY ---
            Xóa class "max-w-3xl" và "mx-auto" để khối nội dung này mở rộng ra,
            chiếm hết không gian của thẻ <main> và nằm sát sidebar hơn.
          */}
          <div className="bg-white p-8 sm:p-10 md:p-14 rounded-2xl shadow-sm">
            {news.image && (
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-10"
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#4A372D]">
              {news.title}
            </h1>
            <div className="text-sm italic text-[#b48a64] mb-6">
              {news.category} /{" "}
              {new Date(news.date).toLocaleDateString("vi-VN")}
            </div>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              {news.description}
            </p>

            <article className="article-content">
              <ContentWithStyledMedia html={news.content} />
            </article>
          </div>
        </main>
        <aside className="w-full lg:w-80 flex-shrink-0">
          <BlogSidebar />
        </aside>
      </div>
    </section>
  );
}

function ContentWithStyledMedia({ html }) {
  if (typeof window === "undefined" || !html) return null;

  const container = document.createElement("div");
  container.innerHTML = html;

  container.querySelectorAll("div").forEach((div) => {
    const imgs = Array.from(div.children).filter(
      (child) => child.tagName === "IMG"
    );
    if (imgs.length === 2 && div.children.length === 2) {
      div.className = "flex flex-col sm:flex-row gap-4 my-10";
      imgs.forEach((img) => {
        img.className =
          "handled w-full sm:w-1/2 object-cover aspect-square rounded-lg shadow-md";
      });
    }
  });

  container.querySelectorAll("img:not(.handled)").forEach((img) => {
    img.className = "w-full h-auto rounded-lg my-10 shadow-md";
    if (img.parentElement.tagName === "P") {
      img.parentElement.style.marginBottom = "0";
    }
  });

  container.querySelectorAll("blockquote").forEach((bq) => {
    bq.className =
      "italic text-lg text-[#876c5c] border-l-4 border-[#d9a074] pl-6 py-4 bg-[#fdfaf6] rounded-r-lg my-10";
  });

  container.querySelectorAll("p").forEach((p) => {
    if (!p.querySelector("img")) {
      p.className =
        "mb-6 text-lg leading-relaxed text-gray-800 text-justify hyphens-auto";
    }
  });

  return <div dangerouslySetInnerHTML={{ __html: container.innerHTML }} />;
}