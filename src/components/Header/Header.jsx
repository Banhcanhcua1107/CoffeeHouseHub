// Header.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import BTN from '@/components/Header/button';
import { Link, NavLink } from 'react-router-dom';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import Logo from '@/components/img/LOGOCOFFE/logoCoffee.png';
import { ShopContext } from '@/components/context/ShopContext';

function Header() {
  const { user } = useContext(ShopContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const locationDropdownRef = useRef(null);

  const locations = [
    { id: 1, name: "Chi Nhánh 1", address: "736 Nguyễn Trãi, P.11, Q.5, Tp.HCM" },
    { id: 2, name: "Chi Nhánh 2", address: "37 Kinh Dương Vương, Phường 12, Quận 6, TP.HCM" },
    { id: 3, name: "Chi Nhánh 3", address: "Công viên Phần mềm Quang Trung, P. Tân Chánh Hiệp, Quận 12, TP.HCM" }
  ];

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setIsLocationDropdownOpen(false);
  };
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- LOGIC THAY ĐỔI MENU ---
  const userNavItems = [
    { name: 'Sản phẩm', path: '/sanpham' },
    { name: 'Menu', path: '/menu' },
    { name: 'Tin tức', path: '/news' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  const adminNavItems = [
    { name: 'Sản phẩm', path: '/sanpham' },
    { name: 'Menu', path: '/menu' },
    { name: 'Đơn hàng', path: '/order' },
    { name: 'Liên hệ', path: '/contact' },
  ];
  
  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;
  const activeLinkStyle = { color: '#FFD8A9', fontWeight: '600' };

  return (
    <header className="w-full bg-[#3E2C24] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src={Logo} alt="Logo CoffeeHouse" className="w-40 h-13 object-contain" />
        </Link>

        {/* Khối chọn chi nhánh (GIỮ NGUYÊN, LUÔN HIỂN THỊ) */}
        <div ref={locationDropdownRef} className="hidden md:flex items-center ml-8 relative group">
          <button 
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="flex items-center text-base transition px-4 py-2 rounded-lg"
          >
            <FaMapMarkerAlt className="mr-3 text-[#FFD8A9] text-xl" />
            <div className="text-left">
              <p className="font-medium text-lg leading-tight hover:text-[#FFD8A9] transition">
                {selectedLocation ? selectedLocation.name : "Chọn chi nhánh bạn gần"}
              </p>
              <p className="text-sm text-gray-300 hover:text-[#FFD8A9] transition">
                {selectedLocation ? selectedLocation.address : "2 chi nhánh gần đây"}
              </p>
            </div>
            <FaChevronDown className={`ml-4 text-sm transition-transform ${isLocationDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          {isLocationDropdownOpen && (
            <div className="absolute top-full left-0 mt-4 w-72 bg-[#4B2E2E] rounded-lg shadow-xl z-50 p-4 border border-[#5A3A3A]" style={{ marginTop: '17px' }}>
              <h4 className="font-bold text-[#FFD8A9] mb-3 text-lg">Các chi nhánh</h4>
              {locations.map(location => (
                <div 
                    key={location.id} 
                    className="mb-4 last:mb-0 p-3 rounded-lg cursor-pointer 
                              hover:bg-[#5A3A3A] hover:scale-105 transform transition-all duration-200
                              hover:text-[#FFD8A9]"
                    onClick={() => handleSelectLocation(location)}
                  >
                    <p className="font-medium text-[#FFD8A9] text-base">{location.name}</p>
                    <p className="text-sm text-gray-300 mt-1">{location.address}</p>
                  </div>

              ))}
            </div>
          )}
        </div>

        {/* Menu điều hướng chính */}
        <nav className="hidden md:flex items-center space-x-10 text-lg font-medium ml-10">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className="hover:text-[#FFD8A9] transition"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block ml-auto">
          <BTN />
        </div>

        {/* Nút menu mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6 text-[#FFD8A9]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#4B2E2E] text-white px-6 pb-6 pt-2 rounded-b-lg shadow-lg">
          <nav className="flex flex-col space-y-4 text-base">
            {/* Khối chọn chi nhánh trên mobile (GIỮ NGUYÊN) */}
            <div ref={locationDropdownRef} className="mb-4 relative">
              <button 
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="flex items-center w-full text-left px-4 py-3 bg-[#3E2C24] rounded-lg"
              >
                <FaMapMarkerAlt className="mr-3 text-[#FFD8A9] text-xl" />
                <div className="flex-1">
                  <p className="font-medium text-lg">
                    {selectedLocation ? selectedLocation.name : "Chọn chi nhánh bạn gần"}
                  </p>
                  <p className="text-sm text-gray-300">
                    {selectedLocation ? selectedLocation.address : "2 chi nhánh gần đây"}
                  </p>
                </div>
                <FaChevronDown className={`text-sm transition-transform ${isLocationDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#3E2C24] rounded-lg p-3 border border-[#5A3A3A] z-10">
                  <h4 className="font-bold text-[#FFD8A9] mb-3 pl-2">Các chi nhánh</h4>
                  {locations.map(location => (
                    <div 
                      key={location.id} 
                      className="mb-3 last:mb-0 p-2 rounded-lg cursor-pointer hover:text-[#FFD8A9] transition"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <p className="font-medium text-[#FFD8A9]">{location.name}</p>
                      <p className="text-xs text-gray-300 mt-1">{location.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Vòng lặp các mục menu đã được thay đổi */}
            {navItems.map((item) => (
               <NavLink 
                key={item.name} 
                to={item.path} 
                className="hover:text-[#FFD8A9] transition px-4 py-2"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}

            <div className="pt-2">
              <BTN />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;