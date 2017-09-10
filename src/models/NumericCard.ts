import {Card, CardType} from "./Card";
import {Color} from "./Color";

export class NumericCard implements Card {
    readonly points: number;
    readonly type = CardType.Numeric;

    constructor(public readonly num: number, public readonly color: Color) {
        this.points = num;
    }

    getImageName(): string {
        return this.num + this.color.code + ".png";
    }

    getName(): string {
        return `${this.num} ${this.color.name}`;
    }
}