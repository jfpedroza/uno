import {Color} from "./Color";

/**
 * Interface Card define metodos y propiedades de los objetos Card.
 *
 * @interface Card
 * @version 1.0
 */
export interface Card {

    /**
     * La propiedad color representa el color de la carta.
     *
     * @property color
     * @type {Color}
     * @readonly
     */
    readonly color: Color;
    /**
     * La propiedad Type representa el tipo de la carta.
     *
     * @property type
     * @type {CardType}
     * @readonly
     */
    readonly type: CardType;
    /**
     * La propiedad Points representa el numero de puntos de la carta.
     *
     * @property points
     * @type {number}
     * @readonly
     */
    readonly points: number;

    /**
     * @method getImageName
     * @return {string}
     */
    getImageName(): string;

    /**
     * @method getName
     * @return {string}
     */
    getName(): string;
}

/**
 * Lista de propiedades de CardType
 *
 * @enum CardType
 */
export enum CardType {
    Numeric,
    PlusTwo,
    PlusFour,
    Skip,
    Return,
    ColorChange
}