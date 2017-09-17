/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

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
     * Función que retorna el nombre de la imagen.
     *
     * @function getImageName
     * @return {string} retorna el nombre de la imagen.
     */
    getImageName(): string;


    /**
     * Función que retorna el nombre de la carta y su color.
     *
     * @function getName
     * @return {string} retorna el color de la imagen.
     * @public
     */
    getName(): string;
}

/**
 * Representa cada uno de los tipos de cartas que pueden haber
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