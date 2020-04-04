import { NaploException } from "./naplo-exception";
import { stringify } from "flatted/esm";

export class KretaEUgyException extends NaploException {
    constructor(message, ...params) {
        super(message, ...params);
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
    public response: object;

    constructor(response?: object) {
        super(
            "Invalid response to token request. (" + stringify(response) + ")",
            "InvalidResponseException",
            "exceptions.eugy-invalid-response.message",
            "exceptions.server-error"
        );
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
