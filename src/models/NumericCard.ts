/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Card, CardType} from "./Card";
import {Color} from "./Color";

/**
 * Clase NumericCard, implementa la interface Card. Clase principal para las cartas de tipo numérico.
 *
 * @class NumericCard
 * @implements Card
 */
export class NumericCard implements Card {

    /**
     * @inheritDoc
     */
    readonly points: number;

    /**
     * @inheritDoc
     */
    readonly type = CardType.Numeric;

    /**
     * @inheritDoc
     */
    readonly color: Color;

    /**
     * Representa el número de la carta
     *
     * @property num
     * @type {number}
     * @readonly
     */
    readonly num: number;

    /**
     * @constructor
     * @param {number} num El número de la carta
     * @param {Color} color El color de la carta
     */
    constructor(num: number, color: Color) {
        this.num = num;
        this.points = num;
        this.color = color;
    }

    /**
     * @inheritDoc
     */
    getImageName(): string {
        return this.num + this.color.code + ".png";
    }

    /**
     * @inheritDoc
     */
    getName(): string {
        return `${this.num} ${this.color.name}`;
    }
}