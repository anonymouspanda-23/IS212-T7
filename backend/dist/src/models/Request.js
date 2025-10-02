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
const counter_1 = require("@/helpers/counter");
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
(0, counter_1.initializeCounter)("requestId").catch(console.error);
const RequestSchema = new Schema({
    requestId: { type: Number, unique: true },
    staffId: {
        type: Number,
        ref: "Employee",
        required: true,
    },
    staffName: { type: String, required: true },
    reportingManager: {
        type: Number,
        ref: "Employee",
        required: false,
    },
    managerName: { type: String, required: false },
    dept: { type: String, required: true },
    requestedDate: { type: Date, required: true },
    requestType: { type: String, required: true },
    position: { type: String, required: false },
    reason: { type: String, required: true },
    initiatedWithdrawal: { type: Boolean, required: false },
    status: {
        type: String,
        required: true,
        enum: [
            helpers_1.Status.PENDING,
            helpers_1.Status.APPROVED,
            helpers_1.Status.REJECTED,
            helpers_1.Status.CANCELLED,
            helpers_1.Status.WITHDRAWN,
            helpers_1.Status.REVOKED,
        ],
        default: helpers_1.Status.PENDING,
    },
}, {
    timestamps: true,
    versionKey: false,
});
RequestSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            const counter = yield counter_1.Counter.findByIdAndUpdate("requestId", { $inc: { seq: 1 } }, { new: true, upsert: true });
            this.requestId = counter.seq;
        }
        next();
    });
});
RequestSchema.index({ requestId: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Request", RequestSchema);
