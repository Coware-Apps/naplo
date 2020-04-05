import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { mergeMap } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable()
export class UserAgentInterceptorService implements HttpInterceptor {
    constructor(private appVersion: AppVersion) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // do not set UA on ngx-translator requests
        if (!req.url.startsWith("https")) {
            return next.handle(req);
        }

        return from(this.appVersion.getVersionNumber()).pipe(
            mergeMap(version => {
                req = req.clone({
                    setHeaders: {
                        "User-Agent": environment.userAgent.replace(
                            "%APP_VERSION_NUMBER%",
                            version
                        ),
                    },
                });

                console.debug("[HTTP INTERCEPTOR] UA set to req:", req);

                return next.handle(req);
            })
        );
    }
}
