export default class AppError extends Error {
    constructor(statusCode, statusText, msg) {
        super(msg);
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.msg = msg;
    }
}
