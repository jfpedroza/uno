import {Color} from "./Color";

/**
 * Interface Card define metodos y propiedades de los objetos Card.
 *
 * @interface Card
 * @property color {Color} Instancia de Color.
 * @property type {CardType} Instancia de CardType.
 * @property points {number}
 * @method getImageName
 * @method getName
 * @version 1.0
 */
export interface Card {
    readonly color: Color;
    readonly type: CardType;
    readonly points: number;
    getImageName(): string;
    getName(): string;
}

/**
 * Lista de propiedades de CardType
 *
 * @enum CardType
 * @property Numeric
 * @property PlusTwo
 * @property PlusFour
 * @property Skip
 * @property Return
 * @property ColorChange
 */
export enum CardType {
    Numeric,
    PlusTwo,
    PlusFour,
    Skip,
    Return,
    ColorChange
}