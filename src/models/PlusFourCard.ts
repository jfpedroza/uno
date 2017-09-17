/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {ActionCard} from "./ActionCard";
import {Colors} from "./Color";
import {CardType} from "./Card";

/**
 * Clase PlusFourCard, clase principal del +4. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class PlusFourCard
 * @extends ActionCard
 */
export class PlusFourCard extends ActionCard {

    /**
     * @inheritDoc
     */
    readonly type = CardType.PlusFour;

    /**
     * @constructor
     */
    constructor() {
        super("+4", Colors.ALL, 50);
    }

    /**
     * @inheritDoc
     * @override
     */
    getName(): string {
        return `${this.code}`;
    }
}