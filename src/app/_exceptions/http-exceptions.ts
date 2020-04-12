import { NaploException } from "./naplo-exception";
import { HttpRequest, HttpErrorResponse } from "@angular/common/http";

export class NaploHttpException extends NaploException {
    public request: HttpRequest<any>;
    public response: HttpErrorResponse;

    constructor(
        request: HttpRequest<any>,
        response: HttpErrorResponse,
        messageTranslationKey?: string,
        nameTranslationKey?: string,
        iconName?: string
    ) {
        super(response.message, response.name, messageTranslationKey, nameTranslationKey, iconName);

        this.request = request;
        this.response = response;
    }

    toString() {
        let output: string[] = [super.toString()];

        if (this.request) {
            output.push(`\n---- HTTP Request ----`);
            output.push(`URL: ${this.request.method} ${this.request.urlWithParams}`);
            this.request.headers
                .keys()
                .filter(x => x != "Authorization")
                .forEach(h =>
                    output.push(`Header: ${h}: ${this.request.headers.getAll(h).join(";; ")}`)
                );
        }

        if (this.response) {
            output.push(`\n---- HTTP Response ----`);
            output.push(`HTTP Status: ${this.response.status} - ${this.response.statusText}`);
            output.push(`Message: ${this.response.message}`);
            output.push(`Error: ${this.response.error}`);

            if (this.response.error && typeof this.response.error === "object") {
                output.push(
                    `Stack: ${this.response.error.error ? this.response.error.error.stack : null}`
                );
                output.push(
                    `Text (500ch): ${
                        this.response.error.text ? this.response.error.text.slice(0, 500) : null
                    }`
                );
            }
        }

        return output.join("\n");
    }
}

export class NaploHttpInvalidResponseException extends NaploHttpException {
    constructor(request: HttpRequest<any>, response: HttpErrorResponse) {
        super(
            request,
            response,
            "exceptions.invalid-response.message",
            "exceptions.server-error",
            "hammer-outline"
        );
    }
}

export class NaploHttpInvalidRequestException extends NaploHttpException {
    constructor(request: HttpRequest<any>, response: HttpErrorResponse) {
        super(
            request,
            response,
            "exceptions.invalid-response.message",
            "exceptions.server-error",
            null
        );
    }
}

export class NaploHttpServerSideErrorException extends NaploHttpException {
    constructor(request: HttpRequest<any>, response: HttpErrorResponse) {
        super(
            request,
            response,
            "exceptions.server-side-error.message",
            "exceptions.server-error",
            "thunderstorm-outline"
        );
    }
}

export class NaploHttpUnauthorizedException extends NaploHttpException {
    constructor(request: HttpRequest<any>, response: HttpErrorResponse) {
        super(request, response, "exceptions.logged-out.message", "exceptions.logged-out.title");
    }
}
