import { KretaEnum } from "./kreta-enum";

export interface TanuloErtekeles {
    MobilId: number;
    TanuloId: number;
    Ertekeles: {
        OsztalyzatTipus?: KretaEnum;
        Szazalek?: number;
        Szoveg?: string;
    };
}
