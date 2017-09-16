import {Card, CardType} from "./Card";
import {Color} from "./Color";

/**
 * Clase NumericCard, implementa la interface Card. Clase principal para las cartas de tipo numerica.
 *
 * @class NumericCard
 * @implements Card
 */
export class NumericCard implements Card {

    /**
     * La propiedad points representa los puntos de la carta numerica. Estos corresponden al numero de la carta.
     *
     * @property points
     * @type {number}
     * @readonly
     */
    readonly points: number;

    /**
     * La propiedad type representa el tipo de la carta numerica. Esta corresponden a una carta numerica.
     *
     * @property type
     * @type {CardType}
     * @readonly
     */
    readonly type = CardType.Numeric;

    /**
     * @constructor
     * @param {number} num
     * @param {Color} color
     */
    constructor(public readonly num: number, public readonly color: Color) {
        this.points = num;
    }

    /**
     * Funcion getImageName retorna el nombre de la imagen numerica.
     *
     * @function getImageName
     * @return {string} Retorna el nombre de la imagen numerica.
     */
    getImageName(): string {
        return this.num + this.color.code + ".png";
    }

    /**
     * Funcion getName retorna el numero y el color de la carta.
     *
     * @function getName
     * @return {string} Retorna el color de la imagen.
     */
    getName(): string {
        return `${this.num} ${this.color.name}`;
    }
}