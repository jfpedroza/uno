import {Card, CardType} from "./Card";
import {Color} from "./Color";

export abstract class ActionCard implements Card {
    readonly type: CardType;

    constructor(public readonly code: string, public readonly color: Color) {

    }

    getImageName(): string {
        return this.code + this.color.code + ".png";
    }

    getName(): string {
        return `${this.code} ${this.color.name}`;
    }
}