import httpStatus from 'http-status';

/**
 * Custom Error Class - This way we know when an error is thrown by our code and not by a library
 * And, yes, I decided to name it after my car
 * @param errorType
 * @param message
 */
export class HyundaiAccentError extends Error {
    constructor(errorType, message) {
        super(message);

        this.name = 'HyundaiAccentError';

        // Set the default HTTP status code to 500
        this.statusCode = errorType || 500;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

        this.status = errorType || 'Hyundai Accent Error';
    }
}

/**
 * Error types for HyundaiAccentError
 * @type {{MISSING_INPUTS: number, BAD_INPUTS: number, NOT_FOUND: number, GENERAL: number}}
 */
export const HyundaiAccentErrorTypes = {
    MISSING_INPUTS: httpStatus.BAD_REQUEST,
    BAD_INPUTS: httpStatus.BAD_REQUEST,
    NOT_FOUND: httpStatus.NOT_FOUND,
};

/**
 * Error messages for HyundaiAccentError
 * @type {{RESOURCE_NOT_FOUND: string, BAD_REQUEST: string}}
 */
export const ERROR_MESSAGES = {
    BAD_REQUEST: 'Bad request',
    RESOURCE_NOT_FOUND: 'Resource not found',
}