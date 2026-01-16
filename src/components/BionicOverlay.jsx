import React, { useState, useMemo, useCallback } from 'react';
import { toBionic } from '../utils/bionic';
import { getSynonym } from '../utils/synonyms';
import { Star } from 'lucide-react';

const BionicOverlay = ({ text }) => {
    const initialWords = useMemo(() => {
        return text ? toBionic(text) : [];
    }, [text]);

    const [words, setWords] = useState(initialWords);
    const [simplifiedCount, setSimplifiedCount] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [simplifiedIndices, setSimplifiedIndices] = useState(new Set());

    // Update words when text changes
    React.useEffect(() => {
        setWords(initialWords);
        setSimplifiedCount(0);
        setSimplifiedIndices(new Set());
    }, [initialWords]);

    const handleWordClick = useCallback((index, originalWord) => {
        const synonym = getSynonym(originalWord);
        if (synonym) {
            // Replace the word with the synonym
            const [processedSynonym] = toBionic(synonym);

            const newWords = [...words];
            newWords[index] = processedSynonym;
            setWords(newWords);
            setSimplifiedCount(prev => prev + 1);
            setSimplifiedIndices(prev => new Set([...prev, index]));
            
            // Visual feedback: briefly highlight the word
            setHoveredIndex(index);
            setTimeout(() => setHoveredIndex(null), 600);
        }
    }, [words]);

    return (
        <div className="w-full h-full">
            {/* Fun Stats Header */}
            {simplifiedCount > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#38A169] bg-[#F0FFF4] px-4 py-2 rounded-full shadow-md border-2 border-[#38A169]">
                    <Star size={16} className="text-[#38A169] fill-[#38A169]" />
                    <span>Awesome! You simplified {simplifiedCount} word{simplifiedCount !== 1 ? 's' : ''}! 🎉</span>
                </div>
            )}
            
            {/* Bionic Text with high contrast - Black OpenDyslexic font */}
            <div 
                className="text-left select-none text-black leading-relaxed"
                style={{ 
                    fontFamily: 'OpenDyslexic, system-ui, sans-serif',
                    fontSize: '1.2rem',
                    lineHeight: '1.8'
                }}
            >
                {words.map((wordObj, i) => {
                    const hasSynonym = getSynonym(wordObj.original);
                    const isHovered = hoveredIndex === i;
                    const isSimplified = simplifiedIndices.has(i);
                    const isSimplifiable = hasSynonym && !isSimplified && !isHovered;
                    
                    return (
                        <React.Fragment key={i}>
                            <span
                                onClick={() => handleWordClick(i, wordObj.original)}
                                onMouseEnter={() => hasSynonym && !isSimplified && setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`
                                    inline-block transition-all duration-200 ease-in-out
                                    ${hasSynonym && !isSimplified ? 'cursor-pointer' : 'cursor-default'}
                                    ${isSimplifiable ? 'border-b-2 border-dotted border-[#3182CE] hover:border-[#38A169]' : ''}
                                    ${isHovered ? 'bg-[#3182CE]/20 scale-105 rounded px-1 shadow-sm' : ''}
                                    ${isSimplified ? 'text-[#38A169] font-semibold' : ''}
                                    ${hasSynonym && !isSimplified && !isHovered ? 'hover:bg-[#3182CE]/10 rounded px-0.5' : ''}
                                `}
                                title={hasSynonym && !isSimplified ? `Tap to simplify: "${wordObj.original}" → "${getSynonym(wordObj.original)}"` : ""}
                            >
                                {/* First half of word in bold black */}
                                <b className="font-black text-black">{wordObj.bold}</b>
                                {/* Rest of word */}
                                <span className={isSimplified ? 'text-[#38A169]' : 'text-black'}>{wordObj.regular}</span>
                            </span>
                            {' '}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BionicOverlay;
