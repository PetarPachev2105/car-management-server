/**
 * Transforms yyyy-mm to JS Date (start of the month)
 * @param string
 */
function transformAPIMonthDate(string) {
    return new Date(string);
}

/**
 * Transforms yyyy-mm-dd to JS Date
 * @param string
 * @returns {Date}
 */
function transformAPIFullDate(string) {
    return new Date(string);
}

/**
 * Transforms JS Date to yyyy-mm-dd
 * @param date
 */
function transformToAPIFullDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

/**
 * Sets the date to the start of the day - 00:00:00
 * @param date
 * @returns {Date}
 */
function setDateToStartOfTheDay(date) {
    const dateCopy = new Date(date);
    return new Date(dateCopy.setHours(0, 0, 0, 0));
}

/**
 * Sets the date to the end of the day - 23:59:59
 * @param date
 * @returns {Date}
 */
function setDateToEndOfTheDay(date) {
    const dateCopy = new Date(date);
    return new Date(dateCopy.setHours(23, 59, 59, 999));
}

/**
 * Sets the date to the beginning of the month
 * @param date
 * @returns {Date}
 */
function setDateToBeginningOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Sets the date to the last day of the month
 * @param date
 * @returns {Date}
 */
function setDateToEndOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Checks if the given year is a leap year
 * @param year
 * @returns {boolean}
 */
function isYearLeap(year) {
    return new Date(year, 1, 29).getDate() === 29;
}

/**
 * Chunks the given date range into months
 * @param startDate
 * @param endDate
 */
function chunkToMonths(startDate, endDate) {
    const chunks = [];
    let current = new Date(startDate);

    while (current <= endDate) {
        const currentDate = new Date(current);
        chunks.push({
            start: setDateToBeginningOfMonth(new Date(current)),
            end: setDateToEndOfMonth(new Date(current)),
            month: currentDate.toLocaleString('default', { month: 'long' }).toUpperCase(),
            year: currentDate.getFullYear(),
            monthValue: currentDate.getMonth(),
            leapYear: isYearLeap(currentDate.getFullYear()),
        });
        current =  new Date(current.setMonth(current.getMonth() + 1));
    }

    return chunks;
}

/**
 * Chunks the given date range into days
 * @param startDate
 * @param endDate
 */
function chunkToDays(startDate, endDate) {
    const chunks = [];
    let current = new Date(startDate);

    while (current <= endDate) {
        chunks.push({
            start: setDateToStartOfTheDay(current),
            end: setDateToEndOfTheDay(current),
        });
        current.setDate(current.getDate() + 1);
    }

    return chunks;
}


export default {
    transformAPIMonthDate,
    transformAPIFullDate,
    transformToAPIFullDate,

    setDateToStartOfTheDay,
    setDateToEndOfTheDay,
    setDateToBeginningOfMonth,
    setDateToEndOfMonth,
    // isYearLeap,
    chunkToMonths,
    chunkToDays,
}