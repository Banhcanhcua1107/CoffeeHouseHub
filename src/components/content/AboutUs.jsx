// src/pages/AboutUs.jsx

import React from 'react';
import { Link } from 'react-router-dom';

// Import các icon từ thư viện (giả sử bạn đã cài react-icons)
// Nếu chưa có, chạy: npm install react-icons
import { FiCoffee, FiUsers, FiAward, FiHeart } from 'react-icons/fi';

// Component cho các thẻ giá trị cốt lõi
const ValueCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm text-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg">
    <div className="inline-block p-4 bg-[#A47148]/10 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#4A372D] mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Component chính của trang
function AboutUs() {
  // Dữ liệu cho các thẻ giá trị
  const coreValues = [
    {
      icon: <FiCoffee className="text-4xl text-[#A47148]" />,
      title: 'Chất Lượng Hạt Hảo Hạng',
      description: 'Mỗi hạt cà phê đều được tuyển chọn từ những vùng trồng tốt nhất, rang xay tỉ mỉ để giữ trọn vẹn hương vị nguyên bản.',
    },
    {
      icon: <FiUsers className="text-4xl text-[#A47148]" />,
      title: 'Không Gian Gắn Kết',
      description: 'Chúng tôi tạo ra một "ngôi nhà thứ ba" ấm cúng, nơi mọi người có thể gặp gỡ, làm việc và chia sẻ những khoảnh khắc đáng nhớ.',
    },
    {
      icon: <FiHeart className="text-4xl text-[#A47148]" />,
      title: 'Phục Vụ Bằng Cả Trái Tim',
      description: 'Đội ngũ barista không chỉ là chuyên gia pha chế, mà còn là những người bạn luôn sẵn lòng lắng nghe và chia sẻ.',
    },
    {
      icon: <FiAward className="text-4xl text-[#A47148]" />,
      title: 'Cam Kết Bền Vững',
      description: 'Chúng tôi cam kết hỗ trợ cộng đồng nông dân địa phương và áp dụng các phương pháp thân thiện với môi trường.',
    },
  ];

  return (
    <div className="bg-[#F9F5F0]">
      {/* 1. Hero Section - Giới thiệu chung */}
      <section 
        className="relative h-[60vh] bg-cover bg-center flex items-center justify-center text-white"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/gps-cs-s/AC9h4no-IpnRV9xRtaHEr3TuWIYPsQq16N7s7bfZL0plIEFZGnRTL8IBlM2fvjSHJqTBT6I1TJaQyT4NVlmfj_JACYgYyNSkrEzuVvV01xOhOjmVnmSa-Be5gQHFAa6mujdIb0UYCOih=s1360-w1360-h1020-rw')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg mb-6">Câu Chuyện Về Chúng Tôi</h1>
          <p className="text-xl md:text-2xl mt-4 max-w-3xl mx-auto drop-shadow-md font-light">
            Nơi mỗi tách cà phê kể một câu chuyện, mỗi không gian là một kỷ niệm
          </p>
        </div>
      </section>

      {/* 2. Sứ Mệnh & Tầm Nhìn */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#4A372D]">Hành Trình Của Coffee House</h2>
            <div className="w-24 h-1 bg-[#A47148]"></div>
            <p className="text-lg text-gray-700 leading-loose">
              Từ một cửa hàng nhỏ với tình yêu cà phê thuần khiết, chúng tôi đã phát triển thành một không gian cộng đồng nơi mọi người tìm thấy sự ấm áp, cảm hứng và những ly cà phê tuyệt hảo. Mỗi ngày, chúng tôi tiếp tục hành trình lan tỏa văn hóa cà phê chất lượng.
            </p>
            <blockquote className="border-l-4 border-[#A47148] pl-6 italic text-gray-600 py-2">
              "Không chỉ là cà phê, đó là nghệ thuật, là kết nối và là trải nghiệm đáng nhớ"
            </blockquote>
          </div>
          <div className="rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-105">
            <img 
              src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4nriIf65kyv2bJ_TmoYAMbrDgaYup7ewDjWDbcw5z9qvqgpjjE8DWg0TF4vryIesPO4MwyX_zbybD42J2acE5scJ78Vncx8rZOaHa6CbSWnFiHDPVejK-r0QVLT_Z_yHI3Wcd-Q=s1360-w1360-h1020-rw" 
              alt="Không gian ấm cúng của Coffee House" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* 3. Giá Trị Cốt Lõi */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#4A372D]">Triết Lý Của Chúng Tôi</h2>
            <p className="text-lg text-gray-600 mt-4">Những giá trị làm nên sự khác biệt</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <ValueCard key={index} {...value} />
            ))}
          </div>
        </div>
      </section>
      
      {/* 4. Đội ngũ */}
      <section className="py-20 px-6 bg-[#F5EEE6]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-105">
            <img 
              src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4np3v2c4Ci6rLymdff_o5Fbg-_Nb26kCESHj4ZgTyUQ53B5dMsWnrFcrS3J9FTxRyARH6E5MkCi3OcX6OsY94A3qPGmqMuiCNHIMSj19ePS6otfkNdRGg6zNNRbvBod5AHTjQLcI=s1360-w1360-h1020-rw" 
              alt="Đội ngũ Barista chuyên nghiệp" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#4A372D]">Đội Ngũ Tâm Huyết</h2>
            <div className="w-24 h-1 bg-[#A47148]"></div>
            <p className="text-lg text-gray-700 leading-loose">
              Chúng tôi tự hào có một đội ngũ trẻ trung, sáng tạo và đầy nhiệt huyết. Mỗi thành viên không chỉ là chuyên gia về cà phê mà còn là những người kể chuyện, sẵn sàng chia sẻ với bạn về hành trình thú vị từ hạt cà phê đến tách cà phê thơm ngon.
            </p>
            
          </div>
        </div>
      </section>

      {/* 5. Lời kêu gọi hành động (Call to Action) */}
      <section className="py-24 bg-[#4A372D] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Bạn đã sẵn sàng cho trải nghiệm?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Hãy đến và cảm nhận sự khác biệt. Một không gian tuyệt vời và những ly cà phê hảo hạng đang chờ đón bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/menu" 
              className="inline-block bg-white text-[#4A372D] font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition-transform duration-300 transform hover:scale-105"
            >
              Xem Thực Đơn
            </Link>
            <Link 
              to="/sanpham" 
              className="inline-block border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-transform duration-300 transform hover:scale-105"
            >
              Xem Sản Phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;