


import React, { useMemo } from 'react';
import { StageNode, NodeType } from '../types';
import NodeIcon from './NodeIcon';
import { Map } from 'lucide-react';
import { STAGE_TURNS } from '../constants';

interface MiniMapProps {
  nodes: StageNode[][];
  currentTurn: number;
  path: { turn: number; nodeIndex: number; nodeId: string; }[];
}

const nodeTypeNames: { [key in NodeType]: string } = {
    [NodeType.COMBAT]: '전투',
    [NodeType.SHOP]: '상점',
    [NodeType.REST]: '휴식',
    [NodeType.EVENT]: '이벤트',
    [NodeType.MINIBOSS]: '미니보스',
    [NodeType.BOSS]: '보스',
    [NodeType.UNKNOWN]: '???',
};

const isVisited = (path: MiniMapProps['path'], nodeId: string) => path.some(p => p.nodeId === nodeId);

const MiniMap: React.FC<MiniMapProps> = ({ nodes, currentTurn, path }) => {
    
    const pathCoords = useMemo(() => {
        if (path.length < 1) return [];
        return path.map(p => {
            const turnIndex = p.turn - 1;
            const nodeIndex = p.nodeIndex;
            
            // Constants matching layout
            const turnColWidth = 40;
            const turnColGap = 8; // from gap-2
            const turnNumberHeight = 20; // Approximation of text height + padding
            const nodeSize = 28; // from w-7/h-7
            const nodeGap = 4; // from gap-1
            
            const x = turnIndex * (turnColWidth + turnColGap) + turnColWidth / 2;
            const y = turnNumberHeight + nodeIndex * (nodeSize + nodeGap) + nodeSize / 2;

            return { x, y };
        });
    }, [path]);

    return (
      <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50 backdrop-blur-sm">
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
          <div className="relative">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" height="128" width={nodes.length * 48}>
              <g>
                {pathCoords.slice(1).map((coord, index) => {
                    const prevCoord = pathCoords[index];
                    return (
                      <line 
                        key={index} 
                        x1={prevCoord.x} y1={prevCoord.y} 
                        x2={coord.x} y2={coord.y} 
                        stroke="rgba(255,255,255,0.2)" 
                        strokeWidth="2" 
                        strokeDasharray="4 2"
                      />
                    );
                })}
              </g>
            </svg>

            <div className="relative z-10 flex gap-2 pb-2 min-w-max">
              {nodes.map((turnNodes, turnIndex) => {
                const turnNumber = turnIndex + 1;
                const isCurrentTurn = turnNumber === currentTurn;
                const isPastTurn = turnNumber < currentTurn;

                return (
                  <div key={turnIndex} className={`flex flex-col items-center gap-1 min-w-[40px] p-1 rounded-md transition-all ${isCurrentTurn ? 'bg-yellow-500/10' : ''}`}>
                    <div
                      className={`text-xs font-bold px-1 rounded ${
                        isCurrentTurn
                          ? 'text-yellow-400'
                          : isPastTurn
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {turnNumber}
                    </div>
                    <div className="flex flex-col gap-1">
                      {turnNodes.map((node) => {
                          const visited = isVisited(path, node.id);
                          const isFuture = !visited && !isCurrentTurn;
                          const tooltipText = isFuture ? nodeTypeNames[node.type] : '';
                        return (
                          <div
                            key={node.id}
                            title={tooltipText}
                            className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all 
                                        ${
                                          visited
                                            ? 'bg-green-700 border-green-500'
                                            : isCurrentTurn
                                            ? 'bg-gray-700 border-gray-500 animate-pulse'
                                            : 'bg-gray-700 border-gray-600'
                                        }`}
                          >
                            <NodeIcon type={node.type} size="sm" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
};

export default MiniMap;