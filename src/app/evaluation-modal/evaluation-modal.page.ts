import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from "@angular/core";
import { TanitottCsoport, OsztalyTanuloi } from "../_models";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { ModalController, LoadingController, AlertController, Platform } from "@ionic/angular";
import { ErtekelesComponent } from "../_components";
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-evaluation-modal",
    templateUrl: "./evaluation-modal.page.html",
    styleUrls: ["./evaluation-modal.page.scss"],
})
export class EvaluationModalPage extends OnDestroyMixin implements OnInit {
    @Input() public tanitottCsoport: TanitottCsoport;
    public osztalyTanuloi: OsztalyTanuloi;
    @ViewChild("ertekeles", { static: true }) private ertekeles: ErtekelesComponent;

    public currentlyOffline: boolean;

    constructor(
        private kreta: KretaService,
        public modalController: ModalController,
        public loadingController: LoadingController,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private alertController: AlertController,
        private translate: TranslateService,
        private platform: Platform
    ) {
        super();
    }

    async ngOnInit() {
        this.firebase.setScreenName("evaluation_modal");
        await this.firebase.startTrace("evaluation_modal_load_time");

        (await this.kreta.getOsztalyTanuloi(this.tanitottCsoport.OsztalyCsoportId))
            .pipe(untilComponentDestroyed(this))
            .subscribe(x => (this.osztalyTanuloi = x));

        this.firebase.stopTrace("evaluation_modal_load_time");

        this.networkStatus
            .onNetworkChange()
            .pipe(untilComponentDestroyed(this))
            .subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            });

        this.platform.backButton.pipe(untilComponentDestroyed(this)).subscribe(x => this.dismiss());
    }

    async save() {
        if (!(await this.ertekeles.isValid())) return;

        const loading = await this.loadingController.create({ message: "Mentés..." });
        await loading.present();
        await this.firebase.startTrace("evaluation_modal_post_time");
        const ertekelesSaveResult = await this.ertekeles.save();
        this.firebase.stopTrace("evaluation_modal_post_time");
        await loading.dismiss();

        if (ertekelesSaveResult) this.dismiss();
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
