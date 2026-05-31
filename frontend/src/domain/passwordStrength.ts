export const PASSWORD_MIN_LENGTH = 15;
const PASSWORD_MAX_SCORE = 5;

export type PasswordStrengthLevel =
  | "empty"
  | "tooShort"
  | "fair"
  | "good"
  | "strong";

export type PasswordStrengthRules = {
  minLength: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  symbol: boolean;
};

export type PasswordStrength = {
  level: PasswordStrengthLevel;
  rules: PasswordStrengthRules;
  score: number;
  width: number;
};

export function getPasswordStrength(password = ""): PasswordStrength {
  const rules = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    lower: /\p{Ll}/u.test(password),
    upper: /\p{Lu}/u.test(password),
    number: /\p{N}/u.test(password),
    symbol: /[^\p{L}\p{N}\s]/u.test(password),
  };

  const matchedRules = Object.values(rules).filter(Boolean).length;
  const score = rules.minLength ? matchedRules : Math.min(matchedRules, 2);

  if (!password) {
    return { level: "empty", rules, score: 0, width: 0 };
  }

  if (!rules.minLength) {
    return {
      level: "tooShort",
      rules,
      score,
      width: (score / PASSWORD_MAX_SCORE) * 100,
    };
  }

  if (score <= 2) {
    return { level: "fair", rules, score, width: 45 };
  }

  if (score <= 4) {
    return {
      level: "good",
      rules,
      score,
      width: (score / PASSWORD_MAX_SCORE) * 100,
    };
  }

  return { level: "strong", rules, score, width: 100 };
}
