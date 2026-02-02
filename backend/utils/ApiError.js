class ApiError extends Error {
    constructor(statusCode = 500, message = "something went wrong", error = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.data = null;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export default ApiError;