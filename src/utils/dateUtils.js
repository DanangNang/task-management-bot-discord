const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';

function getCurrentDate() {
    return dayjs().tz(TIMEZONE);
}

function parseDate(dateInput) {
    return dayjs(dateInput).tz(TIMEZONE);
}

function parseInputDate(dateStr) {
    const parsed = dayjs.tz(dateStr, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD'], TIMEZONE);
    return parsed.isValid() ? parsed : null;
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
    parseInputDate, 
    formatDateIndo,
    getDaysRemaining,
    TIMEZONE,
};