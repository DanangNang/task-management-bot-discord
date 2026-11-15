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

/**
 * Menggabungkan input Tanggal (YYYY-MM-DD) dan Jam (HH:mm) ke timezone Asia/Jakarta.
 * Jika jam kosong, otomatis memakai defaultTime (contoh: '08:00' atau '23:59').
 */
function combineDateAndTime(dateStr, timeStr, defaultTime = '00:00') {
    const cleanDate = dateStr.trim();
    const cleanTime = timeStr && timeStr.trim() !== '' ? timeStr.trim() : defaultTime;

    const isDateValid = dayjs(cleanDate, 'YYYY-MM-DD', true).isValid();
    const isTimeValid = dayjs(cleanTime, 'HH:mm', true).isValid();

    if (!isDateValid || !isTimeValid) {
        return null;
    }

    const combined = `${cleanDate} ${cleanTime}`;
    const parsed = dayjs.tz(combined, 'YYYY-MM-DD HH:mm', TIMEZONE);
    return parsed.isValid() ? parsed : null;
}

function formatDateIndo(dateInput, formatStr = 'D MMM YYYY HH:mm') {
    return dayjs(dateInput).tz(TIMEZONE).format(formatStr);
}

function getDaysRemaining(deadlineDate) {
    const now = getCurrentDate();
    const target = parseDate(deadlineDate);

    const diffMs = target.diff(now);
    if (diffMs <= 0) {
        return 0;
    }

    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.ceil(diffHours / 24);
}

module.exports = {
    getCurrentDate,
    parseDate,
    combineDateAndTime,
    formatDateIndo,
    getDaysRemaining,
    TIMEZONE,
};