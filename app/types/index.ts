export interface Suggestion {
  name: string;
  category: string;
  value: string | number;
  id: string;
}

export interface FormulaTag {
  id: string;
  name: string;
  category: string;
  value: string | number;
}

export interface FormulaState {
  tags: FormulaTag[];
  formula: string;
  result: number;
  addTag: (tag: FormulaTag) => void;
  removeTag: (id: string) => void;
  updateFormula: (formula: string) => void;
  calculateResult: () => void;
  resetFormula: () => void;
}