import FormulaInput from './components/FormulaInput';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Formula Input</h1>
        <FormulaInput />
      </div>
    </div>
  );
}