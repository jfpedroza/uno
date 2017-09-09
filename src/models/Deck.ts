import {Card} from "./Card";
import {Colors} from "./Color";
import {ColorChangeCard} from "./ColorChangeCard";
import {PlusFourCard} from "./PlusFourCard";
import {SkipCard} from "./SkipCard";
import {ReturnCard} from "./ReturnCard";
import {PlusTwoCard} from "./PlusTwoCard";
import {NumericCard} from "./NumericCard";

export class Deck {
    readonly cards: Card[];

    constructor() {
        this.cards = [];
    }

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

    public get size(): number {
            return this.cards.length;
    }

    public suffle(): void {
        this.cards.sort((a, b) => 0.5 - Math.random());
    }

    public pop(): Card {
        return this.cards.pop();
    }

    public popAmount(amount: number): Card[] {
        return this.cards.splice(this.cards.length - amount, amount);
    }

    public push(card: Card): void {
        this.cards.push(card);
    }

    public putFirst(card: Card): void {
        this.cards.splice(0, 0, card);
    }
}