import { Injectable, RendererFactory2, Inject, Renderer2 } from "@angular/core";
import { Platform } from "@ionic/angular";
import { DOCUMENT, registerLocaleData } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";

import { Globalization } from "@ionic-native/globalization/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { FirebaseService } from "./firebase.service";
import { DataService } from "./data.service";

import { themes } from "../../theme/themes";
import { Institute, ErtekelesTipus } from "../_models";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})
export class ConfigService {
    private _locale: string;
    public get locale(): string {
        return this._locale;
    }
    public set locale(v: string) {
        this.data.saveSetting("locale", v);
        this.applyLocale(v);
    }

    private _theme: string;
    public get theme(): string {
        return this._theme || "light";
    }
    public set theme(v: string) {
        this.data.saveSetting("theme", v);
        this.applyTheme(v);
    }

    private _debugging: boolean;
    public get debugging(): boolean {
        return this._debugging;
    }
    public set debugging(v: boolean) {
        this.data.saveSetting("debugging", v);
        this._debugging = v;
    }

    private _analytics: boolean;
    public get analytics(): boolean {
        return this._analytics || true;
    }
    public set analytics(v: boolean) {
        this.data.saveSetting("analytics", v);
        this._analytics = v;
        this.firebase.setAnalyticsCollectionEnabled(v);
    }

    private _defaultErtekelesTipus: ErtekelesTipus;
    public get defaultErtekelesTipus(): ErtekelesTipus {
        return this._defaultErtekelesTipus || ErtekelesTipus.Osztalyzat;
    }
    public set defaultErtekelesTipus(v: ErtekelesTipus) {
        this.data.saveSetting("defaultErtekelesTipus", v);
        this._defaultErtekelesTipus = v;
    }

    private renderer: Renderer2;

    // https://github.com/ionic-team/ionic/issues/17600
    private _swipeGestureEnabled = true;
    public get swipeGestureEnabled(): boolean {
        return this.platform.is("ios") ? this._swipeGestureEnabled : false;
    }
    public set swipeGestureEnabled(v: boolean) {
        this._swipeGestureEnabled = v;
    }

    constructor(
        private globalization: Globalization,
        private data: DataService,
        private statusBar: StatusBar,
        private rendererFactory: RendererFactory2,
        private firebase: FirebaseService,
        private translate: TranslateService,
        private platform: Platform,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    public async onInit() {
        const res = await Promise.all([
            this.applyTheme(),
            this.applyLocale(),
            this.data.getSetting<Institute>("debugging").catch(() => null),
            this.data.getSetting<Institute>("analytics").catch(() => null),
            this.data.getSetting<ErtekelesTipus>("defaultErtekelesTipus").catch(() => null),
        ]);

        this._debugging = res[2];
        this._analytics = res[3];
        this._defaultErtekelesTipus = res[4];

        if (!environment.production) {
            this.firebase.setAnalyticsCollectionEnabled(false);
            this.firebase.setPerformanceCollectionEnabled(false);
            this.firebase.setCrashlyticsCollectionEnabled(false);
            this.firebase.unregister();
        } else {
            this.firebase.setAnalyticsCollectionEnabled(this.analytics);
        }

        this.firebase.fetchConfig().then(() => this.firebase.activateFetchedConfig());
    }

    public async applyTheme(theme?: string, setStatusbar: boolean = true) {
        if (!theme) {
            theme = await this.data.getSetting<string>("theme").catch(() => {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
                return prefersDark.matches ? "dark" : "light";
            });
        }

        this._theme = theme;

        if (setStatusbar) {
            this.statusBar.styleLightContent();
            if (theme == "dark") {
                this.statusBar.backgroundColorByHexString("#000000");
            } else {
                this.statusBar.backgroundColorByHexString("#3880ff");
            }
        }

        themes.forEach(t => {
            this.renderer.removeClass(this.document.body, t.id);
        });

        this.renderer.addClass(this.document.body, theme);
    }

    private async applyLocale(locale?: string) {
        if (!locale) {
            locale = await this.data
                .getSetting<string>("locale")
                .catch(async () =>
                    (await this.globalization.getLocaleName()).value.substring(0, 2)
                );
        }

        this._locale = locale;
        this.translate.use(locale);

        if (locale == "en") return; // az 'en' már gyárilag be van töltve

        return import(
            /* webpackInclude: /(hu|de)\.js$/ */
            `@angular/common/locales/${locale}.js`
        ).then(module => registerLocaleData(module.default));
    }

    public getBackButtonText(): string | null {
        return this.platform.is("ios") ? this.translate.instant("common.back") : null;
    }
}
