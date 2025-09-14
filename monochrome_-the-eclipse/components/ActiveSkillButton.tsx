import React from 'react';
import { PlayerCharacter, CharacterClass, LucideIcon } from '../types';
import { characterActiveSkills } from '../dataCharacters';
import { Dices, Shuffle, GitCommit, Lock } from 'lucide-react';

interface ActiveSkillButtonProps {
    player: PlayerCharacter;
    onClick: () => void;
    isDisabled: boolean;
}

const skillIcons: { [key in CharacterClass]: LucideIcon } = {
    [CharacterClass.WARRIOR]: Dices,
    [CharacterClass.ROGUE]: Shuffle,
    [CharacterClass.TANK]: GitCommit,
    [CharacterClass.MAGE]: Lock,
};

const ActiveSkillButton: React.FC<ActiveSkillButtonProps> = ({ player, onClick, isDisabled }) => {
    const skill = characterActiveSkills[player.class];
    if (!skill) return null;

    const onCooldown = player.activeSkillCooldown > 0;
    const disabled = isDisabled || onCooldown;

    const Icon = skillIcons[player.class];

    return (
        <div className="bg-gray-900/50 p-3 rounded-lg mt-4 border border-gray-700">
            <h4 className="text-center text-sm font-bold text-gray-300 mb-2">고유 기술</h4>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 rounded-md transition-all duration-200 group
                    ${disabled ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                title={skill.description}
            >
                <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${disabled ? 'text-gray-600' : 'text-cyan-400'}`} />
                    <div>
                        <p className="font-bold text-left">{skill.name}</p>
                        <p className="text-xs text-gray-400 text-left">{skill.description}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-md text-sm font-bold font-orbitron ${onCooldown ? 'bg-red-500/80 text-white' : 'bg-gray-600'}`}>
                    {onCooldown ? `${player.activeSkillCooldown}턴` : '준비'}
                </div>
            </button>
        </div>
    );
};

export default ActiveSkillButton;