import { NaploException } from "./naplo-exception";
import { HttpErrorResponse } from "@angular/common/http";

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

    public toString() {
        let output: string[] = [super.toString()];

        if (this.innerException instanceof HttpErrorResponse) {
            output.push(`\n----- Inner Exception -----`);
            output.push(`Name: ${this.innerException.constructor.name}`);
            output.push(`Status: ${this.innerException.status} ${this.innerException.statusText}`);
            output.push(`Error: ${this.innerException.error}`);
        }

        return output.join("\n");
    }
}
