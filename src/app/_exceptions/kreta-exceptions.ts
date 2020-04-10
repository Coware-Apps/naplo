import { NaploException } from "./naplo-exception";

export class KretaException extends NaploException {
    constructor(
        message: string,
        name?: string,
        messageTranslationKey?: string,
        nameTranslationKey?: string,
        iconName?: string
    ) {
        super(message, name, messageTranslationKey, nameTranslationKey, iconName);
    }
}

export class KretaInvalidPasswordException extends KretaException {
    constructor() {
        super(
            "Invalid username or bad password.",
            "InvalidPasswordException",
            "login.forgot-password",
            "login.bad-credentials"
        );
    }
}

export class KretaMissingRoleException extends KretaException {
    constructor() {
        super("Missing role.", "MissingRoleException");
    }
}
