import RootLayout from "./layouts/root-layout";
import Loader from "./app/common/loader";
import ScrollToTop from "./globals/scroll-to-top";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import forceLightMode from "./utils/forceLightMode";
import "./global-styles.css";
import "./notification-animations.css";
import "./mobile-responsive.css";
import "./employer-mobile-responsive.css";
import "./index16-mobile-fix.css";
import "./logo-fix.css";
import "./mobile-card-scrolling.css";
import "./force-light-mode.css";

function App() {

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Force light mode immediately
    const cleanup = forceLightMode();
    
    AOS.init({
      duration: 300,
      once: true,
      offset: 50,
    });
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
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
