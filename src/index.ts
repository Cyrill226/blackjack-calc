import { addCardToState, setupCardState } from './card-state';
import { getBetterResult, mapResultResponse } from './util';

const cards: Card[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

const handleBlackjack = (player: CardState, dealer: CardState) => {
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

  for (const card of cards) {
    const newPlayerState = addCardToState(player, card);

    if (
      newPlayerState.score === 21 || // win if score is 21
      (newPlayerState.score === 11 && newPlayerState.hasAce) // win if score (ace counts as 1) is 11 and has ace (ace counts as 11)
    ) {
      possibilities.winning += 100; // TODO: wrong, dealer can still get 21
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
    const playerScore =
      player.score <= 11 && player.hasAce ? player.score + 10 : player.score;

    if (newDealerState.score > 21) {
      // win if dealer score is over 21
      possibilities.winning += 100;
    } else if (
      newDealerState.score >= 17 || // dealer stands on 17
      (newDealerState.score === 7 && newDealerState.hasAce) // dealer stands on soft 17 // TODO; dealer has to hit on soft 18 19 20 and 21 as well
    ) {
      if (playerScore > newDealerState.score) {
        possibilities.winning += 100;
      } else if (playerScore < newDealerState.score) {
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

  for (const card of cards) {
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
  // TODO: do dynamic programming here
  const hit = calculateHit(player, dealer);
  const stand = calculateStand(player, dealer);
  const double = calculateDouble(player, dealer);
  const split = calculateSplit(player, dealer, splits);

  return {
    hit,
    stand,
    double,
    split,
  };
};

const play = (playerCards: Card[], dealerCards: Card[]) => {
  const playerState = setupCardState(playerCards);
  const dealerState = setupCardState(dealerCards);

  if (playerState.hasBlackjack) {
    return handleBlackjack(playerState, dealerState);
  }

  const results = calculate(playerState, dealerState);

  return mapResultResponse(results);
};

console.log(play(['A', 'A'], [9]));
