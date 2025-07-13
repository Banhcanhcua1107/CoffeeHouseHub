import HeroSection from "@/components/content/HeroSection";
import IntroSection from "@/components/content/IntroSection";
import AboutSection from "@/components/content/AboutSection";
import Body4Product from "@/components/content/Body4Product";
import ShopSection from "@/components/content/ShopSection";
import NewsSection from "@/components/content/NewsSection";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log('🏠 Home component mounted');
    console.log('📍 Location state:', location.state);
    
    if (location.state?.momoSuccess) {
      console.log('🎉 Hiển thị popup thành công MoMo');
      setShowSuccess(true);
      setIsAnimating(true);
      
      // Xóa momoSuccess khỏi state của history (để F5 không hiện lại box)
      window.history.replaceState({}, document.title);
      
      // Tự động ẩn sau 5 giây
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setShowSuccess(false), 300); // Thời gian cho animation fade out
      }, 5000);
    }
  }, [location.state]);

  const handleCloseSuccess = () => {
    setIsAnimating(false);
    setTimeout(() => setShowSuccess(false), 300);
  };

  return (
      <>
        {showSuccess && (
          <div 
            style={{
              position: "fixed",
              zIndex: 9999,
              left: 0, 
              right: 0, 
              top: 0, 
              bottom: 0,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isAnimating ? 1 : 0,
              transition: "opacity 0.3s ease-in-out"
            }}
            onClick={handleCloseSuccess}
          >
            <div 
              style={{
                background: "#fff",
                padding: "40px 50px",
                borderRadius: 20,
                boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
                textAlign: "center",
                maxWidth: "500px",
                width: "90%",
                transform: isAnimating ? "scale(1) translateY(0)" : "scale(0.9) translateY(-20px)",
                transition: "all 0.3s ease-in-out",
                position: "relative"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút đóng */}
              <button
                onClick={handleCloseSuccess}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f0f0f0";
                  e.target.style.color = "#333";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                  e.target.style.color = "#999";
                }}
              >
                ×
              </button>
              
              <div style={{ marginBottom: "20px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "#27ae60",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px auto",
                  animation: "bounce 1s ease-in-out"
                }}>
                  <span style={{ fontSize: "40px", color: "white" }}>✓</span>
                </div>
                
                <h2 style={{ 
                  color: "#27ae60", 
                  fontSize: 32, 
                  marginBottom: 12,
                  fontWeight: "bold"
                }}>
                  🎉 Thanh toán thành công!
                </h2>
              </div>
              
              <div style={{ marginBottom: "25px" }}>
                {location.state?.orderCode && (
                  <div style={{
                    background: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "15px"
                  }}>
                    <p style={{ fontSize: 16, marginBottom: 5, color: "#666" }}>
                      <strong>Mã đơn hàng:</strong> 
                      <span style={{ color: "#27ae60", fontWeight: "bold", marginLeft: "5px" }}>
                        {location.state.orderCode}
                      </span>
                    </p>
                    {location.state?.amount && (
                      <p style={{ fontSize: 16, marginBottom: 0, color: "#666" }}>
                        <strong>Số tiền:</strong> 
                        <span style={{ color: "#e74c3c", fontWeight: "bold", marginLeft: "5px" }}>
                          {Number(location.state.amount).toLocaleString('vi-VN')}đ
                        </span>
                      </p>
                    )}
                  </div>
                )}
                
                <p style={{ fontSize: 18, marginBottom: 0, color: "#555", lineHeight: "1.6" }}>
                  Vui lòng đợi xác nhận đơn hàng của bạn.<br />
                  <strong>Cảm ơn bạn đã mua hàng!</strong>
                </p>
              </div>
              
              <button
                onClick={handleCloseSuccess}
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "12px 30px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  marginTop: "10px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#219a52";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#27ae60";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
        
        <HeroSection />
        <IntroSection />
        <AboutSection />
        <Body4Product />
        <ShopSection />
        <NewsSection />
    </>
  );
}

export default Home;
