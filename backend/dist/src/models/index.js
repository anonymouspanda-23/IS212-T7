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
const mongoose_1 = __importDefault(require("mongoose"));
const Employee_1 = __importDefault(require("./Employee"));
const Log_1 = __importDefault(require("./Log"));
const Reassignment_1 = __importDefault(require("./Reassignment"));
const Request_1 = __importDefault(require("./Request"));
const Withdrawal_1 = __importDefault(require("./Withdrawal"));
const getModels = () => __awaiter(void 0, void 0, void 0, function* () {
    // In case you using mongoose 6
    // https://mongoosejs.com/docs/guide.html#strictQuery
    mongoose_1.default.set("strictQuery", false);
    // Ensure connection is open so we can run migrations
    yield mongoose_1.default.connect(String(process.env.MIGRATE_MONGO_URI));
    // Return models that will be used in migration methods
    return {
        mongoose: mongoose_1.default,
        Employee: Employee_1.default,
        Request: Request_1.default,
        Withdrawal: Withdrawal_1.default,
        Reassignment: Reassignment_1.default,
        Log: Log_1.default,
    };
});
exports.default = getModels;
