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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockReassignmentData = exports.mockWithdrawalData = exports.mockRequestData = exports.generateMockEmployeeTest = exports.generateMockEmployee = void 0;
const helpers_1 = require("@/helpers");
const utils_1 = require("@/tests/utils");
const generateMockEmployee = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (overrides = {}) {
    return (Object.assign({ staffId: 1, staffFName: "John", staffLName: "Doe", dept: "Development", position: "Developer", country: "USA", email: "test@example.com", hashedPassword: yield (0, utils_1.hashPassword)("test-password"), reportingManager: null, reportingManagerName: null, tempReportingManager: null, tempReportingManagerName: null, role: 1 }, overrides));
});
exports.generateMockEmployee = generateMockEmployee;
const generateMockEmployeeTest = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (overrides = {}) {
    return (Object.assign({ staffId: 140003, staffFName: "Janice", staffLName: "Chan", dept: "Sales", position: "Account Manager", country: "Singapore", email: "test@example.com", hashedPassword: yield (0, utils_1.hashPassword)("test-password"), reportingManager: 140894, reportingManagerName: "Rahim Khalid", role: 2 }, overrides));
});
exports.generateMockEmployeeTest = generateMockEmployeeTest;
const mockRequestData = {
    [helpers_1.Status.PENDING]: {
        staffId: 140003,
        staffName: "Janice Chan",
        reportingManager: 140894,
        managerName: "Rahim Khalid",
        dept: "Sales",
        requestedDate: "2024-10-08T00:00:00.000Z",
        requestType: "FULL",
        reason: "Raining",
        status: "PENDING",
        requestId: 22,
    },
    [helpers_1.Status.APPROVED]: {
        staffId: 140003,
        staffName: "Janice Chan",
        reportingManager: 140894,
        managerName: "Rahim Khalid",
        dept: "Sales",
        position: "Account Manager",
        requestedDate: "2024-10-08T00:00:00.000Z",
        requestType: "FULL",
        reason: "Raining",
        status: "APPROVED",
        requestId: 22,
    },
    [helpers_1.Status.REJECTED]: {
        staffId: 140003,
        staffName: "Janice Chan",
        reportingManager: 140894,
        managerName: "Rahim Khalid",
        dept: "Sales",
        position: "Account Manager",
        requestedDate: "2024-10-08T00:00:00.000Z",
        requestType: "FULL",
        reason: "Raining",
        status: "REJECTED",
        requestId: 22,
    },
    testing: {
        staffId: 140003,
        staffName: "Janice Chan",
        reportingManager: 140894,
        managerName: "Rahim Khalid",
        dept: "Sales",
        position: "Account Manager",
        requestedDate: new Date(),
        requestType: "FULL",
        reason: "Raining",
        status: "REJECTED",
        requestId: 22,
    },
    [helpers_1.Status.CANCELLED]: {
        staffId: 140003,
        staffName: "Janice Chan",
        reportingManager: 140894,
        managerName: "Rahim Khalid",
        dept: "Sales",
        position: "Account Manager",
        requestedDate: "2024-10-08T00:00:00.000Z",
        requestType: "FULL",
        reason: "Raining",
        status: "CANCELLED",
        requestId: 22,
    },
};
exports.mockRequestData = mockRequestData;
const mockWithdrawalData = {
    requestId: 22,
    staffId: 140003,
    staffName: "Janice Chan",
    reportingManager: 140894,
    managerName: "Rahim Khalid",
    dept: "Sales",
    position: "Account Manager",
    reason: "Plans cancelled",
    requestedDate: new Date(),
    requestType: "AM",
    withdrawalId: 1,
    status: "PENDING",
};
exports.mockWithdrawalData = mockWithdrawalData;
const mockReassignmentData = {
    staffId: 140894,
    staffName: "Rahim Khalid",
    startDate: "2024-11-14",
    endDate: "2024-11-16",
    tempReportingManagerId: "170166",
    tempManagerName: "David Yap",
    status: "APPROVED",
    active: true,
    reassignmentId: 22,
};
exports.mockReassignmentData = mockReassignmentData;
