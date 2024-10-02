type Card = number | 'J' | 'Q' | 'K' | 'A';

type CardState = {
  score: number;
  hasAce: boolean;
  hasPair: boolean;
  hasBlackjack: boolean;
};

type Possibilities = {
  winning: number;
  losing: number;
  draw: number;
};

type Results = {
  hit: Possibilities;
  stand: Possibilities;
  double: Possibilities;
  split: Possibilities;
};
