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
const Withdrawal_1 = __importDefault(require("@/models/Withdrawal"));
const helpers_1 = require("@/helpers");
const dayjs_1 = __importDefault(require("dayjs"));
class WithdrawalDb {
    withdrawRequest(document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const withdrawalInsert = yield Withdrawal_1.default.create(document);
                return withdrawalInsert ? helpers_1.HttpStatusResponse.OK : null;
            }
            catch (error) {
                return null;
            }
        });
    }
    getWithdrawalRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const withdrawalRequests = yield Withdrawal_1.default.find({
                requestId: requestId,
            });
            return withdrawalRequests;
        });
    }
    getSubordinatesWithdrawalRequests(reportingManager) {
        return __awaiter(this, void 0, void 0, function* () {
            const subordinatesRequests = yield Withdrawal_1.default.find({
                reportingManager: reportingManager,
            });
            return subordinatesRequests;
        });
    }
    getOwnWithdrawalRequests(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ownRequests = yield Withdrawal_1.default.find({
                staffId: staffId,
            });
            return ownRequests;
        });
    }
    getWithdrawalRequestById(withdrawalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const withdrawalRequest = yield Withdrawal_1.default.findOne({
                withdrawalId: withdrawalId,
            });
            if (!withdrawalRequest) {
                return null;
            }
            return withdrawalRequest;
        });
    }
    approveWithdrawalRequest(withdrawalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Withdrawal_1.default.updateMany({
                withdrawalId,
                status: helpers_1.Status.PENDING,
            }, {
                $set: {
                    status: helpers_1.Status.APPROVED,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    rejectWithdrawalRequest(withdrawalId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modifiedCount } = yield Withdrawal_1.default.updateMany({
                withdrawalId,
                status: helpers_1.Status.PENDING,
            }, {
                $set: {
                    status: helpers_1.Status.REJECTED,
                    reason: reason,
                },
            });
            if (modifiedCount == 0) {
                return null;
            }
            return helpers_1.HttpStatusResponse.OK;
        });
    }
    updateWithdrawalStatusToExpired() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, dayjs_1.default)().utc(true).startOf("day");
            const withdrawalRequests = yield Withdrawal_1.default.find({
                status: helpers_1.Status.PENDING,
                requestedDate: now.toDate(),
            });
            if (!withdrawalRequests.length)
                return [];
            yield Withdrawal_1.default.updateMany({
                status: helpers_1.Status.PENDING,
                requestedDate: now.toDate(),
            }, {
                $set: {
                    status: helpers_1.Status.EXPIRED,
                },
            });
            return withdrawalRequests;
        });
    }
}
exports.default = WithdrawalDb;
