import React, { useEffect, useState, useRef } from "react";
import { useMobile } from "../hooks/useMobile";
import RunnerCharacter from "./RunnerCharacter";
import BackgroundInfinite from "./BackgroundInfinite";
import Villain from "./Villain";
import GoodGuy from "./GoodGuy";
import Confetti from "./Confetti";
import bgm1 from "../assets/music/Tulip.mp3";
import bgm2 from "../assets/music/summer end.mp3";
import gameOverImg from "../assets/game_over/game_over.gif";
import gameOverSound from "../assets/game_over/game_over_sound.mp3";
import gameOverMusic from "../assets/game_over/game_over_music.mp3";
import winImg from "../assets/win/win.jpg";
import winMusic from "../assets/win/win.mp3";

import ending1 from "../ending/1.txt?raw";
import ending2 from "../ending/2.txt?raw";
import ending3 from "../ending/3.txt?raw";
import ending4 from '../ending/4.txt?raw';
import ending5 from "../ending/5.txt?raw";
import ending6 from "../ending/6.txt?raw";
import ending7 from "../ending/7.txt?raw";

const GameScene: React.FC = () => {
    const { scale, baseBottom } = useMobile();
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [isGoodGuyVisible, setIsGoodGuyVisible] = useState(false);
    const [enterHoldProgress, setEnterHoldProgress] = useState(0);
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
    const goodGuyX = useRef(window.innerWidth);
    const enterHoldStartTime = useRef<number | null>(null);
    const enterHoldIntervalRef = useRef<number | null>(null);
    const isGoodGuyVisibleRef = useRef(false);
    const enterHoldProgressRef = useRef(0); // Track progress for collision check
    const goodGuyCollisionProcessed = useRef(false); // Track if we already checked collision

    // Touch handling refs
    const touchStartTime = useRef<number | null>(null);
    const touchHoldTimeout = useRef<number | null>(null);
    const triggerJumpRef = useRef<() => void>(() => { });

    // Prevent Space key from scrolling at all times
    useEffect(() => {
        const preventScroll = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
            }
        };
        window.addEventListener("keydown", preventScroll);
        return () => window.removeEventListener("keydown", preventScroll);
    }, []);

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

    // Win Music
    useEffect(() => {
        if (isWin) {
            const music = new Audio(winMusic);
            music.volume = 0.6;
            music.loop = true;
            music.play().catch(e => console.log("Win music blocked", e));

            return () => {
                music.pause();
                music.currentTime = 0;
            };
        }
    }, [isWin]);

    // Background Music Control
    useEffect(() => {
        if (isGameOver || isWin) return;

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
    }, [currentTrackIndex, isGameOver, isWin]);

    // Restart Listener (with delay to prevent accidental restart from held Enter/touch)
    useEffect(() => {
        if (!isGameOver && !isWin) return;

        let canRestart = false;

        // Wait 1 second before allowing restart (prevents held Enter/touch from triggering)
        const delayTimer = setTimeout(() => {
            canRestart = true;
        }, 1000);

        const doRestart = () => {
            setIsGameOver(false);
            setIsWin(false);
            setIsGoodGuyVisible(false);
            setEnterHoldProgress(0);
            setResetKey(prev => prev + 1); // Force re-mount
            setVillainIndex(0); // Reset villain

            // Reset refs
            runnerY.current = 0;
            villainX.current = window.innerWidth;
            goodGuyX.current = window.innerWidth;
            enterHoldStartTime.current = null;
            if (enterHoldIntervalRef.current) {
                clearInterval(enterHoldIntervalRef.current);
                enterHoldIntervalRef.current = null;
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && canRestart) {
                doRestart();
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (canRestart) {
                e.preventDefault();
                doRestart();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("touchstart", handleTouchStart, { passive: false });
        return () => {
            clearTimeout(delayTimer);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("touchstart", handleTouchStart);
        };
    }, [isGameOver, isWin]);

    // Collision Detection Loop
    useEffect(() => {
        if (isGameOver || isWin) return;

        let animationFrameId: number;

        const checkCollision = () => {
            // Hitbox definitions (scaled for mobile)
            const runnerLeft = (50 + 80) * scale;
            const runnerRight = (50 + 300 - 80) * scale;
            const runnerBottom = baseBottom + runnerY.current * scale;

            if (isGoodGuyVisible) {
                // Check good guy collision
                const goodGuyLeft = goodGuyX.current + 80 * scale;
                const goodGuyRight = goodGuyX.current + (300 - 80) * scale;
                const goodGuyTop = baseBottom - 30 * scale + 200 * scale;

                // Check overlap with good guy
                if (
                    !goodGuyCollisionProcessed.current &&
                    runnerRight > goodGuyLeft &&
                    runnerLeft < goodGuyRight &&
                    runnerBottom < goodGuyTop
                ) {
                    // Collision happened - check progress
                    goodGuyCollisionProcessed.current = true;
                    if (enterHoldProgressRef.current >= 100) {
                        triggerWin();
                    }
                    // If progress < 100, do nothing - game continues
                }
            } else {
                // Check villain collision
                const villainLeft = villainX.current + 80 * scale;
                const villainRight = villainX.current + (300 - 80) * scale;
                const villainTop = baseBottom - 30 * scale + 200 * scale;

                // Check overlap
                if (
                    runnerRight > villainLeft &&
                    runnerLeft < villainRight &&
                    runnerBottom < villainTop
                ) {
                    setIsGameOver(true);
                }
            }

            animationFrameId = requestAnimationFrame(checkCollision);
        };

        checkCollision();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isGameOver, isWin, isGoodGuyVisible]);

    // Keep ref in sync with state for use in interval callback
    useEffect(() => {
        isGoodGuyVisibleRef.current = isGoodGuyVisible;
        // Reset collision flag when good guy spawns
        if (isGoodGuyVisible) {
            goodGuyCollisionProcessed.current = false;
        }
    }, [isGoodGuyVisible]);

    // Trigger win function
    const triggerWin = () => {
        setIsWin(true);
        // Clear the enter hold interval
        if (enterHoldIntervalRef.current) {
            clearInterval(enterHoldIntervalRef.current);
            enterHoldIntervalRef.current = null;
        }
        enterHoldStartTime.current = null;
    };

    // Enter hold detection for both good guy and villain
    useEffect(() => {
        if (isGameOver || isWin) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !enterHoldStartTime.current) {
                enterHoldStartTime.current = Date.now();

                // Update progress every 50ms
                enterHoldIntervalRef.current = window.setInterval(() => {
                    const elapsed = Date.now() - (enterHoldStartTime.current || 0);
                    const progress = Math.min((elapsed / 3000) * 100, 100);
                    setEnterHoldProgress(progress);
                    enterHoldProgressRef.current = progress; // Sync ref for collision detection

                    if (progress >= 100) {
                        // Clear interval first
                        enterHoldStartTime.current = null;
                        setEnterHoldProgress(0);
                        enterHoldProgressRef.current = 0;
                        if (enterHoldIntervalRef.current) {
                            clearInterval(enterHoldIntervalRef.current);
                            enterHoldIntervalRef.current = null;
                        }

                        if (isGoodGuyVisibleRef.current) {
                            // Win if progress completes before collision
                            if (!goodGuyCollisionProcessed.current) {
                                triggerWin();
                            }
                        } else {
                            // Game over if villain is visible
                            setIsGameOver(true);
                        }
                    }
                }, 50);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                enterHoldStartTime.current = null;
                setEnterHoldProgress(0);
                enterHoldProgressRef.current = 0;
                if (enterHoldIntervalRef.current) {
                    clearInterval(enterHoldIntervalRef.current);
                    enterHoldIntervalRef.current = null;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (enterHoldIntervalRef.current) {
                clearInterval(enterHoldIntervalRef.current);
            }
        };
    }, [isGameOver, isWin, isGoodGuyVisible]);

    // Reset progress when good guy leaves (missed opportunity - game continues)
    useEffect(() => {
        if (!isGoodGuyVisible) {
            enterHoldStartTime.current = null;
            setEnterHoldProgress(0);
            enterHoldProgressRef.current = 0;
            if (enterHoldIntervalRef.current) {
                clearInterval(enterHoldIntervalRef.current);
                enterHoldIntervalRef.current = null;
            }
        }
    }, [isGoodGuyVisible]);

    // Touch controls: tap to jump, hold to send heart
    useEffect(() => {
        if (isGameOver || isWin) return;

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            touchStartTime.current = Date.now();

            // After 250ms, start the heart hold progress (like holding Enter)
            touchHoldTimeout.current = window.setTimeout(() => {
                enterHoldStartTime.current = Date.now();
                enterHoldIntervalRef.current = window.setInterval(() => {
                    const elapsed = Date.now() - (enterHoldStartTime.current || 0);
                    const progress = Math.min((elapsed / 3000) * 100, 100);
                    setEnterHoldProgress(progress);
                    enterHoldProgressRef.current = progress;

                    if (progress >= 100) {
                        enterHoldStartTime.current = null;
                        setEnterHoldProgress(0);
                        enterHoldProgressRef.current = 0;
                        if (enterHoldIntervalRef.current) {
                            clearInterval(enterHoldIntervalRef.current);
                            enterHoldIntervalRef.current = null;
                        }

                        if (isGoodGuyVisibleRef.current) {
                            if (!goodGuyCollisionProcessed.current) {
                                triggerWin();
                            }
                        } else {
                            setIsGameOver(true);
                        }
                    }
                }, 50);
            }, 250);
        };

        const handleTouchEnd = () => {
            const touchDuration = Date.now() - (touchStartTime.current || 0);

            // Clear hold timeout
            if (touchHoldTimeout.current) {
                clearTimeout(touchHoldTimeout.current);
                touchHoldTimeout.current = null;
            }

            // Quick tap = jump
            if (touchDuration < 250) {
                triggerJumpRef.current();
            }

            // Reset hold progress
            enterHoldStartTime.current = null;
            setEnterHoldProgress(0);
            enterHoldProgressRef.current = 0;
            if (enterHoldIntervalRef.current) {
                clearInterval(enterHoldIntervalRef.current);
                enterHoldIntervalRef.current = null;
            }
            touchStartTime.current = null;
        };

        window.addEventListener("touchstart", handleTouchStart, { passive: false });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
            if (touchHoldTimeout.current) {
                clearTimeout(touchHoldTimeout.current);
            }
        };
    }, [isGameOver, isWin]);

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
            <BackgroundInfinite key={`bg-${resetKey}`} isGameOver={isGameOver || isWin} />
            <RunnerCharacter
                key={`runner-${resetKey}`}
                isGameOver={isGameOver || isWin}
                isHoldingEnter={enterHoldProgress > 0}
                onPositionUpdate={(y) => runnerY.current = y}
                onRegisterJump={(fn) => triggerJumpRef.current = fn}
            />
            {!isGoodGuyVisible && (
                <Villain
                    key={`villain-${resetKey}`}
                    isGameOver={isGameOver || isWin}
                    villainIndex={villainIndex}
                    onPositionUpdate={(x) => villainX.current = x}
                    onVillainCycle={() => {
                        setVillainIndex((prev) => (prev + 1) % 7);
                        // 40% chance to spawn good guy
                        if (Math.random() < 0.4) {
                            setIsGoodGuyVisible(true);
                        }
                    }}
                />
            )}

            <GoodGuy
                key={`goodguy-${resetKey}`}
                isGameOver={isGameOver}
                isWin={isWin}
                isVisible={isGoodGuyVisible}
                onPositionUpdate={(x) => goodGuyX.current = x}
                onGoodGuyCycle={() => setIsGoodGuyVisible(false)}
            />

            {/* Enter Hold Progress Bar */}
            {enterHoldProgress > 0 && !isWin && !isGameOver && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '40px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    border: '3px solid white'
                }}>
                    <div style={{
                        width: `${enterHoldProgress}%`,
                        height: '100%',
                        backgroundColor: '#ff69b4',
                        transition: 'width 0.05s linear'
                    }} />
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '24px',
                        lineHeight: '40px'
                    }}>
                        Enter 를 눌러 너나자를 쏘세요! ❤️
                    </span>
                </div>
            )}

            {/* Win Overlay */}
            {isWin && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 192, 203, 0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                >
                    <Confetti />
                    <img
                        src={winImg}
                        alt="You Win!"
                        className="w-1/3 h-auto drop-shadow-2xl animate-float rounded-lg"
                    />
                    <p
                        className="text-white text-3xl mt-8 font-bold"
                        style={{
                            color: '#ff1493',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        김이드는 좋남과 결혼하여 평생 부양 받으며 살았답니다..❤️
                    </p>
                    <p
                        className="text-white text-2xl mt-4 font-bold animate-pulse"
                        style={{ color: 'white' }}
                    >
                        Press Enter to Play Again
                    </p>
                </div>
            )}

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

            {/* Rotate phone overlay for portrait mode */}
            <div className="rotate-phone-overlay">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📱</div>
                <div>화면을 가로로 돌려주세요!</div>
                <div style={{ fontSize: '16px', marginTop: '10px', opacity: 0.7 }}>
                    Please rotate your phone to landscape
                </div>
            </div>
        </div>
    );
};

export default GameScene;
