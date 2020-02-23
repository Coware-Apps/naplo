export interface Tanmenet {
    OsztalyCsoportId: number;
    TantargyId: number;
    FeltoltoTanarId: number;
    Items: TanmenetElem[];
}

export interface TanmenetElem {
    Id: number;
    Megjegyzes?: string;
    Nev: string;
    RovidNev?: string;
    Tema: string;
    EvesOraszam: number;
}
