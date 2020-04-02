import { Component, OnInit } from "@angular/core";
import { KretaEUgyService, ConfigService } from "src/app/_services";
import { MessageListItem } from "src/app/_models";

@Component({
    selector: "app-inbox",
    templateUrl: "./inbox.page.html",
    styleUrls: ["./inbox.page.scss"],
})
export class InboxPage implements OnInit {
    private messages: MessageListItem[];
    public displayedMessages: MessageListItem[] = [];

    public searchbarEnabled: boolean = false;
    public filteredMessages: MessageListItem[] = [];

    constructor(public config: ConfigService, private eugy: KretaEUgyService) {}

    public async ngOnInit() {
        this.messages = await this.eugy.getMessageList("inbox");
        this.displayMessages(this.messages, 20);
    }

    private displayMessages(list: MessageListItem[], number: number) {
        console.log("displaying: ", this.displayedMessages.length, number);

        const temp = list.slice(this.displayedMessages.length, number).reverse();
        this.displayedMessages.push(...temp);
    }

    public loadMoreData(event) {
        if (this.filteredMessages.length == 0) this.displayMessages(this.messages, 10);
        else this.displayMessages(this.filteredMessages, 10);

        event.target.complete();

        if (this.messages.length <= 0 || this.displayMessages.length >= 150) {
            event.target.disabed = true;
        }
    }

    public toggleSearchbar(enabled: boolean = true) {
        this.searchbarEnabled = enabled;

        if (!enabled) {
            this.displayMessages(this.messages, 20);
            this.filteredMessages = [];
        }
    }

    public onSearchChange(event) {
        console.log(event.detail.value);

        if (event.detail.value == "") {
            this.displayedMessages = [];
            this.displayMessages(this.messages, 20);
            return;
        }

        this.filteredMessages = this.messages.filter(
            x =>
                x.uzenetFeladoNev
                    .toLocaleLowerCase()
                    .includes(event.detail.value.toLocaleLowerCase()) ||
                x.uzenetFeladoTitulus
                    .toLocaleLowerCase()
                    .includes(event.detail.value.toLocaleLowerCase()) ||
                x.uzenetTargy.toLocaleLowerCase().includes(event.detail.value.toLocaleLowerCase())
        );

        this.displayedMessages = [];
        this.displayMessages(this.filteredMessages, 20);
    }
}
