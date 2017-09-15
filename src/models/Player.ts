import {Card} from "./Card";
import {isArray} from "util";

export class Player {
    cards: Card[];
    points: number;
    saidUno: boolean;
    ready: boolean;

    constructor(public readonly id: number, public name: string) {
        this.cards = [];
        this.points = 0;
        this.saidUno = false;
        this.ready = false;
    }

    public add(newCard: Card): void {
        this.cards.push(newCard);
        if (this.cards.length > 1) {
            this.saidUno = false;
        }
    }

    public addArray(newCards: Card[]): void {
        this.cards.push(... newCards);
        if (this.cards.length > 1) {
            this.saidUno = false;
        }
    }

    public getCardPoints(): number {
        return this.cards.map(c => c.points).reduce((a,  b) => a + b);
    }
}