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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@/helpers");
const index_1 = require("@/index");
const Log_1 = __importDefault(require("@/models/Log"));
const Employee_1 = __importDefault(require("@/models/Employee"));
const Reassignment_1 = __importDefault(require("@/models/Reassignment"));
const Request_1 = __importDefault(require("@/models/Request"));
const Withdrawal_1 = __importDefault(require("@/models/Withdrawal"));
const schema_1 = require("@/schema");
const utils_1 = require("@/tests/utils");
const fs_1 = require("fs");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const supertest_1 = __importDefault(require("supertest"));
jest.mock("nodemailer");
jest.unmock("mongoose");
jest.unmock("@/models/Log");
jest.unmock("@/models/Withdrawal");
jest.unmock("@/models/Request");
jest.unmock("@/models/Employee");
jest.unmock("@/models/Reassignment");
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
describe("Withdrawal Integration Tests", () => {
    let mongoServer;
    let mockServer;
    const filePath = path_1.default.resolve("@/../script/withdrawal.json");
    const fileContent = (0, fs_1.readFileSync)(filePath, "utf-8");
    const withdrawals = JSON.parse(fileContent);
    const filePath2 = path_1.default.resolve("@/../script/request.json");
    const fileContent2 = (0, fs_1.readFileSync)(filePath2, "utf-8");
    const requests = JSON.parse(fileContent2);
    const filePath3 = path_1.default.resolve("@/../script/employee.json");
    const fileContent3 = (0, fs_1.readFileSync)(filePath3, "utf-8");
    const employees = JSON.parse(fileContent3);
    const filePath4 = path_1.default.resolve("@/../script/reassignment.json");
    const fileContent4 = (0, fs_1.readFileSync)(filePath4, "utf-8");
    const reassignments = JSON.parse(fileContent4);
    const filePath5 = path_1.default.resolve("@/../script/log.json");
    const fileContent5 = (0, fs_1.readFileSync)(filePath5, "utf-8");
    const logs = JSON.parse(fileContent5);
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
        yield Request_1.default.deleteMany();
        const REQUEST_LIMIT = 10;
        for (let i = 0; i < Math.min(REQUEST_LIMIT, requests.length); i++) {
            const requestData = requests[i];
            requestData.requestedDate = new Date(requestData.requestedDate);
            yield Request_1.default.create(requestData);
        }
        mockCounter.seq = 1;
        yield Log_1.default.deleteMany();
        const LOG_LIMIT = 10;
        for (let i = 0; i < Math.min(LOG_LIMIT, logs.length); i++) {
            const logData = logs[i];
            yield Log_1.default.create(logData);
        }
        mockCounter.seq = 1;
        yield Reassignment_1.default.deleteMany();
        const REASSIGNMENT_LIMIT = 10;
        for (let i = 0; i < Math.min(REASSIGNMENT_LIMIT, reassignments.length); i++) {
            const reassignmentData = reassignments[i];
            reassignmentData.startDate = new Date(reassignmentData.startDate);
            reassignmentData.endDate = new Date(reassignmentData.endDate);
            yield Reassignment_1.default.create(reassignmentData);
        }
        mockCounter.seq = 1;
        yield Withdrawal_1.default.deleteMany();
        const WITHDRAWAL_LIMIT = 10;
        for (let i = 0; i < Math.min(WITHDRAWAL_LIMIT, withdrawals.length); i++) {
            const withdrawalData = withdrawals[i];
            withdrawalData.requestedDate = new Date(withdrawalData.requestedDate);
            yield Withdrawal_1.default.create(withdrawalData);
        }
    }), 60000);
    describe("withdrawRequest", () => {
        it("should return Missing Parameters if missing requestId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {};
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_PARAMETERS });
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED if invalid requestId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                requestId: 25,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED if request is pending", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                requestId: 3,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED if there is an existing pending withdrawal", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                requestId: 3,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            yield Request_1.default.findOneAndUpdate({ requestId: 3 }, { status: "APPROVED" });
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED if there is an existing approved withdrawal", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                requestId: 3,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            yield Request_1.default.findOneAndUpdate({ requestId: 3 }, { status: "APPROVED" });
            yield Withdrawal_1.default.findOneAndUpdate({ requestId: 3 }, { status: "APPROVED" });
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED for a request with past date", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                requestId: 4,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            yield Request_1.default.findOneAndUpdate({ requestId: 4 }, { status: "APPROVED" });
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED for a request with today's date", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                requestId: 4,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            yield Request_1.default.findOneAndUpdate({ requestId: 4 }, { status: "APPROVED" }, { requestedDate: new Date() });
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.OK for a request with tomorrow's date", () => __awaiter(void 0, void 0, void 0, function* () {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const requestBody = {
                requestId: 5,
            };
            yield Request_1.default.findOneAndUpdate({ requestId: 5 }, {
                status: "APPROVED",
                requestedDate: tomorrow,
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/withdrawRequest")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.OK);
        }));
    });
    describe("getSubordinatesWithdrawalRequests", () => {
        it("should return an error for an invalid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "1234";
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getSubordinatesWithdrawalRequests")
                .set("id", id)
                .expect(200);
            expect(response.body).toEqual({
                error: helpers_1.errMsg.USER_DOES_NOT_EXIST,
            });
        }));
        it("should return an error for if there is missing header", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getSubordinatesWithdrawalRequests");
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
        it("should return withdrawal data for a valid staff id", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "151408";
            const expectedResponse = [
                {
                    requestId: 3,
                    staffId: 150245,
                    staffName: "Benjamin Tan",
                    reportingManager: 151408,
                    managerName: "Philip Lee",
                    dept: "Engineering",
                    position: "Call Centre",
                    reason: "Plans cancelled",
                    requestedDate: "2024-09-15T00:00:00.000Z",
                    requestType: "AM",
                    withdrawalId: 2,
                    status: "PENDING",
                },
            ];
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getSubordinatesWithdrawalRequests")
                .set("id", id)
                .expect(200);
            const filteredResponse = response.body.map((_a) => {
                var { createdAt, updatedAt, _id } = _a, rest = __rest(_a, ["createdAt", "updatedAt", "_id"]);
                return rest;
            });
            expect(filteredResponse).toStrictEqual(expectedResponse);
        }));
        it("should return withdrawal + temp withdrawal data for a valid staff id and active reassignment", () => __awaiter(void 0, void 0, void 0, function* () {
            yield Reassignment_1.default.findOneAndUpdate({ tempReportingManagerId: 151408 }, {
                status: "APPROVED",
                active: true,
            });
            const expectedResponse = [
                {
                    requestId: 3,
                    staffId: 150245,
                    staffName: "Benjamin Tan",
                    reportingManager: 151408,
                    managerName: "Philip Lee",
                    dept: "Engineering",
                    position: "Call Centre",
                    reason: "Plans cancelled",
                    requestedDate: "2024-09-15T00:00:00.000Z",
                    requestType: "AM",
                    withdrawalId: 2,
                    status: "PENDING",
                },
                {
                    requestId: 6,
                    staffId: 140008,
                    staffName: "Jaclyn Lee",
                    reportingManager: 140001,
                    managerName: "Derek Tan",
                    dept: "Sales",
                    position: "Sales Manager",
                    requestedDate: "2024-09-18T00:00:00.000Z",
                    reason: "Plans cancelled",
                    requestType: "AM",
                    withdrawalId: 3,
                    status: "PENDING",
                },
            ];
            const id = "151408";
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getSubordinatesWithdrawalRequests")
                .set("id", id)
                .expect(200);
            const filteredResponse = response.body.map((_a) => {
                var { createdAt, updatedAt, _id } = _a, rest = __rest(_a, ["createdAt", "updatedAt", "_id"]);
                return rest;
            });
            expect(filteredResponse).toStrictEqual(expectedResponse);
        }));
    });
    describe("getOwnWithdrawalRequests", () => {
        it("should return [] for an invalid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = "1234";
            const response = yield (0, supertest_1.default)(mockServer)
                .get(`/api/v1/getOwnWithdrawalRequests?staffId=${staffId}`)
                .expect(200);
            expect(response.body).toEqual([]);
        }));
        it("should return an error for if there is missing staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer)
                .get(`/api/v1/getOwnWithdrawalRequests`)
                .expect(200);
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_PARAMETERS });
        }));
        it("should return withdrawal data for a valid staffId", () => __awaiter(void 0, void 0, void 0, function* () {
            const staffId = "150245";
            const response = yield (0, supertest_1.default)(mockServer)
                .get(`/api/v1/getOwnWithdrawalRequests?staffId=${staffId}`)
                .expect(200);
            const filteredResponse = response.body.map((_a) => {
                var { createdAt, updatedAt, _id } = _a, rest = __rest(_a, ["createdAt", "updatedAt", "_id"]);
                return rest;
            });
            const expectedResponse = [
                {
                    requestId: 3,
                    staffId: 150245,
                    staffName: "Benjamin Tan",
                    reportingManager: 151408,
                    managerName: "Philip Lee",
                    dept: "Engineering",
                    position: "Call Centre",
                    reason: "Plans cancelled",
                    requestedDate: "2024-09-15T00:00:00.000Z",
                    requestType: "AM",
                    withdrawalId: 2,
                    status: "PENDING",
                },
            ];
            expect(filteredResponse).toStrictEqual(expectedResponse);
        }));
    });
    describe("approveWithdrawalRequest", () => {
        it("should return error for missing performedBy / withdrawalId", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer)
                .post(`/api/v1/approveWithdrawalRequest`)
                .expect(200);
            const validation = schema_1.withdrawalApprovalSchema.safeParse(response);
            expect(response.body).toEqual({ errMsg: validation.error.format() });
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED for invalid withdrawalId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 151408,
                withdrawalId: 555,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED for invalid performedby", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 777,
                withdrawalId: 2,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.OK for valid performedby & withdrawalId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 151408,
                withdrawalId: 2,
            };
            const currentWithdrawal = yield Withdrawal_1.default.findOne({ withdrawalId: 2 });
            yield Request_1.default.findOneAndUpdate({
                requestId: currentWithdrawal.requestId,
            }, {
                status: "APPROVED",
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return HttpStatusResponse.OK for valid performedby (temp) & withdrawalId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 151408,
                withdrawalId: 3,
            };
            yield Reassignment_1.default.findOneAndUpdate({ tempReportingManagerId: 151408 }, {
                status: "APPROVED",
                active: true,
            });
            const currentWithdrawal = yield Withdrawal_1.default.findOne({
                withdrawalId: 3,
            });
            yield Request_1.default.findOneAndUpdate({
                requestId: currentWithdrawal.requestId,
            }, {
                status: "APPROVED",
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/approveWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.OK);
        }));
    });
    describe("rejectWithdrawalRequest", () => {
        it("should return error for missing performedBy / withdrawalId / reason", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer)
                .post(`/api/v1/rejectWithdrawalRequest`)
                .expect(200);
            const validation = schema_1.withdrawalRejectionSchema.safeParse(response);
            expect(response.body).toEqual({ errMsg: validation.error.format() });
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED for invalid withdrawalId", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 151408,
                withdrawalId: 555,
                reason: "stay home",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.NOT_MODIFIED for invalid performedby", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 777,
                withdrawalId: 2,
                reason: "stay home",
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.NOT_MODIFIED);
        }));
        it("should return HttpStatusResponse.OK for valid performedby & withdrawalId & reason", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 151408,
                withdrawalId: 2,
                reason: "stay home",
            };
            const currentWithdrawal = yield Withdrawal_1.default.findOne({ withdrawalId: 2 });
            yield Request_1.default.findOneAndUpdate({
                requestId: currentWithdrawal.requestId,
            }, {
                status: "APPROVED",
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.OK);
        }));
        it("should return HttpStatusResponse.OK for valid performedby (temp) & withdrawalId & reason", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                performedBy: 151408,
                withdrawalId: 3,
                reason: "stay home",
            };
            yield Reassignment_1.default.findOneAndUpdate({ tempReportingManagerId: 151408 }, {
                status: "APPROVED",
                active: true,
            });
            const currentWithdrawal = yield Withdrawal_1.default.findOne({
                withdrawalId: 3,
            });
            yield Request_1.default.findOneAndUpdate({
                requestId: currentWithdrawal.requestId,
            }, {
                status: "APPROVED",
            });
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/rejectWithdrawalRequest")
                .send(requestBody)
                .expect(200);
            expect(response.text).toEqual(helpers_1.HttpStatusResponse.OK);
        }));
    });
});
