import { Component, OnInit, Input } from "@angular/core";
import { Lesson, Tanmenet, TanmenetElem } from "../_models";
import { ModalController, Platform, AlertController } from "@ionic/angular";
import { NetworkStatusService, ConnectionStatus, KretaService } from "../_services";
import { untilComponentDestroyed, OnDestroyMixin } from "@w11k/ngx-componentdestroyed";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-curriculum-modal",
    templateUrl: "./curriculum-modal.page.html",
    styleUrls: ["./curriculum-modal.page.scss"],
})
export class CurriculumModalPage extends OnDestroyMixin implements OnInit {
    @Input() public lesson: Lesson;
    public currentlyOffline: boolean;
    public tanmenet: Tanmenet;
    public evesOraSorszam: number = 0;

    constructor(
        private modalController: ModalController,
        private networkStatus: NetworkStatusService,
        private kreta: KretaService,
        private platform: Platform,
        private alertController: AlertController,
        private translate: TranslateService
    ) {
        super();
    }

    async ngOnInit() {
        this.evesOraSorszam =
            this.lesson.Allapot.Nev == "Naplozott"
                ? this.lesson.EvesOraszam
                : this.lesson.EvesOraszam + 1;

        (await this.kreta.getTanmenet(this.lesson)).subscribe(x => (this.tanmenet = x));

        this.networkStatus
            .onNetworkChange()
            .pipe(untilComponentDestroyed(this))
            .subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
            });

        this.platform.backButton.pipe(untilComponentDestroyed(this)).subscribe(x => this.dismiss());
    }

    public save(t: TanmenetElem) {
        this.modalController.dismiss({ tanmenetElem: t });
    }

    public async dismiss() {
        const alert = await this.alertController.create({
            header: await this.translate.get("common.are-you-sure").toPromise(),
            message: await this.translate.get("common.data-will-be-lost").toPromise(),
            buttons: [
                {
                    text: await this.translate.get("common.cancel").toPromise(),
                    role: "cancel",
                    cssClass: "secondary",
                },
                {
                    text: await this.translate.get("common.exit").toPromise(),
                    handler: () => this.modalController.dismiss(),
                },
            ],
        });

        await alert.present();
    }
}
