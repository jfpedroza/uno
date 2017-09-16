import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

/**
 * Clase PlusTwoCard, clase principal del +2. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class PlusTwoCard
 * @extends ActionCard
 * @property type {CardType}
 */
export class PlusTwoCard extends ActionCard {
    readonly type = CardType.PlusTwo;

    /**
     * @constructor
     * @param {Color} color
     */
    constructor(public readonly color: Color) {
        super("+2", color, 20);
    }
}