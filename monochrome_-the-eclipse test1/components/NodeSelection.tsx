
import React from 'react';
import { StageNode, NodeType } from '../types';
import NodeIcon from './NodeIcon';

interface NodeSelectionProps {
  nodes: StageNode[];
  onSelect: (node: StageNode, index: number) => void;
  currentTurn: number;
}

const NodeSelection: React.FC<NodeSelectionProps> = ({ nodes, onSelect, currentTurn }) => {
  const nodeTypeNames: { [key in NodeType]: string } = {
    [NodeType.COMBAT]: '전투',
    [NodeType.SHOP]: '상점',
    [NodeType.REST]: '휴식',
    [NodeType.EVENT]: '이벤트',
    [NodeType.MINIBOSS]: '미니보스',
    [NodeType.BOSS]: '보스',
    [NodeType.UNKNOWN]: '???',
  };
  const nodeTypeDescriptions: { [key in NodeType]: string } = {
    [NodeType.COMBAT]: '적과 전투를 벌입니다',
    [NodeType.SHOP]: '자원으로 아이템을 구매합니다',
    [NodeType.REST]: '능력을 강화합니다',
    [NodeType.EVENT]: '선택에 따라 결과가 달라집니다',
    [NodeType.MINIBOSS]: '강력한 적과의 전투입니다',
    [NodeType.BOSS]: '스테이지의 최종 보스입니다',
    [NodeType.UNKNOWN]: '무엇이 기다리고 있을까요?',
  };
  const nodeColors: { [key in NodeType]?: string } = {
    [NodeType.COMBAT]: 'border-red-400 hover:border-red-600 bg-red-800 hover:bg-red-700 text-red-100',
    [NodeType.SHOP]: 'border-purple-400 hover:border-purple-600 bg-purple-800 hover:bg-purple-700 text-purple-100',
    [NodeType.REST]: 'border-green-400 hover:border-green-600 bg-green-800 hover:bg-green-700 text-green-100',
    [NodeType.EVENT]: 'border-yellow-400 hover:border-yellow-600 bg-yellow-800 hover:bg-yellow-700 text-yellow-100',
    [NodeType.MINIBOSS]: 'border-orange-400 hover:border-orange-600 bg-orange-800 hover:bg-orange-700 text-orange-100',
    [NodeType.BOSS]: 'border-gray-500 hover:border-gray-300 bg-black hover:bg-gray-900 text-gray-100',
    [NodeType.UNKNOWN]: 'border-gray-600 hover:border-gray-400 bg-gray-700 hover:bg-gray-600 text-gray-200',
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          층 {currentTurn} - 어느 길로 가시겠습니까?
        </h2>
        <p className="text-sm text-gray-400">선택지를 클릭하여 진행하세요</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-4">
        {nodes.map((node, index) => (
          <button
            key={node.id}
            onClick={() => onSelect(node, index)}
            className={`p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 flex-1 max-w-sm flex flex-col items-center text-center
                        ${nodeColors[node.type] || 'border-gray-600 hover:border-gray-400 bg-gray-700 text-gray-200'}`}
          >
            <div className="mb-3">
                <NodeIcon type={node.type} size="lg" />
            </div>
            <h3 className="font-bold text-lg mb-1">{nodeTypeNames[node.type]}</h3>
            <p className="text-xs opacity-80 leading-tight flex-grow">{nodeTypeDescriptions[node.type]}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NodeSelection;
