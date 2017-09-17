/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Card} from "./Card";

/**
 * Clase Player, clase principal del jugador, define las propiedades del mismo.
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
     * @default 0
     */
    points: number = 0;

    /**
     * La propiedad saidUno representa el true/false del estado "dijo uno" del jugador.
     *
     * @property saidUno
     * @type {boolean}
     * @default false
     */
    saidUno: boolean = false;

    /**
     * La propiedad ready representa el estado del jugador, si está o no listo para jugar.
     *
     * @property ready
     * @type {boolean}
     * @default false
     */
    ready: boolean = false;

    /**
     * @constructor
     * @param {number} id
     * @param {string} name
     */
    constructor(public readonly id: number, public name: string) {
        this.cards = [];
    }

    /**
     * Metodo add, agregar una carta al array del cartas del jugardor.
     *
     * @method add
     * @param {Card} newCard Nueva carta a agregar.
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
     * @param {Card[]} newCards Nuevas cartas a agregar.
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
     * @return {number} Número de puntos totales en las cartas del jugador.
     * @public
     */
    public getCardPoints(): number {
        return this.cards.map(c => c.points).reduce((a,  b) => a + b);
    }
}