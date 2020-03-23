import { Component, OnInit, Input } from "@angular/core";
import { Lesson, Tanmenet, TanmenetElem } from "../_models";
import { ModalController } from "@ionic/angular";
import { NetworkStatusService, ConnectionStatus, KretaService } from "../_services";
import { untilComponentDestroyed, OnDestroyMixin } from "@w11k/ngx-componentdestroyed";

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
        private kreta: KretaService
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
    }

    ngOnDestroy() {}

    save(t: TanmenetElem) {
        this.modalController.dismiss({ tanmenetElem: t });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
