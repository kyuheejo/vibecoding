import React, { useEffect, useState } from "react";

interface HeartAnimationProps {
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    onComplete: () => void;
}

interface Heart {
    id: number;
    x: number;
    y: number;
    delay: number;
    offsetX: number;
    offsetY: number;
}

const HeartAnimation: React.FC<HeartAnimationProps> = ({
    startX,
    startY,
    targetX,
    targetY,
    onComplete,
}) => {
    const [hearts, setHearts] = useState<Heart[]>([]);

    useEffect(() => {
        // Create 8 hearts with staggered delays
        const newHearts: Heart[] = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: startX,
            y: startY,
            delay: i * 150,
            offsetX: (Math.random() - 0.5) * 40,
            offsetY: (Math.random() - 0.5) * 20,
        }));
        setHearts(newHearts);

        // Complete after all hearts have animated
        const timeout = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10000 }}>
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="heart-fly"
                    style={{
                        position: "absolute",
                        left: startX,
                        top: startY,
                        fontSize: "2rem",
                        animationDelay: `${heart.delay}ms`,
                        "--target-x": `${targetX - startX + heart.offsetX}px`,
                        "--target-y": `${targetY - startY + heart.offsetY}px`,
                    } as React.CSSProperties}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
};

export default HeartAnimation;
