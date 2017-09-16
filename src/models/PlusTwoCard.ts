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
     * La propiedad type representa el tipo de la carta la cuenta es una carta de acción y con la propiedad +2.
     *
     * @property type
     * @type {CardType}
     * @readonly
     */
    readonly type = CardType.PlusTwo;

    /**
     * @constructor
     * @param {Color} color
     */
    constructor(public readonly color: Color) {
        super("+2", color, 20);
    }
}