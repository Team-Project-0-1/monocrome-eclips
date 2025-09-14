

import React, { useState } from 'react';
import { StageNode, NodeType } from '../types';
import NodeIcon from './NodeIcon';
import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';

interface NodeSelectionProps {
  nodes: StageNode[];
  onSelect: (node: StageNode, index: number) => void;
  currentTurn: number;
}

const NodeSelection: React.FC<NodeSelectionProps> = ({ nodes, onSelect, currentTurn }) => {
  const [selectedNode, setSelectedNode] = useState<StageNode | null>(null);
  
  const handleSelect = (node: StageNode, index: number) => {
    setSelectedNode(node);
    setTimeout(() => {
        onSelect(node, index);
        setSelectedNode(null); 
    }, 600);
  };
    
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
    [NodeType.COMBAT]: 'border-red-500/50 hover:border-red-500 bg-red-900/50 hover:bg-red-900/80 text-red-100',
    [NodeType.SHOP]: 'border-purple-500/50 hover:border-purple-500 bg-purple-900/50 hover:bg-purple-900/80 text-purple-100',
    [NodeType.REST]: 'border-green-500/50 hover:border-green-500 bg-green-900/50 hover:bg-green-900/80 text-green-100',
    [NodeType.EVENT]: 'border-yellow-500/50 hover:border-yellow-500 bg-yellow-900/50 hover:bg-yellow-900/80 text-yellow-100',
    [NodeType.MINIBOSS]: 'border-orange-400 hover:border-orange-500 bg-orange-900/80 hover:bg-orange-800/80 text-orange-100',
    [NodeType.BOSS]: 'border-gray-500 hover:border-gray-300 bg-black hover:bg-gray-900 text-gray-100',
    [NodeType.UNKNOWN]: 'border-gray-600 hover:border-gray-400 bg-gray-700 hover:bg-gray-600 text-gray-200',
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700/50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          층 {currentTurn} - 어느 길로 가시겠습니까?
        </h2>
        <p className="text-sm text-gray-400">선택지를 클릭하여 진행하세요</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-4">
        {nodes.map((node, index) => {
          return (
            <motion.button
              key={node.id}
              onClick={() => handleSelect(node, index)}
              animate={selectedNode?.id === node.id ? { scale: 1.5, opacity: 0, zIndex: 50 } : {}}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className={`p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-2 flex-1 max-w-sm flex flex-col items-center text-center group
                        ${nodeColors[node.type] || 'border-gray-600 hover:border-gray-400 bg-gray-700 text-gray-200'}`}
            >
              <div className="mb-3 transition-transform group-hover:scale-110">
                  <NodeIcon type={node.type} size="lg" />
              </div>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                {nodeTypeNames[node.type]}
              </h3>
              <p className="text-xs opacity-80 leading-tight flex-grow">{nodeTypeDescriptions[node.type]}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default NodeSelection;