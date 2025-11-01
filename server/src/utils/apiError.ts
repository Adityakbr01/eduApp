export type ErrorDetail = {
    path?: string;
    message: string;
};

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errors?: ErrorDetail[];
    public readonly context?: Record<string, unknown>;
    public readonly errorCode?: string;

    constructor({
        message,
        statusCode = 500,
        errors,
        context,
        errorCode,
        isOperational = true
    }: {
        message: string;
        statusCode?: number;
        errors?: ErrorDetail[];
        context?: Record<string, unknown>;
        errorCode?: string;
        isOperational?: boolean;
    }) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        this.context = context;
        this.errorCode = errorCode;
        Error.captureStackTrace?.(this, this.constructor);
    }
    toJSON() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            errorCode: this.errorCode,
            errors: this.errors,
            context: this.context,
            isOperational: this.isOperational,
        };
    }
}
