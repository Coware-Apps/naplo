export class KretaEUgyException extends Error {
    constructor(public message: string, name?: string) {
        super(message);
        this.name = name || "KretaException";
        this.message = message;
        this.stack = (<any>new Error()).stack;
    }
    toString() {
        return this.name + ": " + this.message;
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

export class KretaEUgyInvalidTokenResponseException extends KretaEUgyException {
    constructor() {
        super("Invalid response to token request.", "InvalidTokenResponseException");
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
