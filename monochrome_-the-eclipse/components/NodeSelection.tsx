

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
    <div className="space-y-6 p-6 bg-gray-800/70 rounded-xl shadow-2xl backdrop-blur-md border border-gray-600/50 relative">
      {/* Atmospheric header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent rounded-lg"></div>
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">
          <span className="text-blue-400">던전</span> {currentTurn}층
        </h2>
        <p className="text-base text-gray-300 mb-1 relative z-10">어느 길로 가시겠습니까?</p>
        <p className="text-xs text-gray-500 relative z-10">선택지를 클릭하여 진행하세요</p>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <Skull className="w-6 h-6 text-gray-600/30" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-4">
        {nodes.map((node, index) => {
          return (
            <motion.button
              key={node.id}
              onClick={() => handleSelect(node, index)}
              animate={selectedNode?.id === node.id ? { scale: 1.5, opacity: 0, zIndex: 50 } : {}}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 flex-1 max-w-sm flex flex-col items-center text-center group relative overflow-hidden
                        ${nodeColors[node.type] || 'border-gray-600 hover:border-gray-400 bg-gray-700 text-gray-200'}`}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon container with enhanced effects */}
              <div className="relative mb-4 p-3 rounded-full bg-black/20 group-hover:bg-black/30 transition-all duration-300 group-hover:shadow-lg">
                <div className="transition-transform group-hover:scale-125 duration-300">
                  <NodeIcon type={node.type} size="lg" />
                </div>
                {/* Subtle pulse effect for emphasis */}
                <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <h3 className="font-bold text-xl mb-2 flex items-center gap-2 relative z-10">
                {nodeTypeNames[node.type]}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed flex-grow relative z-10">{nodeTypeDescriptions[node.type]}</p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default NodeSelection;