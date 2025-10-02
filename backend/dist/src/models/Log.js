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
(0, counter_1.initializeCounter)("logId").catch(console.error);
const LogSchema = new Schema({
    logId: { type: Number, unique: true },
    performedBy: {
        type: Number,
        required: true,
    },
    staffName: { type: String, required: false },
    dept: { type: String, required: false },
    position: { type: String, required: false },
    reportingManagerId: { type: Number, required: false },
    managerName: { type: String, required: false },
    requestId: { type: Number, required: false },
    requestType: {
        type: String,
        required: true,
        enum: [helpers_1.Request.APPLICATION, helpers_1.Request.WITHDRAWAL, helpers_1.Request.REASSIGNMENT],
    },
    action: {
        type: String,
        required: true,
        enum: [
            helpers_1.Action.APPLY,
            helpers_1.Action.APPROVE,
            helpers_1.Action.RETRIEVE,
            helpers_1.Action.REJECT,
            helpers_1.Action.CANCEL,
            helpers_1.Action.REVOKE,
            helpers_1.Action.REASSIGN,
            helpers_1.Action.EXPIRE,
            helpers_1.Action.SET_INACTIVE,
            helpers_1.Action.SET_ACTIVE,
        ],
    },
    reason: { type: String, required: false },
}, {
    timestamps: true,
    versionKey: false,
});
LogSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            const counter = yield counter_1.Counter.findByIdAndUpdate("logId", { $inc: { seq: 1 } }, { new: true, upsert: true });
            this.logId = counter.seq;
        }
        next();
    });
});
LogSchema.index({ logId: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Log", LogSchema);
