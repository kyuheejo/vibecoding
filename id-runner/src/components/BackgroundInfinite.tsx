import React from "react";
import bg from "../assets/background/background.png";

interface BackgroundProps {
    isGameOver: boolean;
}

const BackgroundInfinite: React.FC<BackgroundProps> = ({ isGameOver }) => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            {/* Container for the sliding images */}
            <div
                className={`flex w-[200%] h-full ${isGameOver ? '' : 'animate-scroll-bg'}`}
                style={{ animationPlayState: isGameOver ? 'paused' : 'running' }}
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