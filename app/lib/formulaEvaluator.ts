export class FormulaEvaluator {
  private static isOperator(char: string): boolean {
    return ['+', '-', '*', '/', '^', '(', ')'].includes(char);
  }

  private static getPrecedence(operator: string): number {
    switch (operator) {
      case '^':
        return 3;
      case '*':
      case '/':
        return 2;
      case '+':
      case '-':
        return 1;
      default:
        return 0;
    }
  }

  private static applyOperation(a: number, b: number, operator: string): number {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? a / b : NaN;
      case '^':
        return Math.pow(a, b);
      default:
        return NaN;
    }
  }

  static evaluate(tokens: (string | number)[]): number {
    const values: number[] = [];
    const operators: string[] = [];

    const processOperator = () => {
      const operator = operators.pop();
      const b = values.pop();
      const a = values.pop();
      if (a !== undefined && b !== undefined && operator) {
        values.push(this.applyOperation(a, b, operator));
      }
    };

    for (const token of tokens) {
      if (typeof token === 'number') {
        values.push(token);
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length && operators[operators.length - 1] !== '(') {
          processOperator();
        }
        operators.pop(); // Remove '('
      } else if (this.isOperator(token)) {
        while (
          operators.length &&
          operators[operators.length - 1] !== '(' &&
          this.getPrecedence(operators[operators.length - 1]) >= this.getPrecedence(token)
        ) {
          processOperator();
        }
        operators.push(token);
      }
    }

    while (operators.length) {
      processOperator();
    }

    return values[0] || 0;
  }
}