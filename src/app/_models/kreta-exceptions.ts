// declare global {
//     interface Error {
//         // stack: any;
//         type: KretaLoginExceptionType;
//     }
// }

export class KretaException extends Error {

    constructor(public message: string, name?: string) {
        super(message);
        this.name = name || 'KretaException';
        this.message = message;
        this.stack = (<any>new Error()).stack;
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}

export class KretaInvalidPasswordException extends KretaException {
    constructor() {
        super('Invalid username or bad password.', 'InvalidPasswordException');
    }
}

export class KretaMissingRoleException extends KretaException {
    constructor() {
        super('Missing role.', 'MissingRoleException');
    }
}
