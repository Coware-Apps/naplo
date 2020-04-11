import { Component, Input } from "@angular/core";
import { Lesson, Tanmenet, TanmenetElem, PageState } from "../../_models";
import { ModalController, Platform } from "@ionic/angular";
import {
    NetworkStatusService,
    ConnectionStatus,
    KretaService,
    ConfigService,
} from "../../_services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-curriculum-modal",
    templateUrl: "./curriculum-modal.page.html",
    styleUrls: ["./curriculum-modal.page.scss"],
})
export class CurriculumModalPage {
    @Input() public lesson: Lesson;
    public currentlyOffline: boolean;
    public curriculum: Tanmenet;
    public yearlyLessonCount: number = 0;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void>;

    constructor(
        public config: ConfigService,
        public platform: Platform,
        private modalController: ModalController,
        private networkStatus: NetworkStatusService,
        private kreta: KretaService
    ) {}

    async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();

        this.yearlyLessonCount =
            this.lesson.Allapot.Nev == "Naplozott"
                ? this.lesson.EvesOraszam
                : this.lesson.EvesOraszam + 1;

        this.loadData();

        this.networkStatus
            .onNetworkChange()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: status => {
                    this.currentlyOffline = status === ConnectionStatus.Offline;
                },
            });
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public loadData(forceRefresh: boolean = false) {
        this.pageState = PageState.Loading;
        this.loadingInProgress = true;

        this.kreta.getTanmenet(this.lesson, forceRefresh).subscribe({
            next: x => {
                this.pageState = x.Items.length == 0 ? PageState.Empty : PageState.Loaded;
                this.curriculum = x;
            },
            error: error => {
                if (!this.curriculum) {
                    this.pageState = PageState.Error;
                    this.exception = error;
                    error.handled = true;
                }

                this.loadingInProgress = false;
                throw error;
            },
            complete: () => (this.loadingInProgress = false),
        });
    }

    public save(t: TanmenetElem) {
        this.modalController.dismiss({ tanmenetElem: t });
    }

    public async dismiss() {
        this.modalController.dismiss();
    }
}
