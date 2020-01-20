export interface Tanulo {
    Id: number;
    Nev: string;
    AnyjaNev: string;
    SzuletesUtc: Date;
    TanugyiAdatok: {
        IsJogviszonySzunetelteto: boolean;
        IsSzakmaiGyakorlatonLevo: boolean;
    };
}

export interface OsztalyTanuloi {
    Id: number;
    Nev: string;
    TanuloLista: Tanulo[];
}