import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { KretaService } from "../kreta.service";
import { mergeMap } from "rxjs/operators";

@Injectable()
export class BearerTokenInterceptorService implements HttpInterceptor {
    constructor(private kreta: KretaService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add token only to kreta mobile api requests
        if (req.url.startsWith(this.kreta.institute.Url)) {
            return from(this.kreta.getValidAccessToken()).pipe(
                mergeMap(token => {
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    return next.handle(req);
                })
            );
        }

        return next.handle(req);
    }
}
