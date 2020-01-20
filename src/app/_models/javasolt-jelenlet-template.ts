export interface JavasoltJelenletTemplate {
    OrarendiOraId: number;
    OraKezdetDatumaUtc: Date;
    TanuloLista: {
        TanuloId: number;
        JavasoltJelenletTemplateTipusSzuroLista: {
            Megjegyzes: string;
            Tipus: string;
        }[];
    }[];
}

