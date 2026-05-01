import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { GameState } from '../types';
import { useGameStore } from '../store/gameStore';
import { TutorialKey } from '../store/slices/uiSlice';

interface TutorialCopy {
  key: TutorialKey;
  title: string;
  body: string;
  hints: string[];
}

const tutorialByState: Partial<Record<GameState, TutorialCopy>> = {
  [GameState.MENU]: {
    key: 'menu',
    title: '로비',
    body: '이어하기와 새 탐험을 분리했습니다. 옵션은 저장되어 다음 실행에도 유지됩니다.',
    hints: ['Enter로 바로 시작', '사운드와 전투 보조는 여기서 전환'],
  },
  [GameState.CHARACTER_SELECT]: {
    key: 'character',
    title: '캐릭터 선택',
    body: '각 캐릭터는 무기와 전투 리듬이 다릅니다. HP, 역할, 대표 스킬을 먼저 비교하세요.',
    hints: ['전사는 소리굽쇠로 공명 누적', '초반에는 생존력과 조작 난이도 확인'],
  },
  [GameState.EXPLORATION]: {
    key: 'exploration',
    title: '경로 선택',
    body: '전투, 상점, 이벤트, 휴식 노드를 보고 다음 턴의 리스크와 보상을 고릅니다.',
    hints: ['자원이 부족하면 상점 가치 하락', '보스 전에는 휴식과 보급을 우선'],
  },
  [GameState.COMBAT]: {
    key: 'combat',
    title: '동전 전투',
    body: '내 동전과 적 의도를 한 화면에서 비교하고, 가능한 족보를 선택한 뒤 실행하세요.',
    hints: ['PC는 좌우 대치, 모바일은 상하 흐름', '행운 동전과 액티브 스킬은 실행 전 사용'],
  },
  [GameState.SHOP]: {
    key: 'shop',
    title: '상점',
    body: '자원, 구매 가능 여부, 효과 미리보기를 같은 화면에서 비교하도록 정리했습니다.',
    hints: ['불가능한 구매는 이유를 먼저 확인', '행운 동전은 전투 안정성을 크게 올림'],
  },
  [GameState.EVENT]: {
    key: 'event',
    title: '이벤트',
    body: '선택지별 성공 확률, 보상, 위험을 확인하고 캐릭터 조건이 맞는 선택을 고르세요.',
    hints: ['잠긴 선택지는 조건이 부족한 상태', '확률 선택은 즉시 진행됨'],
  },
};

const getTutorialCopy = (gameState: GameState): TutorialCopy | null => (
  tutorialByState[gameState] ?? null
);

const TutorialCoachmark: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const gameOptions = useGameStore(state => state.gameOptions);
  const tutorialFlags = useGameStore(state => state.tutorialFlags);
  const dismissTutorial = useGameStore(state => state.dismissTutorial);
  const setGameOption = useGameStore(state => state.setGameOption);

  const copy = getTutorialCopy(gameState);
  if (!copy || !gameOptions.tutorialEnabled || tutorialFlags[copy.key]) {
    return null;
  }

  return (
    <aside className={`tutorial-coachmark tutorial-${copy.key}`} role="status" aria-live="polite">
      <div className="tutorial-coachmark-header">
        <span className="tutorial-coachmark-kicker">
          <HelpCircle className="h-4 w-4" />
          Tutorial
        </span>
        <button
          type="button"
          className="tutorial-coachmark-close"
          onClick={() => dismissTutorial(copy.key)}
          aria-label="튜토리얼 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <h2>{copy.title}</h2>
      <p>{copy.body}</p>
      <div className="tutorial-coachmark-hints">
        {copy.hints.map((hint) => (
          <span key={hint}>{hint}</span>
        ))}
      </div>
      <div className="tutorial-coachmark-actions">
        <button type="button" onClick={() => dismissTutorial(copy.key)}>
          확인
        </button>
        <button type="button" onClick={() => setGameOption('tutorialEnabled', false)}>
          튜토리얼 끄기
        </button>
      </div>
    </aside>
  );
};

export default TutorialCoachmark;
