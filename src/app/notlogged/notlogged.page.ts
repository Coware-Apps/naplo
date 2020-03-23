import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import { Lesson } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    ConfigService,
    FirebaseService,
} from "../_services";
import { ModalController } from "@ionic/angular";
import { LoggingModalPage } from "../logging-modal/logging-modal.page";
import { takeUntil } from "rxjs/operators";
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";

@Component({
    selector: "app-notlogged",
    templateUrl: "./notlogged.page.html",
    styleUrls: ["./notlogged.page.scss"],
})
export class NotloggedPage extends OnDestroyMixin implements OnInit {
    public loading: boolean;
    public orak: Lesson[] = [];

    public napToCheck = 10;

    constructor(
        private dateHelper: DateHelper,
        private kreta: KretaService,
        public modalController: ModalController,
        private errorHelper: ErrorHelper,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private config: ConfigService,
        private firebase: FirebaseService
    ) {
        super();
    }

    ngOnInit(): void {
        this.firebase.setScreenName("not_logged_lessons");
        this.networkStatus
            .onNetworkChangeOnly()
            .pipe(untilComponentDestroyed(this))
            .subscribe(x => {
                if (x === ConnectionStatus.Online) this.loadHianyzoOrak();
            });
    }

    async ionViewWillEnter() {
        this.loading = true;
        this.loadHianyzoOrak();
    }

    async loadHianyzoOrak(forceRefresh: boolean = false, $event?) {
        await this.firebase.startTrace("not_logged_lessons_load_time");

        this.orak = [];
        let map = new Map();
        for (let i = 0; i < this.napToCheck; i++) {
            let d = new Date(this.dateHelper.getDayFromToday(-i));
            (await this.kreta.getTimetable(d, forceRefresh))
                .pipe(untilComponentDestroyed(this))
                .subscribe(
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
                        if (this.config.debugging) this.errorHelper.presentAlert(e);
                    }
                );
        }
    }

    async onLessonClick(c: Lesson) {
        this.firebase.logEvent("notlogged_lesson_clicked", {});

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.errorHelper.presentToast(
                "Nincs internetkapcsolat, ezért az óra most nem naplózható!"
            );

        const modal = await this.modalController.create({
            component: LoggingModalPage,
            backdropDismiss: false,
            componentProps: { lesson: c },
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data && data.success) this.loadHianyzoOrak();
    }
}
