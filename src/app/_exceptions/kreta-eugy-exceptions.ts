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

export class KretaEUgyInvalidPasswordException extends KretaEUgyException {
    constructor() {
        super("Invalid username or bad password.", "InvalidPasswordException");
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

export class KretaEUgyMessageAttachmentDownloadException extends KretaEUgyException {
    protected filename;

    constructor(error, filename) {
        super(error, "MessageAttachmentDownloadException");
        this.filename = filename;
    }

    toString() {
        return `${this.name} (${this.filename}): ${this.message}`;
    }
}
