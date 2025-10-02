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
const LogDb_1 = __importDefault(require("./LogDb"));
jest.mock("@/models/Log", () => ({
    create: jest.fn(),
    aggregate: jest.fn(),
}));
describe("LogDb", () => {
    let logDb;
    beforeEach(() => {
        logDb = new LogDb_1.default();
        jest.clearAllMocks();
    });
    describe("logAction", () => {
        it("should call Log.create with the correct logAction", () => __awaiter(void 0, void 0, void 0, function* () {
            const logAction = { action: "CREATE", performedBy: "User1" };
            yield logDb.logAction(logAction);
            expect(Log_1.default.create).toHaveBeenCalledWith(logAction);
            expect(Log_1.default.create).toHaveBeenCalledTimes(1);
        }));
    });
    describe("getLogs", () => {
        it("should return formatted logs grouped by department and position", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockLogData = [
                {
                    dept: "HR",
                    position: "Manager",
                    logs: [
                        {
                            staffName: "John Doe",
                            action: "CREATE",
                            createdAt: new Date(),
                            logId: 1,
                        },
                        {
                            staffName: "Jane Doe",
                            action: "UPDATE",
                            createdAt: new Date(),
                            logId: 2,
                        },
                    ],
                },
                {
                    dept: "IT",
                    position: "Developer",
                    logs: [
                        {
                            staffName: "Jim Beam",
                            action: "DELETE",
                            createdAt: new Date(),
                            logId: 3,
                        },
                    ],
                },
            ];
            Log_1.default.aggregate.mockResolvedValue(mockLogData);
            const result = yield logDb.getLogs();
            expect(Log_1.default.aggregate).toHaveBeenCalledWith([
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
            // Check the result
            expect(result).toEqual({
                HR: {
                    Manager: [
                        {
                            staffName: "John Doe",
                            action: "CREATE",
                            createdAt: expect.any(Date),
                            logId: 1,
                        },
                        {
                            staffName: "Jane Doe",
                            action: "UPDATE",
                            createdAt: expect.any(Date),
                            logId: 2,
                        },
                    ],
                },
                IT: {
                    Developer: [
                        {
                            staffName: "Jim Beam",
                            action: "DELETE",
                            createdAt: expect.any(Date),
                            logId: 3,
                        },
                    ],
                },
            });
        }));
        it("should return an empty object if there are no logs", () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the aggregate method to return an empty array
            Log_1.default.aggregate.mockResolvedValue([]);
            const result = yield logDb.getLogs();
            expect(Log_1.default.aggregate).toHaveBeenCalled();
            expect(result).toEqual({});
        }));
    });
});
