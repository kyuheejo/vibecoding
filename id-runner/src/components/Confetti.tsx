import React, { useEffect, useState } from "react";

interface ConfettiPiece {
    id: number;
    left: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
}

const COLORS = ["#ff69b4", "#ff1493", "#ff6b6b", "#ffd700", "#ff8c00", "#00ff7f", "#87ceeb", "#dda0dd"];

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 8 + Math.random() * 8,
        }));
        setPieces(newPieces);
    }, []);

    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998, overflow: "hidden" }}>
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        position: "absolute",
                        left: `${piece.left}%`,
                        top: "-20px",
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        backgroundColor: piece.color,
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
