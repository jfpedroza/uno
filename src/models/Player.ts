import {Card} from "./Card";
import {isArray} from "util";

export class Player {
    cards: Card[];
    points: number;
    saidUno: boolean;

    constructor(public readonly id: number, public name: string) {
        this.cards = [];
        this.points = 0;
        this.saidUno = false;
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
}