import { useState, useEffect, useRef } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { calculateRisk } from '../utils/riskLogic';

const ITEMS = [
    { id: 'red', label: 'Red', color: '#ef4444', type: 'color' },  // Red-500
    { id: 'blue', label: 'Blue', color: '#3b82f6', type: 'color' }, // Blue-500
    { id: 'chair', label: 'Chair', emoji: '🪑', type: 'object' },
    { id: 'dog', label: 'Dog', emoji: '🐶', type: 'object' }
];

const BalloonGame = () => {
    const { startListening, stopListening, lastWord, isListening, hasBrowserSupport } = useSpeechRecognition();

    // Game State
    const [foundItems, setFoundItems] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, completed
    const [riskResult, setRiskResult] = useState(null);
    const [empathyTriggered, setEmpathyTriggered] = useState(false);

    // Effect: Start Game on Mount
    useEffect(() => {
        if (hasBrowserSupport) {
            startGame();
        }
    }, [hasBrowserSupport]);

    // Effect: Listen for Matches
    useEffect(() => {
        if (gameStatus !== 'playing' || !lastWord) return;

        console.log("Detected:", lastWord);

        // check distress keywords
        if (['hard', 'stop', 'stuck'].includes(lastWord)) {
            triggerEmpathyMode();
            return;
        }

        // Check for game matches
        const match = ITEMS.find(item => item.label.toLowerCase() === lastWord);
        if (match && !foundItems.includes(match.id)) {
            const newFound = [...foundItems, match.id];
            setFoundItems(newFound);

            // Check Win Condition
            if (newFound.length === ITEMS.length) {
                finishGame();
            }
        }

    }, [lastWord, gameStatus, foundItems]);

    const startGame = () => {
        setFoundItems([]);
        setRiskResult(null);
        setEmpathyTriggered(false);
        setGameStatus('playing');
        setStartTime(Date.now());
        startListening();
    };

    const finishGame = () => {
        stopListening();
        setGameStatus('completed');
        if (startTime) {
            const duration = Date.now() - startTime;
            const result = calculateRisk(duration);
            setRiskResult(result);
        }
    };

    const triggerEmpathyMode = () => {
        setEmpathyTriggered(true);
        // Optional: Pause logic or show modal
        console.log("Empathy Mode Triggered");
    };

    if (!hasBrowserSupport) {
        return <div className="card">Browser not supported. Please use Chrome.</div>;
    }

    return (
        <div className="game-container">
            {/* Status Bar */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="status-badge">
                    Status: <strong>{gameStatus === 'playing' ? 'Listening...' : gameStatus}</strong> {isListening && '🎙️'}
                </div>
                {empathyTriggered && <div className="status-badge" style={{ background: '#fef08a', color: '#854d0e' }}>Need Help? Take your time.</div>}
            </div>

            {/* Grid */}
            <div className="grid-2x2">
                {ITEMS.map(item => {
                    const isFound = foundItems.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            className={`card game-card ${isFound ? 'found' : ''}`}
                            style={{
                                background: isFound ? '#dcfce7' : 'var(--glass)',
                                borderColor: isFound ? '#22c55e' : 'transparent',
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
                                    borderRadius: '50%',
                                    background: item.color,
                                    boxShadow: 'var(--shadow-md)',
                                    marginBottom: '1rem',
                                    opacity: isFound ? 0.5 : 1
                                }}></div>
                            ) : (
                                <div style={{ fontSize: '4rem', marginBottom: '0.5rem', opacity: isFound ? 0.5 : 1 }}>
                                    {item.emoji}
                                </div>
                            )}
                            <h2 style={{
                                color: isFound ? '#15803d' : 'var(--text-primary)',
                                textDecoration: isFound ? 'line-through' : 'none'
                            }}>
                                {item.label}
                            </h2>
                        </div>
                    );
                })}
            </div>

            {/* Results Overlay */}
            {gameStatus === 'completed' && riskResult && (
                <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s' }}>
                    <h2>Great Job! 🎉</h2>
                    <p>Time: {riskResult.durationInSeconds.toFixed(1)}s</p>
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        background: riskResult.risk === 'High Risk' ? '#fee2e2' : '#d1fae5',
                        color: riskResult.risk === 'High Risk' ? '#991b1b' : '#065f46',
                        fontWeight: 'bold'
                    }}>
                        Calculation: {riskResult.risk}
                    </div>
                    <button className="btn" onClick={startGame} style={{ marginTop: '1.5rem' }}>
                        Play Again
                    </button>
                </div>
            )}

            {/* Debug / Instructions */}
            <div style={{ marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <p>Say: "Red", "Blue", "Chair", "Dog"</p>
                <p>Keywords: "Hard", "Stop" (Triggers Empathy)</p>
                <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    background: '#e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                }}>
                    DEBUG: Last heard: "{lastWord}"
                </div>
            </div>
        </div>
    );
};

export default BalloonGame;
