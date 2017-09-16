import {Card, CardType} from "./Card";
import {Color} from "./Color";

/**
 * Clase NumericCard, implementa la interface Card. Clase principal para las cartas de tipo numerica.
 *
 * @class NumericCard
 * @implements Card
 * @property points {number}
 * @property type {CardType.Numeric} Instacia de CardType.
 */
export class NumericCard implements Card {
    readonly points: number;
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