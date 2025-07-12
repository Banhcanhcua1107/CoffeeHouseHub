import { FaInstagram, FaTwitter, FaFacebookF, FaTumblr, FaVimeoV, FaLinkedinIn } from 'react-icons/fa';
import Avatar from '@/components/img/LOGOCOFFE/bienlaigmail.png';

export default function BlogSidebar() {
  return (
    <div className="sticky top-24 bg-white p-8 rounded-2xl shadow-sm">
      <div className="mb-10 text-center">
        <h3 className="font-bold text-lg border-b-2 border-[#ece9e0] pb-2 mb-6 uppercase tracking-wider">Giới thiệu</h3>
        <img
          src={Avatar}
          alt="Tác giả"
          className="w-32 h-32 object-cover rounded-full mx-auto mb-5 border-4 border-white shadow-md"
        />
        <p className="text-gray-500 text-sm leading-relaxed">
          Xin chào! Mình là "NPC" người yêu thích cà phê và những câu chuyện bên ly cà phê.
          Blog này chia sẻ trải nghiệm, kiến thức và cảm hứng về cà phê.
          Cảm ơn bạn đã ghé thăm!
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg border-b-2 border-[#ece9e0] pb-2 mb-6 uppercase tracking-wider text-center">Kết nối</h3>
        <div className="flex justify-center items-center gap-4 mt-6 px-4">
          <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-[#C13584] transition-colors"><FaInstagram size={22} /></a>
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400 transition-colors"><FaTwitter size={22} /></a>
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition-colors"><FaFacebookF size={22} /></a>
          <a href="#" aria-label="Tumblr" className="text-gray-400 hover:text-[#34526f] transition-colors"><FaTumblr size={22} /></a>
          <a href="#" aria-label="Vimeo" className="text-gray-400 hover:text-[#1ab7ea] transition-colors"><FaVimeoV size={22} /></a>
        </div>
      </div>
    </div>
  );
}