import {
  CharacterClass,
  EventDefinition,
} from "./types";

export const eventData: { [key: string]: EventDefinition } = {
  event_supplies: {
    id: "event_supplies",
    title: "버려진 보급품",
    description:
      "폐허가 된 지하 통로에서 낡은 군용 상자를 발견했습니다. 안에는 에코 잔재가 남아 있을 수도 있지만, 경보 장치가 아직 살아 있을 수도 있습니다.",
    choices: [
      {
        text: "조심스럽게 열어본다",
        baseSuccessRate: 50,
        senseBonus: { [CharacterClass.TANK]: 30 },
        success: { echoRemnants: 30, message: "상자 안에서 쓸 만한 에코 잔재를 찾아냈습니다." },
        failure: {
          damage: 10,
          message: "상자 안쪽의 경보 장치가 폭발했습니다. 파편이 갑옷 틈을 파고듭니다.",
        },
      },
      {
        text: "냄새와 먼지의 흐름을 읽는다",
        requiredSense: CharacterClass.ROGUE,
        baseSuccessRate: 80,
        success: {
          echoRemnants: 20,
          senseFragments: 1,
          message: "함정의 호흡을 읽고 안전한 수납칸만 열었습니다.",
        },
        failure: null,
      },
      {
        text: "표식을 남기고 지나간다",
        guaranteed: true,
        result: { message: "위험한 보급품을 건드리지 않았습니다. 대신 다음 탐험자를 위한 표식을 남겼습니다." },
      },
    ],
  },
  event_survivor: {
    id: "event_survivor",
    title: "생존자의 신호",
    description:
      "무너진 벽 너머에서 작은 두드림이 반복됩니다. 구조 신호일 수도 있고, 약탈자가 흉내 내는 미끼일 수도 있습니다.",
    choices: [
      {
        text: "소리를 따라간다",
        baseSuccessRate: 60,
        senseBonus: { [CharacterClass.WARRIOR]: 20 },
        success: {
          echoRemnants: -10,
          memoryPieces: 1,
          message:
            "소리의 떨림이 사람의 호흡과 맞물려 있음을 알아냈습니다. 생존자는 작은 기억 조각을 보답으로 건넵니다.",
          followUp: "event_survivor_reward",
        },
        failure: {
          combat: "marauder1",
          message: "신호는 미끼였습니다. 매복한 약탈자가 그림자 속에서 튀어나옵니다.",
        },
      },
      {
        text: "마력의 잔향을 확인한다",
        requiredSense: CharacterClass.MAGE,
        baseSuccessRate: 90,
        success: {
          message: "신호 주변의 악의를 미리 감지했습니다. 위험한 골목을 피해 돌아갑니다.",
          echoRemnants: 10,
        },
        failure: null,
      },
      {
        text: "응답하지 않고 지나간다",
        guaranteed: true,
        result: { message: "알 수 없는 신호를 뒤로하고 조용히 자리를 떠났습니다." },
      },
    ],
  },
  event_trap: {
    id: "event_trap",
    title: "이상한 장치",
    description:
      "바닥에 박힌 오래된 감응 장치가 희미하게 깜빡입니다. 가까이 다가가면 감각을 증폭시킬 수도, 저주를 흘려보낼 수도 있습니다.",
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
          message: "장치의 공명 주기를 맞춰 감각 조각을 추출했습니다.",
        },
        failure: {
          damage: 15,
          curse: 2,
          message: "검은 파장이 손끝을 타고 올라옵니다. 저주의 잔향이 남았습니다.",
        },
      },
      {
        text: "도둑의 흔적을 추적한다",
        requiredSense: CharacterClass.ROGUE,
        baseSuccessRate: 70,
        success: {
          echoRemnants: 25,
          message: "누군가 장치를 털다 흘린 에코 잔재를 찾아냈습니다.",
        },
        failure: {
          damage: 5,
          message: "흔적을 쫓다 느슨한 철판에 발을 베였습니다.",
        },
      },
      {
        text: "부숴서 잔재만 회수한다",
        guaranteed: true,
        result: {
          echoRemnants: 5,
          message: "장치를 망가뜨리고 남은 부품에서 적은 양의 에코를 회수했습니다.",
        },
      },
    ],
  },
  event_survivor_reward: {
    id: "event_survivor_reward",
    title: "생존자의 보답",
    description: "구조한 생존자가 흔들리는 손으로 낡은 금속 표식을 내밉니다. 표식 안쪽에는 기억의 결이 남아 있습니다.",
    isFollowUp: true,
    choices: [
      {
        text: "감사의 표식을 받는다",
        guaranteed: true,
        result: {
          echoRemnants: 50,
          senseFragments: 1,
          message: "생존자는 당신의 이름을 기억하겠다고 말했습니다. 작은 감사가 에코로 되돌아옵니다.",
        },
      },
    ],
  },
  event_coin_pouch: {
    id: "event_coin_pouch",
    title: "낡은 동전 주머니",
    description: "끊어진 가죽끈에 매달린 동전 주머니를 발견했습니다. 안쪽에서 아직 굴러가지 않은 동전의 무게가 느껴집니다.",
    choices: [
      {
        text: "열어본다",
        guaranteed: true,
        result: {
          message: "주머니 안에서 예비 동전 하나를 얻었습니다.",
          reserveCoinsGained: 1,
        },
      },
      {
        text: "그대로 지나간다",
        guaranteed: true,
        result: { message: "불길한 주머니를 건드리지 않고 길을 계속 갑니다." },
      },
    ],
  },
  event_wishing_well: {
    id: "event_wishing_well",
    title: "오래된 우물",
    description: "건물 안뜰에 오래된 우물이 남아 있습니다. 밑바닥에서 빛이 깜빡이고, 동전을 던지면 무언가 되돌아올 것 같습니다.",
    choices: [
      {
        text: "에코 10개를 던져본다",
        requiredResources: { echoRemnants: 10 },
        baseSuccessRate: 50,
        success: {
          echoRemnants: -10,
          message: "우물 속 빛이 반응하며 예비 동전 하나를 밀어 올렸습니다.",
          reserveCoinsGained: 1,
        },
        failure: {
          echoRemnants: -10,
          message: "에코가 물속으로 사라졌습니다. 되돌아온 것은 차가운 메아리뿐입니다.",
        },
      },
      {
        text: "소원 없이 지나간다",
        guaranteed: true,
        result: { message: "우물을 바라보다가, 아직 빌 소원이 없다는 사실만 확인했습니다." },
      },
    ],
  },
};
