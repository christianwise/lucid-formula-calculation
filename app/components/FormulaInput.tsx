'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormulaStore } from '../store/formulaStore';
import { Suggestion, FormulaTag } from '../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RefreshCw } from 'lucide-react';

const fetchSuggestions = async (): Promise<Suggestion[]> => {
  const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];

export default function FormulaInput() {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tags, formula, result, addTag, removeTag, updateFormula, resetFormula } = useFormulaStore();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions'],
    queryFn: fetchSuggestions,
  });

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Reset selected index when filtered suggestions change
  useRef(() => {
    setSelectedSuggestionIndex(0);
  }).current;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      // Handle arrow navigation in suggestions
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prevIndex) => 
          prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleTagSelect(filteredSuggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
    
    if (e.key === 'Backspace' && inputValue === '' && formula.trim() !== '') {
      // First check if the last part of the formula matches any tag
      const matchingTag = tags.find(tag => 
        formula.trim().endsWith(tag.name)
      );
      
      if (matchingTag) {
        // If we found a matching tag at the end, remove it entirely
        removeTag(matchingTag.id);
        const newFormula = formula.substring(0, formula.lastIndexOf(matchingTag.name)).trim();
        updateFormula(newFormula);
      } else {
        // If it's not a tag, remove the last element (number/operator)
        const formulaElements = formula.trim().split(/\s+/);
        const lastElement = formulaElements[formulaElements.length - 1];
        const newFormula = formula.substring(0, formula.lastIndexOf(lastElement)).trim();
        updateFormula(newFormula);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(0);

    // If it's an operator, update formula immediately
    if (OPERATORS.includes(value)) {
      updateFormula(`${formula} ${value} `);
      setInputValue('');
      return;
    }

    // If it's a number, update formula immediately
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateFormula(`${formula} ${numValue} `);
      setInputValue('');
      return;
    }
  };

  const handleTagSelect = (suggestion: Suggestion) => {
    const newTag: FormulaTag = {
      id: suggestion.id,
      name: suggestion.name,
      category: suggestion.category,
      value: suggestion.value,
    };
    addTag(newTag);
    updateFormula(`${formula} ${suggestion.name} `);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRefresh = () => {
    resetFormula();
    setInputValue('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="border rounded-lg p-2 flex flex-wrap gap-2 min-h-[100px] bg-white">
        <div className="w-full font-mono text-sm mb-2 text-gray-600 flex justify-between items-center">
          <span>Formula: {formula || 'Start typing to create a formula'}</span>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh formula"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {(() => {
            // Define types for our formula items
            type FormulaItem = 
              | { type: 'tag'; tag: FormulaTag }
              | { type: 'operator'; value: string }
              | { type: 'number'; value: string };
              
            const formulaItems: FormulaItem[] = [];
            const formulaText = formula.trim();
            
            if (!formulaText) return null;
            
            // First identify all tags and their positions in the formula
            const tagPositions = tags.map(tag => ({
              tag,
              index: formulaText.indexOf(tag.name),
              length: tag.name.length
            })).filter(item => item.index !== -1)
              .sort((a, b) => a.index - b.index);
            
            // Parse the formula into segments: tags, operators, and numbers
            let lastPosition = 0;
            
            for (const tagPosition of tagPositions) {
              // Add any content before this tag
              if (tagPosition.index > lastPosition) {
                const beforeTag = formulaText.substring(lastPosition, tagPosition.index).trim();
                
                // Split and add operators and numbers from this segment
                beforeTag.split(/\s+/).forEach(item => {
                  if (item) {
                    if (OPERATORS.includes(item)) {
                      formulaItems.push({ type: 'operator', value: item });
                    } else {
                      formulaItems.push({ type: 'number', value: item });
                    }
                  }
                });
              }
              
              // Add the tag
              formulaItems.push({ type: 'tag', tag: tagPosition.tag });
              
              // Update position after this tag
              lastPosition = tagPosition.index + tagPosition.length;
            }
            
            // Add any remaining content after the last tag
            if (lastPosition < formulaText.length) {
              const afterLastTag = formulaText.substring(lastPosition).trim();
              
              afterLastTag.split(/\s+/).forEach(item => {
                if (item) {
                  if (OPERATORS.includes(item)) {
                    formulaItems.push({ type: 'operator', value: item });
                  } else {
                    formulaItems.push({ type: 'number', value: item });
                  }
                }
              });
            }
            
            // Render the parsed formula items
            return formulaItems.map((item, index) => {
              if (item.type === 'tag') {
                const tag = item.tag;
                return (
                  <div
                    key={`${tag.id}-${index}`}
                    className="flex items-center bg-blue-100 rounded px-2 py-1"
                  >
                    <span>{tag.name}</span>
                    <Popover>
                      <PopoverTrigger>
                        <span className="ml-2 text-blue-600 cursor-pointer">▼</span>
                      </PopoverTrigger>
                      <PopoverContent className="p-3 w-56">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2">
                            <span className="font-semibold text-sm">ID:</span>
                            <span className="text-sm">{tag.id}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="font-semibold text-sm">Category:</span>
                            <span className="text-sm">{tag.category}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="font-semibold text-sm">Value:</span>
                            <span className="text-sm">{tag.value}</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              } else if (item.type === 'operator') {
                return (
                  <div key={`op-${index}`} className="flex items-center bg-gray-100 rounded px-2 py-1">
                    <span className="font-medium">{item.value}</span>
                  </div>
                );
              } else {
                return (
                  <div key={`num-${index}`} className="flex items-center bg-green-100 rounded px-2 py-1">
                    <span>{item.value}</span>
                  </div>
                );
              }
            });
          })()}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none min-w-[200px]"
          placeholder="Type variable name, number, or operator (+, -, *, /, ^)"
        />
      </div>
      
      {showSuggestions && inputValue && (
        <div className="mt-2 border rounded-lg bg-white shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`p-2 cursor-pointer ${
                index === selectedSuggestionIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleTagSelect(suggestion)}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-sm text-gray-500">{suggestion.category}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <div className="text-lg font-semibold">Result:</div>
        <div className="text-2xl font-mono">{result}</div>
      </div>
    </div>
  );
}