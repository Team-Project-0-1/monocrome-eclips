import {
  EventDefinition,
  CharacterClass,
} from "./types";

export const eventData: { [key: string]: EventDefinition } = {
  event_supplies: {
    id: "event_supplies",
    title: "버려진 보급품",
    description:
      "폐허 속에서 낡은 상자를 발견했습니다. 함정일 수도 있고, 귀중한 물자일 수도 있습니다.",
    choices: [
      {
        text: "조심스럽게 열어본다",
        baseSuccessRate: 50,
        senseBonus: { [CharacterClass.TANK]: 30 },
        success: { echoRemnants: 30, message: "유용한 물자를 발견했습니다!" },
        failure: {
          damage: 10,
          message: "함정이었습니다! 폭발로 피해를 입었습니다.",
        },
      },
      {
        text: "냄새를 맡아본다",
        requiredSense: CharacterClass.ROGUE,
        baseSuccessRate: 80,
        success: {
          echoRemnants: 20,
          senseFragments: 1,
          message: "안전하게 물자를 확보했습니다.",
        },
        failure: null,
      },
      {
        text: "무시하고 지나간다",
        guaranteed: true,
        result: { message: "안전하게 지나갔습니다." },
      },
    ],
  },
  event_survivor: {
    id: "event_survivor",
    title: "생존자와의 조우",
    description:
      "어둠 속에서 누군가의 신음소리가 들립니다. 다친 생존자일 수도, 함정일 수도 있습니다.",
    choices: [
      {
        text: "소리를 추적한다",
        baseSuccessRate: 60,
        senseBonus: { [CharacterClass.WARRIOR]: 20 },
        success: {
          echoRemnants: -10,
          memoryPieces: 1,
          message:
            "부상당한 생존자를 도왔습니다. 감사의 표시로 정보를 얻었습니다.",
          followUp: "event_survivor_reward",
        },
        failure: {
          combat: "marauder1",
          message: "함정이었습니다! 약탈자들이 습격합니다!",
        },
      },
      {
        text: "영적 감각으로 확인한다",
        requiredSense: CharacterClass.MAGE,
        baseSuccessRate: 90,
        success: {
          message: "사악한 기운을 감지했습니다. 피해갑니다.",
          echoRemnants: 10,
        },
        failure: null,
      },
      {
        text: "조용히 떠난다",
        guaranteed: true,
        result: { message: "위험을 피해 조용히 자리를 떴습니다." },
      },
    ],
  },
  event_trap: {
    id: "event_trap",
    title: "이상한 장치",
    description:
      "벽면에 기묘한 장치가 설치되어 있습니다. 고대의 유물일까요, 아니면 최근의 함정일까요?",
    choices: [
      {
        text: "장치를 조사한다",
        baseSuccessRate: 40,
        senseBonus: {
          [CharacterClass.WARRIOR]: 10,
          [CharacterClass.TANK]: 20,
          [CharacterClass.MAGE]: 15,
        },
        success: {
          senseFragments: 2,
          message: "고대의 감각 증폭 장치를 발견했습니다!",
        },
        failure: {
          damage: 15,
          curse: 2,
          message: "저주받은 함정이 발동했습니다!",
        },
      },
      {
        text: "흔적을 추적한다",
        requiredSense: CharacterClass.ROGUE,
        baseSuccessRate: 70,
        success: {
          echoRemnants: 25,
          message: "숨겨진 보물을 발견했습니다!",
        },
        failure: {
          damage: 5,
          message: "함정을 피하려다 살짝 다쳤습니다.",
        },
      },
      {
        text: "파괴한다",
        guaranteed: true,
        result: {
          echoRemnants: 5,
          message: "장치를 파괴하고 부품을 회수했습니다.",
        },
      },
    ],
  },
  event_survivor_reward: {
    id: "event_survivor_reward",
    title: "생존자의 보답",
    description: "이전에 도왔던 생존자가 당신을 찾아왔습니다.",
    isFollowUp: true,
    choices: [
      {
        text: "감사히 받는다",
        guaranteed: true,
        result: {
          echoRemnants: 50,
          senseFragments: 1,
          message: "생존자가 숨겨둔 물자의 위치를 알려주었습니다!",
        },
      },
    ],
  },
  event_coin_pouch: {
    id: "event_coin_pouch",
    title: "낡은 동전 주머니",
    description: "길가에서 낡은 가죽 주머니를 발견했습니다. 묵직한 것이 들어있습니다.",
    choices: [
      {
        text: "열어본다",
        guaranteed: true,
        result: {
          message: "안에 낡았지만 쓸만한 동전이 들어있었다.",
          reserveCoinsGained: 1
        },
      },
      {
        text: "무시하고 지나간다",
        guaranteed: true,
        result: { message: "안전하게 지나갔습니다." },
      },
    ],
  },
  event_wishing_well: {
    id: "event_wishing_well",
    title: "오래된 우물",
    description: "오래된 우물을 발견했습니다. 안에서 희미한 빛이 납니다. 에코를 던져 소원을 빌어볼 수 있을 것 같습니다.",
    choices: [
      {
        text: "에코 10개를 던져본다",
        baseSuccessRate: 50,
        success: {
          echoRemnants: -10,
          message: "우물이 빛나며 새로운 동전을 뱉어냈다!",
          reserveCoinsGained: 1
        },
        failure: {
          echoRemnants: -10,
          message: "에코가 물에 빠지는 소리만 들릴 뿐, 아무 일도 일어나지 않았다.",
        },
      },
      {
        text: "지나간다",
        guaranteed: true,
        result: { message: "우물을 뒤로하고 길을 계속 걸었습니다." },
      },
    ],
  }
};