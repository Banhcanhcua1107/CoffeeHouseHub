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

  useEffect(() => {
    if (location.state?.momoSuccess) {
      setShowSuccess(true);
      // Xóa momoSuccess khỏi state của history (để F5 không hiện lại box)
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowSuccess(false), 4000); // 4 giây sau tự tắt
    }
  }, [location.state]);

  return (
      <>
        {showSuccess && (
          <div style={{
            position: "fixed",
            zIndex: 9999,
            left: 0, right: 0, top: 0, bottom: 0,
            background: "rgba(0,0,0,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              background: "#fff",
              padding: "32px 48px",
              borderRadius: 18,
              boxShadow: "0 4px 32px #0002",
              textAlign: "center"
            }}>
              <h2 style={{ color: "#27ae60", fontSize: 28, marginBottom: 8 }}>
                🎉 Thanh toán thành công!
              </h2>
              <p style={{ fontSize: 18, marginBottom: 10 }}>
                {location.state?.orderCode && (
                  <>Mã đơn hàng: <strong>{location.state.orderCode}</strong><br /></>
                )}
                Vui lòng đợi xác nhận đơn hàng của bạn.<br />Cảm ơn bạn đã mua hàng!
              </p>
            </div>
          </div>
        )}
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
