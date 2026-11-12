const { getDaysRemaining } = require('./dateUtils');

const TASK_STATUS_EMOJI = {
    AMAN: '🟢',
    WASPADAI: '🟡',
    BERAKHIR: '🔴',
    SELESAI: '✅',
};

/**
 * @param {Date|String} deadline 
 * @returns {Object} { statusLabel, emoji, daysLeft }
 */
function calculateTaskStatus(deadline) {
    const daysLeft = getDaysRemaining(deadline);

    if (daysLeft >= 4) {
        return {
            code: 'AMAN',
            label: 'Aman',
            emoji: TASK_STATUS_EMOJI.AMAN,
            daysLeft,
        };
    } else if (daysLeft >= 1 && daysLeft <= 3) {
        return {
            code: 'WASPADAI',
            label: 'Waspada',
            emoji: TASK_STATUS_EMOJI.WASPADAI,
            daysLeft,
        };
    } else {
        return {
            code: 'BERAKHIR',
            label: 'Berakhir',
            emoji: TASK_STATUS_EMOJI.BERAKHIR,
            daysLeft,
        };
    }
}

module.exports = {
    TASK_STATUS_EMOJI,
    calculateTaskStatus,
};