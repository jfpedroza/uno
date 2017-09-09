import {Color} from "./Color";

export interface Card {
    readonly color: Color;
    readonly type: CardType;
    getImageName(): string;
    getName(): string;
}

export enum CardType {
    Numeric,
    PlusTwo,
    PlusFour,
    Skip,
    Return,
    ColorChange
}