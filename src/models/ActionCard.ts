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

    /**
     * @inheritDoc
     */
    readonly type: CardType;

    /**
     * @inheritDoc
     */
    readonly color: Color;

    /**
     * @inheritDoc
     */
    readonly points: number;

    /**
     * Código usando para identificar qué carta de acción es. También se usa en el nombre.
     * Los códigos son los siguentes:
     * - C: Cambio de color
     * - +4: +4
     * - +2: +2
     * - R: Carta de retorno
     * - S: Salto de turno
     *
     * @property code
     * @type {string}
     * @readonly
     */
    readonly code: string;

    /**
     * Constructor de la clase ActionCard.
     *
     * @constructor
     * @param code {string} Recibe el codigo de la carta.
     * @param color {Color} Instancia de Color para agregar como hijo de esta instancia de objeto.
     * @param points {number} Recibe el numero de puntos de la carta.
     */
    constructor(code: string, color: Color, points: number) {
        this.code = code;
        this.color = color;
        this.points = points;
    }

    /**
     * @inheritDoc
     */
    getImageName(): string {
        return this.code + this.color.code + ".png";
    }

    /**
     * @inheritDoc
     */
    getName(): string {
        return `${this.code} ${this.color.name}`;
    }
}