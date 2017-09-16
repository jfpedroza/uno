import {Card} from "./Card";

/**
 * Clase Player, clase principal del jugador define las propiedades del mismo.
 *
 * @class Player
 * @property cards {Card}
 * @property points {number}
 * @property saidUno {boolean}
 * @property ready {boolean}
 */
export class Player {
    cards: Card[];
    points: number;
    saidUno: boolean;
    ready: boolean;

    /**
     * @constructor
     * @param {number} id
     * @param {string} name
     */
    constructor(public readonly id: number, public name: string) {
        this.cards = [];
        this.points = 0;
        this.saidUno = false;
        this.ready = false;
    }

    /**
     * Metodo add, agregar una carta al array del cartas del jugardor.
     *
     * @method add
     * @param {Card} newCard
     * @public
     */
    public add(newCard: Card): void {
        this.cards.push(newCard);
        if (this.cards.length > 1) {
            this.saidUno = false;
        }
    }

    /**
     * Metodo addArray, agregar un array de cartas al array de cartas del jugador.
     *
     * @method addArray
     * @param {Card[]} newCards
     * @public
     */
    public addArray(newCards: Card[]): void {
        this.cards.push(... newCards);
        if (this.cards.length > 1) {
            this.saidUno = false;
        }
    }

    /**
     * Metodo getCardPoints retorna los puntos de las cartas del array de cartas del jugador.
     *
     * @method getCardPoints
     * @return {number} Retorna los puntos por cada carta.
     * @public
     */
    public getCardPoints(): number {
        return this.cards.map(c => c.points).reduce((a,  b) => a + b);
    }
}