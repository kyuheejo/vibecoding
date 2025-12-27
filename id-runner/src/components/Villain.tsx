import React, { useEffect, useState, useRef } from "react";
import { useMobile } from "../hooks/useMobile";

// Import villain frames
import v1 from "../assets/villain/1.png";
import v2 from "../assets/villain/2.png";
import v3 from "../assets/villain/3.png";
import v4 from "../assets/villain/4.png";
import v5 from "../assets/villain/5.png";
import v6 from "../assets/villain/6.png";
import v7 from "../assets/villain/7.png";


// Import speech bubble frames
import s1 from "../assets/villain_speaks/1.png";
import s2 from "../assets/villain_speaks/2.png";
import s3 from "../assets/villain_speaks/3.png";
import s4 from "../assets/villain_speaks/4.png";
import s5 from "../assets/villain_speaks/5.png";
import s6 from "../assets/villain_speaks/6.png";
import s7 from "../assets/villain_speaks/7.png";


const frames = [v1, v2, v3, v4, v5, v6, v7];
const speechFrames = [s1, s2, s3, s4, s5, s6, s7];

interface VillainProps {
    isGameOver: boolean;
    villainIndex: number;
    onPositionUpdate: (x: number) => void;
    onVillainCycle: () => void;
}

const Villain: React.FC<VillainProps> = ({ isGameOver, villainIndex, onPositionUpdate, onVillainCycle }) => {
    const { scale, baseBottom } = useMobile();
    const [x, setX] = useState(window.innerWidth); // Start off-screen right

    // Refs for physics loop
    const xRef = useRef(window.innerWidth);
    const requestRef = useRef<number>(0);
    const speed = 5; // Movement speed

    // Movement loop
    useEffect(() => {
        if (isGameOver) return;

        const move = () => {
            xRef.current -= speed;

            // Reset if off-screen left
            if (xRef.current < -300) {
                xRef.current = window.innerWidth;
                // Cycle through villains sequentially
                onVillainCycle();
            }

            setX(xRef.current);
            onPositionUpdate(xRef.current); // Report position
            requestRef.current = requestAnimationFrame(move);
        };

        requestRef.current = requestAnimationFrame(move);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isGameOver]);

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
                src={speechFrames[villainIndex]}
                alt="Speech"
                className="animate-float"
                style={{
                    width: `${200 * scale}px`,
                    height: "auto",
                    marginBottom: "-2px",
                    position: "relative",
                    left: `${-30 * scale}px`,
                    animationPlayState: isGameOver ? 'paused' : 'running'
                }}
            />

            {/* Villain Character */}
            <img
                src={frames[villainIndex]}
                alt="Villain"
                style={{
                    width: "100%",
                    height: "auto",
                }}
            />
        </div>
    );
};

export default Villain;