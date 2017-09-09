import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

export class ReturnCard extends ActionCard {
    readonly type = CardType.Return;

    constructor(public readonly color: Color) {
        super("R", color);
    }

    getName(): string {
        return `Cambio de sentido ${this.color.name}`;
    }
}