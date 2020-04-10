import { NaploException } from "./naplo-exception";

export class NaploNetworkException extends NaploException {
    constructor(innerException: Error) {
        super(
            "A network error occurred.",
            "NetworkException",
            "exceptions.network-exception.message",
            "exceptions.network-error",
            "cellular-outline",
            innerException
        );
    }
}
