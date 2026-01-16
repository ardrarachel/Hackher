import { useState, useEffect, useRef } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { calculateLevelRisk, calculateRisk } from '../utils/riskLogic';
import { LEVELS, shuffleItems } from '../data/levels';

const BalloonGame = () => {
    const { startListening, stopListening, lastWord, isListening, error, hasBrowserSupport, resetTranscript } = useSpeechRecognition();

    // Game State
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [currentLevelData, setCurrentLevelData] = useState(null);

    const [foundItems, setFoundItems] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, level_completed, game_completed
    const [riskResult, setRiskResult] = useState(null);
    const [levelResult, setLevelResult] = useState(null); // Result for just the current level
    const [empathyTriggered, setEmpathyTriggered] = useState(false);

    // Track total time across levels
    const totalDurationRef = useRef(0);

    // Initialize Level
    useEffect(() => {
        console.log("--- MOUNTING BALLOON GAME ---");
        if (hasBrowserSupport) {
            startLevel(0);
        }
        return () => console.log("--- UNMOUNTING BALLOON GAME ---");
    }, [hasBrowserSupport]);

    // Effect: Listen for Matches
    useEffect(() => {
        if (gameStatus !== 'playing' || !lastWord || !currentLevelData) return;

        console.log("Detected:", lastWord);

        const cleanInput = lastWord.toLowerCase();

        // If Empathy Mode (Pause) is active, only listen for 'start'
        if (empathyTriggered) {
            if (cleanInput.includes('start') || cleanInput.includes('resume') || cleanInput.includes('play') || cleanInput.includes('go')) {
                setEmpathyTriggered(false);
                console.log("Game Resumed");
                resetTranscript(); // Clear "start" so it doesn't trigger anything else
            }
            return;
        }

        // check distress keywords
        if (cleanInput.includes('hard') || cleanInput.includes('stop') || cleanInput.includes('stuck')) {
            triggerEmpathyMode();
            return;
        }

        // Check for game matches
        const foundInThisUtterance = [];

        currentLevelData.items.forEach(item => {
            if (cleanInput.includes(item.label.toLowerCase()) && !foundItems.includes(item.id)) {
                foundInThisUtterance.push(item.id);
            }
        });

        if (foundInThisUtterance.length > 0) {
            const newFound = [...foundItems, ...foundInThisUtterance];
            setFoundItems(newFound);

            // Check Win Condition for Level
            if (newFound.length === currentLevelData.items.length) {
                finishLevel();
            }
        }

    }, [lastWord, gameStatus, foundItems, currentLevelData, empathyTriggered]);

    const startLevel = (levelIndex) => {
        resetTranscript();

        // Load Level Data
        const levelRaw = LEVELS[levelIndex];
        const shuffledItems = shuffleItems(levelRaw.items);

        setCurrentLevelData({ ...levelRaw, items: shuffledItems });
        setCurrentLevelIndex(levelIndex);

        setFoundItems([]);
        setLevelResult(null);
        setEmpathyTriggered(false);
        setGameStatus('playing');
        setStartTime(Date.now());

        // Force a fresh start for the microphone
        stopListening();
        setTimeout(() => {
            startListening();
        }, 200);
    };

    const finishLevel = () => {
        stopListening(); // Explicitly stop to clean up session
        const duration = Date.now() - startTime;
        totalDurationRef.current += duration;

        // Calculate level-specific risk
        const result = calculateLevelRisk(duration);
        setLevelResult(result);

        if (currentLevelIndex < LEVELS.length - 1) {
            setGameStatus('level_completed');
        } else {
            finishGame();
        }
    };

    const nextLevel = () => {
        startLevel(currentLevelIndex + 1);
    }

    const finishGame = () => {
        stopListening(); // Only stop when the whole game is done
        setGameStatus('game_completed');
        const result = calculateRisk(totalDurationRef.current);
        setRiskResult(result);
    };

    const playAgain = () => {
        totalDurationRef.current = 0;
        setRiskResult(null);
        startLevel(0);
    }

    const triggerEmpathyMode = () => {
        setEmpathyTriggered(true);
        console.log("Empathy Mode Triggered");
        resetTranscript(); // Clear the "stop" word immediately
        startListening(); // Ensure we KEEP listening
    };

    if (!hasBrowserSupport) {
        return <div className="card">Browser not supported. Please use Chrome.</div>;
    }

    if (!currentLevelData) return <div>Loading...</div>;

    return (
        <div className="game-container">
            {/* Status Bar */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="status-badge" style={{ padding: '0.75rem 2rem', background: 'var(--glass)', border: '2px solid var(--primary)' }}>
                        <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{currentLevelData.name}</strong>
                    </div>
                    {/* Mic Status Indicator */}
                    <div title={isListening ? "Microphone Active" : "Microphone Off"} style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: isListening ? '#22c55e' : '#ef4444',
                        boxShadow: isListening ? '0 0 8px #22c55e' : 'none',
                        transition: 'all 0.3s'
                    }}></div>
                </div>

                {empathyTriggered && (
                    <button
                        className="status-badge"
                        onClick={() => {
                            setEmpathyTriggered(false);
                            resetTranscript();
                        }}
                        style={{
                            background: 'var(--error)',
                            color: '#9f1239',
                            cursor: 'pointer',
                            border: '2px solid #fecdd3',
                            marginLeft: 'auto'
                        }}
                    >
                        Paused. Click to Resume.
                    </button>
                )}
            </div>

            {/* Grid */}
            <div className="grid-2x2">
                {currentLevelData.items.map(item => {
                    const isFound = foundItems.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            className={`card game-card ${isFound ? 'found' : ''}`}
                            style={{
                                background: isFound ? 'var(--success)' : 'var(--glass)',
                                borderColor: isFound ? '#a7f3d0' : 'transparent', // Slightly darker green border
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '200px',
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {item.type === 'color' ? (
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: item.shape === 'square' ? '8px' : '50%',
                                    background: item.color,
                                    boxShadow: 'var(--shadow-md)',
                                    marginBottom: '1rem',
                                    opacity: isFound ? 0.6 : 1
                                }}></div>
                            ) : item.type === 'shape' ? (
                                <div style={{
                                    width: item.shape === 'rectangle' ? '120px' : '80px',
                                    height: '80px',
                                    borderRadius: item.shape === 'square' || item.shape === 'rectangle' ? '8px' : '50%',
                                    background: item.color,
                                    boxShadow: 'var(--shadow-md)',
                                    marginBottom: '1rem',
                                    opacity: isFound ? 0.6 : 1
                                }}></div>
                            ) : (
                                <div style={{ fontSize: '4rem', marginBottom: '0.5rem', opacity: isFound ? 0.6 : 1 }}>
                                    {item.emoji}
                                </div>
                            )}
                            <h2 style={{
                                color: isFound ? '#14532d' : 'var(--text-primary)',
                                textDecoration: isFound ? 'none' : 'none', // Removed line-through for cleaner look
                                opacity: isFound ? 0.7 : 1
                            }}>
                                {item.label}
                            </h2>
                        </div>
                    );
                })}
            </div>

            {/* Level Complete Overlay */}
            {gameStatus === 'level_completed' && levelResult && (
                <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary-text)' }}>Level Complete</h2>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Time: {levelResult.durationInSeconds.toFixed(1)}s</p>
                        <p style={{
                            fontWeight: 'bold',
                            color: levelResult.risk === 'High Risk' ? '#ef4444' : '#10b981',
                            fontSize: '1.1rem'
                        }}>
                            {levelResult.risk}
                        </p>
                    </div>
                    <button className="btn" onClick={nextLevel}>
                        Next Level
                    </button>
                </div>
            )}

            {/* Game Results Overlay */}
            {gameStatus === 'game_completed' && riskResult && (
                <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary-text)' }}>All Levels Complete</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Total Time: {riskResult.durationInSeconds.toFixed(1)}s</p>
                    <div style={{
                        marginTop: '1rem',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        background: riskResult.risk === 'High Risk' ? '#fee2e2' : '#d1fae5',
                        color: riskResult.risk === 'High Risk' ? '#991b1b' : '#065f46',
                        fontWeight: 'bold',
                        fontSize: '1.5rem'
                    }}>
                        Overall: {riskResult.risk}
                    </div>
                    <button className="btn" onClick={playAgain} style={{ marginTop: '2rem' }}>
                        Play Again
                    </button>
                </div>
            )}

            {/* Debug / Instructions */}
            <div style={{ marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <p>Current Level: {currentLevelIndex + 1}/{LEVELS.length}</p>
                <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    background: '#e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                }}>
                    DEBUG: Last heard: "{lastWord}" {error && <span style={{ color: 'red' }}>| ERROR: {error}</span>}
                </div>
            </div>
        </div>
    );
};

export default BalloonGame;
