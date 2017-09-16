import {ActionCard} from "./ActionCard";
import {Color} from "./Color";
import {CardType} from "./Card";

/**
 * Clase SkipCard, clase principal de la carta de salto de turno. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class SkipCard
 * @extends ActionCard
 * @property type {CardType}
 */
export class SkipCard extends ActionCard {
    readonly type = CardType.Skip;

    /**
     * @constructor
     * @param {Color} color
     */
    constructor(public readonly color: Color) {
        super("S", color, 20);
    }

    /**
     * Funcion getName retorna el nombre y el color de la carta.
     *
     * @function getName
     * @return {string} Retorna el nombre de la carta.
     */
    getName(): string {
        return `Salto de turno ${this.color.name}`;
    }
}