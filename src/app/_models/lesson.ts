import { KretaEnum } from "./kreta-enum";

export interface Lesson {
    OrarendiOraId?: number;
    TanitasiOraId?: number;
    Allapot: KretaEnum;
    KezdeteUtc: Date;
    VegeUtc: Date;
    EvesOraszam: number;
    Oraszam: number;
    IsElmaradt: boolean;
    Tema: string;
    TantargyId: number;
    TantargyNev: string;
    TantargyKategoria: string;
    OsztalyCsoportId: number;
    OsztalyCsoportNev: string;
    TeremNev: string;
    HazifeladatSzovege?: any;
    HazifeladatId?: any;
    HazifeladatHataridoUtc?: any;
    OraTulajdonosTanar: KretaEnum;
    HelyettesitoId?: any;
}
