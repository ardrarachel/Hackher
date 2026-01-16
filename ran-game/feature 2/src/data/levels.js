export const LEVELS = [
    {
        id: 1,
        name: 'Level 1: Basic',
        items: [
            { id: 'red', label: 'Red', color: '#ef4444', type: 'color' },
            { id: 'blue', label: 'Blue', color: '#3b82f6', type: 'color' },
            { id: 'chair', label: 'Chair', emoji: '🪑', type: 'object' },
            { id: 'dog', label: 'Dog', emoji: '🐶', type: 'object' }
        ]
    },
    {
        id: 2,
        name: 'Level 2: Intermediate',
        items: [
            { id: 'cat', label: 'Cat', emoji: '🐱', type: 'object' },
            { id: 'bird', label: 'Bird', emoji: '🐦', type: 'object' },
            { id: 'square', label: 'Square', color: '#10b981', type: 'shape', shape: 'square' }, // Green square
            { id: 'rectangle', label: 'Rectangle', color: '#f59e0b', type: 'shape', shape: 'rectangle' }  // Amber rectangle
        ]
    },
    {
        id: 3,
        name: 'Level 3: Advanced',
        items: [
            { id: 'elephant', label: 'Elephant', emoji: '🐘', type: 'object' },
            { id: 'umbrella', label: 'Umbrella', emoji: '☂️', type: 'object' },
            { id: 'bicycle', label: 'Bicycle', emoji: '🚲', type: 'object' },
            { id: 'purple', label: 'Purple', color: '#a855f7', type: 'color' }
        ]
    }
];

export const shuffleItems = (items) => {
    return [...items].sort(() => Math.random() - 0.5);
};
