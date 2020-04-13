import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { UserAgentInterceptorService } from "./user-agent-interceptor.service";
import { BearerTokenInterceptorService } from "./bearer-token-interceptor.service";
import { ErrorInterceptorService } from "./error-interceptor.service";

export const interceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: UserAgentInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
];
