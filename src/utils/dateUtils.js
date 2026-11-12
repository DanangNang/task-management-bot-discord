const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';

function getCurrentDate() {
    return dayjs().tz(TIMEZONE);
}

function parseDate(dateInput) {
    return dayjs(dateInput).tz(TIMEZONE);
}

function formatDateIndo(dateInput, formatStr = 'D MMM YYYY HH:mm') {
    return dayjs(dateInput).tz(TIMEZONE).format(formatStr);
}

function getDaysRemaining(deadlineDate) {
    const now = getCurrentDate().startOf('day');
    const target = parseDate(deadlineDate).startOf('day');

    return target.diff(now, 'day');
}

module.exports = {
    getCurrentDate,
    parseDate,
    formatDateIndo,
    getDaysRemaining,
    TIMEZONE,
};