/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Card} from "./Card";

/**
 * Clase Player, clase principal del jugador define las propiedades del mismo.
 *
 * @class Player
 */
export class Player {

    /**
     * La propiedad cards representa el vector de cartas del jugador.
     *
     * @property cards
     * @type {Card[]}
     */
    cards: Card[];

    /**
     * La propiedad points representa el numero de puntos del jugador.
     *
     * @property points
     * @type {number}
     */
    points: number;

    /**
     * La propiedad saidUno representa el true/false del estado "dijo uno" del jugador.
     *
     * @property saidUno
     * @type {boolean}
     */
    saidUno: boolean;

    /**
     * La propiedad ready representa el estado del jugador, si está o no listo para jugar.
     *
     * @property ready
     * @type {boolean}
     */
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