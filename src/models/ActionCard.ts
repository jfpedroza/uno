/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Card, CardType} from "./Card";
import {Color} from "./Color";

/**
 * Clase principal de las {ActionCard} que implementa la interface {Card} para poder acceder a sus metodos y propiedades.
 *
 * @class ActionCard
 * @abstract
 * @implements Card
 * @version 1.0
 */
export abstract class ActionCard implements Card {
    readonly type: CardType;

    /**
     * Constructor de la clase Card.
     *
     * @constructor
     * @param code {string} Recibe el codigo de la carta.
     * @param color {Color} Instancia de Color para agregar como hijo de esta instancia de objeto.
     * @param points {number} Recibe el numero de puntos de la carta.
     */
    constructor(public readonly code: string, public readonly color: Color, public readonly points: number) {

    }

    /**
     * Función que retorna el nombre de la imagen.
     *
     * @function getImageName
     * @return {string} retorna el nombre de la imagen.
     * @public
     */
    getImageName(): string {
        return this.code + this.color.code + ".png";
    }
    /**
     * Función que retorna el nombre de la carta y su color.
     *
     * @function getName
     * @return {string} retorna el color de la imagen.
     * @public
     */
    getName(): string {
        return `${this.code} ${this.color.name}`;
    }
}