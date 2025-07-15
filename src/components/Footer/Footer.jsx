import { FaClock, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import logo from "@/components/img/LOGOCOFFE/logoCoffee.png";

function Footer() {
  const branch1Address = "736 Nguyễn Trãi, Phường 11, Quận 5, Tp.HCM";
  const branch2Address = "37 Kinh Dương Vương, Phường 12, Quận 6, TP.HCM";

  const getGoogleMapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <footer className="bg-[#121212] text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Cột Logo */}
        <div className="flex justify-center md:justify-start items-center">
          <img
            src={logo}
            alt="Logo CoffeeHouse"
            className="w-60 h-auto object-contain"
          />
        </div>

        {/* Cột Giờ mở cửa */}
        <div className="px-2">
          <h4 className="font-bold mb-3 uppercase text-[#d9a074] text-2xl flex items-center">
            <FaClock className="mr-3" /> Giờ mở cửa
          </h4>
          <ul className="text-gray-300 text-xl space-y-1">
            <li>Thứ 2: <span className="text-[#d6bfa3] font-semibold">Đóng cửa</span></li>
            <li>Thứ 3 - Thứ 5: 9:00 - 22:00</li>
            <li>Thứ 6: 9:00 - 01:00</li>
            <li>Thứ 7: 12:00 - 01:00</li>
            <li>Chủ nhật: 9:00 - 22:00</li>
          </ul>
        </div>

        {/* Cột Liên hệ */}
        <div className="px-2">
          <h4 className="font-bold mb-3 uppercase text-[#d9a074] text-2xl flex items-center">
            <FaEnvelope className="mr-3" /> Liên hệ
          </h4>
          <div className="text-gray-300 text-xl space-y-2">
            <p className="flex items-center">
              <FaEnvelope className="mr-3 min-w-[20px]" /> info@dhv.edu.vn
            </p>
            <p className="flex items-center">
              <FaPhone className="mr-3 min-w-[20px]" /> (+84) 02871001888
            </p>
          </div>
        </div>

        {/* Cột Chi nhánh */}
        <div className="px-2">
          <h4 className="font-bold mb-3 uppercase text-[#d9a074] text-2xl flex items-center">
            <FaMapMarkerAlt className="mr-3" /> Chi nhánh
          </h4>
          <div className="text-gray-300 text-xl space-y-2">
            <a
              href={getGoogleMapsUrl(branch1Address)}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-[#d9a074] transition-colors"
            >
              <strong className="flex items-start">
                <FaMapMarkerAlt className="mr-3 mt-1 flex-shrink-0" />
                <span>Chi Nhánh 1: {branch1Address}</span>
              </strong>
            </a>
            <a
              href={getGoogleMapsUrl(branch2Address)}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-[#d9a074] transition-colors"
            >
              <strong className="flex items-start">
                <FaMapMarkerAlt className="mr-3 mt-1 flex-shrink-0" />
                <span>Chi Nhánh 2: {branch2Address}</span>
              </strong>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-4 text-center text-gray-400 text-lg">
        © 2025 CoffeeHouse. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;