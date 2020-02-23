import { KretaEnum } from "./kreta-enum";

export interface KretaTanuloErtekeles {
    MobilId: number;
    TanuloId: number;
    Ertekeles: {
        OsztalyzatTipus?: KretaEnum;
        Szazalek?: number;
        Szoveg?: string;
    };
}
