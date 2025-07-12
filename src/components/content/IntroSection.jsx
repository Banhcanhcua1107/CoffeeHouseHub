// --- START OF FILE IntroSection.jsx ---

import { Link } from "react-router-dom";
import { I1, I2, I3, I4 } from "@/components/img/Intro";

function IntroSection() {
  // BẠN CẦN THAY THẾ CÁC SỐ ID DƯỚI ĐÂY BẰNG ID THỰC TẾ TRONG DATABASE CỦA BẠN
  const idBaiVietKhongGian = 1; // << THAY SỐ NÀY
  const idBaiVietHuongVi = 2;   // << THAY SỐ NÀY
  const idBaiVietPhucVu = 3;    // << THAY SỐ NÀY

  const features = [
    {
      img: I1,
      title: "KHÔNG GIAN ẤM CÚNG",
      desc: "Thiết kế hiện đại, không gian yên tĩnh – lý tưởng để gặp gỡ, làm việc hoặc thư giãn.",
      link: `/newspaper/${idBaiVietKhongGian}`,
    },
    {
      img: I2,
      title: "HƯƠNG VỊ ĐẬM ĐÀ",
      desc: "Cà phê nguyên chất, rang xay tại chỗ – mang đến hương vị trọn vẹn trong từng ngụm.",
      link: `/newspaper/${idBaiVietHuongVi}`,
    },
    {
      img: I3,
      title: "PHỤC VỤ TẬN TÂM",
      desc: "Đội ngũ Barista chuyên nghiệp, thân thiện – luôn đặt trải nghiệm khách hàng lên hàng đầu.",
      link: `/newspaper/${idBaiVietPhucVu}`,
    },
  ];

  return (
    <section className="bg-[#f2ede7] text-[#3E2C24] py-20">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm uppercase text-[#b48a64] md:text-3xl mb-2 tracking-wide">Giới thiệu nhanh</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">CÀ PHÊ - KHƠI NGUỒN CẢM HỨNG</h2>
        <div className="w-20 h-[2px] bg-[#D9A074] mx-auto mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="block text-left bg-white p-5 rounded-lg shadow hover:shadow-xl transition duration-300 group"
            >
              <div className="overflow-hidden rounded-md shadow-md mb-4">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#b48a64]">{item.title}</h3>
              <p className="text-sm text-gray-700 mb-4">{item.desc}</p>
              <div className="mt-auto">
                <p className="text-[#b48a64] text-sm font-semibold group-hover:underline inline-flex items-center gap-1">
                  KHÁM PHÁ NGAY →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <Link
            to='/menu'
            className="inline-block bg-[#D9A074] text-white font-semibold px-8 py-4 rounded-full shadow-md hover:bg-[#c98b50] transition"
          >
            XEM MENU & ĐẶT NƯỚC NGAY
          </Link>
        </div>
      </div>
    </section>
  );
}

export default IntroSection;