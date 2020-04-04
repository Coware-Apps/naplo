export class NaploException extends Error {
    public nameTranslationKey: string;
    public messageTranslationKey: string;
    public iconName: string;
    public handled: boolean;

    constructor(
        message: string,
        name?: string,
        messageTranslationKey?: string,
        nameTranslationKey?: string,
        iconName?: string
    ) {
        super(message);

        this.name = name || "NaploException";
        this.nameTranslationKey = nameTranslationKey;
        this.message = message;
        this.messageTranslationKey = messageTranslationKey;
        this.iconName = iconName;

        this.stack = (<any>new Error()).stack;
    }
    toString() {
        return this.name + ": " + this.message;
    }
}
