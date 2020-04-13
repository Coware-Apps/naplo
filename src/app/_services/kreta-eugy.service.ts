import { Injectable } from "@angular/core";
import { HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Institute, TokenResponse } from "../_models";
import {
    Message,
    InstituteEugy,
    MessageListItem,
    MessageAddressee,
    AddresseeGroup,
    AddresseeType,
    ParentAddresseeListItem,
    StudentAddresseeListItem,
} from "../_models/eugy";

import {
    KretaEUgyInvalidResponseException,
    KretaEUgyInvalidPasswordException,
    KretaEUgyNotLoggedInException,
    KretaEUgyException,
} from "../_exceptions";

import { DataService } from "./data.service";
import { KretaService } from "./kreta.service";

@Injectable({
    providedIn: "root",
})
export class KretaEUgyService {
    public host = "https://eugyintezes.e-kreta.hu/api/v1/";
    private endpoints = {
        instituteDetails: "ugy/aktualisIntezmenyAdatok",
        inboxList: "kommunikacio/postaladaelemek/beerkezett",
        outboxList: "kommunikacio/postaladaelemek/elkuldott",
        deletedList: "kommunikacio/postaladaelemek/torolt",
        message: "kommunikacio/postaladaelemek",
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
            tutelaries: {
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

    constructor(private data: DataService, private kreta: KretaService) {}

    /**
     * Gets a valid access_token from storage or from the IDP
     * @returns A promise that resolves to a valid access_token
     */
    public async getValidAccessToken(): Promise<string> {
        // If there's a valid access token in the cache, we use that
        const access_token = await this.data.getItem<string>("eugy_access_token").catch(() => {
            console.debug("[EUGY] Nincs valid AT");
            return null;
        });

        if (access_token) return access_token;

        // If there isn't or it's expried, we refresh it
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
    ): Promise<TokenResponse> {
        try {
            const params = {
                userName: username,
                password: password,
                institute_code: institute.InstituteCode,
                grant_type: "password",
                client_id: "kozelkep-js-web",
            };

            const response = await this.data
                .postUrl<TokenResponse>(
                    "https://idp.e-kreta.hu/connect/Token",
                    new HttpParams({ fromObject: params }).toString(),
                    new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded")
                )
                .toPromise();

            console.debug("[EUGY] getToken result:", response);

            if (!response.access_token) throw new KretaEUgyInvalidResponseException(response);

            await Promise.all([
                this.data.saveItem(
                    "eugy_access_token",
                    response.access_token,
                    null,
                    response.expires_in - 30
                ),
                this.data.saveItem(
                    "eugy_refresh_token",
                    response.refresh_token,
                    null,
                    this.longtermStorageExpiry
                ),
                this.data.saveSetting("eugy_institute", await this.getInstituteDetails()),
            ]);

            return response;
        } catch (error) {
            if (error.status == 400) throw new KretaEUgyInvalidPasswordException();
            throw error;
        }
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
            const params = {
                refresh_token: refresh_token,
                grant_type: "refresh_token",
                institute_code: institute.InstituteCode,
                client_id: "kozelkep-js-web",
            };
            console.log(`[EUGY->renewToken()] renewing tokens with refreshToken`, refresh_token);

            const response = await this.data
                .postUrl<TokenResponse>(
                    "https://idp.e-kreta.hu/connect/Token",
                    new HttpParams({ fromObject: params }).toString(),
                    new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded")
                )
                .toPromise();

            if (!response.access_token) throw new KretaEUgyInvalidResponseException(response);

            await Promise.all([
                this.data.saveItem(
                    "eugy_access_token",
                    response.access_token,
                    null,
                    response.expires_in - 30
                ),
                this.data.saveItem(
                    "eugy_refresh_token",
                    response.refresh_token,
                    null,
                    this.longtermStorageExpiry
                ),
            ]);

            return response.access_token;
        } finally {
            this.loginInProgress = false;
        }
    }

    public logout(): Promise<any> {
        return Promise.all([
            this.data.removeItem("eugy_access_token"),
            this.data.removeItem("eugy_refresh_token"),
        ]);
    }

    /**
     * Returns whether the user is logged in to EUgy or not
     * @returns boolean
     */
    public async isAuthenticated(): Promise<boolean> {
        return (await this.data.itemExists("eugy_refresh_token")) === true;
    }

    /**
     * Returns the details of the current institute
     * @returns A promise that resolves to an InstituteEugy
     */
    public async getInstituteDetails(): Promise<InstituteEugy> {
        const response = await this.data
            .getUrl<InstituteEugy>(this.host + this.endpoints.instituteDetails)
            .toPromise();

        await this.data.saveSetting("eugy_institute", response);
        return response;
    }

    /**
     * Gets whether the messaging service is enabled in the institution
     * @returns boolean
     */
    public async isMessagingEnabled() {
        const institute: InstituteEugy = await this.data
            .getSetting("eugy_institute")
            .catch(() => null);

        if (!institute) throw new KretaEUgyException("No institution settings available.");
        return institute.IsUzenetKezelesElerheto;
    }

    /**
     * Gets the user's message list by a specified category (state)
     * @param state From which category to get the message list
     */
    public getMessageList(
        state: "inbox" | "outbox" | "deleted",
        forceRefresh = false
    ): Observable<MessageListItem[]> {
        const response = this.data.getUrlWithCache<MessageListItem[]>(
            this.host + this.endpoints[`${state}List`],
            null,
            null,
            null,
            forceRefresh
        );

        return response.pipe(
            map(item =>
                item.map(x => {
                    x.uzenetKuldesDatum = new Date(x.uzenetKuldesDatum);
                    return x;
                })
            )
        );
    }

    public getMessage(messageId: number, forceRefresh: boolean = false): Observable<Message> {
        return this.data.getUrlWithCache<Message>(
            this.host + this.endpoints.message + "/" + messageId,
            null,
            null,
            null,
            forceRefresh
        );
    }

    /**
     * Put a message in the bin (it can be reverted)
     * @param action Choose put to put the message in the bin, remove to remove it.
     * @param messageIdList The `azonosito` fields of the messages to perform the operation on
     */
    public binMessages(action: "put" | "remove", messageIdList: number[]): Observable<any> {
        const params = {
            isKuka: action == "put",
            postaladaElemAzonositoLista: messageIdList,
        };

        return this.data.postUrl<any>(this.host + this.endpoints.manageBin, params);
    }

    /**
     * Delete a message permanently (HOT!)
     * @param messageIdList The `uzenetAzonosito` fields of the messages to perform the operation on
     */
    public deleteMessages(messageIdList: number[]): Observable<any> {
        const params = new HttpParams();
        messageIdList.forEach(messageId =>
            params.append("postaladaElemAzonositok", messageId.toString())
        );

        return this.data.deleteUrl<any>(this.host + this.endpoints.delete, null, params);
    }

    /**
     * Set a message's state either read or to unread
     * @param newState Choose read to set the message as read, unread to set it as unread
     * @param messageIdList The `uzenetAzonosito` fields of the messages to perform the operation on
     */
    public changeMessageState(
        newState: "read" | "unread",
        messageIdList: number[]
    ): Observable<any> {
        const params = {
            isOlvasott: newState == "read",
            postaladaElemAzonositoLista: messageIdList,
        };

        return this.data.postUrl<any>(this.host + this.endpoints.manageState, params);
    }

    public getAddresseeGroups(
        addresseeType: "tutelaries" | "students",
        groupType: "classes" | "groups"
    ): Observable<AddresseeGroup[]> {
        const params = {
            cimzettKod: addresseeType == "tutelaries" ? "GONDVISELOK" : "TANULOK",
        };
        let endpoint = this.endpoints.addresseeCategories[groupType];
        return this.data.getUrlWithCache<AddresseeGroup[]>(
            this.host + endpoint,
            params,
            new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded")
        );
    }

    /**
     * Replies to an existing message
     * @param messageId The `uzenetAzonosito` field of the message to reply to
     * @param targy The subject of the new message
     * @param szoveg The text of the new message (Can include HTML tags)
     * @param attachmentList The list of attachments to send with the message
     */
    public replyToMessage(
        messageId: number,
        targy: string,
        szoveg: string,
        attachmentList: { name: string; id: string }[]
    ): Observable<any> {
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

        const params = {
            targy: targy,
            szoveg: szoveg,
            elozoUzenetAzonosito: messageId,
            cimzettLista: [],
            csatolmanyok: attachments,
        };

        return this.data.postUrl<any>(this.host + this.endpoints.newMessage, params);
    }

    /**
     * Sends a new message
     * @param addresseeList The list of addressees to send the message to
     * @param targy The subject of the new message
     * @param szoveg The text of the new message (Can include HTML tags)
     * @param attachmentList The list of attachments to send with the message
     * @see The documentation for more info about addressees
     */
    public sendNewMessage(
        addresseeList: MessageAddressee[],
        targy: string,
        szoveg: string,
        attachmentList: { name: string; id: string }[]
    ): Observable<any> {
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

        const params = {
            targy: targy,
            szoveg: szoveg,
            elozoUzenetAzonosito: null,
            cimzettLista: addresseeList,
            csatolmanyok: attachments,
        };

        return this.data.postUrl<any>(this.host + this.endpoints.newMessage, params);
    }

    /**
     * Gets the types of addressees the user can choose from. It is used to display category names descriptions etc.
     * @see The documentation for more info about addressees
     */
    public getAddresseeTypeList(): Observable<AddresseeType[]> {
        return this.data.getUrlWithCache<AddresseeType[]>(
            this.host + this.endpoints.addresseeTypesList
        );
    }

    /**
     * Gets the list of possible addressees to send a message to, from a specified category.
     * @param category The category from which to get the list of possible addressees
     */
    public getAddresseListByCategory(
        category: "teachers" | "headTeachers" | "directorate" | "admins"
    ): Observable<MessageAddressee[]> {
        return this.data.getUrlWithCache<MessageAddressee[]>(
            this.host + this.endpoints.addresseeCategories[category]
        );
    }

    public getStudentsOrParents(
        category: "students" | "tutelaries",
        by: "byGroups" | "byClasses",
        groupOrClassId: number
    ): Observable<ParentAddresseeListItem[] | StudentAddresseeListItem[]> {
        return this.data.getUrlWithCache<ParentAddresseeListItem[] | StudentAddresseeListItem[]>(
            this.host + this.endpoints.addresseeCategories[category][by] + `/${groupOrClassId}`
        );
    }

    // /**
    //  * Add an attachment to the temporary attachment storage. Used to draft messages WIP
    //  * @param tokens `Token` used for authentication
    //  * @returns Promise that resolves to a string, that is the id of the file in the temporary storage
    //  */
    // public async addAttachment(using: "camera" | "gallery" | "file"): Promise<AttachmentToSend> {
    //     let uri = this.host + this.endpoints.temporaryAttachmentStorage;
    //     let filePath, fileName;
    //     const ios = this.platform.is("ios");

    //     try {
    //         if (using == "file") {
    //             if (ios) {
    //                 filePath = "file://" + (await this._iosFilePicker.pickFile());
    //                 fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
    //             } else {
    //                 filePath = await this._fileChooser.open();
    //                 fileName = await this._filePath.resolveNativePath(filePath);
    //                 fileName = fileName.split("/")[fileName.split("/").length - 1];
    //             }
    //         } else {
    //             let opts: CameraOptions = {
    //                 quality: 80,
    //                 destinationType: ios
    //                     ? this._camera.DestinationType.FILE_URI
    //                     : this._camera.DestinationType.NATIVE_URI,
    //                 sourceType:
    //                     using == "camera"
    //                         ? this._camera.PictureSourceType.CAMERA
    //                         : this._camera.PictureSourceType.PHOTOLIBRARY,
    //                 encodingType: this._camera.EncodingType.JPEG,
    //                 saveToPhotoAlbum: false,
    //                 allowEdit: true,
    //             };

    //             filePath = await this._camera.getPicture(opts);
    //             if (!ios) filePath = await this._filePath.resolveNativePath(filePath);
    //             fileName = filePath.split("/")[filePath.split("/").length - 1];
    //         }
    //     } catch (error) {
    //         if (error != "User canceled." && error != "No Image Selected") {
    //             throw new AdministrationFileError(
    //                 "addAttachment()",
    //                 error,
    //                 fileName,
    //                 "addAttachment.title",
    //                 "addAttachment.text"
    //             );
    //         } else {
    //             console.log("Aborting upload, no file/image selected");
    //             return;
    //         }
    //     }

    //         let response = await this._http.uploadFile(uri, params, headers, filePath, "fajl");
    //         let returnVal: AttachmentToSend = {
    //             fajlNev: fileName,
    //             fajl: {
    //                 ideiglenesFajlAzonosito: response.data,
    //             },
    //             iktatoszam: null,
    //         };
    //         return returnVal;
    // }

    /**
     * Removes an attachment from the temporary attachment storage. Used for drafting messages.
     * @param attachmentId The id of the attachment to remove
     */
    public removeAttachment(attachmentId: string): Observable<any> {
        return this.data.deleteUrl<any>(
            this.host + this.endpoints.temporaryAttachmentStorage + `/${attachmentId}`
        );
    }

    // /**
    //  * Gets an attachment from the final attachment storage. Use this for existing messages.
    //  * @param fileId The id of the file to get from the server
    //  * @param fileName The name of the file to get form the server (used to save the file)
    //  * @param fileExtension The extension of the file to get from the server
    //  */
    // public async getAttachment(
    //     fileId: number,
    //     fileName: string,
    //     fileExtension: string
    // ): Promise<string> {
    //     let fileTransfer = this.transfer.create();
    //     let uri = `${this.host}${this.endpoints.finalAttachmentStorage}/${fileId}`;
    //     let fullFileName = fileName + "." + fileExtension;

    //     try {
    //         let url;
    //         const access_token = await this.getValidAccessToken();

    //         let entry = await fileTransfer.download(
    //             uri,
    //             (await this.getDownloadPath()) + fullFileName,
    //             false,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${access_token}`,
    //                 },
    //             }
    //         );
    //         url = entry.nativeURL;

    //         return url;
    //     } catch (error) {
    //         throw new KretaEUgyMessageAttachmentDownloadException(error, fullFileName);
    //     }
    // }

    // /**
    //  * Gets an attachment from the final attachment storage. Use this for existing messages.
    //  * @param fileId The id of the file to get from the server
    //  * @param fileName The name of the file to get form the server (used to save the file)
    //  * @param fileExtension The extension of the file to get from the server
    //  * @param tokens `Token` used for authentication
    //  */
    // public async getAttachment(
    //     fileId: number,
    //     fileName: string,
    //     fileExtension: string,
    //     tokens: Token
    // ): Promise<string> {
    //     let fileTransfer = this._transfer.create();
    //     let uri = `${this._host}${this._endpoints.finalAttachmentStorage}/${fileId}`;
    //     let fullFileName = fileName + "." + fileExtension;
    //     try {
    //         let url;
    //         await this._platform.ready().then(async x => {
    //             let entry = await fileTransfer.download(
    //                 uri,
    //                 (await this.getDownloadPath()) + fullFileName,
    //                 false,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${tokens.access_token}`,
    //                         "User-Agent": this._userAgent,
    //                     },
    //                 }
    //             );
    //             url = entry.nativeURL;
    //         });
    //         return url;
    //     } catch (error) {
    //         console.error("Error trying to get file", error);
    //         this._firebase.logError(`[KRETA->getMessageFile()]: ` + stringify(error));
    //         if (error.status && error.status < 0)
    //             throw new AdministrationNetworkError("getAttachment()");
    //         throw new AdministrationFileError(
    //             "getAttachment()",
    //             error,
    //             fileName,
    //             "getAttachment.title",
    //             "getAttachment.text"
    //         );
    //     }
    // }

    // protected async getDownloadPath() {
    //     if (this._platform.is("ios")) {
    //         return this._file.documentsDirectory;
    //     }

    //     await this._androidPermissions
    //         .checkPermission(this._androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
    //         .then(result => {
    //             if (!result.hasPermission) {
    //                 this._androidPermissions.requestPermission(
    //                     this._androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    //                 );
    //             }
    //         });

    //     return this._file.dataDirectory;
    // }
}
