import { addCardToState, setupCardState } from './card-state';
import { CARDS, getBetterResult, mapResultResponse } from './util';

const dynamicResults: { [key: string]: Results } = {}; // store the results of each state to avoid recalculating -> example: 3-true-false-10

const handleBlackjack = (dealer: CardState) => {
  if (dealer.score !== 10 && !dealer.hasAce) {
    return {
      blackJackExpectedValue: 250,
    };
  }
  if (dealer.hasAce) {
    return {
      blackJackExpectedValue: (4 * 100 + 7 * 250) / 13, // 4/13 chance of getting a 10, 7/13 chance of getting any other card that looses against a blackjack
    };
  }
  if (dealer.score === 10) {
    return {
      blackJackExpectedValue: (1 * 100 + 12 * 250) / 13, // 1/13 chance of getting an ace, 12/13 chance of getting any other card that looses against a blackjack
    };
  }
};

const calculateHit = (player: CardState, dealer: CardState): Possibilities => {
  const possibilities = {
    winning: 0,
    losing: 0,
    draw: 0,
  };

  for (const card of CARDS) {
    const newPlayerState = addCardToState(player, card);

    if (newPlayerState.score > 21) {
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
  for (const card of CARDS) {
    const newDealerState = addCardToState(dealer, card);
    const playerScore =
      player.score <= 11 && player.hasAce ? player.score + 10 : player.score;

    if (newDealerState.score > 21) {
      // win if dealer score is over 21
      possibilities.winning += 100;
    } else if (
      newDealerState.score >= 17 || // dealer stands on 17
      (newDealerState.score >= 7 &&
        newDealerState.score <= 11 &&
        newDealerState.hasAce) // dealer stands on soft 17 /
    ) {
      if (playerScore > newDealerState.score) {
        possibilities.winning += 100;
      } else if (playerScore < newDealerState.score || dealer.hasBlackjack) {
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

const calculateDouble = (
  player: CardState,
  dealer: CardState
): Possibilities => {
  const possibilities = {
    winning: 0,
    losing: 0,
    draw: 0,
  };

  for (const card of CARDS) {
    const newPlayerState = addCardToState(player, card);

    if (newPlayerState.score > 21) {
      possibilities.losing += 100;
    } else {
      const standResults = calculateStand(newPlayerState, dealer);

      possibilities.winning += standResults.winning / 13;
      possibilities.losing += standResults.losing / 13;
      possibilities.draw += standResults.draw / 13;
    }
  }

  return possibilities;
};

const calculateSplit = (
  player: CardState,
  dealer: CardState,
  splits: number
): Possibilities => {
  const possibilities = {
    winning: 0,
    losing: 0,
    draw: 0,
  };

  if (!player.hasPair || splits === 4) {
    return possibilities;
  }

  if (player.hasPair && player.hasAce) {
    const newPlayerState = {
      ...player,
      hasPair: false,
      score: 1,
    };
    return calculateDouble(newPlayerState, dealer);
  }

  const newPlayerState = {
    ...player,
    hasPair: false,
    score: player.hasAce ? 1 : player.score / 2,
  };
  const childResults = calculate(newPlayerState, dealer, splits + 1);
  const bestChildResult = getBetterResult(childResults);

  return bestChildResult;
};

const calculate = (
  player: CardState,
  dealer: CardState,
  splits = 0
): Results => {
  const dynamicResultsKey = `${player.score}-${player.hasAce}-${player.hasPair}-${dealer.score}`;
  if (dynamicResults[dynamicResultsKey]) {
    return dynamicResults[dynamicResultsKey];
  }

  const hit = calculateHit(player, dealer);
  const stand = calculateStand(player, dealer);
  const double = calculateDouble(player, dealer);
  const split = calculateSplit(player, dealer, splits);

  const results = {
    hit,
    stand,
    double,
    split,
  };

  dynamicResults[dynamicResultsKey] = results;

  return results;
};

export const play = (playerCards: Card[], dealerCards: Card[]) => {
  const playerState = setupCardState(playerCards);
  const dealerState = setupCardState(dealerCards);

  if (playerState.hasBlackjack) {
    return handleBlackjack(dealerState);
  }

  const results = calculate(playerState, dealerState);

  return mapResultResponse(results);
};
