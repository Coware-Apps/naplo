import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { MessageListItem } from "src/app/_models";
import { ConfigService, KretaEUgyService } from "src/app/_services";
import { BehaviorSubject, Subscription } from "rxjs";

@Component({
    selector: "app-message-list-component",
    templateUrl: "./message-list.component.html",
    styleUrls: ["./message-list.component.scss"],
})
export class MessageListComponent implements OnInit, OnDestroy {
    @Input() private folder: "inbox" | "outbox" | "deleted" = "inbox";
    @Input() private initNumberMessages: number = 15;
    @Input() private incrementNumberMessages: number = 5;

    private messages: MessageListItem[];
    public toBeDisplayed: MessageListItem[] = [];
    public displayedMessages: MessageListItem[] = [];

    public componentState: BehaviorSubject<
        "loading" | "loaded" | "empty" | "error"
    > = new BehaviorSubject("loading");
    public exception: Error;
    private subs: Subscription[] = [];

    constructor(public config: ConfigService, private eugy: KretaEUgyService) {}

    public async ngOnInit() {
        await this.loadMessages();
    }

    public ngOnDestroy() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    public async loadMessages(forceRefresh: boolean = false, event?) {
        this.componentState.next("loading");
        this.exception = null;

        this.subs.push(
            (await this.eugy.getMessageList(this.folder, forceRefresh)).subscribe(
                x => {
                    this.messages = x;

                    if (event) event.target.complete();

                    if (this.messages.length == 0) {
                        this.componentState.next("empty");
                        return;
                    }

                    this.resetDisplay();
                    this.componentState.next("loaded");
                },
                e => {
                    if (!this.messages) {
                        this.componentState.next("error");
                        this.exception = e;
                        e.handled = true;
                    }
                    throw e;
                }
            )
        );
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
            this.displayedMessages = [];
            this.toBeDisplayed = [...this.messages];
            this.displayMessages(this.initNumberMessages);
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
}
