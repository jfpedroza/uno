/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

/**
 * Clase ReturnCard, clase principal de la carta de cambio de sentido. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class ReturnCard
 * @extends ActionCard
 */
export class ReturnCard extends ActionCard {

    /**
     * @inheritDoc
     */
    readonly type = CardType.Return;

    /**
     * @constructor
     * @param {Color} color Color de la carta
     */
    constructor(color: Color) {
        super("R", color, 20);
    }

    /**
     * @inheritDoc
     * @override
     */
    getName(): string {
        return `Cambio de sentido ${this.color.name}`;
    }
}