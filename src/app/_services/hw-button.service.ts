import { Injectable, NgZone } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import { Subscription, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class HwButtonService {
    constructor(private platform: Platform, private router: Router, private ngZone: NgZone) {}

    public registerHwBackButton(unsubscribe$: Subject<void>, exit: boolean = false): Subscription {
        if (this.platform.is("android")) {
            return this.platform.backButton.pipe(takeUntil(unsubscribe$)).subscribe({
                next: () => {
                    if (exit) navigator["app"].exitApp();
                    else this.ngZone.run(() => this.router.navigateByUrl("/timetable"));
                },
            });
        } else {
            return new Subscription();
        }
    }
}
