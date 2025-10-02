"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDate = checkDate;
exports.checkLatestDate = checkLatestDate;
exports.checkPastDate = checkPastDate;
exports.checkPastWithdrawalDate = checkPastWithdrawalDate;
exports.checkValidWithdrawalDate = checkValidWithdrawalDate;
exports.checkWeekend = checkWeekend;
exports.getDatesInRange = getDatesInRange;
exports.weekMap = weekMap;
const dayjs_1 = __importDefault(require("dayjs"));
const localeData_1 = __importDefault(require("dayjs/plugin/localeData"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
dayjs_1.default.extend(weekOfYear_1.default);
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(localeData_1.default);
const localeObject = {
    name: "es",
    weekdays: "Domingo_Lunes ...".split("_"),
    weekStart: 1,
    months: "Enero_Febrero ... ".split("_"),
    formats: {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A",
        l: "D/M/YYYY",
        ll: "D MMM, YYYY",
        lll: "D MMM, YYYY h:mm A",
        llll: "ddd, MMM D, YYYY h:mm A",
    },
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years",
    },
};
dayjs_1.default.locale(localeObject);
function weekMap(dates) {
    const weekMap = {};
    for (const date of dates) {
        const localizedDate = (0, dayjs_1.default)(date).tz("Asia/Singapore");
        const weekNumber = localizedDate.week();
        const year = localizedDate.year();
        const key = `${year}-${weekNumber}`;
        if (weekMap[key]) {
            weekMap[key]++;
        }
        else {
            weekMap[key] = 1;
        }
    }
    return weekMap;
}
function checkDate(date, weekMap) {
    const localizedDate = (0, dayjs_1.default)(date).tz("Asia/Singapore");
    const weekNumber = localizedDate.week();
    const year = localizedDate.year();
    const key = `${year}-${weekNumber}`;
    if (weekMap[key] && weekMap[key] >= 2) {
        weekMap[key]++;
        return true;
    }
    else if (weekMap[key]) {
        weekMap[key]++;
    }
    else {
        weekMap[key] = 1;
    }
    return false;
}
function checkPastDate(date) {
    let singaporeTime = (0, dayjs_1.default)().tz("Asia/Singapore");
    singaporeTime = singaporeTime.hour(0).minute(0).second(0).millisecond(0);
    const tomorrowInSingapore = singaporeTime.add(1, "day");
    let dateInput = (0, dayjs_1.default)(date).tz("Asia/Singapore");
    dateInput = dateInput.hour(0).minute(0).second(0).millisecond(0);
    if (dateInput.isBefore(tomorrowInSingapore) ||
        dateInput.isSame(tomorrowInSingapore, "day")) {
        return true;
    }
    return false;
}
function checkPastWithdrawalDate(date) {
    let singaporeTime = (0, dayjs_1.default)().tz("Asia/Singapore");
    singaporeTime = singaporeTime.hour(0).minute(0).second(0).millisecond(0);
    const tomorrowInSingapore = singaporeTime.add(1, "day");
    let dateInput = (0, dayjs_1.default)(date).tz("Asia/Singapore");
    dateInput = dateInput.hour(0).minute(0).second(0).millisecond(0);
    if (dateInput.isBefore(tomorrowInSingapore)) {
        return true;
    }
    return false;
}
function checkValidWithdrawalDate(date) {
    let singaporeTime = (0, dayjs_1.default)().tz("Asia/Singapore");
    singaporeTime = singaporeTime.hour(0).minute(0).second(0).millisecond(0);
    let dateInput = (0, dayjs_1.default)(date).tz("Asia/Singapore");
    dateInput = dateInput.hour(0).minute(0).second(0).millisecond(0);
    if (singaporeTime.isBefore(dateInput)) {
        return true;
    }
    return false;
}
function checkWeekend(date) {
    let dateInput = (0, dayjs_1.default)(date).tz("Asia/Singapore");
    let dayOfWeek = dateInput.day();
    if (dayOfWeek == 0 || dayOfWeek == 6) {
        return true;
    }
    return false;
}
function checkLatestDate(date, testDate = null) {
    let singaporeTime = (0, dayjs_1.default)(testDate || new Date()).tz("Asia/Singapore");
    singaporeTime = singaporeTime.hour(0).minute(0).second(0).millisecond(0);
    let dateInput = (0, dayjs_1.default)(date).tz("Asia/Singapore");
    dateInput = dateInput.hour(0).minute(0).second(0).millisecond(0);
    let dayOfWeek = dateInput.day();
    if (dayOfWeek === 1 || dayOfWeek == 2) {
        const latestApplicationDate = dateInput.subtract(4, "day");
        if (singaporeTime.isAfter(latestApplicationDate)) {
            return true;
        }
    }
    return false;
}
function getDatesInRange(start, end) {
    const dates = [];
    let currentDate = (0, dayjs_1.default)(start);
    while (currentDate.isBefore(end) || currentDate.isSame(end)) {
        dates.push(currentDate.format("YYYY-MM-DD"));
        currentDate = currentDate.add(1, "day");
    }
    return dates;
}
