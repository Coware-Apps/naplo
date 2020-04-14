import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { DataService, KretaEUgyService, ConfigService } from "src/app/_services";
import { Router, ActivatedRoute } from "@angular/router";
import { Message } from "src/app/_models/eugy";
import { PageState } from "src/app/_models";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { takeUntil } from "rxjs/operators";
import { ErrorHelper } from "src/app/_helpers";
import { Location } from "@angular/common";
import { AlertController } from "@ionic/angular";

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
        private alertController: AlertController
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
                                ? "én"
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
                complete: () => (this.loadingInProgress = false),
            });
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    replyToMsg() {
        // this.data.setData("replyData", this.message);
        this.router.navigateByUrl("messages/new-message?replyDataKey=replyData");
    }
    forwardMsg() {
        // this.data.setData("forwardData", this.message);
        this.router.navigateByUrl("messages/new-message?forwardDataKey=forwardData");
    }

    showStatusInfo() {
        // this.prompt.presentUniversalAlert(
        //     `Azonosító: ${this.message.azonosito}`,
        //     `Státusz: ${this.message.uzenet.statusz.azonosito} (${this.message.uzenet.statusz.leiras})`,
        //     `Hibakód: ${this.message.uzenet.hibaCorrellationId}`
        // );
    }

    async binMsg(action: "put" | "remove") {
        await this.eugy.binMessages(action, [this.message.azonosito]).toPromise();
        this.errorHelper.presentToast(
            action == "put" ? "Az üzenetet a kukába helyeztük" : "Az üzenetet visszaállítottuk"
        );

        this.location.back();
    }

    async deleteMsg() {
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
        this.errorHelper.presentToast("Üzenet olvasatlannak lett jelölve");
        this.location.back();
    }

    async getFile(id: number, fullName: string) {
        // for (let i = 0; i < this.message.uzenet.csatolmanyok.length; i++) {
        //     if (this.message.uzenet.csatolmanyok[i].azonosito == id) {
        //         this.message.uzenet.csatolmanyok[i].loading = true;
        //     }
        // }
        // const splitAt = (index: number) => (x: string) => [x.slice(0, index), x.slice(index)];
        // let newName = splitAt(fullName.lastIndexOf("."))(fullName);
        // newName[1] = newName[1].slice(1);
        // let filePath = await this.eugy(
        //     id,
        //     newName[0],
        //     newName[1]
        // );
        // this.FileOpener.showOpenWithDialog(filePath, this.types[newName[1]]);
        // for (let i = 0; i < this.message.uzenet.csatolmanyok.length; i++) {
        //     if (this.message.uzenet.csatolmanyok[i].azonosito == id) {
        //         this.message.uzenet.csatolmanyok[i].loading = false;
        //     }
        // }
    }
    public types = {
        "3dmf": "x-world/x-3dmf",
        "3dm": "x-world/x-3dmf",
        avi: "video/x-msvideo",
        ai: "application/postscript",
        bin: "application/octet-stream",
        bmp: "image/bmp",
        cab: "application/x-shockwave-flash",
        c: "text/plain",
        "c++": "text/plain",
        class: "application/java",
        css: "text/css",
        csv: "text/comma-separated-values",
        cdr: "application/cdr",
        doc: "application/msword",
        dot: "application/msword",
        docx: "application/msword",
        dwg: "application/acad",
        eps: "application/postscript",
        exe: "application/octet-stream",
        gif: "image/gif",
        gz: "application/gzip",
        gtar: "application/x-gtar",
        flv: "video/x-flv",
        fh4: "image/x-freehand",
        fh5: "image/x-freehand",
        fhc: "image/x-freehand",
        help: "application/x-helpfile",
        hlp: "application/x-helpfile",
        html: "text/html",
        htm: "text/html",
        ico: "image/x-icon",
        imap: "application/x-httpd-imap",
        inf: "application/inf",
        jpe: "image/jpeg",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        js: "application/x-javascript",
        java: "text/x-java-source",
        latex: "application/x-latex",
        log: "text/plain",
        m3u: "audio/x-mpequrl",
        midi: "audio/midi",
        mid: "audio/midi",
        mov: "video/quicktime",
        mp3: "audio/mpeg",
        mpeg: "video/mpeg",
        mpg: "video/mpeg",
        mp2: "video/mpeg",
        ogg: "application/ogg",
        phtml: "application/x-httpd-php",
        php: "application/x-httpd-php",
        pdf: "application/pdf",
        pgp: "application/pgp",
        png: "image/png",
        pps: "application/mspowerpoint",
        ppt: "application/mspowerpoint",
        ppz: "application/mspowerpoint",
        pot: "application/mspowerpoint",
        ps: "application/postscript",
        qt: "video/quicktime",
        qd3d: "x-world/x-3dmf",
        qd3: "x-world/x-3dmf",
        qxd: "application/x-quark-express",
        rar: "application/x-rar-compressed",
        ra: "audio/x-realaudio",
        ram: "audio/x-pn-realaudio",
        rm: "audio/x-pn-realaudio",
        rtf: "text/rtf",
        spr: "application/x-sprite",
        sprite: "application/x-sprite",
        stream: "audio/x-qt-stream",
        swf: "application/x-shockwave-flash",
        svg: "text/xml-svg",
        sgml: "text/x-sgml",
        sgm: "text/x-sgml",
        tar: "application/x-tar",
        tiff: "image/tiff",
        tif: "image/tiff",
        tgz: "application/x-compressed",
        tex: "application/x-tex",
        txt: "text/plain",
        vob: "video/x-mpg",
        wav: "audio/x-wav",
        wrl: "model/vrml",
        xla: "application/msexcel",
        xls: "application/msexcel",
        xlc: "application/vnd.ms-excel",
        xml: "text/xml",
        zip: "application/zip",
    };
}
