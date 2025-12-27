import { useState, useEffect } from 'react';

export const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

    useEffect(() => {
        const checkMobile = () => {
            // Check if screen width is mobile-sized (landscape mobile is typically < 900px height)
            const isMobileDevice = window.innerWidth < 900 ||
                /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            setIsMobile(isMobileDevice);
            setScreenHeight(window.innerHeight);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scale factor: 1/3 for mobile
    const scale = isMobile ? 0.33 : 1;

    // Bottom position: 1/3 of screen height on mobile, 200px on desktop
    const baseBottom = isMobile ? Math.floor(screenHeight / 3) : 200;

    return { isMobile, scale, baseBottom };
};
