import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

export class PlusTwoCard extends ActionCard {
    readonly type = CardType.PlusTwo;

    constructor(public readonly color: Color) {
        super("+2", color, 20);
    }
}