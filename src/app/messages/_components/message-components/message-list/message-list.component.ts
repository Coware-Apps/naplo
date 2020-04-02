import { Component, OnInit, Input } from "@angular/core";
import { MessageListItem } from "src/app/_models";
import { ConfigService, KretaEUgyService } from "src/app/_services";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "app-message-list-component",
    templateUrl: "./message-list.component.html",
    styleUrls: ["./message-list.component.scss"],
})
export class MessageListComponent implements OnInit {
    @Input() private folder: "inbox" | "outbox" | "deleted" = "inbox";
    @Input() private initNumberMessages: number = 15;
    @Input() private incrementNumberMessages: number = 5;

    private messages: MessageListItem[];
    public toBeDisplayed: MessageListItem[] = [];
    public displayedMessages: MessageListItem[] = [];
    public componentState: BehaviorSubject<
        "loading" | "loaded" | "empty" | "error"
    > = new BehaviorSubject("loading");

    constructor(public config: ConfigService, private eugy: KretaEUgyService) {}

    public async ngOnInit() {
        await this.loadMessages();
    }

    public async loadMessages(force: boolean = false, event?) {
        this.componentState.next("loading");
        try {
            this.messages = await this.eugy.getMessageList(this.folder);
            if (event) event.target.complete();

            if (this.messages.length == 0) {
                this.componentState.next("empty");
                return;
            }

            this.resetDisplay();
            this.componentState.next("loaded");
        } catch (error) {
            this.componentState.next("error");
            throw error;
        }
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
        console.log(event.detail.value);

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
