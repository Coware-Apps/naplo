import { Component, ChangeDetectorRef } from "@angular/core";
import { Lesson } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    ConfigService,
    FirebaseService,
} from "../_services";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
    selector: "app-notlogged",
    templateUrl: "./notlogged.page.html",
    styleUrls: ["./notlogged.page.scss"],
})
export class NotloggedPage {
    public loading: boolean;
    public orak: Lesson[] = [];

    public napToCheck = 10;
    private subs: Subscription[] = [];

    constructor(
        private dateHelper: DateHelper,
        private kreta: KretaService,
        private errorHelper: ErrorHelper,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private config: ConfigService,
        private firebase: FirebaseService,
        private router: Router
    ) {}

    async ionViewWillEnter() {
        this.firebase.setScreenName("not_logged_lessons");

        this.loading = true;
        this.loadHianyzoOrak();

        this.subs.push(
            this.networkStatus.onNetworkChangeOnly().subscribe(x => {
                if (x === ConnectionStatus.Online) this.loadHianyzoOrak();
            })
        );
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    async loadHianyzoOrak(forceRefresh: boolean = false, $event?) {
        await this.firebase.startTrace("not_logged_lessons_load_time");

        this.orak = [];
        let map = new Map();
        for (let i = 0; i < this.napToCheck; i++) {
            let d = new Date(this.dateHelper.getDayFromToday(-i));
            this.subs.push(
                this.kreta.getTimetable(d, forceRefresh).subscribe(
                    x => {
                        x.forEach(ora => {
                            if (
                                ora.Allapot.Nev == "Nem_naplozott" &&
                                !ora.IsElmaradt &&
                                !map.has(ora.OrarendiOraId)
                            ) {
                                map.set(ora.OrarendiOraId, true);
                                this.orak.push(ora);
                            }
                        });

                        if (i == this.napToCheck - 1) {
                            this.loading = false;
                            this.cd.detectChanges();
                            this.firebase.stopTrace("not_logged_lessons_load_time");

                            if ($event) $event.target.complete();
                        }
                    },
                    e => {
                        throw e;
                    }
                )
            );
        }
    }

    async onLessonClick(l: Lesson) {
        this.firebase.logEvent("notlogged_lesson_clicked", {});

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.errorHelper.presentToast(
                "Nincs internetkapcsolat, ezért az óra most nem naplózható!"
            );

        this.router.navigate(["/logging-form"], { state: { lesson: l } });
    }
}
