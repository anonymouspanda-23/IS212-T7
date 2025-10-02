"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailer_1 = __importDefault(require("./mailer"));
jest.mock("nodemailer");
describe("Mailer", () => {
    let mailerInstance;
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.SMTP_HOST = "smtp.example.com";
        process.env.SMTP_AUTH_USER = "user@example.com";
        process.env.SMTP_AUTH_PASSWORD = "password";
    });
    it("should create a singleton instance of Mailer", () => {
        const firstInstance = mailer_1.default.getInstance();
        const secondInstance = mailer_1.default.getInstance();
        expect(firstInstance).toBe(secondInstance);
    });
    it("should create a transporter on first call to getTransporter", () => {
        const mockTransporter = { verify: jest.fn((cb) => cb(null, true)) };
        nodemailer_1.default.createTransport.mockReturnValue(mockTransporter);
        mailerInstance = mailer_1.default.getInstance();
        const transporter = mailerInstance.getTransporter();
        expect(transporter).toEqual(mockTransporter);
        expect(nodemailer_1.default.createTransport).toHaveBeenCalledWith({
            pool: true,
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_AUTH_USER,
                pass: process.env.SMTP_AUTH_PASSWORD,
            },
        });
        expect(mockTransporter.verify).toHaveBeenCalled();
    });
});
