import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = (language = 'en-US') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastWord, setLastWord] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const [retryCount, setRetryCount] = useState(0); // Used to force re-instantiation

    const shouldListenRef = useRef(false);

    // Watchdog: If we should be listening but aren't, force a hard reset after a grace period
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (shouldListenRef.current && !isListening) {
                console.log("Watchdog: Recognition stopped unexpectedly. Forcing hard reset...");
                setRetryCount(prev => prev + 1); // This triggers the main effect to re-run
            }
        }, 2500); // Check every 2.5s

        return () => clearInterval(intervalId);
    }, [isListening]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("Browser does not support Speech Recognition.");
            return;
        }

        console.log("Initializing SpeechRecognition instance...");
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
            console.log("SpeechRecognition started");
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            console.log("SpeechRecognition ended");
            setIsListening(false);

            // Soft restart attempt
            if (shouldListenRef.current) {
                setTimeout(() => {
                    // Check if we are still active and haven't already been replaced
                    if (shouldListenRef.current && recognitionRef.current === recognition) {
                        try {
                            recognition.start();
                        } catch (e) {
                            // Ignore, let watchdog handle hard reset
                        }
                    }
                }, 100);
            }
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                setLastWord(finalTranscript.trim().toLowerCase());
            }

            if (interimTranscript) {
                setLastWord(interimTranscript.trim().toLowerCase());
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error", event.error);
            setError(event.error);
            if (event.error === 'not-allowed') {
                shouldListenRef.current = false;
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        // Start immediately if we are supposed to be listening
        if (shouldListenRef.current) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Error starting new instance:", e);
            }
        }

        return () => {
            shouldListenRef.current = false; // Stop the restart loop
            if (recognition) {
                recognition.stop();
            }
        };
    }, [language, retryCount]);

    const startListening = () => {
        shouldListenRef.current = true;
        setError(null);
        if (!isListening) {
            // Try to start existing one first before forcing reset
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    return;
                } catch (e) {
                    // failed, force reset
                }
            }
            setRetryCount(c => c + 1); // Force new instance
        }
    };

    const stopListening = () => {
        shouldListenRef.current = false;
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const resetTranscript = () => {
        setTranscript('');
        setLastWord('');
    }

    return {
        isListening,
        transcript,
        lastWord,
        error,
        startListening,
        stopListening,
        resetTranscript,
        hasBrowserSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};

export default useSpeechRecognition;
