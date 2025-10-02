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
const helpers_1 = require("@/helpers");
const dayjs_1 = __importDefault(require("dayjs"));
class ReassignmentService {
    constructor(reassignmentDb, requestDb, employeeService, logService, notificationService) {
        this.reassignmentDb = reassignmentDb;
        this.requestDb = requestDb;
        this.employeeService = employeeService;
        this.logService = logService;
        this.notificationService = notificationService;
    }
    insertReassignmentRequest(reassignmentRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffId, tempReportingManagerId, startDate, endDate } = reassignmentRequest;
            const now = (0, dayjs_1.default)().utc(true);
            const startDateUTC = (0, dayjs_1.default)(startDate).utc(true);
            if (startDateUTC.isBefore(now, "day")) {
                return helpers_1.errMsg.PAST_DATE_NOT_ALLOWED;
            }
            else if (startDateUTC.isSame(now, "day")) {
                return helpers_1.errMsg.CURRENT_DATE_NOT_ALLOWED;
            }
            const currentManager = yield this.employeeService.getEmployee(staffId);
            const tempReportingManager = yield this.employeeService.getEmployee(tempReportingManagerId);
            const managerName = `${currentManager.staffFName} ${currentManager.staffLName}`;
            const hasNonRejectedReassignmentBetweenStartAndEndDate = yield this.reassignmentDb.hasNonRejectedReassignment(staffId, startDate, endDate);
            if (hasNonRejectedReassignmentBetweenStartAndEndDate) {
                return helpers_1.errMsg.NON_REJECTED_REASSIGNMENT;
            }
            if (currentManager.role !== tempReportingManager.role) {
                return helpers_1.errMsg.SAME_ROLE_REASSIGNMENT;
            }
            const request = Object.assign(Object.assign({}, reassignmentRequest), { staffName: `${currentManager.staffFName} ${currentManager.staffLName}`, originalManagerDept: currentManager.dept, tempManagerName: `${tempReportingManager.staffFName} ${tempReportingManager.staffLName}`, status: helpers_1.Status.PENDING, active: null });
            yield this.reassignmentDb.insertReassignmentRequest(request);
            const dayjsStartDate = (0, dayjs_1.default)(startDate);
            const formattedStartDate = dayjsStartDate.format("YYYY-MM-DD");
            const dayjsEndDate = (0, dayjs_1.default)(endDate);
            const formattedEndDate = dayjsEndDate.format("YYYY-MM-DD");
            let emailSubject = `[${helpers_1.Request.REASSIGNMENT}] Pending Reassignment Request`;
            let emailContent = `You have a pending reassignment request from ${managerName}, ${currentManager.email} (${currentManager.dept} - ${currentManager.position}) and requires your approval. Please login to the portal to approve the request.`;
            yield this.notificationService.notify(tempReportingManager.email, emailSubject, emailContent, [formattedStartDate, formattedEndDate], null);
            emailSubject = `[${helpers_1.Request.REASSIGNMENT}] Pending Reassignment Request`;
            emailContent = `Your reassignment request for the following dates have been sent to ${tempReportingManager === null || tempReportingManager === void 0 ? void 0 : tempReportingManager.staffFName} ${tempReportingManager === null || tempReportingManager === void 0 ? void 0 : tempReportingManager.staffLName}, ${tempReportingManager === null || tempReportingManager === void 0 ? void 0 : tempReportingManager.email} (${tempReportingManager === null || tempReportingManager === void 0 ? void 0 : tempReportingManager.dept} - ${tempReportingManager === null || tempReportingManager === void 0 ? void 0 : tempReportingManager.position}).`;
            yield this.notificationService.notify(currentManager.email, emailSubject, emailContent, [formattedStartDate, formattedEndDate], null);
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: staffId,
                requestType: helpers_1.Request.REASSIGNMENT,
                action: helpers_1.Action.APPLY,
                staffName: managerName,
                dept: currentManager.dept,
                position: currentManager.position,
            });
        });
    }
    getReassignmentStatus(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffFName, staffLName, dept, position } = yield this.employeeService.getEmployee(staffId);
            const staffName = `${staffFName} ${staffLName}`;
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: staffId,
                requestType: helpers_1.Request.REASSIGNMENT,
                action: helpers_1.Action.RETRIEVE,
                staffName: staffName,
                dept: dept,
                position: position,
            });
            return yield this.reassignmentDb.getReassignmentRequest(staffId);
        });
    }
    getTempMgrReassignmentStatus(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { staffFName, staffLName, dept, position } = yield this.employeeService.getEmployee(staffId);
            const staffName = `${staffFName} ${staffLName}`;
            /**
             * Logging
             */
            yield this.logService.logRequestHelper({
                performedBy: staffId,
                requestType: helpers_1.Request.REASSIGNMENT,
                action: helpers_1.Action.RETRIEVE,
                staffName: staffName,
                dept: dept,
                position: position,
            });
            return yield this.reassignmentDb.getTempMgrReassignmentRequest(staffId);
        });
    }
    setActiveReassignmentPeriod() {
        return __awaiter(this, void 0, void 0, function* () {
            const isActiveUpdated = yield this.reassignmentDb.setActiveReassignmentPeriod();
            if (isActiveUpdated) {
                /**
                 * Logging
                 */
                yield this.logService.logRequestHelper({
                    performedBy: helpers_1.PerformedBy.SYSTEM,
                    requestType: helpers_1.Request.REASSIGNMENT,
                    action: helpers_1.Action.SET_ACTIVE,
                    dept: helpers_1.PerformedBy.SYSTEM,
                    position: helpers_1.PerformedBy.SYSTEM,
                });
            }
        });
    }
    setInactiveReassignmentPeriod() {
        return __awaiter(this, void 0, void 0, function* () {
            const isActiveUpdated = yield this.reassignmentDb.setInactiveReassignmentPeriod();
            if (isActiveUpdated) {
                /**
                 * Logging
                 */
                yield this.logService.logRequestHelper({
                    performedBy: helpers_1.PerformedBy.SYSTEM,
                    requestType: helpers_1.Request.REASSIGNMENT,
                    action: helpers_1.Action.SET_INACTIVE,
                    dept: helpers_1.PerformedBy.SYSTEM,
                    position: helpers_1.PerformedBy.SYSTEM,
                });
            }
        });
    }
    getReassignmentActive(staffId, tempReportingManagerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeFlag = yield this.reassignmentDb.getReassignmentActive(staffId, tempReportingManagerId);
            return activeFlag;
        });
    }
    getActiveReassignmentAsTempManager(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeReassignments = yield this.reassignmentDb.getActiveReassignmentAsTempManager(staffId);
            return activeReassignments;
        });
    }
    getIncomingReassignmentRequests(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.reassignmentDb.getIncomingReassignmentRequests(staffId);
        });
    }
    handleReassignmentRequest(staffId, reassignmentId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignment = yield this.reassignmentDb.getIncomingReassignmentRequests(staffId);
            if (!reassignment) {
                throw new Error("Reassignment request not found");
            }
            if (reassignment[0].tempReportingManagerId !== staffId) {
                throw new Error("Unauthorized to perform this action");
            }
            if (reassignment[0].status !== helpers_1.Status.PENDING) {
                throw new Error("This request has already been processed");
            }
            const newStatus = action === helpers_1.Action.APPROVE ? helpers_1.Status.APPROVED : helpers_1.Status.REJECTED;
            yield this.reassignmentDb.updateReassignmentStatus(reassignmentId, newStatus);
            const requestedManager = yield this.employeeService.getEmployee(reassignment[0].staffId);
            const currentManager = yield this.employeeService.getEmployee(staffId);
            if (requestedManager && currentManager) {
                const reassignmentAction = action === helpers_1.Action.APPROVE ? "Approved" : "Rejected";
                const dayjsStartDate = (0, dayjs_1.default)(reassignment[0].startDate);
                const formattedStartDate = dayjsStartDate.format("YYYY-MM-DD");
                const dayjsEndDate = (0, dayjs_1.default)(reassignment[0].endDate);
                const formattedEndDate = dayjsEndDate.format("YYYY-MM-DD");
                const emailSubject = `[${helpers_1.Request.REASSIGNMENT}] Reassignment ${reassignmentAction}`;
                const emailContent = `Your reassignment request has been ${reassignmentAction.toLowerCase()} by ${currentManager.staffFName} ${currentManager.staffLName}, ${currentManager.email} (${currentManager.dept} - ${currentManager.position}). Please login to the portal to view the reassignment request.`;
                yield this.notificationService.notify(requestedManager.email, emailSubject, emailContent, [formattedStartDate, formattedEndDate], null);
                yield this.logService.logRequestHelper({
                    performedBy: staffId,
                    requestType: helpers_1.Request.REASSIGNMENT,
                    action: action,
                    staffName: `${currentManager.staffFName} ${currentManager.staffLName}`,
                    dept: currentManager.dept,
                    position: currentManager.position,
                });
            }
        });
    }
    getSubordinateRequestsForTempManager(staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reassignment = yield this.reassignmentDb.getActiveReassignmentAsTempManager(staffId);
            if (!reassignment) {
                return null;
            }
            const subordinateRequests = yield this.requestDb.getAllSubordinatesRequests(reassignment.staffId);
            // filter approved requests based on reassignment dates
            return subordinateRequests.filter((request) => {
                if (request.status === helpers_1.Status.APPROVED ||
                    request.status === helpers_1.Status.REJECTED) {
                    const requestDate = new Date(request.requestedDate);
                    const reassignmentStartDate = new Date(reassignment.startDate);
                    const reassignmentEndDate = new Date(reassignment.endDate);
                    return (
                    // only return approved requests if they are between startDate and endDate of reassignment
                    requestDate >= reassignmentStartDate &&
                        requestDate <= reassignmentEndDate);
                }
                // keep all pending requests
                else
                    return request.status === helpers_1.Status.PENDING;
            });
        });
    }
}
exports.default = ReassignmentService;
