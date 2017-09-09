import {Card, CardType} from "./Card";
import {Color} from "./Color";

export class NumericCard implements Card {
    readonly type = CardType.Numeric;

    constructor(public readonly num: number, public readonly color: Color) {

    }

    getImageName(): string {
        return this.num + this.color.code + ".png";
    }

    getName(): string {
        return `${this.num} ${this.color.name}`;
    }
}