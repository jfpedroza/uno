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
     * La propiedad type representa el tipo de la carta la cuenta es una carta de acción y con la propiedad cambio de sentido.
     *
     * @property type
     * @type {CardType}
     * @readonly
     */
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