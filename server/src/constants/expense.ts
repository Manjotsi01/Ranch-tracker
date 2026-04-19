export const EXPENSE_CATEGORY_VALUES = [
  'SEEDS',
  'FERTILIZER',
  'PESTICIDE',
  'LABOUR',
  'MACHINERY',
  'IRRIGATION',
  'OTHER',
] as const;

export type ExpenseCategory =
  typeof EXPENSE_CATEGORY_VALUES[number];