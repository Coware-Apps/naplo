import { Injectable } from "@angular/core";
import { DataService } from "./data.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HTTPResponse } from "@ionic-native/http/ngx";
import {
    TanarProfil,
    Lesson,
    OsztalyTanuloi,
    Mulasztas,
    Feljegyzes,
    JavasoltJelenletTemplate,
    KretaEnum,
    Institute,
    Jwt,
    Tanmenet,
} from "../_models";
import { ErrorHelper, JwtDecodeHelper } from "../_helpers";
import {
    KretaMissingRoleException,
    KretaInvalidPasswordException,
} from "../_models/kreta-exceptions";
import { stringify } from "flatted/esm";
import { FirebaseService } from "./firebase.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: "root",
})
export class KretaService {
    private _institute: Institute;
    public get institute(): Institute {
        return this._institute;
    }
    public set institute(v: Institute) {
        this.data.saveSetting("institute", v);
        this._institute = v;
    }

    private _currentUser: Jwt;
    public get currentUser(): Jwt {
        return this._currentUser;
    }
    public set currentUser(v: Jwt) {
        this._currentUser = v;
    }

    constructor(
        private data: DataService,
        private jwtHelper: JwtDecodeHelper,
        private error: ErrorHelper,
        private firebase: FirebaseService,
        private translate: TranslateService
    ) {}

    private idpUrl = "https://idp.e-kreta.hu";
    private longtermStorageExpiry = 72 * 30 * 24 * 60 * 60;
    private loginInProgress: boolean = false;

    public async onInit() {
        this._institute = await this.data.getSetting<Institute>("institute").catch(() => null);

        if (await this.isAuthenticated()) {
            this._currentUser = this.jwtHelper.decodeToken(await this.getValidAccessToken());
            this.firebase.initialize(this.currentUser, this.institute);
        }
    }

    public async getValidAccessToken(): Promise<string> {
        try {
            // ha van érvényes access_token elmentve, visszaadjuk azt
            const access_token = await this.data.getItem<string>("access_token").catch(() => {
                console.debug("[LOGIN] Nincs valid AT");
                return null;
            });

            if (access_token) return access_token;

            //ha nincs vagy lejárt az access_token, de van refresh_token, megújítunk azzal
            const refresh_token = await this.data.getItem<string>("refresh_token").catch(() => {
                throw Error("[LOGIN] Nincs valid RT");
            });

            if (refresh_token) {
                console.debug("[LOGIN] Van valid RT, megújítás...");
                return await this.loginWithRefreshToken(refresh_token);
            }
        } catch (error) {
            this.firebase.logError("getValidAccessToken(): " + stringify(error));
            console.error("[LOGIN] " + error);
            await this.error.presentAlert(error, "getValidAccessToken()", undefined, () => {
                this.logout();
            });
        }
    }

    async loginWithUsername(username: string, password: string): Promise<HTTPResponse> {
        try {
            if (!this.institute || !this.institute.Url)
                throw Error("Nincs intézmény kiválasztva! (loginWithUsername())");

            const response = await this.data.postUrl(
                this.idpUrl + "/connect/Token",
                {
                    institute_code: this.institute.InstituteCode,
                    userName: username,
                    password: password,
                    grant_type: "password",
                    client_id: "kreta-naplo-mobile",
                },
                {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            );

            if (response.status == 200) {
                const data = JSON.parse(response.data);

                if (data && data.access_token) {
                    this.currentUser = this.jwtHelper.decodeToken(data.access_token);

                    console.debug("[LOGIN] Roles we have: ", this.currentUser.role);
                    if (this.currentUser.role.indexOf("Tanar") === -1) {
                        console.debug("[LOGIN] Missing role: 'Tanar' in ", this.currentUser.role);

                        throw new KretaMissingRoleException();
                    }

                    await Promise.all([
                        this.data.saveItem(
                            "access_token",
                            data.access_token,
                            null,
                            data.expires_in - 30
                        ),
                        this.data.saveItem(
                            "refresh_token",
                            data.refresh_token,
                            null,
                            this.longtermStorageExpiry
                        ),
                    ]);

                    Promise.all([
                        this.getNaploEnum("MulasztasTipusEnum"),
                        this.getNaploEnum("EsemenyTipusEnum"),
                        this.getNaploEnum("ErtekelesModEnum"),
                        this.getNaploEnum("ErtekelesTipusEnum"),
                        this.getNaploEnum("OsztalyzatTipusEnum"),
                    ]);

                    this.firebase.initialize(this.currentUser, this.institute);
                } else throw Error("Error response during username login: " + response.data);
            } else if (response.status == 400) throw new KretaInvalidPasswordException();
            else throw Error("Non-200 response during username login: " + response.data);

            return response;
        } catch (error) {
            if (error.status == 400) throw new KretaInvalidPasswordException();
            else throw error;
        }
    }

    private delay(timer: number): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), timer));
    }

    private async loginWithRefreshToken(refresh_token: string): Promise<string> {
        // ha épp folyamatban van bejelentkezés, akkor azt megvárjuk és utána annak az eredményét adjuk vissza
        if (this.loginInProgress) {
            while (this.loginInProgress) await this.delay(20);

            return this.getValidAccessToken();
        }

        this.loginInProgress = true;

        try {
            if (!this.institute || !this.institute.Url)
                throw Error("Nincs intézmény kiválasztva! (getValidAccessToken())");

            await this.firebase.startTrace("token_refresh_time");

            const response = await this.data.postUrl(
                this.idpUrl + "/connect/Token",
                {
                    refresh_token: refresh_token,
                    grant_type: "refresh_token",
                    client_id: "kreta-naplo-mobile",
                },
                {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            );

            if (response.status == 200) {
                const data = JSON.parse(response.data);

                if (data && data.access_token) {
                    await Promise.all([
                        this.data.saveItem(
                            "access_token",
                            data.access_token,
                            null,
                            data.expires_in - 30
                        ),
                        this.data.saveItem(
                            "refresh_token",
                            data.refresh_token,
                            null,
                            this.longtermStorageExpiry
                        ),
                    ]);

                    console.debug("[LOGIN] AT sikeresen megújítva RT-el");
                    this.currentUser = this.jwtHelper.decodeToken(data.access_token);
                    this.firebase.stopTrace("token_refresh_time");

                    return data.access_token;
                } else throw Error("Error response during token login: " + response.data);
            } else throw Error("Non-200 response during token login: " + response.data);
        } catch (error) {
            if (error instanceof SyntaxError) {
                await this.error.presentAlert(
                    (await this.translate.get("common.comm-error").toPromise()) +
                        " <br>(" +
                        error +
                        ")"
                );
            } else {
                this.firebase.logError("loginWithRefreshToken(): " + stringify(error));
                console.error("[LOGIN] ", error);
                await this.error.presentAlert(
                    (await this.translate.get("kreta.login-unknown-error").toPromise()) +
                        " (" +
                        stringify(error) +
                        ")",
                    "Token refresh",
                    await this.translate.get("common.error").toPromise(),
                    () => {
                        this.logout();
                    }
                );
            }
        } finally {
            this.loginInProgress = false;
        }
    }

    async logout() {
        await this.data.clearAll();
        await this.firebase.unregister();
        window.location.replace("/login");
    }

    async isAuthenticated(): Promise<boolean> {
        const loginInfo = await this.data.itemExists("refresh_token");
        return loginInfo === true;
    }

    async getInstituteList(): Promise<Observable<Institute[]>> {
        return (
            await this.data.getUrlWithCache(
                "https://kretaglobalmobileapi.ekreta.hu/api/v1/Institute",
                null,
                {
                    apiKey: "7856d350-1fda-45f5-822d-e1a2f3f1acf0",
                },
                this.longtermStorageExpiry
            )
        ).pipe(map(x => JSON.parse(x.data)));
    }

    async deleteInstituteListFromStorage(): Promise<void> {
        return this.data.removeItem("https://kretaglobalmobileapi.ekreta.hu/api/v1/Institute");
    }

    async getAuthenticatedAdatcsomag<T>(
        url: string,
        cacheSecs: number = 30 * 60,
        forceRefresh: boolean = false
    ): Promise<Observable<T>> {
        const access_token = await this.getValidAccessToken();
        return (
            await this.data.getUrlWithCache(
                this.institute.Url + url,
                null,
                {
                    Authorization: "Bearer " + access_token,
                },
                cacheSecs,
                forceRefresh
            )
        ).pipe(
            map(x => JSON.parse(x.data)),
            map(x => x.Adatcsomag)
        );
    }

    async getTanarProfil(): Promise<Observable<TanarProfil>> {
        console.log("getTanarProfil()");
        return this.getAuthenticatedAdatcsomag<TanarProfil>(
            "/Naplo/v2/Tanar/Profil",
            this.longtermStorageExpiry
        );
    }

    async getNaploEnum(engedelyezettEnumName: string = "MulasztasTipusEnum"): Promise<KretaEnum[]> {
        const access_token = await this.getValidAccessToken();
        return (
            await this.data.getUrlWithCache(
                this.institute.Url +
                    "/Naplo/v2/Enum/NaploEnum?hash=&engedelyezettEnumName=" +
                    engedelyezettEnumName,
                null,
                {
                    Authorization: "Bearer " + access_token,
                },
                this.longtermStorageExpiry
            )
        )
            .pipe(
                map(x => JSON.parse(x.data)),
                map(x => x.Adatcsomag)
            )
            .toPromise();
    }

    async getTimetable(day: Date, forceRefresh: boolean = false): Promise<Observable<Lesson[]>> {
        console.log("getTimetable()");

        day.setUTCHours(0, 0, 0, 0);
        return this.getAuthenticatedAdatcsomag<Lesson[]>(
            "/Naplo/v2/Orarend/OraLista?datumUtc=" + day.toISOString(),
            30 * 60,
            forceRefresh
        );
    }

    async getOsztalyTanuloi(osztalyCsoportId: number): Promise<Observable<OsztalyTanuloi>> {
        console.log("getOsztalyTanuloi()");

        return this.getAuthenticatedAdatcsomag<OsztalyTanuloi>(
            "/Naplo/v2/Ora/OsztalyTanuloi?osztalyCsoportId=" + osztalyCsoportId,
            60 * 60 * 24 * 3
        );
    }

    async getJavasoltJelenlet(ora: Lesson): Promise<Observable<JavasoltJelenletTemplate>> {
        console.log("getJavasoltJelenlet()");

        let url = "";
        if (ora.OrarendiOraId)
            url =
                this.institute.Url +
                "/Naplo/v2/Ora/OrarendiOra/JavasoltJelenlet?key[0].OrarendiOraId=" +
                ora.OrarendiOraId +
                "&key[0].OraKezdetDatumaUtc=" +
                ora.KezdeteUtc +
                "&key[0].OraVegDatumaUtc=" +
                ora.VegeUtc;
        else
            url =
                this.institute.Url +
                "/Naplo/v2/Ora/TanitasiOra/JavasoltJelenlet?key[0].TanitasiOraId=" +
                ora.TanitasiOraId;

        const access_token = await this.getValidAccessToken();
        return (
            await this.data.getUrlWithCache(url, null, {
                Authorization: "Bearer " + access_token,
            })
        ).pipe(
            map(x => JSON.parse(x.data)),
            map(x => x[0])
        );
    }

    async getMulasztas(tanoraid: number): Promise<Observable<Mulasztas[]>> {
        console.log("getMulasztas()");

        return this.getAuthenticatedAdatcsomag(
            "/Naplo/v2/Ora/Mulasztas?hash=&tanoraId=" + tanoraid
        );
    }

    async getFeljegyzes(tanoraid: number): Promise<Observable<Feljegyzes[]>> {
        console.log("getFeljegyzes()");

        return this.getAuthenticatedAdatcsomag(
            "/Naplo/v2/Ora/Feljegyzes?hash=&tanoraId=" + tanoraid
        );
    }

    async getTanmenet(lesson: Lesson): Promise<Observable<Tanmenet>> {
        const access_token = await this.getValidAccessToken();
        return (
            await this.data.getUrlWithCache(
                this.institute.Url +
                    "/Naplo/v2/Tanmenet?key[0].OsztalycsoportId=" +
                    lesson.OsztalyCsoportId +
                    "&key[0].Tantargyid=" +
                    lesson.TantargyId +
                    "&key[0].FeltoltoTanarId=" +
                    this.currentUser["kreta:institute_user_id"],
                null,
                {
                    Authorization: "Bearer " + access_token,
                },
                60 * 60 * 24
            )
        ).pipe(
            map(x => JSON.parse(x.data)),
            map(x => x[0])
        );
    }

    async postLesson(data: object): Promise<any> {
        const access_token = await this.getValidAccessToken();
        const response = await this.data.postUrl(
            this.institute.Url + "/Naplo/v2/Orarend/OraNaplozas",
            data,
            {
                Authorization: "Bearer " + access_token,
            },
            "json"
        );

        this.firebase.logEvent("post_lesson");
        console.log("postLesson()", data, response);

        return JSON.parse(response.data);
    }

    async postErtekeles(data: object): Promise<any> {
        const access_token = await this.getValidAccessToken();
        const response = await this.data.postUrl(
            this.institute.Url + "/Naplo/v2/Ertekeles/OsztalyCsoportErtekeles",
            data,
            {
                Authorization: "Bearer " + access_token,
            },
            "json"
        );

        this.firebase.logEvent("post_evaluation");
        console.log("postErtekeles()", data, response);

        return JSON.parse(response.data);
    }

    async removeDayFromCache(day: Date) {
        let date = new Date(day);
        date.setUTCHours(0, 0, 0, 0);
        await this.data.removeItem(
            this.institute.Url + "/Naplo/v2/Orarend/OraLista?datumUtc=" + date.toISOString()
        );
    }

    async removeMulasztasFromCache(tanoraid: number) {
        await this.data.removeItem(
            this.institute.Url + "/Naplo/v2/Ora/Mulasztas?hash=&tanoraId=" + tanoraid
        );
    }

    async removeFeljegyzesFromCache(tanoraid: number) {
        await this.data.removeItem(
            this.institute.Url + "/Naplo/v2/Ora/Feljegyzes?hash=&tanoraId=" + tanoraid
        );
    }
}
