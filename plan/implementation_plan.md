# Implementation Plan - Role 2: "The Brain" (Screening & Speech)

Role 2 is responsible for the "RAN" (Rapid Automatized Naming) Screening Game. This involves using the Web Speech API to listen for specific words while a user interacts with a visual grid, timing the interaction to assess risk, and monitoring for distress keywords.

## User Review Required
> [!NOTE]
> I will be using **Vite + React** to build this application to ensure a modern, responsive, and state-manageable foundation.

## Proposed Changes

### Project Structure
I will initialize a new Vite + React project in the current directory.

### Core Components

#### [NEW] `src/hooks/useSpeechRecognition.js`
- Custom hook to manage the `window.SpeechRecognition` (or `webkitSpeechRecognition`) instance.
- Handles starting/stopping, listening for results, and error handling.
- **Key Features**:
    - Continuous listening (or auto-restart).
    - Callback for detected words.

#### [NEW] `src/components/BalloonGame.jsx`
- The main game screen.
- **UI**:
    - A 2x2 grid displaying images/text for "Red", "Blue", "Chair", "Dog".
    - Visual feedback when an item is "recognized" (e.g., pops, changes color).
- **Logic**:
    - Starts a timer (`Date.now()`) on mount.
    - Uses `useSpeechRecognition` to listen for the target words.
    - Tracks which words have been found.
    - Once all 4 are found:
        - Stops timer.
        - Calculates Duration.
        - Calls `calculateRisk(duration)`.

#### [NEW] `src/utils/riskLogic.js`
- Contains the purely functional logic:
    ```javascript
    export const calculateRisk = (timeInSeconds) => {
      return timeInSeconds > 20 ? "High Risk" : "Low Risk";
    };
    ```
- Saves result to `localStorage.setItem('screeningResult', risk)`.

#### [NEW] `src/utils/emotionLite.js`
- A secondary listener or logic branch within the speech handler.
- Checks for "Hard", "Stop", "Stuck".
- Triggers `triggerEmpathyMode()` (placeholder or UI event).

### Styling
- `src/index.css`: Global styles using modern CSS variables, gradients, and a "Premium" aesthetic (glassmorphism, soft shadows).

## Verification Plan

### Manual Verification
1.  **Browser Capability**: Verify `window.SpeechRecognition` works in the testing browser (Chrome/Edge usually required).
2.  **Game Flow**:
    - Load page -> Timer starts.
    - Speak "Red" -> Red item highlights/checks off.
    - Speak all 4 -> Game ends -> Risk calculated.
    - Check `localStorage` for `screeningResult`.
3.  **Risk Logic**:
    - Wait > 20s before finishing -> Verify "High Risk".
    - Finish < 20s -> Verify "Low Risk".
4.  **Distress**:
    - Say "Stuck" -> Verify Empathy Mode trigger (console/visual).
