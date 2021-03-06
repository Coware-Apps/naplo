import { NaploException } from "./naplo-exception";

export class KretaException extends NaploException {
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

export class KretaInvalidRefreshTokenException extends KretaException {
    constructor(innerException?: Error) {
        super(
            "Invalid refresh token.",
            "InvalidRefreshTokenException",
            "exceptions.logged-out.message",
            "exceptions.logged-out.title",
            undefined,
            innerException
        );
    }
}

export class KretaMissingRoleException extends KretaException {
    constructor() {
        super("Missing role.", "MissingRoleException");
    }
}

export class KretaNewSchoolYearException extends KretaException {
    constructor(innerException?: Error) {
        super(
            "The institution changed the active school year.",
            "NewSchoolYearException",
            "exceptions.new-school-year.message",
            "exceptions.new-school-year.title",
            "refresh-outline",
            innerException
        );
    }
}

export class KretaInvalidResponseException extends KretaException {
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
