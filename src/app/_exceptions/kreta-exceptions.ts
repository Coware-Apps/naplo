import { NaploException } from "./naplo-exception";

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
