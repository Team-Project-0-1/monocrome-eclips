
import React from 'react';
import { StageNode, NodeType } from '../types';
import NodeIcon from './NodeIcon';
import { Map } from 'lucide-react';
import { STAGE_TURNS } from '../constants';

interface MiniMapProps {
  nodes: StageNode[][];
  currentTurn: number;
  visitedNodes: string[];
}

const isVisited = (visitedNodes: string[], nodeId: string) => visitedNodes.includes(nodeId);

const MiniMap: React.FC<MiniMapProps> = ({ nodes, currentTurn, visitedNodes }) => (
  <div className="bg-gray-800 p-3 rounded-lg">
    <h3 className="text-white text-sm font-bold mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Map className="w-4 h-4" />
        던전 진행도
      </div>
      <span className="text-yellow-400 text-xs">
        {currentTurn} / {STAGE_TURNS}층
      </span>
    </h3>
    <div className="overflow-x-auto">
      <div className="flex gap-2 pb-2 min-w-max">
        {nodes.map((turnNodes, turnIndex) => {
          const turnNumber = turnIndex + 1;
          const isCurrentTurn = turnNumber === currentTurn;
          const isPastTurn = turnNumber < currentTurn;
          return (
            <div key={turnIndex} className="flex flex-col items-center gap-1 min-w-[40px]">
              <div
                className={`text-xs font-bold px-1 rounded ${
                  isCurrentTurn
                    ? 'text-yellow-400 bg-yellow-900/50'
                    : isPastTurn
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                {turnNumber}
              </div>
              <div className="flex flex-col gap-1">
                {turnNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-all ${
                      isVisited(visitedNodes, node.id)
                        ? 'bg-green-600 border-green-400'
                        : isCurrentTurn
                        ? 'bg-yellow-500 border-yellow-300 animate-pulse'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    <NodeIcon type={node.type} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default MiniMap;
