export const calculateRisk = (durationInMs) => {
    const durationInSeconds = durationInMs / 1000;
    // Threshold: 20 seconds
    const risk = durationInSeconds > 20 ? "High Risk" : "Low Risk";

    // Persist result
    localStorage.setItem('screeningResult', risk);
    localStorage.setItem('screeningDuration', durationInSeconds.toFixed(2));

    return { risk, durationInSeconds };
};
