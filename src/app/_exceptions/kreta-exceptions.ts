import { NaploException } from "./naplo-exception";
import { stringify } from "flatted/esm";

export class KretaException extends NaploException {
    constructor(message: string, ...params) {
        super(message, ...params);
    }
}

export class KretaInvalidPasswordException extends KretaException {
    constructor() {
        super("Invalid username or bad password.", "InvalidPasswordException");
    }
}

export class KretaMissingRoleException extends KretaException {
    constructor() {
        super("Missing role.", "MissingRoleException");
    }
}

export class KretaInvalidResponseException extends KretaException {
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

export class KretaInternalServerErrorException extends KretaException {
    public statusCode: number;
    constructor(statusCode: number, message: string) {
        super(
            message,
            "InternalServerError",
            "exceptions.server-side-error.message",
            "exceptions.server-error",
            "thunderstorm-online"
        );

        this.statusCode = statusCode;
    }
}
