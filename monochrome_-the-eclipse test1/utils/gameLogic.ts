import { Coin, CoinFace, DetectedPattern, PatternType, StageNode, NodeType, PlayerCharacter, CharacterClass } from '../types';
import { COIN_COUNT, STAGE_TURNS, MINIBOSS_TURN_RANGE, BOSS_TURN } from '../constants';

export const flipCoin = (headsChance: number = 0.5): CoinFace => Math.random() < headsChance ? CoinFace.HEADS : CoinFace.TAILS;

export const generateCoins = (count = COIN_COUNT, headsChance: number = 0.5): Coin[] => {
  return Array(count)
    .fill(null)
    .map((_, idx) => ({ face: flipCoin(headsChance), locked: false, id: idx }));
};

export const detectPatterns = (coins: Coin[]): DetectedPattern[] => {
  const patterns: DetectedPattern[] = [];
  const faces = coins.map((c) => c.face);
  const addPattern = (pattern: Omit<DetectedPattern, "id">) => {
    const id = `p-${pattern.type}-${pattern.face || 'special'}-${pattern.indices.join('-')}`;
    patterns.push({ ...pattern, id });
  };

  const patternTypesByLength: { [key: number]: PatternType } = {
    2: PatternType.PAIR,
    3: PatternType.TRIPLE,
    4: PatternType.QUAD,
    5: PatternType.PENTA,
  };
  
  let i = 0;
  while (i < faces.length) {
    let j = i;
    while (j < faces.length && faces[j] === faces[i]) {
      j++;
    }
    const streakLen = j - i;
    const streakFace = faces[i];
    const streakStart = i;

    if (streakLen >= 2) {
      for (let subLen = 2; subLen <= streakLen; subLen++) {
        const type = patternTypesByLength[subLen];
        if (type) {
          for (let k = 0; k <= streakLen - subLen; k++) {
            const indices = Array.from({ length: subLen }, (_, l) => streakStart + k + l);
            addPattern({ type, face: streakFace, count: subLen, indices });
          }
        }
      }
    }
    i = j;
  }

  const headCount = faces.filter((f) => f === CoinFace.HEADS).length;
  const tailCount = faces.filter((f) => f === CoinFace.TAILS).length;

  if (headCount === 1) {
    const headIndex = faces.findIndex((f) => f === CoinFace.HEADS);
    addPattern({ type: PatternType.UNIQUE, face: CoinFace.HEADS, count: 1, indices: [headIndex] });
  }
  if (tailCount === 1) {
    const tailIndex = faces.findIndex((f) => f === CoinFace.TAILS);
    addPattern({ type: PatternType.UNIQUE, face: CoinFace.TAILS, count: 1, indices: [tailIndex] });
  }
  
  const isAlternating = () => {
    if (faces.length !== 5) return false;
    for (let i = 0; i < faces.length - 1; i++) {
      if (faces[i] === faces[i+1]) return false;
    }
    return true;
  };

  if (isAlternating()) {
    addPattern({ type: PatternType.AWAKENING, count: 5, indices: [0,1,2,3,4], face: faces[0] });
  }

  return patterns.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if ((a.face || 'ZZZ') !== (b.face || 'ZZZ')) return (a.face || 'ZZZ').localeCompare(b.face || 'ZZZ');
    return a.indices[0] - b.indices[0];
  });
};


export const generateStageNodes = (stageNumber: number): StageNode[][] => {
  let nodes: StageNode[][] = [];
  for (let turn = 1; turn <= STAGE_TURNS; turn++) {
    const turnNodes: StageNode[] = [];
    if (turn === 1) {
      for (let i = 0; i < 3; i++) turnNodes.push({ type: NodeType.COMBAT, id: `${turn}-${i}` });
    } else if (turn === 9) {
      const restPosition = Math.floor(Math.random() * 3);
      for (let i = 0; i < 3; i++) turnNodes.push({ type: i === restPosition ? NodeType.REST : getRandomNodeType(turn), id: `${turn}-${i}` });
    } else if (turn === 14) {
      for (let i = 0; i < 3; i++) turnNodes.push({ type: NodeType.REST, id: `${turn}-${i}` });
    } else if (turn === BOSS_TURN) {
      for (let i = 0; i < 3; i++) turnNodes.push({ type: NodeType.BOSS, id: `${turn}-${i}` });
    } else if (turn >= MINIBOSS_TURN_RANGE[0] && turn <= MINIBOSS_TURN_RANGE[1]) {
      const minibossPosition = Math.floor(Math.random() * 3);
      for (let i = 0; i < 3; i++) turnNodes.push({ type: i === minibossPosition ? NodeType.MINIBOSS : getRandomNodeType(turn), id: `${turn}-${i}` });
    } else {
      for (let i = 0; i < 3; i++) turnNodes.push({ type: getRandomNodeType(turn), id: `${turn}-${i}` });
    }
    nodes.push(turnNodes);
  }
  nodes = applyAntiConsecutiveRules(nodes);
  return nodes;
};

const getRandomNodeType = (turn: number): NodeType => {
  const weights = turn < 3
    ? { [NodeType.COMBAT]: 70, [NodeType.EVENT]: 30 }
    : { [NodeType.COMBAT]: 50, [NodeType.EVENT]: 20, [NodeType.SHOP]: 15, [NodeType.REST]: 15 };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return type as NodeType;
  }
  return NodeType.COMBAT; 
};

const applyAntiConsecutiveRules = (nodes: StageNode[][]): StageNode[][] => {
  const specialNodes: NodeType[] = [NodeType.MINIBOSS, NodeType.SHOP, NodeType.REST];
  for (let turn = 1; turn < nodes.length; turn++) {
    const currentTurnNodes = nodes[turn];
    const previousTurnNodes = nodes[turn - 1];
    for (let pos = 0; pos < currentTurnNodes.length; pos++) {
      const currentNode = currentTurnNodes[pos];
      if (specialNodes.includes(currentNode.type)) {
        const hasSpecialInPreviousConnectedPath = 
          (pos > 0 && specialNodes.includes(previousTurnNodes[pos-1]?.type)) ||
          specialNodes.includes(previousTurnNodes[pos]?.type) ||
          (pos < previousTurnNodes.length -1 && specialNodes.includes(previousTurnNodes[pos+1]?.type));

        if (hasSpecialInPreviousConnectedPath && currentNode.type !== NodeType.REST && !(turn + 1 === 9 || turn + 1 === 14) ) {
          currentNode.type = NodeType.COMBAT; 
        }
      }
    }
  }
  return nodes;
};
