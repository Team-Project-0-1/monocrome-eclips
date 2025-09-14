
import React from 'react';

interface ResourceDisplayProps {
  resources: {
    echoRemnants: number;
    senseFragments: number;
    memoryPieces: number;
  };
  reserveCoins?: { face: string | null; locked: boolean; id: number }[];
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, reserveCoins = [] }) => {
  const resourceItems = [
    { name: "에코", value: resources.echoRemnants, icon: "⚡", color: "text-yellow-400", hoverColor: "hover:text-yellow-300", description: "주요 화폐, 상점 이용 및 일부 이벤트에 사용됩니다." },
    { name: "감각", value: resources.senseFragments, icon: "🔮", color: "text-purple-400", hoverColor: "hover:text-purple-300", description: "족보 강화에 사용되는 특수 재화입니다." },
    { name: "기억", value: resources.memoryPieces, icon: "💎", color: "text-blue-400", hoverColor: "hover:text-blue-300", description: "기억의 제단에서 영구 능력치 강화에 사용됩니다." },
    { name: "예비 동전", value: `${reserveCoins.length}/3`, icon: "🪙", color: "text-orange-400", hoverColor: "hover:text-orange-300", description: "전투 중 교체 가능한 예비 동전입니다." },
  ];

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-md font-bold mb-3 text-center text-gray-300">자원 현황</h3>
      <div className="space-y-2">
        {resourceItems.map((item, index) => (
          <div key={index} className={`group relative flex items-center justify-between p-2 rounded-md bg-gray-700/50 hover:bg-gray-700 transition-colors`} title={item.description}>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${item.color} ${item.hoverColor} transition-colors`}>{item.icon}</span>
              <span className="text-sm text-gray-300">{item.name}</span>
            </div>
            <span className={`text-md font-bold ${item.color} ${item.hoverColor} transition-colors`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceDisplay;
