import { Component, ChangeDetectorRef } from "@angular/core";
import {
    AddresseeListItem,
    instanceOfAddresseeListItem,
    instanceOfParentAddresseeListItem,
    instanceOfStudentAddresseeListItem,
    MessageAttachmentToSend,
    Message,
    MessageAddressee,
} from "src/app/_models/eugy";
import { Subject } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import {
    KretaEUgyService,
    ConfigService,
    FirebaseService,
    NetworkStatusService,
    ConnectionStatus,
} from "src/app/_services";
import {
    LoadingController,
    ModalController,
    Platform,
    MenuController,
    PopoverController,
} from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { IDirty } from "src/app/_models";
import { map, takeUntil } from "rxjs/operators";
import { ErrorHelper } from "src/app/_helpers";
import { AddresseeModalPage } from "./addressee-modal/addressee-modal.page";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { IOSFilePicker } from "@ionic-native/file-picker/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { KretaEUgyMessageAttachmentException } from "src/app/_exceptions";
import { AttachmentOptionsComponent } from "./attachment-options/attachment-options.component";

@Component({
    selector: "app-compose",
    templateUrl: "./compose.page.html",
    styleUrls: ["./compose.page.scss"],
})
export class ComposePage implements IDirty {
    public text: string;
    public subject: string;
    public addresseeList: AddresseeListItem[] = [];
    public attachmentList: MessageAttachmentToSend[] = [];
    public allowNavigationTo = ["/messages/addressee-selector", "/messages/list-addressees"];
    private _isDirty = false;

    public loadingInProgress: boolean = false;
    public currentlyOffline: boolean = false;
    public currentlyUploading: MessageAttachmentToSend;
    private unsubscribe$: Subject<void>;

    //replies and forwarding
    public prevMsgId: number;
    public prevMsgText: string = "";
    public prevMsgShown: boolean;

    constructor(
        public config: ConfigService,
        private router: Router,
        private route: ActivatedRoute,
        private loadingCtrl: LoadingController,
        private modalController: ModalController,
        private translator: TranslateService,
        private eugy: KretaEUgyService,
        private firebase: FirebaseService,
        private errorHelper: ErrorHelper,
        private platform: Platform,
        private camera: Camera,
        private androidChooser: FileChooser,
        private iosChooser: IOSFilePicker,
        private filePath: FilePath,
        private changeDetector: ChangeDetectorRef,
        private menuController: MenuController,
        private networkStatus: NetworkStatusService,
        private popoverController: PopoverController
    ) {}

    public ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("messages_compose");
        this.menuController.swipeGesture(false);

        this.route.paramMap
            .pipe(map(() => window.history.state))
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: state => {
                    if (state.replyToMsg || state.forwardedMsg) {
                        let prevMsg: Message = state.replyToMsg
                            ? state.replyToMsg
                            : state.forwardedMsg;

                        this.prevMsgText =
                            "<br><br>--------------------<br>" +
                            `${this.translator.instant("messages.compose.from")}: ${
                                prevMsg.uzenet.feladoNev
                            } (${prevMsg.uzenet.feladoTitulus})<br>` +
                            `${this.translator.instant("messages.compose.sent-at")}: ${new Date(
                                prevMsg.uzenet.kuldesDatum
                            ).toLocaleString(this.config.locale, {
                                //@ts-ignore
                                dateStyle: "short",
                                timeStyle: "short",
                            })}<br>` +
                            `${this.translator.instant("messages.compose.label-subject")}: ${
                                prevMsg.uzenet.targy
                            }<br><br>` +
                            prevMsg.uzenet.szoveg;

                        if (state.replyToMsg) {
                            this.prevMsgId = prevMsg.uzenet.azonosito;

                            const prefix =
                                prevMsg.uzenet.targy.indexOf("Válasz:") == 0 ||
                                prevMsg.uzenet.targy.indexOf("Reply:") == 0
                                    ? ""
                                    : this.translator.instant("messages.compose.reply-prefix") +
                                      ": ";

                            this.subject = prefix + prevMsg.uzenet.targy;

                            this.addresseeList.push({
                                isAlairo: null,
                                kretaAzonosito: null,
                                nev: prevMsg.uzenet.feladoNev,
                                titulus: prevMsg.uzenet.feladoTitulus,
                                isAdded: null,
                                oktatasiAzonosito: null,
                                tipus: null,
                            });
                        } else if (state.forwardedMsg) {
                            let prevMsg: Message = state.forwardedMsg;

                            const prefix =
                                prevMsg.uzenet.targy.indexOf("Továbbítva:") == 0 ||
                                prevMsg.uzenet.targy.indexOf("Fwd:") == 0
                                    ? ""
                                    : this.translator.instant("messages.compose.forward-prefix") +
                                      ": ";

                            this.subject = prefix + prevMsg.uzenet.targy;

                            prevMsg.uzenet.csatolmanyok.forEach(a => {
                                this.attachmentList.push({
                                    azonosito: a.azonosito,
                                    fajlNev: a.fajlNev,
                                    fajl: null,
                                    iktatoszam: null,
                                });
                            });
                        }
                    }
                },
            });

        this.networkStatus
            .onNetworkChange()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: status => {
                    this.currentlyOffline = status === ConnectionStatus.Offline;
                },
            });
    }

    public ionViewWillLeave() {
        this.menuController.swipeGesture(true);
        this.config.swipeGestureEnabled = true;
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public isDirty() {
        return this._isDirty;
    }

    public makeItDirty() {
        this.config.swipeGestureEnabled = false;
        this._isDirty = true;
    }

    public async selectAddressees() {
        const modal = await this.modalController.create({
            component: AddresseeModalPage,
            componentProps: { selectedAddresseeList: this.addresseeList },
        });

        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data && data.addresseeList) {
            this.addresseeList = data.addresseeList;
            if (data.addresseeList.length > 0) this._isDirty = true;
        }
    }

    public removeAddressee(item: AddresseeListItem) {
        this.addresseeList.splice(
            this.addresseeList.findIndex(x => x == item),
            1
        );
    }

    public getName(a) {
        if (instanceOfAddresseeListItem(a)) {
            return a.nev;
        } else if (instanceOfParentAddresseeListItem(a)) {
            return a.gondviseloNev;
        } else if (instanceOfStudentAddresseeListItem(a)) {
            return a.vezetekNev + " " + a.keresztNev;
        }
    }

    public async sendMsg() {
        if (this.addresseeList.length == 0 || !this.text || !this.subject) {
            this.errorHelper.presentToast(
                this.translator.instant("messages.compose.all-fields-required")
            );
            return;
        }

        let loading = await this.loadingCtrl.create({
            spinner: "crescent",
            message: this.translator.instant("messages.compose.sending-message"),
        });
        await loading.present();

        try {
            if (!this.prevMsgId) {
                // new message
                let addressees: MessageAddressee[] = [];
                this.addresseeList.forEach(e => {
                    addressees.push({
                        azonosito: null,
                        nev: this.getName(e),
                        kretaAzonosito: e.kretaAzonosito,
                        tipus: e.tipus,
                    });
                });

                const sendResult = await this.eugy.sendNewMessage(
                    addressees,
                    this.subject,
                    this.text + this.prevMsgText,
                    this.attachmentList
                );

                this.firebase.logEvent("messages_sent_new");
            } else {
                // reply
                const sendResult = await this.eugy.replyToMessage(
                    this.prevMsgId,
                    this.subject,
                    this.text + this.prevMsgText,
                    this.attachmentList
                );

                this.firebase.logEvent("messages_sent_reply");
            }

            this._isDirty = false;
            this.errorHelper.presentToast(this.translator.instant("messages.compose.message-sent"));
            this.router.navigateByUrl("messages/folder/inbox");
        } finally {
            loading.dismiss();
        }
    }

    public async chooseAttachmentSource($event: any) {
        const popover = await this.popoverController.create({
            component: AttachmentOptionsComponent,
            event: $event,
        });

        await popover.present();
        const { data } = await popover.onWillDismiss();
        if (!data || !data.result) return;

        this.addAttachment(data.result);
    }

    public async addAttachment(using: "camera" | "gallery" | "file") {
        const ios = this.platform.is("ios");
        let filePath: string;
        let fileName: string;

        try {
            if (using == "file") {
                if (ios) {
                    filePath = "file://" + (await this.iosChooser.pickFile());
                } else {
                    filePath = await this.androidChooser.open();
                }
            } else {
                const opts: CameraOptions = {
                    quality: 80,
                    destinationType: ios
                        ? this.camera.DestinationType.FILE_URI
                        : this.camera.DestinationType.NATIVE_URI,
                    sourceType:
                        using == "camera"
                            ? this.camera.PictureSourceType.CAMERA
                            : this.camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: this.camera.EncodingType.JPEG,
                    saveToPhotoAlbum: false,
                    allowEdit: false,
                };

                filePath = await this.camera.getPicture(opts);
            }

            if (!ios) filePath = await this.filePath.resolveNativePath(filePath);
            fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
        } catch (error) {
            if (
                typeof error === "string" &&
                (error.includes("canceled") ||
                    error == "No Image Selected" ||
                    error == "No camera available")
            ) {
                console.log("Aborting upload, no file/image selected.", error);
                return;
            }

            throw new KretaEUgyMessageAttachmentException(error, filePath);
        }

        this.loadingInProgress = true;
        this.currentlyUploading = { fajlNev: fileName, fajl: null, uploadProgressPercent: 0 };
        try {
            let newAttachment = await this.eugy.addAttachment(filePath, event => {
                if (event.lengthComputable) {
                    this.currentlyUploading.uploadProgressPercent = event.loaded / event.total;
                    this.changeDetector.detectChanges();
                }
            });

            if (newAttachment) {
                this.attachmentList.push(newAttachment);
                this.firebase.logEvent("messages_attachment_uploaded");
            }

            this.currentlyUploading = undefined;
        } catch (error) {
            this.currentlyUploading.isFailedUpload = true;
            throw error;
        } finally {
            this.loadingInProgress = false;
        }
    }

    public async deleteAttachment(a: MessageAttachmentToSend) {
        if (!a.fajl) {
            // the attachment came from the message that was forwarded,
            // it isn't in the temporary storage, we don't need to delete it from there

            this.attachmentList.splice(
                this.attachmentList.findIndex(x => x.azonosito == a.azonosito),
                1
            );
        } else {
            this.loadingInProgress = true;

            try {
                await this.eugy.removeAttachment(a.fajl.ideiglenesFajlAzonosito);

                this.attachmentList.splice(
                    this.attachmentList.findIndex(
                        x => x.fajl.ideiglenesFajlAzonosito == a.fajl.ideiglenesFajlAzonosito
                    ),
                    1
                );
                this.firebase.logEvent("messages_attachment_deleted");
            } finally {
                this.loadingInProgress = false;
            }
        }
    }

    public resetCurrentlyUploading() {
        this.currentlyUploading = undefined;
    }
}
