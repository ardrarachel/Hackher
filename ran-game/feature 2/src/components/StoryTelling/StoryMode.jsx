import React, { useState, useEffect, useRef } from 'react';
import './StoryMode.css';

// Import local images
import img1 from './images/1.png';
import img2 from './images/2.png';
import img3 from './images/3.png';
import img4 from './images/4.png';
import img5 from './images/5.png';

const DEMO_SCRIPT = [
    {
        phase: 0,
        speaker: 'avatar',
        text: "Come, I want to hear a story! Can you help me build it?",
        image: null, // No image for intro conversation
        actionRequired: false
    },
    {
        phase: 1,
        speaker: 'avatar',
        text: "I saw a fluffy white cloud crying because it was hungry.",
        image: img1,
        actionRequired: false
    },
    {
        phase: 2,
        speaker: 'kid',
        text: "The cloud wanted to eat a giant pizza.",
        image: img2,
        actionRequired: true // User must click mic
    },
    {
        phase: 3,
        speaker: 'avatar',
        text: "Suddenly, a pizza plane flew by and... CHOMP! The cloud turned orange!",
        image: img3,
        actionRequired: false
    },
    {
        phase: 4,
        speaker: 'kid',
        text: "It rained cheese.",
        image: img4,
        actionRequired: true // User must click mic
    },
    {
        phase: 5,
        speaker: 'avatar',
        text: "Yum! It was the most delicious rainstorm ever. The End!",
        image: img5,
        actionRequired: false
    }
];

const StoryMode = () => {
    const [phase, setPhase] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [showNextBtn, setShowNextBtn] = useState(false);
    const [showImage, setShowImage] = useState(false);

    const currentStep = DEMO_SCRIPT[phase];

    // Effect to handle Avatar turns automatically or reset for Kid turns
    useEffect(() => {
        if (!currentStep) return;

        if (currentStep.speaker === 'avatar') {
            // Avatar speaks immediately
            setDisplayedText(currentStep.text);
            // Only show image if one exists
            if (currentStep.image) {
                setShowImage(true);
            } else {
                setShowImage(false);
            }
            setShowNextBtn(true);
        } else {
            // Kid's turn: Clear text and wait for input
            setDisplayedText('');
            setShowImage(false); // Hide image initially for kid
            setShowNextBtn(false);
        }
    }, [phase, currentStep]);

    const handleMicClick = () => {
        if (isListening) return; // Prevent double clicks

        setIsListening(true);

        // Simulate listening delay (Increased to 3s)
        setTimeout(() => {
            setIsListening(false);
            setDisplayedText(currentStep.text);

            // Reveal image 2 seconds AFTER text appears
            setTimeout(() => {
                setShowImage(true);
                setShowNextBtn(true);
            }, 2000);

        }, 3000);
    };

    const handleNextClick = () => {
        if (phase < DEMO_SCRIPT.length - 1) {
            setShowImage(false); // Hide immediately to prevent flash
            setPhase(p => p + 1);
        }
    };

    // No restart button needed in UI as requested

    if (!currentStep) return <div>End of Story</div>;

    return (
        <div className="story-container demo-mode">

            <h1>It's Story Timee 🪄</h1>

            {/* Image Area - Only render if image exists */}
            {currentStep.image && (
                <div className="illustration-frame">
                    <img
                        key={currentStep.image} // Force new element to prevent transition artifacts from previous image
                        src={currentStep.image}
                        alt={`Story Phase ${phase}`}
                        className="demo-image"
                        style={{ opacity: showImage ? 1 : 0, transition: 'opacity 1s ease' }}
                    />
                </div>
            )}

            {!currentStep.image && (
                <div className="intro-spacer" style={{ height: '50px' }}></div>
            )}

            {/* Text Bubble */}
            <div className={`story-bubble ${currentStep.speaker === 'avatar' ? 'avatar-bubble' : 'kid-bubble'}`}>
                {isListening ? (
                    <span className="listening-text">Listening... 🎤</span>
                ) : (
                    displayedText || <span className="placeholder-text">Tap the mic to say your line!</span>
                )}
            </div>

            {/* Controls */}
            <div className="controls">
                {currentStep.actionRequired && !displayedText && (
                    <button
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={handleMicClick}
                    >
                        🎤
                    </button>
                )}

                {showNextBtn && phase < DEMO_SCRIPT.length - 1 && (
                    <button className="btn next-btn" onClick={handleNextClick}>
                        Continue ➡️
                    </button>
                )}

                {phase === DEMO_SCRIPT.length - 1 && (
                    <div className="end-message">✨ The End! ✨</div>
                )}
            </div>
        </div>
    );
};

export default StoryMode;
