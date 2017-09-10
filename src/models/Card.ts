import {Color} from "./Color";

export interface Card {
    readonly color: Color;
    readonly type: CardType;
    readonly points: number;
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