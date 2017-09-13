import {Card, CardType} from "./Card";
import {NumericCard} from "./NumericCard";
import {ColorChangeCard} from "./ColorChangeCard";
import {PlusFourCard} from "./PlusFourCard";
import {PlusTwoCard} from "./PlusTwoCard";
import {ReturnCard} from "./ReturnCard";
import {SkipCard} from "./SkipCard";

export class Utils {

    public static createCard(card: Card): Card {
        switch (card.type) {
            case CardType.Numeric:
                return new NumericCard((card as NumericCard).num, card.color);
            case CardType.ColorChange:
                return new ColorChangeCard();
            case CardType.PlusFour:
                return new PlusFourCard();
            case CardType.PlusTwo:
                return new PlusTwoCard(card.color);
            case CardType.Return:
                return new ReturnCard(card.color);
            case CardType.Skip:
                return new SkipCard(card.color);
        }
    }

    public static createCards(cards: Card[]): Card[] {
        return cards.map(card => Utils.createCard(card));
    }


    public static compareCard(card1: Card, card2: Card): boolean {

        if (card1.type != card2.type) {
            return false;
        }

        if (card1.color.code != card2.color.code) {
            return false;
        }

        if (card1.type == CardType.Numeric) {
            return (card1 as NumericCard).num == (card2 as NumericCard).num;
        } else {
            return true;
        }
    }
}