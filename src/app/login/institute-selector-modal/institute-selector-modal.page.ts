import { Component } from "@angular/core";
import { KretaService, FirebaseService } from "../../_services";
import { Institute } from "../../_models";
import { ModalController, Platform } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
    selector: "app-institute-selector-modal",
    templateUrl: "./institute-selector-modal.page.html",
    styleUrls: ["./institute-selector-modal.page.scss"],
})
export class InstituteSelectorModalPage {
    public institutes: Institute[];
    public filteredInstitutes: Institute[];

    private subs: Subscription[] = [];

    constructor(
        public platform: Platform,
        private kreta: KretaService,
        private modalController: ModalController,
        private firebase: FirebaseService
    ) {}

    async ionViewWillEnter() {
        this.firebase.setScreenName("institute_selector_modal");
        await this.firebase.startTrace("institute_list_loading_time");

        this.subs.push(
            (await this.kreta.getInstituteList()).subscribe(x => {
                this.institutes = x;
                this.filteredInstitutes = x;
                this.firebase.stopTrace("institute_list_loading_time");
            })
        );
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    doFilter($event) {
        if (this.institutes)
            this.filteredInstitutes = this.institutes.filter(x =>
                x.Name.toLowerCase().includes($event.target.value.toLowerCase())
            );
    }

    onSelectionChange(instituteCode: string) {
        const selected = this.institutes.find(x => x.InstituteCode == instituteCode);
        this.kreta.institute = selected;
        this.modalController.dismiss({ selectedInstitute: selected });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
