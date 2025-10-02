"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
class CronJob {
    constructor(requestService, reassignmentService, withdrawalService) {
        this.requestService = requestService;
        this.reassignmentService = reassignmentService;
        this.withdrawalService = withdrawalService;
    }
    execute() {
        // To run at 00:00 AM daily
        node_cron_1.default.schedule("0 0 * * *", () => {
            this.requestService.updateRequestStatusToExpired();
            this.withdrawalService.updateWithdrawalStatusToExpired();
            this.reassignmentService.setActiveReassignmentPeriod();
            this.reassignmentService.setInactiveReassignmentPeriod();
        });
    }
}
exports.default = CronJob;
