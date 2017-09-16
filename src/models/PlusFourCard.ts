import {ActionCard} from "./ActionCard";
import {Colors} from "./Color";
import {CardType} from "./Card";

/**
 * Clase PlusFourCard, clase principal del +4. Define las propiedades de este. Además, extiende la clase ActionCard.
 *
 * @class PlusFourCard
 * @extends ActionCard
 * @property type {CardType}
 */
export class PlusFourCard extends ActionCard {
    readonly type = CardType.PlusFour;

    /**
     * @constructor
     */
    constructor() {
        super("+4", Colors.ALL, 50);
    }

    /**
     * Funcion getName retonar el nombre de la carta.
     *
     * @function getName
     * @return {string} Retorna el nombre de la carta.
     * @public
     */
    getName(): string {
        return `${this.code}`;
    }
}