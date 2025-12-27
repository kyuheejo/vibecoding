import React, { useEffect, useRef } from "react";
import bg from "../assets/background/background.png";

interface BackgroundProps {
    isGameOver: boolean;
}

const BackgroundInfinite: React.FC<BackgroundProps> = ({ isGameOver }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);

    useEffect(() => {
        if (isGameOver) return;

        let animationFrameId: number;
        const speed = 0.2; // ~4 seconds per cycle at 60fps

        const animate = () => {
            positionRef.current -= speed;

            // Reset when we've scrolled 50% (one full image width)
            if (positionRef.current <= -50) {
                positionRef.current += 50;
            }

            if (containerRef.current) {
                containerRef.current.style.transform = `translate3d(${positionRef.current}%, 0, 0)`;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isGameOver]);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            <div
                ref={containerRef}
                className="flex w-[200%] h-full"
                style={{ willChange: 'transform' }}
            >
                <img
                    src={bg}
                    className="w-1/2 h-full object-cover"
                    alt="background"
                />
                <img
                    src={bg}
                    className="w-1/2 h-full object-cover"
                    alt="background"
                />
            </div>
        </div>
    );
};

export default BackgroundInfinite;