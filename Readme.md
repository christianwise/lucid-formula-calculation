# Formula Input

This project is a Next.js-based application that allows users to input mathematical formulas using tags, numbers, and operators. It provides real-time suggestions for variables and evaluates the formula to display the result.

## Features

- **Dynamic Formula Input**: Users can type formulas using tags, numbers, and operators.
- **Autocomplete Suggestions**: Provides suggestions for tag names as the user types.
- **Real-time Evaluation**: The formula is evaluated in real-time, and the result is displayed.
- **Tag Management**: Users can add and remove variable tags from the formula.

## Technologies Used

- **Next.js**: For building the user interface.
- **Zustand**: For state management.
- **React Query**: For data fetching and caching.
- **Tailwind CSS**: For styling.
- **Lucide React**: For icons.
- **Radix UI**: For UI components like popovers and selects.

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/christianwise/lucid-formula-calculation.git
   cd lucid-formula-calculation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to see the application in action.

## Usage

- **Input Formula**: Start typing a formula in the input box. Use operators like `+`, `-`, `*`, `/`, `^`, and parentheses `(`, `)`.
- **Autocomplete**: As you type, suggestions for variable names will appear. Use the arrow keys to navigate and `Enter` to select.
- **Manage Tags**: Click on a tag to view its details or remove it from the formula.
- **Refresh**: Use the refresh button to clear the formula and start over.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.
