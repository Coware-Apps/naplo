import { HttpErrorResponse } from "@angular/common/http";

export class NaploException implements Error {
    public name: string;
    public message: string;
    public stack?: string;

    public innerException: Error;
    public nameTranslationKey: string;
    public messageTranslationKey: string;
    public iconName: string;
    public handled: boolean;

    constructor(
        message: string,
        name?: string,
        messageTranslationKey?: string,
        nameTranslationKey?: string,
        iconName?: string,
        innerException?: Error
    ) {
        this.name = name || "NaploException";
        this.nameTranslationKey = nameTranslationKey;
        this.message = message;
        this.messageTranslationKey = messageTranslationKey;
        this.iconName = iconName;
        this.innerException = innerException;

        this.stack = (<any>new Error()).stack;
    }

    toString() {
        let output: string[] = [];

        output.push(`Name: ${this.name}`);
        output.push(`Date: ${new Date().toISOString()}`);
        output.push(`Message: ${this.message}`);
        output.push(`InnerException: ${this.innerException}`);

        if (this.innerException instanceof HttpErrorResponse) {
            output.push(`\n----- Inner Exception -----`);
            output.push(`Name: ${this.innerException.name}`);
            output.push(`Status: ${this.innerException.status} ${this.innerException.statusText}`);
            output.push(`Error: ${this.innerException.error}`);
        }

        return output.join("\n");
    }
}
