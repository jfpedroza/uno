/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {ActionCard} from "./ActionCard";
import {Colors} from "./Color";
import {CardType} from "./Card";

/**
 *
 * Representa una carta de cambio de color.
 *
 * @class ColorChangeCard
 * @extends ActionCard
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
     * @inheritDoc
     * @override
     */
    getName(): string {
        return "Cambio de color";
    }
}