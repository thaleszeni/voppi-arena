
/**
 * Voppi Arena - Missions and Streaks Logic
 */

export const DAILY_MISSIONS = [
    { id: '3-rounds', label: 'Completar 3 rodadas', goal: 3, reward: 50 },
    { id: 'score-80', label: 'Fazer 80+ pontos em 2 leads', goal: 2, reward: 100 },
    { id: 'perfect-opening', label: 'Conseguir 3 Aberturas Perfeitas', goal: 3, reward: 80 }
];

export const calculateStreak = (lastPlayDate, currentStreak = 0) => {
    if (!lastPlayDate) return 1;

    const last = new Date(lastPlayDate);
    const today = new Date();

    // Reset hours to compare only dates
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return currentStreak; // Already played today
    if (diffDays === 1) return currentStreak + 1; // Consecutive day

    return 1; // Streak broken
};

export const getStreakBonus = (streak) => {
    // 5% bonus per day, max 35% (7 days)
    return Math.min(streak * 0.05, 0.35);
};

export const updateMissionsProgress = (currentMissions = [], action) => {
    // Placeholder for mission progress logic
    // This would match actions like 'round_complete' or 'milestone_opening'
    return currentMissions;
};
