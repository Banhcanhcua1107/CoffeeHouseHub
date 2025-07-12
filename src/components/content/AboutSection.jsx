import About from "@/components/img/AboutSection/about.jpg";

function AboutSection() {
  return (
    <section className="relative bg-[#1a1a1a] text-white overflow-hidden">
      {/* Ảnh nền parallax */}
      <div
        className="absolute inset-0 bg-fixed bg-center bg-cover opacity-70"
        style={{ backgroundImage: `url(${About})` }}
      ></div>

      {/* Lớp phủ nền tối */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Nội dung chính */}
     <div className="relative z-10 max-w-7xl mx-auto py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-x-16">     
        {/* Cột trái: Video */}
        <div className="hidden md:flex justify-center">
          <div className="rounded-lg overflow-hidden shadow-lg w-[650px] h-[350px]">
           <iframe width="610" height="350" src="https://www.youtube.com/embed/MYPVQccHhAQ?si=jzrcmZmlArcyCXDL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </div>
        </div>

        {/* Cột phải: Văn bản */}
        <div className="text-left md:pl-12">
          <p className="text-2xl text-[#d6bfa3] uppercase mb-2">VỀ CHÚNG TÔI</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            CÀ PHÊ KHÔNG CHỈ LÀ ĐỒ UỐNG
          </h2>
          <p className="text-lg mb-6 text-gray-200 max-w-xl">
            Với chúng tôi, cà phê là một phần của cuộc sống – là kết nối, là cảm xúc và là phong cách sống.
            Trải nghiệm ngay tại quán hoặc thông qua ứng dụng đặt hàng tiện lợi.
          </p>
          <a
            href="#"
            className="bg-[#d6bfa3] text-black font-semibold px-6 py-3 rounded shadow hover:bg-[#bfa280] transition"
          >
            KHÁM PHÁ NGAY
          </a>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
