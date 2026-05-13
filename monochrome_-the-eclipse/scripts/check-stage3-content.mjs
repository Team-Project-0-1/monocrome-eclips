import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(appDir, "..");
const strict = process.argv.includes("--strict");
const templatePath = path.join(appDir, "content", "stage3", "stage3-content-template.json");
const failures = [];

const tbdMarker = "__STAGE3_TBD__";
const allowedOwners = new Set(["content", "combat", "balance", "art", "audio", "implementation"]);
const allowedExpectedTypes = new Set(["string", "number", "boolean", "enum", "array", "object", "effect"]);
const allowedRoles = new Set(["warrior", "assassin", "mage", "utility", "hybrid"]);
const allowedIntentCategories = new Set(["attack", "buff", "debuff", "move", "idle"]);
const allowedDangerLevels = new Set(["normal", "high"]);
const allowedSecretTechniqueKinds = new Set(["active", "passive"]);

const readText = (relativePath) => {
  const fullPath = path.join(appDir, relativePath);
  if (!existsSync(fullPath)) {
    failures.push(`missing ${path.relative(repoDir, fullPath)}`);
    return "";
  }
  return readFileSync(fullPath, "utf8");
};

const formatPath = (segments) => segments.join(".");

const isPlainObject = (value) => (
  Boolean(value) && typeof value === "object" && !Array.isArray(value)
);

const isTbd = (value) => (
  isPlainObject(value) && value.__stage3_tbd__ === tbdMarker
);

const validateTbd = (value, segments) => {
  const location = formatPath(segments);

  if (strict) {
    failures.push(`${location} still uses ${tbdMarker}`);
  }
  if (!allowedExpectedTypes.has(value.expectedType)) {
    failures.push(`${location}.expectedType is invalid`);
  }
  if (!allowedOwners.has(value.owner)) {
    failures.push(`${location}.owner is invalid`);
  }
  if (typeof value.sourceNeeded !== "string" || value.sourceNeeded.trim().length < 2) {
    failures.push(`${location}.sourceNeeded must explain the missing source`);
  }
};

const validateDraftField = (value, expectedType, segments, allowedValues) => {
  if (isTbd(value)) {
    validateTbd(value, segments);
    if (value.expectedType !== expectedType) {
      failures.push(`${formatPath(segments)} expected TBD type ${expectedType}, got ${value.expectedType}`);
    }
    return;
  }

  const location = formatPath(segments);
  if (expectedType === "array") {
    if (!Array.isArray(value)) failures.push(`${location} must be an array or TBD`);
    return;
  }
  if (expectedType === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) failures.push(`${location} must be a finite number or TBD`);
    return;
  }
  if (expectedType === "string" || expectedType === "effect") {
    if (typeof value !== "string" || value.trim().length === 0) failures.push(`${location} must be a non-empty string or TBD`);
    return;
  }
  if (expectedType === "enum") {
    if (!allowedValues?.has(value)) failures.push(`${location} uses invalid enum value ${JSON.stringify(value)}`);
  }
};

const walkForTbdShape = (value, segments = ["root"]) => {
  if (isTbd(value)) {
    validateTbd(value, segments);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForTbdShape(item, [...segments, String(index)]));
    return;
  }
  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nested]) => walkForTbdShape(nested, [...segments, key]));
  }
};

const requireArray = (value, label, minLength = 1) => {
  if (!Array.isArray(value)) {
    failures.push(`${label} must be an array`);
    return [];
  }
  if (value.length < minLength) {
    failures.push(`${label} must include at least ${minLength} entry`);
  }
  return value;
};

const validateIntent = (intent, segments) => {
  if (!isPlainObject(intent)) {
    failures.push(`${formatPath(segments)} must be an object`);
    return;
  }
  validateDraftField(intent.category, "enum", [...segments, "category"], allowedIntentCategories);
  validateDraftField(intent.dangerLevel, "enum", [...segments, "dangerLevel"], allowedDangerLevels);
  validateDraftField(intent.rangeLabel, "string", [...segments, "rangeLabel"]);
  validateDraftField(intent.playerCue, "string", [...segments, "playerCue"]);
};

const validatePatterns = (patterns, segments) => {
  const rows = requireArray(patterns, formatPath(segments), strict ? 1 : 0);
  rows.forEach((pattern, index) => {
    const next = [...segments, String(index)];
    if (!/^stage3_/.test(pattern.id ?? "")) failures.push(`${formatPath(next)}.id must start with stage3_`);
    validateDraftField(pattern.name, "string", [...next, "name"]);
    validateDraftField(pattern.trigger, "string", [...next, "trigger"]);
    validateDraftField(pattern.role, "enum", [...next, "role"], allowedRoles);
    validateDraftField(pattern.effect, "effect", [...next, "effect"]);
    validateIntent(pattern.intent, [...next, "intent"]);
  });
};

const validateMonster = (monster, segments, tier) => {
  if (!/^stage3_/.test(monster.id ?? "")) failures.push(`${formatPath(segments)}.id must start with stage3_`);
  if (monster.tier !== tier) failures.push(`${formatPath(segments)}.tier must be ${tier}`);
  if (strict && monster.status !== "ready") failures.push(`${formatPath(segments)}.status must be ready in strict mode`);
  validateDraftField(monster.name, "string", [...segments, "name"]);
  validateDraftField(monster.hp, "number", [...segments, "hp"]);
  validateDraftField(monster.baseAtk, "number", [...segments, "baseAtk"]);
  validateDraftField(monster.baseDef, "number", [...segments, "baseDef"]);
  validatePatterns(monster.patterns, [...segments, "patterns"]);
};

if (!existsSync(templatePath)) {
  failures.push(`missing ${path.relative(repoDir, templatePath)}`);
} else {
  const data = JSON.parse(readFileSync(templatePath, "utf8"));

  if (data.schemaVersion !== "stage3-content-input-v1") failures.push("schemaVersion must be stage3-content-input-v1");
  if (data.stage !== 3) failures.push("stage must be 3");
  if (data.status !== "locked") failures.push("status must stay locked");
  if (data.source?.title !== "기획서") failures.push("source.title must be 기획서");
  if (data.source?.documentId !== "1Ta50Zudk34_6qBi4sP3TjQVoPq7Su8cnQpqUBsXRbf8") failures.push("source.documentId does not match the Drive 기획서");

  const gate = data.gate ?? {};
  if (gate.normalCombatsBeforeBoss !== 2) failures.push("gate.normalCombatsBeforeBoss must be 2");
  if (gate.targetTotalEnemyCount !== 8) failures.push("gate.targetTotalEnemyCount must be 8");
  if (gate.maxEnemiesOnField !== 3) failures.push("gate.maxEnemiesOnField must be 3");
  if (gate.bossReward !== "secretTechniqueDraft") failures.push("gate.bossReward must be secretTechniqueDraft");
  if (gate.rewardOfferCount !== 3 || gate.rewardChooseCount !== 1) failures.push("Gate 3 비기 reward must offer 3 and choose 1");

  requireArray(data.normalMonsterTemplates, "normalMonsterTemplates", 3).forEach((monster, index) => {
    const segments = ["normalMonsterTemplates", String(index)];
    validateMonster(monster, segments, "normal");
    validateDraftField(monster.role, "enum", [...segments, "role"], allowedRoles);
    validateDraftField(monster.passives, "array", [...segments, "passives"]);
  });

  requireArray(data.bossTemplates, "bossTemplates", 1).forEach((boss, index) => {
    const segments = ["bossTemplates", String(index)];
    validateMonster(boss, segments, "boss");
    requireArray(boss.phases, `${formatPath(segments)}.phases`, 1).forEach((phase, phaseIndex) => {
      const phaseSegments = [...segments, "phases", String(phaseIndex)];
      if (!/^stage3_/.test(phase.id ?? "")) failures.push(`${formatPath(phaseSegments)}.id must start with stage3_`);
      validateDraftField(phase.label, "string", [...phaseSegments, "label"]);
      if ("hpBelow" in phase) validateDraftField(phase.hpBelow, "number", [...phaseSegments, "hpBelow"]);
      if ("turnFrom" in phase) validateDraftField(phase.turnFrom, "number", [...phaseSegments, "turnFrom"]);
      validateDraftField(phase.patternIds, "array", [...phaseSegments, "patternIds"]);
      validateDraftField(phase.playerCue, "string", [...phaseSegments, "playerCue"]);
    });
    validateDraftField(boss.dangerIntentThreshold, "string", [...segments, "dangerIntentThreshold"]);
  });

  const rewards = requireArray(data.secretTechniqueRewardTemplates, "secretTechniqueRewardTemplates", 3);
  if (rewards.length !== 3) failures.push("secretTechniqueRewardTemplates must contain exactly 3 draft options");
  rewards.forEach((reward, index) => {
    const segments = ["secretTechniqueRewardTemplates", String(index)];
    if (!/^stage3_secret_technique_/.test(reward.id ?? "")) failures.push(`${formatPath(segments)}.id must start with stage3_secret_technique_`);
    if (strict && reward.status !== "ready") failures.push(`${formatPath(segments)}.status must be ready in strict mode`);
    validateDraftField(reward.kind, "enum", [...segments, "kind"], allowedSecretTechniqueKinds);
    validateDraftField(reward.name, "string", [...segments, "name"]);
    validateDraftField(reward.role, "string", [...segments, "role"]);
    validateDraftField(reward.usageRule, "string", [...segments, "usageRule"]);
    validateDraftField(reward.effect, "effect", [...segments, "effect"]);
    validateDraftField(reward.playerCue, "string", [...segments, "playerCue"]);
  });

  walkForTbdShape(data);
}

const dataStages = readText("dataStages.ts");
if (!/3:\s*\{[\s\S]*combatPool:\s*\[\][\s\S]*miniboss:\s*''[\s\S]*boss:\s*''[\s\S]*eventPool:\s*\[\]/.test(dataStages)) {
  failures.push("dataStages.ts Stage 3 must remain locked with empty combatPool, miniboss, boss, and eventPool");
}

const publicText = [
  readText("index.html"),
  readText(path.join("public", "manifest.webmanifest")),
].join("\n");

[
  /3스테이지\s*플레이\s*가능/,
  /Stage\s*3\s*playable/i,
  /최종\s*보스\s*구현/,
  /엔딩\s*포함/
].forEach((pattern) => {
  if (pattern.test(publicText)) {
    failures.push(`public copy must not include ${pattern}`);
  }
});

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}

console.log(`PASS Stage 3 content scaffold checks${strict ? " (strict)" : " (TBD allowed)"}`);
