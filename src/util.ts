export const CARDS: Card[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

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

const calculateDoubleEv = (option: Possibilities): number => {
  const ev = option.winning * 2 + option.draw;
  return ev > 100 ? (ev - 100) * 2 + 100 : 100 - (100 - ev) * 2;
};

export const mapResultResponse = (results: Results): ResultsResponse => {
  const actions = ['hit', 'stand', 'double', 'split'] as const;

  const resultsInPercentage: ResultsResponse = actions.reduce((acc, action) => {
    const option = {
      winning: results[action].winning / 13,
      losing: results[action].losing / 13,
      draw: results[action].draw / 13,
    };
    acc[action] = {
      ...option,
      expectedValue: ['double', 'split'].includes(action)
        ? calculateDoubleEv(option) // calculate double ev separately because the bet is doubled
        : option.winning * 2 + option.draw,
    };
    return acc;
  }, {} as ResultsResponse);

  return resultsInPercentage;
};
