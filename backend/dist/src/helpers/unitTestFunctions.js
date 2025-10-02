"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dayWeekAfter = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const dayWeekAfter = (day) => {
    return (0, dayjs_1.default)()
        .tz("Asia/Singapore")
        .day(day)
        .add(1, "week")
        .format("YYYY-MM-DD");
};
exports.dayWeekAfter = dayWeekAfter;
