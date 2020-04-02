import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Institute, MessageListItem, MessageAddressee, MessageAddresseeType } from "../_models";

import { stringify } from "querystring";
import {
    KretaEUgyInvalidTokenResponseException,
    KretaEUgyInvalidPasswordException,
    KretaEUgyMessageAttachmentDownloadException,
    KretaEUgyNotLoggedInException,
} from "../_exceptions";

import { File } from "@ionic-native/file/ngx";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { FileTransfer } from "@ionic-native/file-transfer/ngx";
import { HTTPResponse } from "@ionic-native/http/ngx";
import { DataService } from "./data.service";
import { KretaService } from "./kreta.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class KretaEUgyService {
    private host = "https://eugyintezes.e-kreta.hu/api/v1/";
    private endpoints = {
        inboxList: "kommunikacio/postaladaelemek/beerkezett",
        outboxList: "kommunikacio/postaladaelemek/elkuldott",
        deletedList: "kommunikacio/postaladaelemek/torolt",
        manageBin: "kommunikacio/postaladaelemek/kuka",
        delete: "kommunikacio/postaladaelemek/torles",
        manageState: "kommunikacio/postaladaelemek/olvasott",
        addresseeTypesList: "kommunikacio/cimezhetotipusok",
        addresseeCategories: {
            teachers: "kreta/alkalmazottak/tanar",
            headTeachers: "kreta/alkalmazottak/oszalyfonok",
            directorate: "kreta/alkalmazottak/igazgatosag",
            admins: "kreta/alkalmazottak/adminisztrator",
            groups: "kommunikacio/tanoraicsoportok/cimezheto",
            classes: "kommunikacio/osztalyok/cimezheto",
            szmk: "kommunikacio/szmkkepviselok/cimezheto",
            parents: {
                byGroups: "kreta/gondviselok/tanoraicsoport",
                byClasses: "kreta/gondviselok/osztaly",
            },
            students: {
                byGroups: "kreta/tanulok/tanoraicsoportok",
                byClasses: "kreta/tanulok/osztalyok",
            },
        },
        newMessage: "kommunikacio/uzenetek",
        temporaryAttachmentStorage: "ideiglenesfajlok",
        finalAttachmentStorage: "kommunikacio/dokumentumok/uzenetek",
    };
    private longtermStorageExpiry = 72 * 30 * 24 * 60 * 60;
    private loginInProgress: boolean = false;

    constructor(
        private transfer: FileTransfer,
        private platform: Platform,
        private file: File,
        private androidPermissions: AndroidPermissions,
        private data: DataService,
        private kreta: KretaService
    ) {}

    /**
     * Gets a valid access_token from storage or from the IDP
     * @returns A promise that resolves to a valid access_token
     */
    private async getValidAccessToken(): Promise<string> {
        // ha van érvényes access_token elmentve, visszaadjuk azt
        const access_token = await this.data.getItem<string>("eugy_access_token").catch(() => {
            console.debug("[EUGY] Nincs valid AT");
            return null;
        });

        if (access_token) return access_token;

        //ha nincs vagy lejárt az access_token, de van refresh_token, megújítunk azzal
        const refresh_token = await this.data.getItem<string>("eugy_refresh_token").catch(() => {
            throw new KretaEUgyNotLoggedInException();
        });

        console.debug("[EUGY] Van valid RT, megújítás...");
        return this.renewToken(refresh_token, this.kreta.institute);
    }

    /**
     * Logs the user in with username and password.
     * @param username username used to log in
     * @param password password used to log in
     * @param institute the institute of the user
     * @returns A Promise that resolves to an access token
     */
    public async getToken(
        username: string,
        password: string,
        institute: Institute
    ): Promise<string> {
        try {
            const headers = {};
            const params = {
                userName: username,
                password: password,
                institute_code: institute.InstituteCode,
                grant_type: "password",
                client_id: "kozelkep-js-web",
            };

            let response = await this.data.postUrl(
                "https://idp.e-kreta.hu/connect/Token",
                params,
                headers
            );

            console.debug("[EUGY] getToken result:", response);

            if (response.status == 400) throw new KretaEUgyInvalidPasswordException();
            const data = JSON.parse(response.data);
            if (!data || !data.access_token)
                throw new Error("Invalid data in token response: " + stringify(response.data));

            await Promise.all([
                this.data.saveItem(
                    "eugy_access_token",
                    data.access_token,
                    null,
                    data.expires_in - 30
                ),
                this.data.saveItem(
                    "eugy_refresh_token",
                    data.refresh_token,
                    null,
                    this.longtermStorageExpiry
                ),
            ]);

            return data.access_token;
        } catch (error) {
            if (error instanceof SyntaxError) throw new KretaEUgyInvalidTokenResponseException();
            if (error.status == 400) throw new KretaEUgyInvalidPasswordException();

            throw error;
        }
    }

    /**
     * Initiates login with only a password
     * @param password The password
     */
    public doPasswordLogin(password: string): Promise<string> {
        return this.getToken(
            this.kreta.currentUser["kreta:user_name"],
            password,
            this.kreta.institute
        );
    }

    private delay(timer: number): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), timer));
    }

    /**
     * Logs the user in with a previously acquired refresh token
     * @param refresh_token the refresh token to log the user in wit
     * @param institute the user's institute
     * @returns A Promise that resolves to an access_token
     */
    public async renewToken(refresh_token: string, institute: Institute): Promise<string> {
        if (this.loginInProgress) {
            while (this.loginInProgress) await this.delay(20);

            return this.getValidAccessToken();
        }

        this.loginInProgress = true;

        try {
            const headers = {};
            const params = {
                refresh_token: refresh_token,
                grant_type: "refresh_token",
                institute_code: institute.InstituteCode,
                client_id: "kozelkep-js-web",
            };
            console.log(`[EUGY->renewToken()] renewing tokens with refreshToken`, refresh_token);

            let response = await this.data.postUrl(
                "https://idp.e-kreta.hu/connect/Token",
                params,
                headers
            );

            if (response.status == 400) throw new KretaEUgyInvalidPasswordException();
            const data = JSON.parse(response.data);
            if (!data || !data.access_token)
                throw new Error("Invalid data in token response: " + stringify(response));

            await Promise.all([
                this.data.saveItem(
                    "eugy_access_token",
                    data.access_token,
                    null,
                    data.expires_in - 30
                ),
                this.data.saveItem(
                    "eugy_refresh_token",
                    data.refresh_token,
                    null,
                    this.longtermStorageExpiry
                ),
            ]);

            return data.access_token;
        } catch (error) {
            if (error instanceof SyntaxError) throw new KretaEUgyInvalidTokenResponseException();
            if (error.status == 400) {
                await Promise.all([
                    this.data.removeItem("eugy_access_token"),
                    this.data.removeItem("eugy_refresh_token"),
                ]);

                throw new KretaEUgyInvalidPasswordException();
            }

            throw error;
        } finally {
            this.loginInProgress = false;
        }
    }

    /**
     * Returns whether the user is logged in to EUgy or not
     * @returns boolean
     */
    public async isAuthenticated(): Promise<boolean> {
        const loginInfo = await this.data.itemExists("eugy_refresh_token");
        return loginInfo === true;
    }

    /**
     * Gets the user's message list by a specified category (state)
     * @param state From which category to get the message list
     */
    public async getMessageList(state: "inbox" | "outbox" | "deleted"): Promise<MessageListItem[]> {
        const access_token = await this.getValidAccessToken();
        const headers = {
            Authorization: "Bearer " + access_token,
        };
        const params = {};

        const response = await this.data.getUrl(
            this.host + this.endpoints[`${state}List`],
            params,
            headers
        );

        return (<MessageListItem[]>JSON.parse(response.data)).map(x => {
            x.uzenetKuldesDatum = new Date(x.uzenetKuldesDatum);
            return x;
        });
    }

    /**
     * Put a message in the bin (it can be reverted)
     * @param action Choose put to put the message in the bin, remove to remove it.
     * @param messageIdList The `azonosito` fields of the messages to perform the operation on
     */
    public async binMessages(
        action: "put" | "remove",
        messageIdList: number[]
    ): Promise<HTTPResponse> {
        const access_token = await this.getValidAccessToken();
        const headers = {
            Authorization: "Bearer " + access_token,
        };
        const params = {
            isKuka: action == "put" ? true : false,
            postaladaElemAzonositoLista: messageIdList,
        };

        return this.data.postUrl(this.host + this.endpoints.manageBin, params, headers, "json");
    }

    /**
     * Delete a message permanently (HOT!)
     * @param messageIdList The `uzenetAzonosito` fields of the messages to perform the operation on
     */
    public async deleteMessages(messageIdList: number[]): Promise<HTTPResponse> {
        const access_token = await this.getValidAccessToken();
        const headers = {
            Authorization: "Bearer " + access_token,
        };

        const params = {
            postaladaElemAzonositok: messageIdList,
        };

        return this.data.deleteUrl(this.host + this.endpoints.delete, params, headers);
    }

    /**
     * Set a message's state either read or to unread
     * @param newState Choose read to set the message as read, unread to set it as unread
     * @param messageIdList The `uzenetAzonosito` fields of the messages to perform the operation on
     */
    public async changeMessageState(
        newState: "read" | "unread",
        messageIdList: number[]
    ): Promise<HTTPResponse> {
        const access_token = await this.getValidAccessToken();

        const headers = {
            Authorization: "Bearer " + access_token,
        };

        const params = {
            isOlvasott: newState == "read" ? true : false,
            postaladaElemAzonositoLista: messageIdList,
        };

        return this.data.postUrl(this.host + this.endpoints.manageState, params, headers);
    }

    /**
     * Replies to an existing message
     * @param messageId The `uzenetAzonosito` field of the message to reply to
     * @param targy The subject of the new message
     * @param szoveg The text of the new message (Can include HTML tags)
     * @param attachmentList The list of attachments to send with the message
     */
    public async replyToMessage(
        messageId: number,
        targy: string,
        szoveg: string,
        attachmentList: { name: string; id: string }[]
    ): Promise<HTTPResponse> {
        //creating the attachments object from the attachmentList
        let attachments: {
            fajlNev: string;
            fajl: { ideiglenesFajlAzonosito: string };
            iktatoszam: any;
        }[] = [];

        attachmentList.forEach(a => {
            attachments.push({
                fajlNev: a.name,
                fajl: { ideiglenesFajlAzonosito: a.id },
                iktatoszam: null,
            });
        });

        const access_token = await this.getValidAccessToken();

        const headers = {
            Authorization: "Bearer " + access_token,
        };

        const params = {
            targy: targy,
            szoveg: szoveg,
            elozoUzenetAzonosito: messageId,
            cimzettLista: [],
            csatolmanyok: attachments,
        };

        return this.data.postUrl(this.host + this.endpoints.newMessage, params, headers, "json");
    }

    /**
     * Sends a new message
     * @param addresseeList The list of addressees to send the message to
     * @param targy The subject of the new message
     * @param szoveg The text of the new message (Can include HTML tags)
     * @param attachmentList The list of attachments to send with the message
     * @see The documentation for more info about addressees
     */
    public async sendNewMessage(
        addresseeList: MessageAddressee[],
        targy: string,
        szoveg: string,
        attachmentList: { name: string; id: string }[]
    ): Promise<HTTPResponse> {
        //creating the attachments object from the attachmentList
        let attachments: {
            fajlNev: string;
            fajl: { ideiglenesFajlAzonosito: string };
            iktatoszam: any;
        }[] = [];

        attachmentList.forEach(a => {
            attachments.push({
                fajlNev: a.name,
                fajl: { ideiglenesFajlAzonosito: a.id },
                iktatoszam: null,
            });
        });

        const access_token = await this.getValidAccessToken();

        const headers = {
            Authorization: "Bearer " + access_token,
        };

        const params = {
            targy: targy,
            szoveg: szoveg,
            elozoUzenetAzonosito: null,
            cimzettLista: addresseeList,
            csatolmanyok: attachments,
        };

        return this.data.postUrl(this.host + this.endpoints.newMessage, params, headers, "json");
    }

    /**
     * Gets the types of addressees the user can choose from. It is used to display category names descriptions etc.
     * @see The documentation for more info about addressees
     */
    public async getAddresseeTypeList(): Promise<Observable<MessageAddresseeType[]>> {
        const access_token = await this.getValidAccessToken();

        const headers = {
            Authorization: "Bearer " + access_token,
        };
        const params = {};
        let response = await this.data.getUrlWithCache(
            this.host + this.endpoints.addresseeTypesList,
            params,
            headers
        );

        return response.pipe(map(x => JSON.parse(x.data)));
    }

    /**
     * Gets the list of possible addressees to send a message to, from a specified category.
     * @param category The category from which to get the list of possible addressees
     */
    public async getAddresseListByCategory(
        category: "teachers" | "headTeachers" | "directorate" | "admins"
    ): Promise<Observable<MessageAddressee[]>> {
        const access_token = await this.getValidAccessToken();

        const headers = {
            Authorization: "Bearer " + access_token,
        };

        const params = {};

        let response = await this.data.getUrlWithCache(
            this.host + this.endpoints.addresseeCategories[category],
            params,
            headers
        );

        return response.pipe(map(x => JSON.parse(x.data)));
    }

    /**
     * Add an attachment to the temporary attachment storage. Used to draft messages WIP
     */
    public async addAttachment(): Promise<string> {
        //todo, with file transfer
        throw new Error("Error trying to add attachment: Feature not yet implemented :/");
    }

    /**
     * Removes an attachment from the temporary attachment storage. Used for drafting messages.
     * @param attachmentId The id of the attachment to remove
     */
    public async removeAttachment(attachmentId: string): Promise<HTTPResponse> {
        const access_token = await this.getValidAccessToken();
        const headers = {
            Authorization: "Bearer " + access_token,
        };
        const params = {};

        let response = await this.data.deleteUrl(
            this.host + this.endpoints.temporaryAttachmentStorage + `/${attachmentId}`,
            params,
            headers
        );

        return response;
    }

    /**
     * Gets an attachment from the final attachment storage. Use this for existing messages.
     * @param fileId The id of the file to get from the server
     * @param fileName The name of the file to get form the server (used to save the file)
     * @param fileExtension The extension of the file to get from the server
     */
    public async getAttachment(
        fileId: number,
        fileName: string,
        fileExtension: string
    ): Promise<string> {
        let fileTransfer = this.transfer.create();
        let uri = `${this.host}${this.endpoints.finalAttachmentStorage}/${fileId}`;
        let fullFileName = fileName + "." + fileExtension;

        try {
            let url;
            const access_token = await this.getValidAccessToken();

            let entry = await fileTransfer.download(
                uri,
                (await this.getDownloadPath()) + fullFileName,
                false,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );
            url = entry.nativeURL;

            return url;
        } catch (error) {
            throw new KretaEUgyMessageAttachmentDownloadException(error, fullFileName);
        }
    }

    /**
     *
     */
    private async getDownloadPath() {
        if (this.platform.is("ios")) {
            return this.file.documentsDirectory;
        }

        const storagePerm = await this.androidPermissions.checkPermission(
            this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        );

        if (!storagePerm.hasPermission) {
            this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
            );
        }

        return this.file.dataDirectory;
    }
}
