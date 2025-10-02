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
const NotificationService_1 = __importDefault(require("@/services/NotificationService"));
const globals_1 = require("@jest/globals");
describe("NotificationService", () => {
    let notificationService;
    let employeeServiceMock;
    let mockTransporter;
    let mockMailer;
    beforeEach(() => {
        employeeServiceMock = {
            getEmployee: globals_1.jest.fn(),
        };
        mockTransporter = {
            sendMail: globals_1.jest.fn().mockImplementation(() => Promise.resolve()),
        };
        mockMailer = {
            getInstance: globals_1.jest.fn().mockReturnThis(),
            getTransporter: globals_1.jest.fn().mockReturnValue(mockTransporter),
        };
        notificationService = new NotificationService_1.default(employeeServiceMock, mockMailer);
    });
    afterEach(() => {
        globals_1.jest.resetAllMocks();
    });
    describe("pushRequestSentNotification", () => {
        const emailSubject = "Email Subject";
        const mockStaffEmail = "staff@lurence.org";
        const mockManagerId = 1;
        const mockRequestDates = [["2023-06-01", "Full Day"]];
        const mockRequestReason = "Working on project";
        const mockRequestType = "REASSIGNMENT";
        it("should send an email successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            employeeServiceMock.getEmployee.mockResolvedValue({
                staffFName: "John",
                staffLName: "Doe",
                email: "john.doe@lurence.org",
            });
            const result = yield notificationService.pushRequestSentNotification(emailSubject, mockStaffEmail, mockManagerId, mockRequestType, mockRequestDates, mockRequestReason);
            expect(result).toBe("Email sent successfully!");
            expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith(mockManagerId);
            // expect(mockMailer.getTransporter().sendMail).toHaveBeenCalled();
        }));
        it("should handle error when manager details are not found", () => __awaiter(void 0, void 0, void 0, function* () {
            employeeServiceMock.getEmployee.mockResolvedValue(null);
            const result = yield notificationService.pushRequestSentNotification(emailSubject, mockStaffEmail, mockManagerId, mockRequestType, mockRequestDates, mockRequestReason);
            expect(result).toBe("Failed to send email");
            expect(employeeServiceMock.getEmployee).toHaveBeenCalledWith(mockManagerId);
            // expect(mockMailer.getTransporter().sendMail).not.toHaveBeenCalled();
        }));
        it("should handle error when sending email fails", () => __awaiter(void 0, void 0, void 0, function* () {
            employeeServiceMock.getEmployee.mockResolvedValue({
                staffFName: "John",
                staffLName: "Doe",
                email: "john.doe@example.com",
            });
            mockTransporter.sendMail.mockRejectedValue(new Error("Send failed"));
            const result = yield notificationService.pushRequestSentNotification(emailSubject, mockStaffEmail, mockManagerId, mockRequestType, mockRequestDates, mockRequestReason);
            expect(result).toBe("Failed to send email");
        }));
        it("should throw an error when no request dates are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            employeeServiceMock.getEmployee.mockResolvedValue({
                staffFName: "John",
                staffLName: "Doe",
                email: "john.doe@example.com",
            });
            const result = yield notificationService.pushRequestSentNotification(emailSubject, mockStaffEmail, mockManagerId, mockRequestType, [], mockRequestReason);
            expect(result).toBe("Failed to send email");
        }));
    });
    describe("notify", () => {
        const emailSubject = "Email Subject";
        const mockStaffEmail = "staff@lurence.org";
        const mockEmailContent = "You have a pending reassignment request from Jane Doe and requires your approval. Please login to the portal to approve the request";
        const mockDateRange = ["2024-10-25", "2024-10-28"];
        it("should send an email successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            employeeServiceMock.getEmployee.mockResolvedValue({
                staffFName: "John",
                staffLName: "Doe",
                email: "john.doe@lurence.org",
            });
            const result = yield notificationService.notify(mockStaffEmail, emailSubject, mockEmailContent, mockDateRange, null);
            expect(result).toBe(true);
            // expect(mockMailer.getTransporter().sendMail).toHaveBeenCalled();
        }));
        it("should return an error when sending email fails", () => __awaiter(void 0, void 0, void 0, function* () {
            employeeServiceMock.getEmployee.mockResolvedValue({
                staffFName: "John",
                staffLName: "Doe",
                email: "john.doe@example.com",
            });
            mockTransporter.sendMail.mockRejectedValue(new Error("Send failed"));
            const result = yield notificationService.notify(mockStaffEmail, emailSubject, mockEmailContent, mockDateRange, null);
            expect(result).toBe(helpers_1.errMsg.FAILED_TO_SEND_EMAIL);
        }));
    });
});
