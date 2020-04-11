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
} from "src/app/_exceptions";

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            retry(1),
            catchError((error: HttpErrorResponse) => {
                // Status < 0 means network errors
                if (error.status < 0) return throwError(new NaploNetworkException(error));

                // HTTP 401: with invalid_grant
                if (error.status == 401 && error.error == "invalid_grant")
                    return throwError(new NaploHttpUnauthorizedException(req, error));

                // HTTP 400+, except 400 and 401 with invalid_grant
                if (error.status >= 401 && error.status < 500)
                    return throwError(new NaploHttpInvalidRequestException(req, error));

                // HTTP 500+
                if (error.status >= 500)
                    return throwError(new NaploHttpServerSideErrorException(req, error));

                if (error.error && error.error.error instanceof SyntaxError)
                    return throwError(new NaploHttpInvalidResponseException(req, error));

                // default
                return throwError(new NaploHttpException(req, error));
            })
        );
    }
}
