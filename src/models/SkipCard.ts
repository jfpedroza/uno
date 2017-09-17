/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

/**
 * Clase SkipCard, clase principal de la carta de salto de turno. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class SkipCard
 * @extends ActionCard
 */
export class SkipCard extends ActionCard {

    /**
     * @inheritDoc
     */
    readonly type = CardType.Skip;

    /**
     * @constructor
     * @param {Color} color Color de la carta
     */
    constructor(color: Color) {
        super("S", color, 20);
    }

    /**
     * @inheritDoc
     * @override
     */
    getName(): string {
        return `Salto de turno ${this.color.name}`;
    }
}