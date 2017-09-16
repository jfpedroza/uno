import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

/**
 * Clase ReturnCard, clase principal de la carta de cambio de sentido. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class ReturnCard
 * @extends ActionCard
 * @property type {CardType}
 */
export class ReturnCard extends ActionCard {
    readonly type = CardType.Return;

    /**
     * @constructor
     * @param {Color} color
     */
    constructor(public readonly color: Color) {
        super("R", color, 20);
    }

    /**
     * Funcion getName retorna el nombre y el color de la carta.
     *
     * @function getName
     * @return {string} Retorna el nombre de la carta.
     */
    getName(): string {
        return `Cambio de sentido ${this.color.name}`;
    }
}