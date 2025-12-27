import React, { useEffect, useState, useRef } from "react";

// PNG 7장을 모두 import
import frame0 from "../assets/run/run_1.png";
import frame1 from "../assets/run/run_2.png";
import frame2 from "../assets/run/run_3.png";
import frame3 from "../assets/run/run_4.png";
import frame4 from "../assets/run/run_5.png";
import frame5 from "../assets/run/run_6.png";
import frame6 from "../assets/run/run_7.png";

// Heart run frames
import heart1 from "../assets/heart_run/1.png";
import heart2 from "../assets/heart_run/2.png";
import heart3 from "../assets/heart_run/3.png";
import heart4 from "../assets/heart_run/4.png";
import heart5 from "../assets/heart_run/5.png";
import heart6 from "../assets/heart_run/6.png";
import heart7 from "../assets/heart_run/7.png";
import heart8 from "../assets/heart_run/8.png";
import heart9 from "../assets/heart_run/9.png";
import heart10 from "../assets/heart_run/10.png";
import heart11 from "../assets/heart_run/11.png";

const frames: string[] = [
    frame0,
    frame1,
    frame2,
    frame3,
    frame4,
    frame5,
    frame6,
];

const heartFrames: string[] = [
    heart1, heart2, heart3, heart4, heart5, heart6,
    heart7, heart8, heart9, heart10, heart11,
];

// 기본 위치
const BASE_LEFT = 50;
const BASE_BOTTOM = 200;
const WIDTH = 300;

interface RunnerProps {
    isGameOver: boolean;
    isHoldingEnter: boolean;
    onPositionUpdate: (y: number) => void;
}

const RunnerCharacter: React.FC<RunnerProps> = ({ isGameOver, isHoldingEnter, onPositionUpdate }) => {
    // 점프 상태
    const [isJumping, setIsJumping] = useState(false);
    const [y, setY] = useState(0);
    const [frameIndex, setFrameIndex] = useState(0);
    const [heartFrameIndex, setHeartFrameIndex] = useState(0);

    // Physics constants (reduced jump for difficulty)
    const JUMP_POWER = 18;
    const GRAVITY = 0.8;

    // Refs for physics loop to avoid re-render dependency cycles
    const posRef = useRef(0);
    const velRef = useRef(0);
    const requestRef = useRef<number>(0);
    const jumpCountRef = useRef(0); // Track number of jumps

    // 러닝 애니메이션 (프레임 순환)
    useEffect(() => {
        if (isGameOver) return; // Stop animation on game over

        const interval = setInterval(() => {
            setFrameIndex((prev) => (prev + 1) % frames.length);
            setHeartFrameIndex((prev) => (prev + 1) % heartFrames.length);
        }, 100);
        return () => clearInterval(interval);
    }, [isGameOver]);

    // 점프 이벤트 (Space)
    useEffect(() => {
        if (isGameOver) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                if (!isJumping) {
                    // First jump
                    setIsJumping(true);
                    velRef.current = JUMP_POWER;
                    jumpCountRef.current = 1;
                } else if (jumpCountRef.current < 2) {
                    // Double jump
                    velRef.current = JUMP_POWER * 0.9; // Slightly weaker second jump
                    jumpCountRef.current += 1;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isJumping, isGameOver]);

    // Game Loop for Jump Physics
    useEffect(() => {
        // Always report position for collision detection
        onPositionUpdate(y);

        if (isGameOver) return;
        if (!isJumping) return;

        const animate = () => {
            // Update physics
            posRef.current += velRef.current;
            velRef.current -= GRAVITY;

            // Check landing
            if (posRef.current <= 0) {
                posRef.current = 0;
                velRef.current = 0;
                setIsJumping(false);
                setY(0);
                jumpCountRef.current = 0; // Reset jump count
                onPositionUpdate(0); // Report landing
                return; // Stop loop
            }

            setY(posRef.current);
            onPositionUpdate(posRef.current); // Report current height
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [isJumping, isGameOver, y]); // Added y to dependency to report updates, but careful with loop

    const currentFrames = isHoldingEnter ? heartFrames : frames;
    const currentIndex = isHoldingEnter ? heartFrameIndex : frameIndex;

    return (
        <img
            src={currentFrames[currentIndex]}
            alt="runner"
            style={{
                position: "absolute",
                left: `${BASE_LEFT}px`,
                bottom: `${BASE_BOTTOM + y}px`,
                width: `${WIDTH}px`,
                height: "auto",
                userSelect: "none",
                pointerEvents: "none",
            }}
        />
    );
};

export default RunnerCharacter;
