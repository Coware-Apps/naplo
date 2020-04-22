import { Component } from "@angular/core";
import { KretaService, FirebaseService } from "../../_services";
import { Institute, PageState } from "../../_models";
import { ModalController, Platform } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DiacriticsHelper } from "src/app/_helpers";

@Component({
    selector: "app-institute-selector-modal",
    templateUrl: "./institute-selector-modal.page.html",
    styleUrls: ["./institute-selector-modal.page.scss"],
})
export class InstituteSelectorModalPage {
    public institutes: Institute[];
    public filteredInstitutes: Institute[];

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    private unsubscribe$: Subject<void>;

    constructor(
        public platform: Platform,
        private kreta: KretaService,
        private modalController: ModalController,
        private firebase: FirebaseService,
        private diacriticsHelper: DiacriticsHelper
    ) {}

    async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("institute_selector_modal");
        await this.firebase.startTrace("institute_list_loading_time");
        this.pageState = PageState.Loading;
        this.exception = null;

        this.kreta
            .getInstituteList()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: x => {
                    this.institutes = x;
                    this.filteredInstitutes = x;

                    this.pageState = x.length == 0 ? PageState.Empty : PageState.Loaded;
                    this.firebase.stopTrace("institute_list_loading_time");
                },
                error: error => {
                    if (!this.institutes) {
                        this.pageState = PageState.Error;
                        this.exception = error;
                        error.handled = true;
                    }

                    throw error;
                },
            });
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    doFilter($event) {
        const search = this.diacriticsHelper.removeDiacritics(
            $event.target.value.toLocaleLowerCase()
        );

        if (this.institutes)
            this.filteredInstitutes = this.institutes.filter(
                x =>
                    this.diacriticsHelper
                        .removeDiacritics(x.Name.toLocaleLowerCase())
                        .includes(search) ||
                    this.diacriticsHelper
                        .removeDiacritics(x.City.toLocaleLowerCase())
                        .includes(search) ||
                    x.InstituteCode.includes(search)
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
