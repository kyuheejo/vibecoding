import React, { useEffect, useState, useRef } from "react";
import { useMobile } from "../hooks/useMobile";

// Import good guy frames
import g1 from "../assets/good_guy/1.png";
import g2 from "../assets/good_guy/2.png";

// Import speech bubble frames
import s1 from "../assets/good_guy_speaks/1.png";
import s2 from "../assets/good_guy_speaks/2.png";

const frames = [g1, g2];
const speechFrames = [s1, s2];

interface GoodGuyProps {
    isGameOver: boolean;
    isWin: boolean;
    isVisible: boolean;
    onPositionUpdate: (x: number) => void;
    onGoodGuyCycle: () => void;
}

const GoodGuy: React.FC<GoodGuyProps> = ({ isGameOver, isWin, isVisible, onPositionUpdate, onGoodGuyCycle }) => {
    const { scale, baseBottom } = useMobile();
    const [x, setX] = useState(window.innerWidth);
    const [frameIndex, setFrameIndex] = useState(0);

    // Refs for physics loop
    const xRef = useRef(window.innerWidth);
    const requestRef = useRef<number>(0);
    const speed = 5; // Same speed as villain

    // Reset position when becoming visible
    useEffect(() => {
        if (isVisible) {
            xRef.current = window.innerWidth;
            setX(window.innerWidth);
            setFrameIndex(Math.floor(Math.random() * frames.length));
        }
    }, [isVisible]);

    // Movement loop
    useEffect(() => {
        if (!isVisible || isGameOver || isWin) return;

        const move = () => {
            xRef.current -= speed;

            // Reset if off-screen left
            if (xRef.current < -300) {
                xRef.current = window.innerWidth;
                onGoodGuyCycle();
            }

            setX(xRef.current);
            onPositionUpdate(xRef.current);
            requestRef.current = requestAnimationFrame(move);
        };

        requestRef.current = requestAnimationFrame(move);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isVisible, isGameOver, isWin]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: "absolute",
                left: `${x}px`,
                bottom: `${baseBottom - 30 * scale}px`,
                width: `${300 * scale}px`,
                height: "auto",
                userSelect: "none",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {/* Speech Bubble */}
            <img
                src={speechFrames[frameIndex]}
                alt="Speech"
                className="animate-float"
                style={{
                    width: `${200 * scale}px`,
                    height: "auto",
                    marginBottom: "-2px",
                    position: "relative",
                    left: `${-30 * scale}px`,
                    animationPlayState: (isGameOver || isWin) ? 'paused' : 'running'
                }}
            />

            {/* Good Guy Character */}
            <img
                src={frames[frameIndex]}
                alt="Good Guy"
                style={{
                    width: "100%",
                    height: "auto",
                }}
            />
        </div>
    );
};

export default GoodGuy;
