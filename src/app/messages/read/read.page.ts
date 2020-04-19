import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Subject } from "rxjs";
import { DataService, KretaEUgyService, ConfigService } from "src/app/_services";
import { Router, ActivatedRoute } from "@angular/router";
import { Message } from "src/app/_models/eugy";
import { PageState } from "src/app/_models";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { takeUntil } from "rxjs/operators";
import { ErrorHelper } from "src/app/_helpers";
import { Location } from "@angular/common";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-read",
    templateUrl: "./read.page.html",
    styleUrls: ["./read.page.scss"],
})
export class ReadPage implements OnInit {
    public messageId: number;
    public message: Message;
    public sentDate: Date;
    public addresseeList: string;
    public attachmentsEnabled: boolean;

    public pageState: PageState = PageState.Loading;
    public loadingInProgress: boolean;
    public exception: Error;

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        public data: DataService,
        public config: ConfigService,
        private eugy: KretaEUgyService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private firebase: FirebaseX,
        private errorHelper: ErrorHelper,
        private alertController: AlertController,
        private fileOpener: FileOpener,
        private changeDetector: ChangeDetectorRef,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.route.params.subscribe(p => (this.messageId = p.messageId));
    }

    async ionViewWillEnter() {
        this.firebase.setScreenName("message-read");

        this.pageState = PageState.Loading;
        this.eugy
            .getMessage(this.messageId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: message => {
                    this.message = message;
                    this.sentDate = new Date(message.uzenet.kuldesDatum);
                    this.addresseeList = message.uzenet.cimzettLista
                        .map(x =>
                            this.eugy.currentUser["kreta:institute_user_id"] == x.kretaAzonosito
                                ? this.translate.instant("messages.read.me")
                                : x.nev
                        )
                        .join(", ");
                    this.pageState = PageState.Loaded;
                },
                error: error => {
                    if (!this.message) {
                        this.pageState = PageState.Error;
                        this.exception = error;
                        error.handled = true;
                    }

                    this.loadingInProgress = false;
                    throw error;
                },
                complete: () => {
                    this.loadingInProgress = false;
                    this.attachmentsEnabled = true;
                },
            });
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    replyToMsg() {
        this.router.navigateByUrl("messages/compose", { state: { replyToMsg: this.message } });
    }

    forwardMsg() {
        this.router.navigateByUrl("messages/compose", {
            state: { forwardedMsg: this.message },
        });
    }

    showStatusInfo() {
        this.errorHelper.presentAlert(
            `Azonosító: ${this.message.azonosito}<br>` +
                `Státusz: ${this.message.uzenet.statusz.azonosito} (${this.message.uzenet.statusz.leiras})<br>` +
                `Hibakód: ${this.message.uzenet.hibaCorrellationId}`,
            undefined,
            this.translate.instant("messages.read.not-delivered")
        );
    }

    async binMsg(action: "put" | "remove") {
        await this.eugy.binMessages(action, [this.message.azonosito]).toPromise();
        this.errorHelper.presentToast(
            action == "put"
                ? this.translate.instant("messages.read.message-recycled")
                : this.translate.instant("messages.read.message-restored")
        );

        this.location.back();
    }

    async deleteMsg() {
        const alert = await this.alertController.create({
            header: this.translate.instant("messages.read.delete-permanently"),
            message: this.translate.instant("messages.read.delete-permanently-desc"),
            buttons: [
                {
                    text: this.translate.instant("common.cancel"),
                    role: "cancel",
                    cssClass: "secondary",
                },
                {
                    text: this.translate.instant("messages.read.delete"),
                    handler: async () => {
                        this.loadingInProgress = true;
                        await this.eugy.deleteMessages([this.messageId]).toPromise();
                        this.loadingInProgress = false;

                        this.location.back();
                    },
                },
            ],
        });

        await alert.present();
    }

    async setAsUnread() {
        this.loadingInProgress = true;
        await this.eugy.changeMessageState("unread", [this.message.azonosito]).toPromise();
        this.loadingInProgress = false;
        this.errorHelper.presentToast(this.translate.instant("messages.read.set-as-unread"));
        this.location.back();
    }

    async getFile(id: number, fullName: string) {
        let attachment = this.message.uzenet.csatolmanyok.find(x => x.azonosito == id);
        this.loadingInProgress = true;

        try {
            const fileEntry = await this.eugy.getAttachment(id, fullName, event => {
                if (event.lengthComputable) {
                    attachment.downloadProgressPercent = event.loaded / event.total;
                    this.changeDetector.detectChanges();
                }
            });

            fileEntry.file(file => {
                this.fileOpener.showOpenWithDialog(fileEntry.nativeURL, file.type);
            });
            attachment.isDownloadFailed = false;
        } catch (error) {
            attachment.isDownloadFailed = true;
            throw error;
        } finally {
            attachment.downloadProgressPercent = undefined;
            this.loadingInProgress = false;
        }
    }
}
