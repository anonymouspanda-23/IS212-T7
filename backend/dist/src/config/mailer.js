"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
class Mailer {
    constructor() {
        this.transporter = null;
    }
    static getInstance() {
        if (!Mailer.instance) {
            Mailer.instance = new Mailer();
        }
        return Mailer.instance;
    }
    getTransporter() {
        if (this.transporter) {
            return this.transporter;
        }
        this.transporter = null;
        // this.transporter = nodemailer.createTransport({
        //   pool: true,
        //   host: String(process.env.SMTP_HOST),
        //   port: 587,
        //   secure: false,
        //   auth: {
        //     user: String(process.env.SMTP_AUTH_USER),
        //     pass: String(process.env.SMTP_AUTH_PASSWORD),
        //   },
        // });
        //
        // this.transporter.verify((error: Error | null, success: boolean) => {
        //   if (error) {
        //     throw new Error(error.message);
        //   }
        // });
        return this.transporter;
    }
}
exports.Mailer = Mailer;
Mailer.instance = null;
exports.default = Mailer;
