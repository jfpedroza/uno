/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

/**
 * Clase PlusTwoCard, clase principal del +2. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class PlusTwoCard
 * @extends ActionCard
 */
export class PlusTwoCard extends ActionCard {

    /**
     * @inheritDoc
     */
    readonly type = CardType.PlusTwo;

    /**
     * @constructor
     * @param {Color} color Color de la carta
     */
    constructor(color: Color) {
        super("+2", color, 20);
    }
}