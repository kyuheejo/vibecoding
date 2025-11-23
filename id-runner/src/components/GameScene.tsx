import React, { useEffect, useState, useRef } from "react";
import RunnerCharacter from "./RunnerCharacter";
import BackgroundInfinite from "./BackgroundInfinite";
import Villain from "./Villain";
import bgm1 from "../assets/music/Tulip.mp3";
import bgm2 from "../assets/music/summer end.mp3";
import gameOverImg from "../assets/game_over/game_over.gif";
import gameOverSound from "../assets/game_over/game_over_sound.mp3";
import gameOverMusic from "../assets/game_over/game_over_music.mp3";

import ending1 from "../ending/1.txt?raw";
import ending2 from "../ending/2.txt?raw";
import ending3 from "../ending/3.txt?raw";
import ending4 from '../ending/4.txt?raw';
import ending5 from "../ending/5.txt?raw";
import ending6 from "../ending/6.txt?raw";
import ending7 from "../ending/7.txt?raw";

const GameScene: React.FC = () => {
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [resetKey, setResetKey] = useState(0); // Key to force re-mount on restart
    const [villainIndex, setVillainIndex] = useState(0); // Track current villain
    const playlist = [bgm1, bgm2];

    // Map villain index to ending text
    // Assuming 7 villains, we can map them. Currently only 1 is provided.
    const endingTexts: { [key: number]: string } = {
        0: ending1,
        1: ending2,
        2: ending3,
        3: ending4,
        4: ending5,
        5: ending6,
        6: ending7,

        // Add more mappings as files are created: 1: ending2, etc.
    };

    // Refs to track positions for collision detection without re-renders
    const runnerY = useRef(0);
    const villainX = useRef(window.innerWidth);

    // Game Over Sound Effect & Music
    useEffect(() => {
        if (isGameOver) {
            // Play sound immediately
            const sound = new Audio(gameOverSound);
            sound.volume = 0.8;
            sound.play().catch(e => console.log("Game over sound blocked", e));

            // Play music after 3 seconds
            const timer = setTimeout(() => {
                const music = new Audio(gameOverMusic);
                music.volume = 0.6;
                music.loop = false; // Play only once
                music.play().catch(e => console.log("Game over music blocked", e));
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isGameOver]);

    // Background Music Control
    useEffect(() => {
        if (isGameOver) return;

        const audio = new Audio(playlist[currentTrackIndex]);
        audio.volume = 0.5;

        const playAudio = () => {
            audio.play().catch((err) => {
                console.log("Audio autoplay blocked, waiting for interaction", err);
            });
        };

        playAudio();

        // Play next track when ended
        const handleEnded = () => {
            setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
        };
        audio.addEventListener('ended', handleEnded);

        // Add interaction listener just in case autoplay is blocked
        const handleInteraction = () => {
            playAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            audio.pause();
            audio.currentTime = 0;
            audio.removeEventListener('ended', handleEnded);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [currentTrackIndex, isGameOver]);

    // Restart Listener
    useEffect(() => {
        if (!isGameOver) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                setIsGameOver(false);
                setResetKey(prev => prev + 1); // Force re-mount
                setVillainIndex(0); // Reset villain

                // Reset refs
                runnerY.current = 0;
                villainX.current = window.innerWidth;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isGameOver]);

    // Collision Detection Loop
    useEffect(() => {
        if (isGameOver) return;

        let animationFrameId: number;

        const checkCollision = () => {
            // Hitbox definitions (tuned for gameplay feel)
            const runnerLeft = 50 + 80; // Offset to center
            const runnerRight = 50 + 300 - 80;
            const runnerBottom = 200 + runnerY.current;

            const villainLeft = villainX.current + 80;
            const villainRight = villainX.current + 300 - 80;
            const villainTop = 170 + 200; // Approx height

            // Check overlap
            if (
                runnerRight > villainLeft &&
                runnerLeft < villainRight &&
                runnerBottom < villainTop
            ) {
                setIsGameOver(true);
            }

            animationFrameId = requestAnimationFrame(checkCollision);
        };

        checkCollision();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isGameOver]);

    const [paragraphIndex, setParagraphIndex] = useState(0);

    // Reset paragraph index when game over starts
    useEffect(() => {
        if (isGameOver) {
            setParagraphIndex(0);
        }
    }, [isGameOver, villainIndex]);

    // Auto-advance paragraphs
    useEffect(() => {
        if (!isGameOver) return;

        const fullText = endingTexts[villainIndex] || "Game Over";
        const paragraphs = fullText.split(/\n\s*\n/); // Split by empty lines

        if (paragraphIndex < paragraphs.length - 1) {
            const timer = setTimeout(() => {
                setParagraphIndex((prev) => prev + 1);
            }, 6000); // 6 seconds per paragraph

            return () => clearTimeout(timer);
        }
    }, [isGameOver, paragraphIndex, villainIndex]);

    // Helper to get current paragraph lines
    const getCurrentParagraphLines = () => {
        const fullText = endingTexts[villainIndex] || "Game Over";
        const paragraphs = fullText.split(/\n\s*\n/);
        const currentParagraph = paragraphs[paragraphIndex] || "";
        return currentParagraph.split('\n');
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
            <BackgroundInfinite key={`bg-${resetKey}`} isGameOver={isGameOver} />
            <RunnerCharacter
                key={`runner-${resetKey}`}
                isGameOver={isGameOver}
                onPositionUpdate={(y) => runnerY.current = y}
            />
            <Villain
                key={`villain-${resetKey}`}
                isGameOver={isGameOver}
                villainIndex={villainIndex}
                onPositionUpdate={(x) => villainX.current = x}
                onVillainCycle={() => setVillainIndex((prev) => (prev + 1) % 9)} // Assuming 7 villains
            />

            {/* Game Over Overlay */}
            {isGameOver && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.76)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                >
                    <img
                        src={gameOverImg}
                        alt="Game Over"
                        className="w-1/5 h-auto drop-shadow-2xl animate-float"
                    />
                    <p
                        className="text-white text-2xl mt-8 font-bold animate-pulse"
                        style={{ color: 'white' }}
                    >
                        Press Enter to Restart
                    </p>
                    {/* Ending Credit Text */}
                    <div
                        className="mt-8 text-center"
                        style={{ width: '60%', minHeight: '200px' }} // Added minHeight to prevent jumping
                    >
                        {getCurrentParagraphLines().map((line, index) => (
                            line.trim() && (
                                <p
                                    key={`${paragraphIndex}-${index}`} // Unique key to trigger animation on change
                                    className="text-white font-medium whitespace-pre-wrap leading-relaxed animate-fade-up"
                                    style={{
                                        fontSize: '1.5rem',
                                        lineHeight: '0.8',
                                        color: 'white',
                                        marginBottom: '0.5rem',
                                        animationDelay: `${index * 0.5}s` // Faster delay for lines
                                    }}
                                >
                                    {line}
                                </p>
                            )
                        ))}
                    </div>


                </div>
            )}
        </div>
    );
};

export default GameScene;
