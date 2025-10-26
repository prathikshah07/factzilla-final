import React, { useState, useCallback } from 'react';
import { factCheckWithGemini } from './services/geminiService';
import type { VerificationResult, GroundingChunk, Verdict } from './types';
import { BackArrowIcon, NewspaperIcon, BeakerIcon, HeartIcon, LinkIcon } from './components/Icons';

type Screen = 'input' | 'report';

const exampleScenarios = [
    { id: 'political', icon: NewspaperIcon, text: 'Political Headline', claim: 'A new study shows that the recent tax cuts for corporations led to a 50% increase in job creation nationwide.' },
    { id: 'scientific', icon: BeakerIcon, text: 'Scientific Study', claim: 'Researchers have discovered that drinking coffee can reverse the effects of aging at a cellular level.' },
    { id: 'health', icon: HeartIcon, text: 'Health/Medical', claim: 'Eating a tablespoon of apple cider vinegar every day is a proven method for losing 20 pounds in a month.' },
];

const verdictStyles: Record<Verdict, { bg: string, text: string, border: string }> = {
    'TRUE': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
    'FALSE': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
    'MISLEADING': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' },
    'UNSUPPORTED': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' },
};

const getVerdictStyle = (verdict: Verdict) => {
    const key = verdict.toUpperCase();
    return verdictStyles[key] || verdictStyles['UNSUPPORTED'];
};


// --- Sub-components defined outside App to prevent re-renders ---

interface InputScreenProps {
    claim: string;
    setClaim: (claim: string) => void;
    onFactCheck: () => void;
}
const InputScreen: React.FC<InputScreenProps> = ({ claim, setClaim, onFactCheck }) => (
    <div className="flex flex-col h-full p-6 md:p-8 space-y-6">
        <header className="flex items-center justify-between text-white">
            <div>
                <h1 className="text-2xl font-bold">Factzilla</h1>
            </div>
            <div className="flex items-center space-x-3 bg-[#2D2A5C] p-2 rounded-full">
                <img src="https://picsum.photos/seed/analyst/40/40" alt="Analyst" className="w-10 h-10 rounded-full" />
                <span className="pr-3 font-medium">Analyst</span>
            </div>
        </header>

        <main className="flex-grow flex flex-col justify-center space-y-6">
            <div className="bg-[#2D2A5C] p-6 rounded-[40px] shadow-lg">
                <label htmlFor="claim-input" className="text-gray-400 font-medium">Enter Claim for Verification</label>
                <textarea
                    id="claim-input"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., The moon is made of cheese..."
                    className="w-full h-32 bg-transparent text-white text-lg mt-2 resize-none focus:outline-none"
                />
            </div>
             <button
                onClick={onFactCheck}
                disabled={!claim.trim()}
                className="w-full bg-[#FFC947] text-[#2D2A5C] font-bold text-lg py-4 rounded-full shadow-lg transition-transform duration-200 active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Fact Check Now
            </button>
        </main>

        <footer className="space-y-4">
            <h2 className="text-white font-semibold">Example Scenarios</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6">
                {exampleScenarios.map(scenario => (
                    <button key={scenario.id} onClick={() => setClaim(scenario.claim)} className="flex-shrink-0 flex flex-col items-center justify-center space-y-2 text-white bg-[#2D2A5C] w-28 h-28 rounded-3xl p-2 text-center text-xs font-medium transition-transform duration-200 active:scale-95">
                        <scenario.icon className="w-8 h-8"/>
                        <span>{scenario.text}</span>
                    </button>
                ))}
            </div>
        </footer>
    </div>
);

interface ReportScreenProps {
    claim: string;
    result: VerificationResult;
    sources: GroundingChunk[];
    onReset: () => void;
}
const ReportScreen: React.FC<ReportScreenProps> = ({ claim, result, sources, onReset }) => {
    const verdictStyle = getVerdictStyle(result.verdict);
    return (
    <div className="flex flex-col h-full p-6 md:p-8 space-y-6">
        <header className="flex items-center text-white">
            <button onClick={onReset} className="p-2 -ml-2 transition-transform duration-200 active:scale-95">
                <BackArrowIcon className="w-8 h-8" />
            </button>
            <h1 className="text-xl font-bold text-center flex-grow">Verification Report</h1>
            <div className="w-8"></div>
        </header>

        <main className="flex-grow flex flex-col space-y-6 overflow-y-auto">
            <div className="bg-[#FFC947] text-[#2D2A5C] p-6 rounded-[40px] shadow-lg space-y-4">
                <p className="font-medium italic">"{claim}"</p>
                <div className="border-t border-[#2D2A5C]/30 my-2"></div>
                <div className="flex items-center space-x-3">
                    <span className={`px-4 py-1 text-sm font-bold rounded-full border-2 ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}>
                        {result.verdict.toUpperCase()}
                    </span>
                    <p className="font-semibold text-lg">Verdict</p>
                </div>
                 <p className="text-sm">{result.summary_explanation}</p>
            </div>

            <div className="bg-[#2D2A5C] text-white p-6 rounded-[40px] shadow-lg space-y-3">
                <div className="flex justify-between items-center font-medium">
                    <span>Low Trust</span>
                    <span className="text-2xl font-bold">{result.confidence_score}%</span>
                    <span>High Trust</span>
                </div>
                <div className="w-full bg-[#201F3C] rounded-full h-4">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-blue-400 h-4 rounded-full transition-width duration-500 ease-out"
                        style={{ width: `${result.confidence_score}%` }}
                    ></div>
                </div>
                <p className="text-center font-semibold">Fact Confidence Meter</p>
            </div>
            
            {sources.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-white font-semibold">Supporting Evidence/Sources</h2>
                    <div className="space-y-3">
                    {sources.map((source, index) => source.web && (
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center justify-between bg-[#2D2A5C] text-white p-4 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-100">
                           <span className="truncate pr-4 text-sm">{source.web.title}</span>
                           <LinkIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />
                        </a>
                    ))}
                    </div>
                </div>
            )}
        </main>
        
        <footer className="pt-4">
            <button
                onClick={onReset}
                className="w-full bg-[#FFC947] text-[#2D2A5C] font-bold text-lg py-4 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
            >
                Start New Check
            </button>
        </footer>
    </div>
)};

const LoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-[#201F3C]/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white space-y-4 p-4 text-center">
        <svg className="animate-spin h-12 w-12 text-[#FFC947]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-bold text-[#FFC947]">Verifying Claim...</h2>
        <p className="text-base text-gray-300">Our AI Analyst is on the case.</p>
    </div>
);


function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [claim, setClaim] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);

  const handleFactCheck = useCallback(async () => {
    if (!claim.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const { result: apiResult, sources: apiSources } = await factCheckWithGemini(claim);
      setResult(apiResult);
      setSources(apiSources);
      setScreen('report');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      // Keep user on input screen if there's an error
    } finally {
      setIsLoading(false);
    }
  }, [claim]);

  const handleReset = useCallback(() => {
    setScreen('input');
    // We don't reset claim to allow user to edit it if they wish
    setResult(null);
    setSources([]);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#201F3C] text-white font-sans md:flex md:items-center md:justify-center md:p-4">
        <div className="relative mx-auto max-w-md w-full h-screen bg-[#201F3C] flex flex-col overflow-hidden md:max-w-lg md:h-auto md:max-h-[95vh] md:rounded-[50px] md:shadow-2xl">
            {isLoading && <LoadingOverlay />}
            {error && (
                <div className="absolute top-5 left-5 right-5 bg-red-500 text-white p-3 rounded-2xl z-20 text-sm shadow-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            <div className={`transition-transform duration-500 ease-in-out w-full flex-shrink-0 h-full ${screen === 'input' ? 'translate-x-0' : '-translate-x-full'}`}>
                <InputScreen claim={claim} setClaim={setClaim} onFactCheck={handleFactCheck} />
            </div>

            <div className={`absolute top-0 left-0 transition-transform duration-500 ease-in-out w-full h-full ${screen === 'report' ? 'translate-x-0' : 'translate-x-full'}`}>
                 {result && <ReportScreen claim={claim} result={result} sources={sources} onReset={handleReset} />}
            </div>
        </div>
    </div>
  );
}

export default App;
