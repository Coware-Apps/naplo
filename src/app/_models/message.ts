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

export interface MessageAddresseeType {
    azonosito: number;
    kod: string;
    rovidNev: string;
    nev: string;
    leiras: string;
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
    uzenetKuldesDatum: string;
    uzenetFeladoNev: string;
    uzenetFeladoTitulus: string;
    uzenetTargy: string;
    hasCsatolmany: boolean;
    isElolvasva: boolean;
}
