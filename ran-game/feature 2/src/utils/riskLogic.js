export const calculateRisk = (durationInMs) => {
    const durationInSeconds = durationInMs / 1000;

    // Adjusted thresholds for 3 levels
    // < 60s (avg 20s per level) -> Low Risk
    // 60s - 90s (avg 20-30s per level) -> Moderate Risk
    // > 90s -> High Risk

    let risk = 'Low Risk';
    if (durationInSeconds > 90) {
        risk = 'High Risk';
    } else if (durationInSeconds > 60) {
        risk = 'Moderate Risk';
    }

    // Persist result
    localStorage.setItem('screeningResult', risk);
    localStorage.setItem('screeningDuration', durationInSeconds.toFixed(2));

    return { risk, durationInSeconds };
};

export const calculateLevelRisk = (durationInMs) => {
    const durationInSeconds = durationInMs / 1000;

    // Per-level thresholds (approx 1/3 of total)
    // < 20s -> Low Risk
    // 20s - 35s -> Moderate Risk
    // > 35s -> High Risk

    let risk = 'Low Risk';
    if (durationInSeconds > 35) {
        risk = 'High Risk';
    } else if (durationInSeconds > 20) {
        risk = 'Moderate Risk';
    }

    return { risk, durationInSeconds };
};
