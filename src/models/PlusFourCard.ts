import {ActionCard} from "./ActionCard";
import {Colors} from "./Color";
import {CardType} from "./Card";

export class PlusFourCard extends ActionCard {
    readonly type = CardType.PlusFour;

    constructor() {
        super("+4", Colors.ALL, 50);
    }
}