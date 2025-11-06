export class BaseError extends Error {
    statusCode: number;
    messageKey: string;
    messageParams?: Record<string, unknown>;

    constructor(statusCode: number, messageKey: string, messageParams?: Record<string, unknown>) {
        super();
        this.statusCode = statusCode;
        this.messageKey = messageKey;
        this.messageParams = messageParams;
    }
}

export class NotFoundError extends BaseError {
    constructor(resource?: string) {
        super(404, 'error.notFound', { resource });
    }
}

export class InternalServerError extends BaseError {
    constructor() {
        super(500, 'error.internalServer');
    }
}

export class BadRequestError extends BaseError {
    constructor(message?: string) {
        super(400, 'error.badRequest', { message });
    }
}
