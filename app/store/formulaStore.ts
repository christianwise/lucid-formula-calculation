import { create } from 'zustand';
import { FormulaState, FormulaTag } from '../types';
import { FormulaEvaluator } from '../lib/formulaEvaluator';

export const useFormulaStore = create<FormulaState>((set, get) => ({
  tags: [],
  formula: '',
  result: 0,
  addTag: (tag: FormulaTag) =>
    set((state) => ({ tags: [...state.tags, tag] })),
  removeTag: (id: string) =>
    set((state) => {
      const newTags = state.tags.filter((tag) => tag.id !== id);
      return { tags: newTags };
    }),
  updateFormula: (formula: string) => {
    set({ formula });
    // Calculate result immediately after formula update
    get().calculateResult();
  },
  calculateResult: () => {
    const { formula, tags } = get();
    
    // Replace tag names with their values in the formula
    let processedFormula = formula;
    
    // Sort tags by name length (longest first) to avoid partial matches
    const sortedTags = [...tags].sort((a, b) => b.name.length - a.name.length);
    
    // Replace each tag name with its value
    for (const tag of sortedTags) {
      processedFormula = processedFormula.replace(
        new RegExp(tag.name, 'g'), 
        tag.value.toString()
      );
    }
    
    // Now parse the formula with replaced values
    const tokens: (string | number)[] = [];
    let currentToken = '';
    
    // Parse formula into tokens
    for (let i = 0; i <= processedFormula.length; i++) {
      const char = processedFormula[i] || ' '; // Add space at the end to process last token
      
      if (char === ' ') {
        if (currentToken) {
          // Try to parse as number
          const numValue = parseFloat(currentToken);
          if (!isNaN(numValue)) {
            tokens.push(numValue);
          }
          currentToken = '';
        }
      } else if (['+', '-', '*', '/', '(', ')'].includes(char)) {
        // Check for operators using a direct check instead of the private method
        if (currentToken) {
          // Process any accumulated token before the operator
          const numValue = parseFloat(currentToken);
          if (!isNaN(numValue)) {
            tokens.push(numValue);
          }
          currentToken = '';
        }
        tokens.push(char);
      } else {
        currentToken += char;
      }
    }

    const result = FormulaEvaluator.evaluate(tokens);
    set({ result });
  },
  resetFormula: () => {
    set({
      formula: '',
      tags: [],
      result: 0,
    });
  }
}));