import RootLayout from "./layouts/root-layout";
import Loader from "./app/common/loader";
import ScrollToTop from "./globals/scroll-to-top";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./global-styles.css";
import "./notification-animations.css";

function App() {

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 300,
      once: true,
      offset: 50,
    });
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <WebSocketProvider>
        {isLoading && <Loader />}
        <ScrollToTop />
        <RootLayout />
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App;