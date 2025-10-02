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
const index_1 = require("@/index");
const Employee_1 = __importDefault(require("@/models/Employee"));
const Log_1 = __importDefault(require("@/models/Log"));
const Request_1 = __importDefault(require("@/models/Request"));
const utils_1 = require("@/tests/utils");
const fs_1 = require("fs");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const supertest_1 = __importDefault(require("supertest"));
jest.mock("nodemailer");
jest.unmock("mongoose");
jest.unmock("@/models/Request");
jest.unmock("@/models/Employee");
const mockCounter = {
    seq: 1,
};
jest.mock("@/helpers/counter", () => ({
    Counter: {
        findByIdAndUpdate: jest.fn(() => {
            return Promise.resolve({ seq: mockCounter.seq++ });
        }),
    },
    initializeCounter: jest.fn(() => Promise.resolve()),
}));
describe("Request Integration Test", () => {
    let mongoServer;
    let mockServer;
    const requestFilePath = path_1.default.resolve("@/../script/request.json");
    const requestFileContent = (0, fs_1.readFileSync)(requestFilePath, "utf-8");
    const requests = JSON.parse(requestFileContent);
    const employeeFilePath = path_1.default.resolve("@/../script/employee.json");
    const employeeFileContent = (0, fs_1.readFileSync)(employeeFilePath, "utf-8");
    const employees = JSON.parse(employeeFileContent);
    const logFilePath = path_1.default.resolve("@/../script/log.json");
    const logFileContent = (0, fs_1.readFileSync)(logFilePath, "utf-8");
    const logs = JSON.parse(logFileContent);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mockCounter.seq = 1;
        const mockTransporter = { verify: jest.fn((cb) => cb(null, true)) };
        nodemailer_1.default.createTransport.mockReturnValue(mockTransporter);
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        yield mongoose_1.default.connect(mongoUri);
        mockServer = index_1.app.listen();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
        mockServer.close();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        mockCounter.seq = 1;
        yield Employee_1.default.deleteMany();
        const EMPLOYEE_LIMIT = 10;
        for (let i = 0; i < Math.min(EMPLOYEE_LIMIT, employees.length); i++) {
            const employeeData = employees[i];
            employeeData.hashedPassword = yield (0, utils_1.hashPassword)("password123");
            yield Employee_1.default.create(employeeData);
        }
        mockCounter.seq = 1;
        yield Log_1.default.deleteMany();
        const LOG_LIMIT = 10;
        for (let i = 0; i < Math.min(LOG_LIMIT, logs.length); i++) {
            const logData = logs[i];
            yield Log_1.default.create(logData);
        }
        mockCounter.seq = 1;
        yield Request_1.default.deleteMany();
        const REQUEST_LIMIT = 10;
        for (let i = 0; i < Math.min(REQUEST_LIMIT, requests.length); i++) {
            const requestData = requests[i];
            yield Request_1.default.create(requestData);
        }
    }), 60000);
    describe("cancelPendingRequests", () => {
        it("should successfully cancel a pending request and return OK when valid staffId and requestId are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffId: 140001,
                requestId: 1,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/cancelPendingRequests")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.text).toStrictEqual(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return NOT_MODIFIED if no pending request is found for given staffId and requestId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffId: 140001,
                requestId: 2,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/cancelPendingRequests")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.text).toStrictEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
    });
    describe("getAllSubordinatesRequests", () => {
        it("should return all requests for the given subordinate ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const subordinateId = 140001;
            const expectedRequests = yield Request_1.default.find({
                employeeId: subordinateId,
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getAllSubordinatesRequests")
                .set("id", subordinateId.toString());
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.arrayContaining(expectedRequests));
        }));
        it("should return an empty array if no requests are found for the given subordinate ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = 9999;
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getAllSubordinatesRequests")
                .set("id", nonExistentId.toString());
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual({
                error: helpers_1.errMsg.USER_DOES_NOT_EXIST,
            });
        }));
    });
    describe("getOwnPendingRequests", () => {
        it("should return pending requests for the given user ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 140001;
            const expectedPendingRequests = yield Request_1.default.find({
                employeeId: userId,
                status: helpers_1.Status.PENDING,
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getOwnPendingRequests")
                .query({ myId: userId });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.arrayContaining(expectedPendingRequests));
        }));
        it("should return an error if myId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getOwnPendingRequests");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("error", helpers_1.errMsg.MISSING_PARAMETERS);
        }));
        it("should return an empty array if no pending requests are found for the given user id", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentUserId = 9999;
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getOwnPendingRequests")
                .query({ myId: nonExistentUserId });
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        }));
    });
    describe("getMySchedule", () => {
        it("should return the schedule for the given user id", () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 140001;
            const expectedSchedule = yield Request_1.default.find({ staffId: userId });
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getMySchedule")
                .query({ myId: userId });
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(expectedSchedule.length);
        }));
        it("should return an error if myId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getMySchedule");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("error", helpers_1.errMsg.MISSING_PARAMETERS);
        }));
    });
    describe("getSchedule", () => {
        it("should return the schedule for the given staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = 140001;
            const expectedSchedule = {
                CEO: { teams: { MD: 1 }, wfhStaff: [] },
                Engineering: { teams: { Director: 1 }, wfhStaff: [] },
                Sales: {
                    teams: { "Account Manager": 5, Director: 1, "Sales Manager": 1 },
                    wfhStaff: [
                        {
                            dept: "Sales",
                            managerName: "Jack Sim",
                            position: "Director",
                            reason: "Apple Launch Day",
                            reportingManager: 130002,
                            requestId: 2,
                            requestType: "AM",
                            requestedDate: "2024-12-15T00:00:00.000Z",
                            staffId: 140001,
                            staffName: "Derek Tan",
                            status: "APPROVED",
                        },
                    ],
                },
                Solutioning: { teams: { Director: 1 }, wfhStaff: [] },
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getSchedule")
                .set("id", staffId.toString());
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expectedSchedule);
        }));
        it("should return an empty object if no schedule is found for the given staff ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentStaffId = 9999;
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getSchedule")
                .set("id", nonExistentStaffId.toString());
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
        }));
    });
    describe("approveRequest", () => {
        it("should approve the request and return OK for valid approval details", () => __awaiter(void 0, void 0, void 0, function* () {
            const approvalDetails = {
                performedBy: 130002,
                requestId: 1,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveRequest")
                .send(approvalDetails);
            expect(response.status).toBe(200);
            expect(response.text).toBe(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return an error if approval details are invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidApprovalDetails = {
                performedBy: "invalid-id",
                requestId: null,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveRequest")
                .send(invalidApprovalDetails);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("errMsg");
        }));
        it("should return NOT_MODIFIED if the requestId is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const approvalDetails = {
                performedBy: 140001,
                requestId: 99999,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveRequest")
                .send(approvalDetails);
            expect(response.status).toBe(200);
            expect(response.text).toBe(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
    });
    describe("rejectRequest", () => {
        it("should reject the request for valid rejection details", () => __awaiter(void 0, void 0, void 0, function* () {
            const rejectionDetails = {
                performedBy: 140001,
                requestId: 12345,
                reason: "Not required anymore",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectRequest")
                .send(rejectionDetails);
            expect(response.status).toBe(200);
            expect(response.text).toBe(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return an error if rejection details are invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidRejectionDetails = {
                performedBy: "invalid-id",
                requestId: null,
                reason: "",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectRequest")
                .send(invalidRejectionDetails);
            const expectedResponse = {
                errMsg: {
                    _errors: [],
                    performedBy: {
                        _errors: ["Expected number, received string"],
                    },
                    requestId: {
                        _errors: ["Expected number, received null"],
                    },
                },
            };
            expect(response.status).toBe(200);
            expect(JSON.parse(response.text)).toStrictEqual(expectedResponse);
        }));
        it("should return NOT_MODIFIED if the requestId is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const rejectionDetails = {
                performedBy: 140001,
                requestId: 99999,
                reason: "Request is invalid",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectRequest")
                .send(rejectionDetails);
            expect(response.status).toBe(200);
            expect(response.text).toBe(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
    });
    describe("revokeRequest", () => {
        it("should return NOT_MODIFIED if the requestId is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const revocationDetails = {
                performedBy: 140001,
                requestId: 12345,
                reason: "No longer needed",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/revokeRequest")
                .send(revocationDetails);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return an error if revocation details are invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidRevocationDetails = {
                performedBy: "invalid-id",
                requestId: null,
                reason: "",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/revokeRequest")
                .send(invalidRevocationDetails);
            const expectedResponse = {
                errMsg: {
                    _errors: [],
                    performedBy: {
                        _errors: ["Expected number, received string"],
                    },
                    requestId: {
                        _errors: ["Expected number, received null"],
                    },
                },
            };
            expect(response.status).toBe(200);
            expect(JSON.parse(response.text)).toStrictEqual(expectedResponse);
        }));
        it("should return NOT_MODIFIED if the request could not be revoked", () => __awaiter(void 0, void 0, void 0, function* () {
            const revocationDetails = {
                performedBy: 140001,
                requestId: 99999,
                reason: "Request is invalid",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/revokeRequest")
                .send(revocationDetails);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
    });
    describe("postRequest", () => {
        it("should return success message for valid request details", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestDetails = {
                staffId: 140001,
                staffName: "Derek Tan",
                reportingManager: 140894,
                managerName: "Rahim Khalid",
                dept: "Sales",
                requestedDates: [
                    ["2024-11-25", "AM"],
                    ["2024-11-26", "PM"],
                ],
                reason: "Apple Launch Day",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/postRequest")
                .send(requestDetails);
            expect(response.status).toBe(200);
            expect(response.body.success.message).toBe(helpers_1.successMsg);
            expect(response.body.success.dates).toEqual(expect.any(Array));
        }));
        it("should return an error if request details are invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidRequestDetails = {
                staffId: null,
                staffName: "",
                reportingManager: 140894,
                managerName: "Rahim Khalid",
                dept: "Sales",
                requestedDates: [["invalid-date", "AM"]],
                reason: "",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/postRequest")
                .send(invalidRequestDetails);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("errMsg");
        }));
        it("should return error messages for requests with weekend dates", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestDetails = {
                staffId: 140001,
                staffName: "Derek Tan",
                reportingManager: 140894,
                managerName: "Rahim Khalid",
                dept: "Sales",
                requestedDates: [
                    ["2024-11-02", "AM"],
                    ["2024-11-03", "PM"],
                ],
                reason: "Weekend Request",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/postRequest")
                .send(requestDetails);
            expect(response.status).toBe(200);
            expect(response.body.error).toEqual(expect.arrayContaining([
                {
                    message: helpers_1.errMsg.WEEKEND_REQUEST,
                    dates: expect.any(Array),
                },
            ]));
        }));
        it("should return error messages for requests with past dates", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestDetails = {
                staffId: 140001,
                staffName: "Derek Tan",
                reportingManager: 140894,
                managerName: "Rahim Khalid",
                dept: "Sales",
                requestedDates: [["2020-01-01", "AM"]],
                reason: "Past Date Request",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/postRequest")
                .send(requestDetails);
            expect(response.status).toBe(200);
            expect(response.body.error).toEqual(expect.arrayContaining([
                {
                    message: helpers_1.errMsg.PAST_DATE,
                    dates: expect.any(Array),
                },
            ]));
        }));
        it("should return error messages for requests with duplicate dates", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestDetails = {
                staffId: 140001,
                staffName: "Derek Tan",
                reportingManager: 140894,
                managerName: "Rahim Khalid",
                dept: "Sales",
                requestedDates: [
                    ["2024-11-01", "AM"],
                    ["2024-11-01", "AM"],
                ],
                reason: "Duplicate Date Request",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/postRequest")
                .send(requestDetails);
            expect(response.status).toBe(200);
            expect(response.body.error).toEqual(expect.arrayContaining([
                {
                    message: helpers_1.errMsg.DUPLICATE_DATE,
                    dates: expect.any(Array),
                },
            ]));
        }));
    });
});
