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

        return output.join("\n");
    }
}
