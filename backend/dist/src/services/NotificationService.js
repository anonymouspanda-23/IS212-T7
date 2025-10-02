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
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@/helpers");
class NotificationService {
    // private mailer: Mailer;
    constructor(employeeService, mailer) {
        this.employeeService = employeeService;
        // this.mailer = mailer;
    }
    getManagerDetails(managerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const managerDetails = yield this.employeeService.getEmployee(managerId);
            if (!managerDetails)
                throw new Error("Manager details not found");
            return {
                name: `${managerDetails.staffFName} ${managerDetails.staffLName}`,
                email: managerDetails.email,
                dept: managerDetails.dept,
                position: managerDetails.position,
            };
        });
    }
    createEmailContent(manager, requestType, requestDates, requestReason) {
        if (requestDates.length === 0) {
            throw new Error("No dates to send");
        }
        const textBody = this.createTextBody(manager, requestType, requestDates, requestReason);
        const htmlBody = this.createHtmlBody(manager, requestType, requestDates, requestReason);
        return { text: textBody, html: htmlBody };
    }
    createTextBody(manager, requestType, requestDates, requestReason) {
        let textBody = `Your ${requestType.toLowerCase()} for the following dates have been sent to ${manager.name}, ${manager.email} (${manager.dept} - ${manager.position}):\n`;
        requestDates.forEach(([date, type]) => {
            textBody += `${date}, ${type}\n`;
        });
        textBody += `\nReason: ${requestReason}\n`;
        return textBody;
    }
    createHtmlBody(manager, requestType, requestDates, requestReason) {
        const tableRows = requestDates
            .map(([date, type], index) => `
    <tr>
      <td style="border: 1px solid black; border-collapse: collapse;">${date}</td>
      <td style="border: 1px solid black; border-collapse: collapse;">${type}</td>
      ${index === 0 ? `<td style="border: 1px solid black; border-collapse: collapse;" rowspan="${requestDates.length}">${requestReason}</td>` : ""}
    </tr>
  `)
            .join("");
        return `
    <html>
      <head></head>
      <body>
        <p>Your ${requestType.toLowerCase()} for the following dates have been sent to ${manager.name}, <a href="mailto:${manager.email}">${manager.email}</a> (${manager.dept} - ${manager.position}).</p>
        <table style="border: 1px solid black; border-collapse: collapse;">
          <tr>
            <th style="border: 1px solid black; border-collapse: collapse;">Requested Dates</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Duration</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Reason</th>
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>
  `;
    }
    sendEmail(emailSubject, staffEmail, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // const transporter = this.mailer.getTransporter();
            // const staffName = staffEmail.split("@")[0];
            //
            // const mailOptions = {
            //   from: "noreply@lurence.org",
            //   to: `${staffName}@yopmail.com`,
            //   subject: emailSubject,
            //   text: content.text,
            //   html: content.html,
            // };
            //
            // await transporter.sendMail(mailOptions);
        });
    }
    pushRequestSentNotification(emailSubject, staffEmail, managerId, requestType, requestDates, requestReason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const managerDetails = yield this.getManagerDetails(managerId);
                const emailContent = this.createEmailContent(managerDetails, `WFH ${requestType}`, requestDates, requestReason);
                yield this.sendEmail(emailSubject, staffEmail, emailContent);
                return "Email sent successfully!";
            }
            catch (error) {
                return helpers_1.errMsg.FAILED_TO_SEND_EMAIL;
            }
        });
    }
    notify(approveEmail, emailSubject, emailBodyContent, dateRange, requestedDates) {
        return __awaiter(this, void 0, void 0, function* () {
            let emailContentHtml;
            if (requestedDates) {
                emailContentHtml = this.notifHtmlBody(null, requestedDates, emailBodyContent);
            }
            else if (dateRange) {
                emailContentHtml = this.notifHtmlBody(dateRange, null, emailBodyContent);
            }
            try {
                const emailContent = { text: "", html: emailContentHtml };
                yield this.sendEmail(emailSubject, approveEmail, emailContent);
                return true;
            }
            catch (error) {
                return helpers_1.errMsg.FAILED_TO_SEND_EMAIL;
            }
        });
    }
    notifHtmlBody(dateRange, requestedDates, emailBodyContent) {
        let tableRows;
        let tableHeader;
        if (requestedDates) {
            tableHeader = `<th style="border: 1px solid black; border-collapse: collapse;">Duration</th>`;
            tableRows = requestedDates
                .map(([date, type]) => `
        <tr>
            <td style="border: 1px solid black; border-collapse: collapse;">${date}</td>
            <td style="border: 1px solid black; border-collapse: collapse;">${type}</td>
        </tr>
    `)
                .join("");
        }
        else if (dateRange) {
            const [startDate, endDate] = dateRange;
            tableHeader = "";
            tableRows = `
    <tr>
      <td style="border: 1px solid black; border-collapse: collapse;">${startDate} to ${endDate}</td>
    </tr>
  `;
        }
        return `
    <html>
       <p>${emailBodyContent}</p>
      <body>
        <table style="border: 1px solid black; border-collapse: collapse;">
          <tr>
            <th style="border: 1px solid black; border-collapse: collapse;">Requested Dates</th>
            ${tableHeader}
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>
  `;
    }
}
exports.default = NotificationService;
