/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {ActionCard} from "./ActionCard";
import {Colors} from "./Color";
import {CardType} from "./Card";

/**
 *
 * Clase ColorChangeCard, extends ActionCard.
 *
 * @class ColorChangeCard
 * @extends ActionCard
 * @property type {readonly}
 */
export class ColorChangeCard extends ActionCard {
    readonly type = CardType.ColorChange;

    /**
     * @constructor
     */
    constructor() {
        super("C", Colors.ALL, 50);
    }


    /**
     * Funcion getName retorna el nombre de la carta Cambio de Color.
     *
     * @function getName {string}
     * @return {string} Cambio de color.
     * @public
     */
    getName(): string {
        return "Cambio de color";
    }
}