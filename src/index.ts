import { addCardToState, setupCardState } from './card-state';
import { getBetterResult, resultsInPercentage } from './util';

const cards: Card[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

const calculateHit = (player: CardState, dealer: CardState): Possibilities => {
  const possibilities = {
    winning: 0,
    losing: 0,
    draw: 0,
  };

  for (const card of cards) {
    const newPlayerState = addCardToState(player, card);

    if (
      newPlayerState.score === 21 || // win if score is 21
      (newPlayerState.score === 11 && newPlayerState.hasAce) // win if score (ace counts as 1) is 11 and has ace (ace counts as 11)
    ) {
      possibilities.winning += 100;
    } else if (newPlayerState.score > 21) {
      // lose if score is over 21
      possibilities.losing += 100;
    } else {
      // calculate the possibilities of the next move and use the best result
      const childResults = calculate(newPlayerState, dealer);
      const bestChildResult = getBetterResult(childResults);

      possibilities.winning += bestChildResult.winning / 13;
      possibilities.losing += bestChildResult.losing / 13;
      possibilities.draw += bestChildResult.draw / 13;
    }
  }

  return possibilities;
};

const calculateStand = (
  player: CardState,
  dealer: CardState
): Possibilities => {
  const possibilities = {
    winning: 0,
    losing: 0,
    draw: 0,
  };

  for (const card of cards) {
    const newDealerState = addCardToState(dealer, card);

    if (newDealerState.score > 21) {
      // win if dealer score is over 21
      possibilities.winning += 100;
    } else if (
      newDealerState.score >= 17 || // dealer stands on 17
      (newDealerState.score === 7 && newDealerState.hasAce) // dealer stands on soft 17
    ) {
      if (player.score > newDealerState.score) {
        possibilities.winning += 100;
      } else if (player.score < newDealerState.score) {
        possibilities.losing += 100;
      } else {
        possibilities.draw += 100;
      }
    } else {
      // dealer has to hit again
      const childResults = calculateStand(player, newDealerState);

      possibilities.winning += childResults.winning / 13;
      possibilities.losing += childResults.losing / 13;
      possibilities.draw += childResults.draw / 13;
    }
  }

  return possibilities;
};

const calculate = (player: CardState, dealer: CardState): Results => {
  // TODO: do dynamic programming here
  const hit = calculateHit(player, dealer);
  const stand = calculateStand(player, dealer);

  return {
    hit,
    stand,
    double: {
      winning: 0,
      losing: 0,
      draw: 0,
    },
    split: {
      winning: 0,
      losing: 0,
      draw: 0,
    },
  };
};

const play = (playerCards: Card[], dealerCards: Card[]) => {
  const playerState = setupCardState(playerCards);
  const dealerState = setupCardState(dealerCards);

  const results = calculate(playerState, dealerState);

  return resultsInPercentage(results);
};

console.log(play([3, 'K'], [2]));
