import {Card} from "./Card";
import {Colors} from "./Color";
import {ColorChangeCard} from "./ColorChangeCard";
import {PlusFourCard} from "./PlusFourCard";
import {SkipCard} from "./SkipCard";
import {ReturnCard} from "./ReturnCard";
import {PlusTwoCard} from "./PlusTwoCard";
import {NumericCard} from "./NumericCard";


/**
 * Clase Deck, clase principal del mazo de las cartas.
 *
 * @class Deck
 */
export class Deck {

    /**
     * @property cards
     * @type {Card[]}
     * @readonly
     */
    readonly cards: Card[];

    /**
     * @constructor
     */
    constructor() {
        this.cards = [];
    }

    /**
     * Metodo Fill llena el array de cards con las reglas de numero de cartas del juego.
     *
     * @method fill
     * @public
     */
    public fill(): void {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 10; j++) {
                this.cards.push(new NumericCard(j, Colors.BLUE));
                this.cards.push(new NumericCard(j, Colors.GREEN));
                this.cards.push(new NumericCard(j, Colors.RED));
                this.cards.push(new NumericCard(j, Colors.YELLOW));
            }

            this.cards.push(new PlusTwoCard(Colors.BLUE));
            this.cards.push(new PlusTwoCard(Colors.GREEN));
            this.cards.push(new PlusTwoCard(Colors.RED));
            this.cards.push(new PlusTwoCard(Colors.YELLOW));

            this.cards.push(new ReturnCard(Colors.BLUE));
            this.cards.push(new ReturnCard(Colors.GREEN));
            this.cards.push(new ReturnCard(Colors.RED));
            this.cards.push(new ReturnCard(Colors.YELLOW));

            this.cards.push(new SkipCard(Colors.BLUE));
            this.cards.push(new SkipCard(Colors.GREEN));
            this.cards.push(new SkipCard(Colors.RED));
            this.cards.push(new SkipCard(Colors.YELLOW));
        }

        for (let i = 0; i < 4; i++) {
            this.cards.push(new PlusFourCard());
            this.cards.push(new ColorChangeCard());
        }
    }

    /**
     * Metodo get Size retorna el tamaño del array Cards.
     *
     * @method size
     * @type get
     * @return {number} Retorna el tamaño del Array Cards.
     * @public
     */
    public get size(): number {
        return this.cards.length;
    }

    /**
     * Metodo Suffle revuelve el orden de los objetos del array Cards.
     *
     * @method suffle
     * @public
     */
    public suffle(): void {
        this.cards.sort((a, b) => 0.5 - Math.random());
    }

    /**
     * Metodo Pop retorna un objeto de tipo Card.
     *
     * @method pop
     * @return {Card} Retorna un objeto de tipo Card.
     * @public
     */
    public pop(): Card {
        return this.cards.pop();
    }

    /**
     * Metodo popAmount recibe la cantidad de cartas a sacar del array de Cards.
     *
     * @method popAmount
     * @param {number} amount
     * @return {Card[]} Retorna un numero de objetos de tipo Card según el parametro.
     * @public
     */
    public popAmount(amount: number): Card[] {
        return this.cards.splice(this.cards.length - amount, amount);
    }

    /**
     * Metodo Push recibe el objeto Card y lo agrega al Array de Cards.
     *
     * @method push
     * @param {Card} card
     * @public
     */
    public push(card: Card): void {
        this.cards.push(card);
    }

    /**
     * Metodo putFirst recibe un objeto Card y lo agregar al principio del Array de Cards.
     *
     * @method putFirst
     * @param {Card} card
     * @public
     */
    public putFirst(card: Card): void {
        this.cards.splice(0, 0, card);
    }
}