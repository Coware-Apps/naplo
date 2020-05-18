interface MessageStatusz {
    azonosito: number;
    kod: string;
    rovidNev: string;
    nev: string;
    leiras: string;
}

interface MessageTipus {
    azonosito: number;
    kod: string;
    rovidNev: string;
    nev: string;
    leiras: string;
}

interface MessageCsatolmanyok {
    azonosito: number;
    fajlNev: string;

    //not from the server
    downloadProgressPercent?: number;
    isDownloadFailed?: boolean;
}

interface MessageUzenet {
    azonosito: number;
    kuldesDatum: string;
    feladoNev: string;
    feladoTitulus: string;
    szoveg: string;
    targy: string;
    statusz: MessageStatusz;
    cimzettLista: MessageAddressee[];
    csatolmanyok: MessageCsatolmanyok[];
    hibaCorrellationId?: string;
}

/**
 * The messages contain an array of this
 */
export interface MessageAddressee {
    azonosito: number;
    kretaAzonosito: number;
    nev: string;
    tipus: MessageTipus;
}

/**
 * You get this, if you open a message from the messages list. It includes all data
 */
export interface Message {
    azonosito: number;
    isElolvasva: boolean;
    isToroltElem: boolean;
    tipus: MessageTipus;
    uzenet: MessageUzenet;
}

/**
 * You get an array of this, when you make any message list request (inbox, outbox, deleted)
 */
export interface MessageListItem {
    azonosito: number;
    uzenetAzonosito: number;
    uzenetKuldesDatum: Date;
    uzenetFeladoNev?: string;
    uzenetFeladoTitulus?: string;
    uzenetCimzettLista?: MessageAddressee[];
    uzenetTargy: string;
    hasCsatolmany: boolean;
    isElolvasva: boolean;
    /**
     * If it's successfully sent, uzenetStatusz.azonosito is 2
     */
    uzenetStatusz: MessageStatusz;

    isSelected?: boolean;
}

export interface MessageAttachmentToSend {
    fajlNev: string;
    fajl: {
        ideiglenesFajlAzonosito: string;
        utvonal?: string;
        fileHandler?: string;
        azonosito?: string;
    };
    iktatoszam?: any;
    /**
     * Only used when forwarding a message (prevMsg.uzenet.csatolmanyok[0].azonosito)
     */
    azonosito?: number;

    // not from the server
    uploadProgressPercent?: number;
    isFailedUpload?: boolean;
}
