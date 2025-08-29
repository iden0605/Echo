import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent} from 'framer-motion';

function Navbar({ containerRef }) {
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll({ container: containerRef });
  
  const navItems = ["Lunar", "About"];
  const scrollThreshold = 150;

  useMotionValueEvent(scrollY, "change", (curr) => {
    const prev = scrollY.getPrevious();
    
    if (Math.abs(prev - curr) < 20) {
      return;
    }

    if (curr === 0) {
      setIsVisible(true);
    }
    else if (curr > prev && curr > scrollThreshold) {
      setIsVisible(false);
    }
    else if (prev > curr) {
      setIsVisible(true);
    }
  });
  
  return (
    <motion.nav 
    variants={{
      visible: { y: 0 },
      hidden: { y: "-110%"},
    }}
    animate={isVisible ? "visible" : "hidden"}
    transition={{ duration: 0.2, ease: "easeInOut" }}
    className="fixed w-4/12 shadow-md rounded-full bg-gradient-to-r from-stone-800 to-black px-6 py-4 z-50 left-1/3 mr-2 mt-1.5 select-none">
      <ul className="flex justify-center space-x-8">
        {navItems.map((item) =>
          <li className="text-lg font-medium text-cream-50 hover:text-stone-400 duration-200 transition-transform hover:-translate-y-0.5 cursor-pointer select-none;" key={item} >{item}</li>
        )}
      </ul>
    </motion.nav>
  );
}

export default Navbar;
