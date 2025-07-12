import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/router/router';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import { ShopProvider } from '@/components/context/ShopContext';
import ScrollToTop from '@/components/router/ScrollToTop';
function App() {
  return (
    <div className="font-sans bg-[#fffaf3] text-gray-800">
      <ShopProvider>
        <BrowserRouter>
          <ScrollToTop /> 
          <AppRoutes />
        </BrowserRouter>
      </ShopProvider>
    </div>
  );
}

export default App;
