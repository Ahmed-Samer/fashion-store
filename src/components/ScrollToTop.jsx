import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // كل ما الرابط (pathname) يتغير، رجع الصفحة لأولها فوراً
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // المكون ده وظيفي بس، مش بيعرض حاجة
};

export default ScrollToTop;