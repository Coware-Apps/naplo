import { Component } from "@angular/core";
import { MessageListItem } from "src/app/_models/eugy";
import { Subject } from "rxjs";
import { ConfigService, KretaEUgyService, FirebaseService } from "src/app/_services";
import { takeUntil } from "rxjs/operators";
import { PageState } from "src/app/_models";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHelper, DiacriticsHelper } from "src/app/_helpers";
import { AlertController } from "@ionic/angular";
import "hammerjs";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-message-folder",
    templateUrl: "./folder.page.html",
    styleUrls: ["./folder.page.scss"],
})
export class FolderPage {
    public folder: "inbox" | "outbox" | "deleted" = "inbox";
    private swipeRouterData = ["inbox", "outbox", "deleted"];
    private initNumberMessages: number = 15;
    private incrementNumberMessages: number = 5;

    private messages: MessageListItem[];
    public toBeDisplayed: MessageListItem[] = [];
    public displayedMessages: MessageListItem[] = [];

    public searchbarEnabled: boolean;
    public checkboxesShown: boolean;
    public numberOfSelectedItems: number = 0;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        public config: ConfigService,
        private eugy: KretaEUgyService,
        private router: Router,
        private route: ActivatedRoute,
        private errorHelper: ErrorHelper,
        private diacritics: DiacriticsHelper,
        private alertController: AlertController,
        private translate: TranslateService,
        private firebase: FirebaseService
    ) {}

    public async ionViewWillEnter() {
        this.firebase.setScreenName("messages_folder_" + this.folder);
        this.route.params
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(p => (this.folder = p.folder));

        this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            if (params.forceRefresh) this.loadMessages(true);
        });

        this.loadMessages();
    }

    public ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public async loadMessages(forceRefresh: boolean = false, event?) {
        if (!this.messages) this.pageState = PageState.Loading;
        this.loadingInProgress = true;

        this.eugy
            .getMessageList(this.folder, forceRefresh)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: x => {
                    this.messages = x;
                    if (this.messages.length == 0) {
                        this.pageState = PageState.Empty;
                        return;
                    }

                    this.resetDisplay();
                    this.pageState = PageState.Loaded;
                },
                error: e => {
                    if (!this.messages) {
                        this.pageState = PageState.Error;
                        this.exception = e;
                        e.handled = true;
                    }

                    this.loadingInProgress = false;
                    if (event) event.target.complete();
                    throw e;
                },
                complete: () => {
                    this.loadingInProgress = false;
                    if (event) event.target.complete();
                },
            });
    }

    public resetDisplay() {
        this.displayedMessages = [];
        this.toBeDisplayed = [...this.messages];
        this.displayMessages(this.initNumberMessages);
    }

    private displayMessages(number: number) {
        const temp = this.toBeDisplayed.splice(-number, number).reverse();
        this.displayedMessages.push(...temp);
    }

    public loadMoreData(event?) {
        this.displayMessages(this.incrementNumberMessages);

        if (event) {
            event.target.complete();

            if (this.messages.length <= 0 || this.displayMessages.length >= 150) {
                event.target.disabed = true;
            }
        }
    }

    public onSearchChange(event) {
        if (event.detail.value == "") {
            this.resetDisplay();
            return;
        }

        this.toBeDisplayed = this.messages.filter(x => {
            const search = this.diacritics.removeDiacritics(event.detail.value).toLowerCase();

            // subject
            if (this.diacritics.removeDiacritics(x.uzenetTargy).toLowerCase().includes(search))
                return true;

            // inbox -> sender
            if (
                x.uzenetFeladoNev &&
                x.uzenetFeladoTitulus &&
                (this.diacritics
                    .removeDiacritics(x.uzenetFeladoNev)
                    .toLowerCase()
                    .includes(search) ||
                    this.diacritics
                        .removeDiacritics(x.uzenetFeladoTitulus)
                        .toLowerCase()
                        .includes(search))
            )
                return true;

            // outbox -> recipient
            if (x.uzenetCimzettLista) {
                let recipientSearchString;
                x.uzenetCimzettLista.map(a => (recipientSearchString += a.nev));

                if (
                    this.diacritics
                        .removeDiacritics(recipientSearchString)
                        .toLowerCase()
                        .includes(search)
                )
                    return true;
            }
        });

        this.displayedMessages = [];
        this.displayMessages(this.initNumberMessages);
    }

    public toggleSearchbar(enabled?: boolean) {
        this.searchbarEnabled = enabled || !this.searchbarEnabled;

        if (!enabled) {
            this.resetDisplay();
        } else {
            this.firebase.logEvent("messages_folder_searchbar_opened");
        }
    }

    public openNewMsgPage() {
        this.firebase.logEvent("messages_new_message_fab_clicked");
        this.router.navigateByUrl("messages/compose");
    }

    public async binSelected(action: "put" | "remove") {
        const ids = this.displayedMessages.filter(x => x.isSelected).map(x => x.azonosito);
        await this.eugy.binMessages(action, ids).toPromise();
        this.firebase.logEvent("messages_folder_action_bin", { action: action });
        this.errorHelper.presentToast(
            action == "put"
                ? this.translate.instant("messages.folder.messages-recycled")
                : this.translate.instant("messages.folder.messages-restored")
        );
        this.resetCheckboxes();
        this.loadMessages(true);
    }

    public async deleteSelected() {
        const ids = this.displayedMessages.filter(x => x.isSelected).map(x => x.azonosito);

        const alert = await this.alertController.create({
            header: this.translate.instant("messages.folder.delete-permanently"),
            message: this.translate.instant("messages.folder.delete-permanently-desc"),
            buttons: [
                {
                    text: this.translate.instant("common.cancel"),
                    role: "cancel",
                    cssClass: "secondary",
                },
                {
                    text: this.translate.instant("messages.folder.delete"),
                    handler: async () => {
                        this.loadingInProgress = true;
                        await this.eugy.deleteMessages(ids).toPromise();
                        this.firebase.logEvent("messages_folder_action_delete");
                        this.loadingInProgress = false;

                        this.resetCheckboxes();
                        this.loadMessages(true);
                    },
                },
            ],
        });

        await alert.present();
    }

    public async setSelectedMessageState(state: "read" | "unread") {
        this.loadingInProgress = true;
        const ids = this.displayedMessages.filter(x => x.isSelected).map(x => x.azonosito);
        await this.eugy.changeMessageState(state, ids).toPromise();
        this.firebase.logEvent("messages_folder_state_change", { newState: state });

        this.loadingInProgress = false;
        this.errorHelper.presentToast(
            state == "read"
                ? this.translate.instant("messages.folder.set-as-read")
                : this.translate.instant("messages.folder.set-as-unread")
        );

        this.resetCheckboxes();
        this.loadMessages(true);
    }

    public async openMessage(message: MessageListItem) {
        if (!message.isElolvasva) {
            this.eugy
                .changeMessageState("read", [message.azonosito])
                .toPromise()
                .then(() => this.loadMessages(true));
        }

        this.firebase.logEvent("messages_folder_message_open");
        this.router.navigateByUrl("/messages/read/" + message.azonosito);
    }

    public messageTap(message: MessageListItem) {
        if (this.checkboxesShown) {
            message.isSelected = !message.isSelected;
            this.updateCheckboxToolbar();
            return;
        }

        this.openMessage(message);
    }

    public messagePress(message: MessageListItem) {
        this.checkboxesShown = true;
        this.messageTap(message);
        this.firebase.logEvent("messages_folder_longpress");
    }

    public updateCheckboxToolbar() {
        this.numberOfSelectedItems = this.displayedMessages.filter(x => x.isSelected).length;
        if (this.numberOfSelectedItems > 0) this.checkboxesShown = true;
        else this.checkboxesShown = false;
    }

    public resetCheckboxes() {
        this.displayedMessages.map(x => (x.isSelected = false));
        this.checkboxesShown = false;
        this.numberOfSelectedItems = 0;
    }

    public swipe(event) {
        if (event.direction === 2) {
            //swiped left, needs to load page to the right
            if (this.swipeRouterData.indexOf(this.folder) != 2) {
                this.router.navigateByUrl(
                    "messages/folder/" +
                        this.swipeRouterData[this.swipeRouterData.indexOf(this.folder) + 1]
                );
            }
            this.firebase.logEvent("messages_folder_swipe", { direction: "left" });
        } else {
            //swiped right, needs to load page to the left
            if (this.swipeRouterData.indexOf(this.folder) != 0) {
                this.router.navigateByUrl(
                    "messages/folder/" +
                        this.swipeRouterData[this.swipeRouterData.indexOf(this.folder) - 1]
                );
            }
            this.firebase.logEvent("messages_folder_swipe", { direction: "right" });
        }
    }
}
