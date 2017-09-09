import {ActionCard} from "./ActionCard";
import {Colors} from "./Color";
import {CardType} from "./Card";

export class ColorChangeCard extends ActionCard {
    readonly type = CardType.ColorChange;

    constructor() {
        super("C", Colors.ALL);
    }

    getName(): string {
        return "Cambio de color";
    }
}