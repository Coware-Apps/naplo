import { NaploException } from "./naplo-exception";

export class KretaEUgyException extends NaploException {
    constructor(
        message: string,
        name?: string,
        messageTranslationKey?: string,
        nameTranslationKey?: string,
        iconName?: string,
        innerException?: Error
    ) {
        super(message, name, messageTranslationKey, nameTranslationKey, iconName, innerException);
    }
}

export class KretaEUgyNotLoggedInException extends KretaEUgyException {
    constructor() {
        super("No logged in user.", "NotLoggedInException");
    }
}

export class KretaEUgyInvalidResponseException extends KretaEUgyException {
    public response: any;

    constructor(response?: any) {
        super(
            "Invalid response.",
            "InvalidResponseException",
            "exceptions.invalid-response.message",
            "exceptions.server-error",
            "hammer-outline"
        );

        this.response = response;
    }

    toString(): string {
        return super.toString() + "\nResponse: " + JSON.stringify(this.response);
    }
}

export class KretaEUgyMessageAttachmentException extends KretaEUgyException {
    protected filename;
    protected code;
    protected http_status;
    protected response_body;

    constructor(
        error,
        filename: string,
        code?: number,
        http_status?: number,
        response_body?: string
    ) {
        super(
            error,
            "MessageAttachmentException",
            "exceptions.file-transfer.message",
            "exceptions.file-transfer.title",
            "code-download-outline"
        );
        this.filename = filename;
        this.code = code;
        this.http_status = http_status;
        this.response_body = response_body;
    }

    toString(): string {
        return (
            super.toString() +
            `\n\n` +
            `File name: ${this.filename} \n` +
            `Code: ${this.code}\n` +
            `HTTP status: ${this.http_status}\n` +
            `Response body: ${this.response_body ? this.response_body.slice(0, 500) : null}\n`
        );
    }
}
