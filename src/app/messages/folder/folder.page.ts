import { Component } from "@angular/core";
import { MessageListItem } from "src/app/_models/eugy";
import { Subject } from "rxjs";
import { ConfigService, KretaEUgyService } from "src/app/_services";
import { takeUntil } from "rxjs/operators";
import { PageState } from "src/app/_models";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHelper } from "src/app/_helpers";
import { AlertController } from "@ionic/angular";

@Component({
    selector: "app-message-folder",
    templateUrl: "./folder.page.html",
    styleUrls: ["./folder.page.scss"],
})
export class FolderPage {
    public folder: "inbox" | "outbox" | "deleted" = "inbox";
    private initNumberMessages: number = 15;
    private incrementNumberMessages: number = 5;

    private messages: MessageListItem[];
    public toBeDisplayed: MessageListItem[] = [];
    public displayedMessages: MessageListItem[] = [];

    public searchbarEnabled: boolean = false;
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
        private alertController: AlertController
    ) {}

    public async ionViewWillEnter() {
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
            const search = event.detail.value.toLocaleLowerCase();

            // subject
            if (x.uzenetTargy.toLocaleLowerCase().includes(search)) return true;

            // inbox -> sender
            if (
                x.uzenetFeladoNev &&
                x.uzenetFeladoTitulus &&
                (x.uzenetFeladoNev.toLocaleLowerCase().includes(search) ||
                    x.uzenetFeladoTitulus.toLocaleLowerCase().includes(search))
            )
                return true;

            // outbox -> recipient
            if (x.uzenetCimzettLista) {
                let recipientSearchString;
                x.uzenetCimzettLista.map(a => (recipientSearchString += a.nev));
                if (recipientSearchString.toLocaleLowerCase().includes(search)) return true;
            }
        });

        this.displayedMessages = [];
        this.displayMessages(this.initNumberMessages);
    }

    public toggleSearchbar(enabled: boolean = true) {
        this.searchbarEnabled = enabled;

        if (!enabled) {
            this.resetDisplay();
        }
    }

    public openNewMsgPage() {
        this.router.navigateByUrl("messages/new-message");
    }

    async binSelected(action: "put" | "remove") {
        const ids = this.displayedMessages.filter(x => x.isSelected).map(x => x.azonosito);
        await this.eugy.binMessages(action, ids).toPromise();
        this.errorHelper.presentToast(
            action == "put" ? "Az üzenetet a kukába helyeztük" : "Az üzenetet visszaállítottuk"
        );
        this.displayedMessages.map(x => {
            x.isSelected = false;
            return x;
        });

        // await this.userManager.currentUser.clearUserCacheByCategory(
        //     "administration.outboxMessageList"
        // );
        // await this.userManager.currentUser.clearUserCacheByCategory(
        //     "administration.inboxMessageList"
        // );
        // await this.userManager.currentUser.clearUserCacheByCategory(
        //     "administration.deletedMessageList"
        // );

        this.loadMessages(true);
    }

    async deleteSelected() {
        const ids = this.displayedMessages.filter(x => x.isSelected).map(x => x.azonosito);

        const alert = await this.alertController.create({
            header: "Biztos vagy benne?",
            message: "A törlés végleges, és nem vonható vissza!",
            buttons: [
                {
                    text: "Mégse",
                    role: "cancel",
                    cssClass: "secondary",
                },
                {
                    text: "Törlés",
                    handler: async () => {
                        await this.eugy.deleteMessages(ids).toPromise();

                        this.displayedMessages.map(x => {
                            x.isSelected = false;
                            return x;
                        });

                        // await this.userManager.currentUser.clearUserCacheByCategory(
                        //     "administration.deletedMessageList"
                        // );
                        this.loadMessages(true);
                    },
                },
            ],
        });

        await alert.present();
    }

    async setSelectedAsUnread() {
        const ids = this.displayedMessages.filter(x => x.isSelected).map(x => x.azonosito);

        await this.eugy.changeMessageState("unread", ids).toPromise();
        this.errorHelper.presentToast("Az üzenetet olvasottnak jelöltük");

        this.displayedMessages.map(x => {
            x.isSelected = false;
            return x;
        });

        // await this.userManager.currentUser.clearUserCacheByCategory(
        //     "administration.inboxMessageList"
        // );
        this.loadMessages(true);
    }

    async openMessage(message: MessageListItem) {
        if (!message.isElolvasva) {
            await this.eugy.changeMessageState("read", [message.azonosito]).toPromise();
            this.loadMessages(true);
        }

        this.router.navigateByUrl("/messages/read-message?messageId=" + message.azonosito);
    }
}
