import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import { Subscription, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class HwButtonService {
    constructor(private platform: Platform, private router: Router) {}

    public registerHwBackButton(unsubscribe$: Subject<void>, exit: boolean = false): Subscription {
        if (this.platform.is("android")) {
            return this.platform.backButton.pipe(takeUntil(unsubscribe$)).subscribe(() => {
                if (exit) navigator["app"].exitApp();
                else this.router.navigateByUrl("/timetable");
            });
        } else {
            return new Subscription();
        }
    }
}
