import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/components/css/HeroSection.css";
import Slider1 from "@/components/img/Heros/slider1.jpeg"
import Slider2 from "@/components/img/Heros/slider2.jpeg"
import Slider3 from "@/components/img/Heros/slider3.jpeg"
import Slider4 from "@/components/img/Heros/slider4.jpeg"
import { Link } from "react-router-dom";

function HeroSection() {
    const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 800,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    appendDots: dots => (
      <div>
        <ul style={{ marginTop: "20px" }}>{dots}</ul>
      </div>
    ),
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };


    const slides = [
    {
      image: Slider3,
      title: "KHÁM PHÁ NHỮNG HƯƠNG VỊ MỚI",
      desc: "Từ truyền thống đến hiện đại, hương vị cà phê của chúng tôi luôn đổi mới để làm bạn bất ngờ.",
    },
    {
      image: Slider2,
      title: "CHẤT LƯỢNG LÀ ƯU TIÊN HÀNG ĐẦU",
      desc: "Từ hạt cà phê nguyên chất đến từng ly phục vụ, chúng tôi cam kết chất lượng hoàn hảo mỗi ngày.",
    },
    {
      image: Slider4,
      title: "KHÔNG GIAN GẮN KẾT CẢM XÚC",
      desc: "Quán cà phê là nơi bạn gặp gỡ, chia sẻ và tận hưởng phút giây thư giãn thật sự.",
    },
    {
      image: Slider1,
      title: "KHƠI NGUỒN CẢM HỨNG CÙNG CÀ PHÊ",
      desc: "Hành trình bắt đầu từ một tách cà phê đậm đà, nơi bạn tìm thấy sự tỉnh táo và đam mê.",
    },
  ];


  return (
    <section className="relative">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index}>
            <div
              className="h-[90vh] bg-cover bg-center flex items-center justify-center relative"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              <div className="relative z-10 text-white text-center px-6 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-3">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6">{slide.desc}</p>
                <Link
                  to='/about-us'
                  className="inline-block bg-[#D9A074] px-6 py-3 rounded-full shadow hover:bg-[#c98b50] transition"
                >
                  XEM THÊM
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}


function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div className={className} style={{ ...style }} onClick={onClick}>
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div className={className} style={{ ...style }} onClick={onClick}>
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </div>
  );
}

export default HeroSection;
