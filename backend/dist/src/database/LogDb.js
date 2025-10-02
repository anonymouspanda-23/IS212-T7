"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = __importDefault(require("@/models/Log"));
class LogDb {
    logAction(logAction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Log_1.default.create(logAction);
        });
    }
    getOwnLogs(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subordinateLogs = yield Log_1.default.find({
                performedBy: staffId,
            });
            return subordinateLogs;
        });
    }
    getSubordinateLogs(reportingManagerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subordinateLogs = yield Log_1.default.find({
                reportingManagerId,
            });
            return subordinateLogs;
        });
    }
    getLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            const logData = yield Log_1.default.aggregate([
                {
                    $project: {
                        _id: 0,
                        performedBy: 1,
                        staffName: 1,
                        requestId: 1,
                        requestType: 1,
                        action: 1,
                        dept: 1,
                        position: 1,
                        reason: 1,
                        createdAt: 1,
                        logId: 1,
                    },
                },
                {
                    $group: {
                        _id: {
                            dept: "$dept",
                            position: "$position",
                        },
                        logs: { $push: "$$ROOT" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dept: "$_id.dept",
                        position: "$_id.position",
                        logs: 1,
                    },
                },
            ]);
            const formattedLogs = logData.reduce((acc, entry) => {
                if (!acc[entry.dept]) {
                    acc[entry.dept] = {};
                }
                if (!acc[entry.dept][entry.position]) {
                    acc[entry.dept][entry.position] = [];
                }
                acc[entry.dept][entry.position].push(...entry.logs);
                return acc;
            }, {});
            return formattedLogs;
        });
    }
}
exports.default = LogDb;
