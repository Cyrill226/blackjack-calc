import { play } from './game';
import { CARDS } from './util';

type PlayerState = {
  name: string;
  score: number;
  hasAce: boolean;
  hasPair: boolean;
  input: Card[];
};

const PLAYER_STATES: PlayerState[] = [
  { name: '5', score: 5, hasAce: false, hasPair: false, input: [2, 3] },
  { name: '6', score: 6, hasAce: false, hasPair: false, input: [2, 4] },
  { name: '7', score: 7, hasAce: false, hasPair: false, input: [2, 5] },
  { name: '8', score: 8, hasAce: false, hasPair: false, input: [2, 6] },
  { name: '9', score: 9, hasAce: false, hasPair: false, input: [2, 7] },
  { name: '10', score: 10, hasAce: false, hasPair: false, input: [2, 8] },
  { name: '11', score: 11, hasAce: false, hasPair: false, input: [2, 9] },
  { name: '12', score: 12, hasAce: false, hasPair: false, input: [2, 10] },
  { name: '13', score: 13, hasAce: false, hasPair: false, input: [3, 10] },
  { name: '14', score: 14, hasAce: false, hasPair: false, input: [4, 10] },
  { name: '15', score: 15, hasAce: false, hasPair: false, input: [5, 10] },
  { name: '16', score: 16, hasAce: false, hasPair: false, input: [6, 10] },
  { name: '17', score: 17, hasAce: false, hasPair: false, input: [7, 10] },
  { name: '18', score: 18, hasAce: false, hasPair: false, input: [8, 10] },
  { name: '19', score: 19, hasAce: false, hasPair: false, input: [9, 10] },
  { name: '20', score: 20, hasAce: false, hasPair: false, input: [10, 8, 2] },
  { name: '21', score: 21, hasAce: false, hasPair: false, input: [10, 9, 2] },

  { name: 'A, 2', score: 3, hasAce: true, hasPair: false, input: ['A', 2] },
  { name: 'A, 3', score: 4, hasAce: true, hasPair: false, input: ['A', 3] },
  { name: 'A, 4', score: 5, hasAce: true, hasPair: false, input: ['A', 4] },
  { name: 'A, 5', score: 6, hasAce: true, hasPair: false, input: ['A', 5] },
  { name: 'A, 6', score: 7, hasAce: true, hasPair: false, input: ['A', 6] },
  { name: 'A, 7', score: 8, hasAce: true, hasPair: false, input: ['A', 7] },
  { name: 'A, 8', score: 9, hasAce: true, hasPair: false, input: ['A', 8] },
  { name: 'A, 9', score: 10, hasAce: true, hasPair: false, input: ['A', 9] },
  { name: 'A, 10', score: 11, hasAce: true, hasPair: false, input: ['A', 10] },

  { name: 'A, A', score: 2, hasAce: true, hasPair: true, input: ['A', 'A'] },
  { name: '2, 2', score: 4, hasAce: false, hasPair: true, input: [2, 2] },
  { name: '3, 3', score: 6, hasAce: false, hasPair: true, input: [3, 3] },
  { name: '4, 4', score: 8, hasAce: false, hasPair: true, input: [4, 4] },
  { name: '5, 5', score: 10, hasAce: false, hasPair: true, input: [5, 5] },
  { name: '6, 6', score: 12, hasAce: false, hasPair: true, input: [6, 6] },
  { name: '7, 7', score: 14, hasAce: false, hasPair: true, input: [7, 7] },
  { name: '8, 8', score: 16, hasAce: false, hasPair: true, input: [8, 8] },
  { name: '9, 9', score: 18, hasAce: false, hasPair: true, input: [9, 9] },
  { name: '10, 10', score: 20, hasAce: false, hasPair: true, input: [10, 10] },
];

const DEALER_CARDS = CARDS.filter(
  (card) => !['J', 'Q', 'K'].includes(card as string)
);

const bestMove = (results: ResultsResponse): string => {
  const actions = ['hit', 'stand', 'double', 'split'] as const;
  const bestAction = actions.reduce((acc, action) => {
    if (results[action].expectedValue > results[acc].expectedValue) {
      return action;
    }
    return acc;
  }, 'hit');

  return bestAction;
};

const calculateBasicStrategy = () => {
  const basicStrategy = new Map<string, string>();

  for (const playerState of PLAYER_STATES) {
    for (const dealerCard of DEALER_CARDS) {
      const result = play(playerState.input, [dealerCard]);
      basicStrategy.set(
        `${playerState.name}-${dealerCard}`,
        playerState.name === 'A, 10'
          ? 'stand'
          : bestMove(result as ResultsResponse)
      );
    }
  }

  return basicStrategy;
};
