import {Card} from "./Card";
import {isArray} from "util";

export class Player {
    cards: Card[];
    points: number;

    constructor(public readonly id: number, public name: string) {
        this.cards = [];
        this.points = 0;
    }

    public add(newCards: Card): void {
        this.cards.push(newCards as Card);
    }

    public addArray(newCards: Card[]): void {
        this.cards.push(... newCards);
    }
}