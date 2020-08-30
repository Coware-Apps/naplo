import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import {
    NaploNetworkException,
    NaploHttpInvalidRequestException,
    NaploHttpServerSideErrorException,
    NaploHttpInvalidResponseException,
    NaploHttpException,
    NaploHttpUnauthorizedException,
    KretaInvalidPasswordException,
    KretaInvalidRefreshTokenException,
    KretaNewSchoolYearException,
} from "src/app/_exceptions";

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            retry(1),
            catchError((error: HttpErrorResponse) => {
                // console.debug("RAW ERROR", error);

                // Status < 0 means network errors
                if (error.status < 0) return throwError(new NaploNetworkException(error));

                // HTTP 400: comes from the IDP.
                // Bad password: comes with an error_description == "invalid_username_or_password"
                // Bad refresh_token: comes without error_description
                if (error.status == 400) {
                    if (
                        error.error &&
                        error.error.error_description &&
                        error.error.error_description == "invalid_username_or_password"
                    )
                        return throwError(new KretaInvalidPasswordException());
                    else if (error.error && error.error.error == "invalid_grant")
                        return throwError(new KretaInvalidRefreshTokenException(error));
                    else return throwError(new NaploHttpInvalidRequestException(req, error));
                }

                // HTTP 401: comes from API endpoints if wrong access_token is provided
                // at this point we already retried the request with a new token
                if (error.status == 401)
                    return throwError(new NaploHttpUnauthorizedException(req, error));

                // HTTP 400+, except 400 and 401
                if (error.status > 401 && error.status < 500)
                    return throwError(new NaploHttpInvalidRequestException(req, error));

                // HTTP 409 with specific exception
                if (error.status == 409 && error.message.includes("IntezmenyMarTanevetValtott"))
                    return throwError(new KretaNewSchoolYearException(error));

                // HTTP 500+
                if (error.status >= 500)
                    return throwError(new NaploHttpServerSideErrorException(req, error));

                if (error.error && error.error.error instanceof SyntaxError)
                    return throwError(new NaploHttpInvalidResponseException(req, error));

                // default
                if (error instanceof HttpErrorResponse)
                    return throwError(new NaploHttpException(req, error));

                return throwError(error);
            })
        );
    }
}
