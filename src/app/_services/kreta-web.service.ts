import { Injectable } from "@angular/core";
import { HTTP, HTTPResponse } from "@ionic-native/http/ngx";

@Injectable({
    providedIn: "root",
})
export class KretaWebService {
    private _userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";
    private _instituteUrl: string;

    constructor(private _http: HTTP) {
        this._http.setFollowRedirect(false);
    }

    public async login(
        instituteUrl: string,
        username: string,
        password: string
    ): Promise<HTTPResponse> {
        this._http.clearCookies();
        try {
            const headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": this._userAgent,
            };
            const params = {
                UserName: username,
                Password: password,
                ReCaptchaIsEnabled: false,
            };
            const response = await this._http.post(
                `${instituteUrl}/Adminisztracio/Login/LoginCheck`,
                params,
                headers
            );
            this._instituteUrl = instituteUrl;
            await this._chooseRole();
            return response;
        } catch (error) {
            console.error("[WEB-API] Error during login attempt", error);
        }
    }

    private async _chooseRole(): Promise<HTTPResponse> {
        try {
            return await this._http.get(
                `${this._instituteUrl}/Adminisztracio/SzerepkorValaszto`,
                {},
                {
                    "User-Agent": this._userAgent,
                }
            );
        } catch (error) {
            console.error("[WEB-API] Error during role selection", error);
        }
    }

    public async getCommunityServiceData(): Promise<HTTPResponse> {
        try {
            const headers = {
                "User-Agent": this._userAgent,
            };
            const params = {
                sort: "IntervallumKezdete-desc",
                group: "",
                filter: "",
                data: "{}",
                _: "1582481843171",
            };
            let response = await this._http.get(
                `${this._instituteUrl}/api/TanuloKozossegiSzolgalataiApi/GetTanuloKozossegiSzolgalataiGrid`,
                params,
                headers
            );
            return response;
        } catch (error) {
            console.error("[WEB-API] Error during community service request", error);
        }
    }

    public async logout(): Promise<void> {
        try {
            const headers = {
                "User-Agent": this._userAgent,
            };
            const params = {};
            await this._http.post(`${this._instituteUrl}/Layout/LogOut`, params, headers);
            this._http.clearCookies();
        } catch (error) {
            console.error("[WEB-API] Error during logout attempt", error);
        }
    }

    public async getRemainingLoginTime(): Promise<number> {
        try {
            const headers = {
                "User-Agent": this._userAgent,
            };
            const params = {};
            let response = await this._http.post(
                `${this._instituteUrl}/Layout/GetRemainingTime`,
                params,
                headers
            );
            return response.data;
        } catch (error) {
            console.error("[WEB-API] Error during logout attempt", error);
        }
    }
}
