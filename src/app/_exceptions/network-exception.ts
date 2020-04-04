import { NaploException } from "./naplo-exception";

export class NetworkException extends NaploException {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(
            message,
            "NetworkException",
            "exceptions.network-exception.message",
            "exceptions.network-error",
            "cellular-outline"
        );

        this.statusCode = statusCode;
    }
}
