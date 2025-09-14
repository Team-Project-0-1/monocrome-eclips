import React from 'react';
import { useGameStore } from '../store/gameStore';
import { ChevronRight } from "lucide-react";

export const MenuScreen = () => {
    const startGame = useGameStore(state => state.startGame);

    return (
        <div 
            className="relative min-h-screen text-white p-4 sm:p-8 flex items-center justify-center overflow-hidden scanlines"
            style={{
                backgroundImage: `url('./mono.png')`,   // ✅ public/mono.png 사용
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-red-500/10 blur-3xl animate-pulse [animation-delay:2s]"></div>

            <div className="relative z-10 w-full max-w-3xl mx-auto">
                <div className="flex flex-col justify-center text-center">
                    <h1 className="font-orbitron text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        MONOCHROME
                    </h1>
                    <p className="font-orbitron text-2xl md:text-3xl font-bold text-gray-400 drop-shadow-md mb-8">
                        THE ECLIPSE
                    </p>
                    <p className="max-w-xl mx-auto text-gray-300 mb-10 leading-relaxed">
                        세상이 빛을 잃고 흑백으로 물든 지 오래. 당신은 마지막 남은 감각을 가진 자로서, 이 기이한 일식의 비밀을 파헤치기 위해 폐허 속으로 걸어 들어갑니다. 동전의 양면처럼 갈리는 운명 속에서, 당신은 희망을 찾아낼 수 있을까요?
                    </p>
                    <div className="flex justify-center">
                        <button onClick={startGame} className="group relative inline-flex items-center justify-center px-10 py-4 bg-white text-gray-900 font-bold rounded-lg shadow-lg hover:shadow-xl text-lg transition-transform hover:scale-105 active:scale-100 overflow-hidden">
                            <span className="absolute left-0 top-0 h-full w-0 bg-gray-300 transition-all duration-300 ease-in-out group-hover:w-full"></span>
                            <span className="relative z-10 flex items-center gap-2">
                                탐험 시작 <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
