import { getCardAsValue } from './util';

export const addCardToState = (player: CardState, card: Card): CardState => {
  const score = player.score + getCardAsValue(card);
  const hasAce = player.hasAce || card === 'A';

  return {
    score,
    hasAce: score <= 10 && hasAce,
    hasPair: false,
    hasBlackjack: false,
  };
};

export const setupCardState = (cards: Card[]): CardState => {
  const score = cards.reduce(
    (acc, card) => (acc as number) + getCardAsValue(card),
    0
  ) as number;
  const hasAce = cards.includes('A');
  const hasBlackjack = hasAce && score === 11 && cards.length === 2;

  return {
    score,
    hasAce: score <= 10 && hasAce,
    hasPair: cards[0] === cards[1] && cards.length === 2,
    hasBlackjack,
  };
};
