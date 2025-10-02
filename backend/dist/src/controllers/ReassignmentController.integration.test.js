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
const Employee_1 = __importDefault(require("@/models/Employee"));
const Reassignment_1 = __importDefault(require("@/models/Reassignment"));
const utils_1 = require("@/tests/utils");
const fs_1 = require("fs");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const supertest_1 = __importDefault(require("supertest"));
const Log_1 = __importDefault(require("@/models/Log"));
jest.mock("nodemailer");
jest.unmock("mongoose");
jest.unmock("@/models/Reassignment");
jest.unmock("@/models/Employee");
jest.unmock("@/models/Log");
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
describe("Reassignment Integration Tests", () => {
    let mongoServer;
    let mockServer;
    const filePath = path_1.default.resolve("@/../script/reassignment.json");
    const fileContent = (0, fs_1.readFileSync)(filePath, "utf-8");
    const reassignments = JSON.parse(fileContent);
    const filePath2 = path_1.default.resolve("@/../script/employee.json");
    const fileContent2 = (0, fs_1.readFileSync)(filePath2, "utf-8");
    const employees = JSON.parse(fileContent2);
    const filePath3 = path_1.default.resolve("@/../script/log.json");
    const fileContent3 = (0, fs_1.readFileSync)(filePath3, "utf-8");
    const logs = JSON.parse(fileContent3);
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
        yield Reassignment_1.default.deleteMany();
        const REASSIGNMENT_LIMIT = 10;
        for (let i = 0; i < Math.min(REASSIGNMENT_LIMIT, reassignments.length); i++) {
            const reassignmentData = reassignments[i];
            reassignmentData.startDate = new Date(reassignmentData.startDate);
            reassignmentData.endDate = new Date(reassignmentData.endDate);
            yield Reassignment_1.default.create(reassignmentData);
        }
    }), 60000);
    describe("insertReassignmentRequest", () => {
        it("should not insert reassignment data to db if the date is today", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffId: 140001,
                startDate: new Date(),
                endDate: "2024-11-28",
                tempReportingManagerId: 150008,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/requestReassignment")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual({
                errMsg: helpers_1.errMsg.CURRENT_DATE_NOT_ALLOWED,
            });
        }));
        it("should not insert reassignment data to db if the date has passed", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffId: 140001,
                startDate: new Date(Date.now() - 86400000),
                endDate: "2024-11-28",
                tempReportingManagerId: 150008,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/requestReassignment")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual({
                errMsg: helpers_1.errMsg.PAST_DATE_NOT_ALLOWED,
            });
        }));
        it("should insert reassignment data to db if the date is tomorrow onwards", () => __awaiter(void 0, void 0, void 0, function* () {
            const requestBody = {
                staffId: 151408,
                startDate: new Date(Date.now() + 86400000),
                endDate: "2024-11-28",
                tempReportingManagerId: 130002,
            };
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/requestReassignment")
                .send(requestBody);
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual({});
        }));
    });
    describe("getReassignmentStatus", () => {
        it("should return an error for if there is missing header", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getReassignmentStatus");
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
        it("should return reassignment data for a valid staff id", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "140001";
            const expectedResponse = [
                {
                    staffId: 140001,
                    staffName: "Derek Tan",
                    startDate: "2024-09-29T00:00:00.000Z",
                    endDate: "2024-10-01T00:00:00.000Z",
                    originalManagerDept: "Engineering",
                    tempReportingManagerId: 150008,
                    tempManagerName: "Eric",
                    status: "PENDING",
                    active: null,
                    reassignmentId: 1,
                },
                {
                    staffId: 140001,
                    staffName: "Derek Tan",
                    startDate: "2024-09-29T00:00:00.000Z",
                    endDate: "2024-10-01T00:00:00.000Z",
                    originalManagerDept: "Engineering",
                    tempReportingManagerId: 151408,
                    tempManagerName: "Philip Lee",
                    status: "PENDING",
                    active: null,
                    reassignmentId: 2,
                },
            ];
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getReassignmentStatus")
                .set("id", id)
                .expect(200);
            expect(response.body).toStrictEqual(expectedResponse);
        }));
    });
    describe("getTempMgrReassignmentStatus", () => {
        it("should return an error if the header id is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getTempMgrReassignmentStatus");
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
    });
    describe("getIncomingReassignmentRequests", () => {
        it("should return an error if the header id is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getIncomingReassignmentRequests");
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
        it("should return incoming reassignment requests for a valid staff id", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "150008";
            const expectedResponse = [
                {
                    active: null,
                    endDate: "2024-10-01T00:00:00.000Z",
                    originalManagerDept: "Engineering",
                    reassignmentId: 1,
                    staffId: 140001,
                    staffName: "Derek Tan",
                    startDate: "2024-09-29T00:00:00.000Z",
                    status: "PENDING",
                    tempManagerName: "Eric",
                    tempReportingManagerId: 150008,
                },
            ];
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getIncomingReassignmentRequests")
                .set("id", id)
                .expect(200);
            const filteredResponse = response.body.map((_a) => {
                var { createdAt, updatedAt } = _a, rest = __rest(_a, ["createdAt", "updatedAt"]);
                return rest;
            });
            expect(filteredResponse).toStrictEqual(expectedResponse);
        }));
    });
    describe("handleReassignmentRequest", () => {
        it("should return an error if the header id is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/handleReassignmentRequest")
                .send({ reassignmentId: 1, action: "APPROVE" });
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
        it("should return an error if reassignmentId or action is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "150008";
            const response1 = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/handleReassignmentRequest")
                .set("id", id)
                .send({ action: "APPROVE" });
            expect(response1.body).toEqual({ error: helpers_1.errMsg.MISSING_PARAMETERS });
            const response2 = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/handleReassignmentRequest")
                .set("id", id)
                .send({ reassignmentId: 1 });
            expect(response2.body).toEqual({ error: helpers_1.errMsg.MISSING_PARAMETERS });
        }));
        it("should return an error for an invalid action", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "150008";
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/handleReassignmentRequest")
                .set("id", id)
                .send({ reassignmentId: 1, action: "INVALID_ACTION" });
            expect(response.body).toEqual({ error: helpers_1.errMsg.INVALID_ACTION });
        }));
        it("should successfully handle a reassignment request with APPROVE action", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "150008";
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/handleReassignmentRequest")
                .set("id", id)
                .send({ reassignmentId: 1, action: helpers_1.Action.APPROVE });
            expect(response.status).toBe(200);
        }));
        it("should successfully handle a reassignment request with REJECT action", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "150008";
            const response = yield (0, supertest_1.default)(mockServer)
                .post("/api/v1/handleReassignmentRequest")
                .set("id", id)
                .send({ reassignmentId: 1, action: helpers_1.Action.REJECT });
            expect(response.status).toBe(200);
        }));
    });
    describe("getSubordinateRequestsForTempManager", () => {
        it("should return an error if the header id is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(mockServer).get("/api/v1/getSubordinateRequestsForTempManager");
            expect(response.body).toEqual({ error: helpers_1.errMsg.MISSING_HEADER });
        }));
        it("should return an error if no active reassignments are found", () => __awaiter(void 0, void 0, void 0, function* () {
            const id = "150008";
            const response = yield (0, supertest_1.default)(mockServer)
                .get("/api/v1/getSubordinateRequestsForTempManager")
                .set("id", id);
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: helpers_1.errMsg.NO_ACTIVE_REASSIGNMENT });
        }));
    });
});
