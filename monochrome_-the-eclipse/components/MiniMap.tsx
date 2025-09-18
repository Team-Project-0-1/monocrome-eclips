


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
      <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-lg relative">
        {/* Header with enhanced styling */}
        <h3 className="text-white text-base font-bold mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-500/20">
              <Map className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-200">던전 진행도</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">현재</span>
            <span className="text-yellow-400 text-sm font-bold bg-yellow-400/10 px-2 py-1 rounded">
              {currentTurn} / {STAGE_TURNS}층
            </span>
          </div>
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
                  <div key={turnIndex} className={`flex flex-col items-center gap-2 min-w-[48px] p-2 rounded-lg transition-all ${isCurrentTurn ? 'bg-yellow-500/15 border border-yellow-500/30' : 'bg-gray-700/30'}`}>
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded-full border transition-all ${
                        isCurrentTurn
                          ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50 shadow-sm'
                          : isPastTurn
                          ? 'text-green-400 bg-green-400/10 border-green-400/30'
                          : 'text-gray-500 bg-gray-600/20 border-gray-600/30'
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
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shadow-sm
                                        ${
                                          visited
                                            ? 'bg-green-700/80 border-green-500 shadow-green-500/30'
                                            : isCurrentTurn
                                            ? 'bg-yellow-600/60 border-yellow-500 animate-pulse shadow-yellow-500/30'
                                            : 'bg-gray-700/60 border-gray-600 hover:border-gray-500'
                                        }`}
                          >
                            <NodeIcon type={node.type} size="sm" />
                            {/* Subtle glow effect for visited nodes */}
                            {visited && (
                              <div className="absolute inset-0 rounded-lg bg-green-400/10 animate-pulse"></div>
                            )}
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