import { NodeType, StageNode } from '../types';

export interface NodePresentation {
  label: string;
  signal: string;
  routeName: string;
  routeHint: string;
  description: string;
  risk: string;
  reward: string;
  stake: string;
  className: string;
  lineClassName: string;
  iconClassName: string;
}

const baseNodePresentation: Record<NodeType, Omit<NodePresentation, 'routeName' | 'routeHint'>> = {
  [NodeType.COMBAT]: {
    label: '전투',
    signal: '적성 신호',
    description: '기본 전투입니다. 체력을 잃을 수 있지만 빌드 성장에 필요한 자원을 안정적으로 얻습니다.',
    risk: '체력 손실',
    reward: '에코 + 감각 조각',
    stake: '안정적인 성장',
    className: 'border-red-400/50 bg-red-950/50 text-red-50 hover:border-red-300 hover:bg-red-900/60',
    lineClassName: 'from-red-500/0 via-red-300/80 to-red-500/0',
    iconClassName: 'text-red-200',
  },
  [NodeType.SHOP]: {
    label: '상점',
    signal: '보급 신호',
    description: '전투 없이 다음 전투를 준비합니다. 보유 에코를 회복, 행운 동전, 기술 강화로 바꿉니다.',
    risk: '전투 보상 없음',
    reward: '즉시 보강',
    stake: '현재 빌드 보정',
    className: 'border-fuchsia-400/45 bg-fuchsia-950/45 text-fuchsia-50 hover:border-fuchsia-300 hover:bg-fuchsia-900/55',
    lineClassName: 'from-fuchsia-500/0 via-fuchsia-300/80 to-fuchsia-500/0',
    iconClassName: 'text-fuchsia-200',
  },
  [NodeType.REST]: {
    label: '휴식',
    signal: '회복 지대',
    description: '체력을 회복하거나 기억의 제단에 들러 장기 성장을 정리합니다. 다음 전투 전 숨을 고르는 선택입니다.',
    risk: '보상 성장 지연',
    reward: '회복 / 기억 정비',
    stake: '생존 안정화',
    className: 'border-emerald-400/45 bg-emerald-950/45 text-emerald-50 hover:border-emerald-300 hover:bg-emerald-900/55',
    lineClassName: 'from-emerald-500/0 via-emerald-300/80 to-emerald-500/0',
    iconClassName: 'text-emerald-200',
  },
  [NodeType.EVENT]: {
    label: '사건',
    signal: '흔들리는 기억',
    description: '확률과 조건이 섞인 장면입니다. 큰 보상, 손실, 전투 진입이 모두 가능합니다.',
    risk: '예측 불가',
    reward: '고변동 보상',
    stake: '런의 방향 전환',
    className: 'border-amber-300/50 bg-amber-950/45 text-amber-50 hover:border-amber-200 hover:bg-amber-900/55',
    lineClassName: 'from-amber-500/0 via-amber-200/80 to-amber-500/0',
    iconClassName: 'text-amber-100',
  },
  [NodeType.MINIBOSS]: {
    label: '중간 보스',
    signal: '고밀도 위협',
    description: '난도가 높지만 행운 동전과 핵심 보상을 노릴 수 있습니다. 런을 강하게 밀어붙이는 선택입니다.',
    risk: '큰 피해 가능',
    reward: '희귀 보상',
    stake: '고위험 성장',
    className: 'border-orange-300/60 bg-orange-950/55 text-orange-50 hover:border-orange-200 hover:bg-orange-900/65',
    lineClassName: 'from-orange-500/0 via-orange-200/90 to-orange-500/0',
    iconClassName: 'text-orange-100',
  },
  [NodeType.BOSS]: {
    label: '보스',
    signal: '이클립스 핵',
    description: '층의 종착점입니다. 지금까지 만든 조합, 자원, 체력 관리가 한 번에 검증됩니다.',
    risk: '치명적 전투',
    reward: '층 돌파',
    stake: '런 진행 관문',
    className: 'border-white/60 bg-black/80 text-white hover:border-red-200 hover:bg-gray-950',
    lineClassName: 'from-white/0 via-white/90 to-white/0',
    iconClassName: 'text-white',
  },
  [NodeType.UNKNOWN]: {
    label: '미확인',
    signal: '불명 신호',
    description: '정체를 알 수 없는 지점입니다. 위험과 보상이 모두 가려져 있습니다.',
    risk: '불명',
    reward: '불명',
    stake: '정보 부족',
    className: 'border-slate-400/45 bg-slate-900/55 text-slate-50 hover:border-slate-200 hover:bg-slate-800/70',
    lineClassName: 'from-slate-500/0 via-slate-200/80 to-slate-500/0',
    iconClassName: 'text-slate-100',
  },
};

const routeNames = ['정면 돌파', '측면 추적', '기회 진입', '침묵 경로'];
const routeHints = ['빠른 충돌', '보상 탐색', '리스크 관리', '변수 확인'];

export const getNodePresentation = (node: StageNode, index: number): NodePresentation => ({
  ...baseNodePresentation[node.type],
  routeName: routeNames[index % routeNames.length],
  routeHint: routeHints[index % routeHints.length],
});

export const getNodeTypeCounts = (nodes: StageNode[]) => (
  nodes.reduce<Record<string, number>>((counts, node) => {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
    return counts;
  }, {})
);
