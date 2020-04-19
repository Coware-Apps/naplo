import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import {
    AddresseeType,
    UniversalAddresseeListItem,
    AddresseeGroup,
    instanceOfAddresseeListItem,
    instanceOfParentAddresseeListItem,
    instanceOfStudentAddresseeListItem,
} from "src/app/_models/eugy";
import { KretaEUgyService, FirebaseService } from "src/app/_services";
import { ModalController } from "@ionic/angular";
import { PageState } from "src/app/_models";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { NaploException } from "src/app/_exceptions";
import { DiacriticsHelper } from "src/app/_helpers";

@Component({
    selector: "app-addressee-modal",
    templateUrl: "./addressee-modal.page.html",
    styleUrls: ["./addressee-modal.page.scss"],
})
export class AddresseeModalPage implements OnInit, OnDestroy {
    public addresseeTypes: AddresseeType[];
    public loadedAddresseeList: UniversalAddresseeListItem[];
    public filteredAddresseeList: UniversalAddresseeListItem[];

    @Input()
    public selectedAddresseeList: UniversalAddresseeListItem[];

    public classes: AddresseeGroup[];
    public groups: AddresseeGroup[];
    public displayedGroups: AddresseeGroup[];

    public filter: string;
    public showSearchbar = false;
    public currentType: string;
    public currentClassId: number;
    public currentGroupId: number;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void> = new Subject<void>();

    get allSelected(): boolean {
        if (!this.filteredAddresseeList) return false;
        return !this.filteredAddresseeList.filter(x => !x.isAdded);
    }
    set allSelected(value: boolean) {
        this.filteredAddresseeList.map(x => {
            x.isAdded = value;
            this.checkboxChanged(x, value);
        });
        this.firebase.logEvent("messages_selector_all_selected");
    }

    public addresseeTypesToSend: AddresseeType[] = [
        {
            azonosito: 1,
            kod: "GONDVISELO",
            rovidNev: "Gondviselő",
            nev: "Gondviselő",
            leiras: "Gondviselő",
        },
        {
            azonosito: 2,
            kod: "TANULO",
            rovidNev: "Tanuló",
            nev: "Tanuló",
            leiras: "Tanuló",
        },
        {
            azonosito: 3,
            kod: "OSZTALY_SZULO",
            rovidNev: "Osztály - Szülő",
            nev: "Osztály - Szülő",
            leiras: "Osztály - Szülő",
        },
        {
            azonosito: 4,
            kod: "OSZTALY_TANULO",
            rovidNev: "Osztály - Tanuló",
            nev: "Osztály - Tanuló",
            leiras: "Osztály - Tanuló",
        },
        {
            azonosito: 5,
            kod: "TANORAICSOPORT_SZULO",
            rovidNev: "Tanórai csoport - Szülő",
            nev: "Tanórai csoport - Szülő",
            leiras: "Tanórai csoport - Szülő",
        },
        {
            azonosito: 6,
            kod: "TANORAICSOPORT_TANULO",
            rovidNev: "Tanórai csoport - Tanuló",
            nev: "Tanórai csoport - Tanuló",
            leiras: "Tanórai csoport - Tanuló",
        },
        {
            azonosito: 7,
            kod: "IGAZGATOSAG",
            rovidNev: "Igazgatóság",
            nev: "Igazgatóság",
            leiras: "Igazgatóság",
        },
        {
            azonosito: 8,
            kod: "OSZTALYFONOK",
            rovidNev: "Osztályfőnök",
            nev: "Osztályfőnök",
            leiras: "Osztályfőnök",
        },
        {
            azonosito: 9,
            kod: "TANAR",
            rovidNev: "Tanár",
            nev: "Tanár",
            leiras: "Tanár",
        },
        {
            azonosito: 10,
            kod: "ADMIN",
            rovidNev: "Adminisztrátor",
            nev: "Adminisztrátor",
            leiras: "Adminisztrátor",
        },
        {
            azonosito: 11,
            kod: "SZMK_KEPVISELO",
            rovidNev: "SZMK képviselő",
            nev: "SZMK képviselő",
            leiras: "SZMK képviselő",
        },
    ];

    /** Connects the addressee types */
    public addresseeTypeBridge = {
        //TANAROK -> TANAR
        1: 9,
        //OSZTALYFONOKOK -> OSZTALYFONOK
        2: 8,
        //IGAZGATOSAG -> IGAZGATOSAG
        3: 7,
        //GONDVISELOK -> GONDVISELO
        4: 1,
        //TANULOK -> TANULO
        5: 2,
        //ADMINISZTRATOROK -> ADMIN
        6: 10,
        //SZMK_KEPVISELOK -> SZMK_KEPVISELO
        7: 11,
    };

    public codeRequestDict = {
        TANAROK: "teachers",
        OSZTALYFONOKOK: "headTeachers",
        IGAZGATOSAG: "directorate",
        GONDVISELOK: "tutelaries",
        TANULOK: "students",
        ADMINISZTRATOROK: "admins",
        SZMK_KEPVISELOK: "szmk",
    };

    constructor(
        private eugy: KretaEUgyService,
        private modalController: ModalController,
        private dicriticsHelper: DiacriticsHelper,
        private firebase: FirebaseService
    ) {}

    async ngOnInit() {
        // load the addressee type list
        this.eugy
            .getAddresseeTypeList()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: list => {
                    this.addresseeTypes = list;
                    this.pageState = list.length > 0 ? PageState.Loaded : PageState.Empty;

                    if (list.length > 0) {
                        this.currentType = list[0].kod;
                        this.typeChanged({ detail: { value: this.currentType } });
                    }
                },
                error: error => {
                    if (!this.addresseeTypes) {
                        this.pageState = PageState.Error;
                        this.exception = error;
                        error.handled = true;
                    }

                    this.loadingInProgress = false;
                    throw error;
                },
                complete: () => {
                    this.loadingInProgress = false;
                },
            });

        // if there are no previously selected addressees
        if (!this.selectedAddresseeList) this.selectedAddresseeList = [];
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async typeChanged($event) {
        let toCategory = $event.detail.value;
        console.log(toCategory);
        this.currentClassId = undefined;
        this.currentGroupId = undefined;

        if (!this.codeRequestDict[toCategory]) {
            throw new NaploException("Message Addressee Selector: nincs ilyen kategória");
        }

        this.loadingInProgress = true;
        if (toCategory != "GONDVISELOK" && toCategory != "TANULOK") {
            this.eugy
                .getAddresseListByCategory(this.codeRequestDict[toCategory])
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                    next: list => this.loadAddressees(list),
                    error: error => {
                        this.loadingInProgress = false;
                        throw error;
                    },
                    complete: () => (this.loadingInProgress = false),
                });
        } else {
            this.loadAddressees([]);

            this.eugy
                .getAddresseeGroups(toCategory, "classes")
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                    next: x => {
                        this.classes = x;
                    },
                    error: error => {
                        this.loadingInProgress = false;
                        throw error;
                    },
                    complete: () => (this.loadingInProgress = false),
                });

            this.eugy
                .getAddresseeGroups(toCategory, "groups")
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                    next: x => {
                        this.groups = x;
                        this.displayedGroups = this.groups.filter(g => !g.osztalyKretaAzonosito);
                    },
                    error: error => {
                        this.loadingInProgress = false;
                        throw error;
                    },
                    complete: () => (this.loadingInProgress = false),
                });
        }
    }

    async subTypeChanged(subTypeName: "byClasses" | "byGroups", $event) {
        const toSubType = $event.detail.value;
        this.loadingInProgress = true;

        if (!this.currentClassId && !this.currentGroupId) return;
        if (!toSubType) return;

        if (subTypeName == "byClasses") {
            this.currentGroupId = null;
            this.displayedGroups = this.groups.filter(g => g.osztalyKretaAzonosito == toSubType);
        }

        this.eugy
            .getStudentsOrParents(this.codeRequestDict[this.currentType], subTypeName, toSubType)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: list => this.loadAddressees(list),
                error: error => {
                    this.loadingInProgress = false;
                    throw error;
                },
                complete: () => (this.loadingInProgress = false),
            });
    }

    private loadAddressees(list: UniversalAddresseeListItem[]) {
        if (!list) return;

        this.loadedAddresseeList = list.map(x => {
            if (this.selectedAddresseeList.find(y => y.kretaAzonosito == x.kretaAzonosito))
                x.isAdded = true;
            return x;
        });

        this.toggleSearchbar(false);
    }

    getName(a) {
        if (instanceOfAddresseeListItem(a)) {
            return a.nev;
        } else if (instanceOfParentAddresseeListItem(a)) {
            return a.gondviseloNev;
        } else if (instanceOfStudentAddresseeListItem(a)) {
            return a.vezetekNev + " " + a.keresztNev;
        }
    }

    checkboxChanged(model: UniversalAddresseeListItem, $event) {
        const typeId = this.addresseeTypes.find(x => x.kod == this.currentType).azonosito;
        model.tipus = this.addresseeTypesToSend.find(
            x => x.azonosito == this.addresseeTypeBridge[typeId]
        );

        if (model.isAdded) {
            this.selectedAddresseeList.push(model);
        } else {
            this.selectedAddresseeList.splice(
                this.selectedAddresseeList.findIndex(x => x.kretaAzonosito == model.kretaAzonosito),
                1
            );
        }
    }

    doFilter($event) {
        this.filteredAddresseeList = this.loadedAddresseeList.filter(x => {
            if ($event.target.value) {
                return this.dicriticsHelper
                    .removeDiacritics(this.getName(x))
                    .toLowerCase()
                    .includes(
                        this.dicriticsHelper.removeDiacritics($event.target.value).toLowerCase()
                    );
            } else return true;
        });
    }

    toggleSearchbar(enabled: boolean) {
        if (!enabled) {
            this.filter = null;
            this.filteredAddresseeList = this.loadedAddresseeList;
        } else {
            this.firebase.logEvent("messages_selector_searchbar_opened");
        }

        this.showSearchbar = enabled;
    }

    closeModal() {
        this.modalController.dismiss({ addresseeList: this.selectedAddresseeList });
    }
}
