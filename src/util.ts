export const getCardAsValue = (card: Card): number => {
  if (['J', 'Q', 'K'].includes(card as string)) {
    return 10;
  }
  if (card === 'A') {
    return 1;
  }
  return card as number;
};

export const resultKey = (player: CardState, dealer: CardState): string =>
  `${player.score}-${player.hasAce}-${player.hasPair}-${player.hasBlackjack}-${dealer.score}-${dealer.hasAce}-${dealer.hasBlackjack}`;

export const getBetterResult = (results: Results): Possibilities => {
  const betterResult =
    results.hit.winning / results.hit.losing >
    results.stand.winning / results.stand.losing
      ? 'hit'
      : 'stand';

  return results[betterResult];
};

export const resultsInPercentage = (results: Results) => ({
  hit: {
    winning: results.hit.winning / 13,
    losing: results.hit.losing / 13,
    draw: results.hit.draw / 13,
  },
  stand: {
    winning: results.stand.winning / 13,
    losing: results.stand.losing / 13,
    draw: results.stand.draw / 13,
  },
  double: {
    winning: results.double.winning / 13,
    losing: results.double.losing / 13,
    draw: results.double.draw / 13,
  },
  split: {
    winning: results.split.winning / 13,
    losing: results.split.losing / 13,
    draw: results.split.draw / 13,
  },
});
