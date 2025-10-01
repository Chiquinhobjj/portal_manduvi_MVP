import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

declare global {
  interface Window {
    VANTA: any;
  }
}

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!vantaRef.current || !window.VANTA) return;

    const lightModeColors = {
      color: 0xE87A3E,
      backgroundColor: 0xF5F5F5,
    };

    const darkModeColors = {
      color: 0xE87A3E,
      backgroundColor: 0x1A1A1A,
    };

    const colors = theme === 'light' ? lightModeColors : darkModeColors;

    if (vantaEffect.current) {
      vantaEffect.current.setOptions(colors);
    } else {
      vantaEffect.current = window.VANTA.TOPOLOGY({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        ...colors,
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [theme]);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10 transition-colors duration-300"
    />
  );
}
