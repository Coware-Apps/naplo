import { KretaEnum } from "./kreta-enum";

export interface JavasoltJelenletTemplate {
    Prioritas: number;
    Tipus: string;
    SzuroElemLista: JavasoltJelenletButton[];
}

export interface JavasoltJelenletButton {
    IsDefault: boolean;
    IsEnabled: boolean;
    MulasztasTipusAdatszotar: KretaEnum;
}
