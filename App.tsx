import React, { useState, useCallback } from 'react';
import { performFactCheck } from './services/geminiService';
import type { VerificationResult, GroundingChunk, Verdict } from './types';
import { BackArrowIcon, NewspaperIcon, BeakerIcon, HeartIcon, LinkIcon } from './components/Icons';

type Screen = 'input' | 'report';

const exampleScenarios = [
    { id: 'political', icon: NewspaperIcon, text: 'Political Headline', claim: 'A new study shows that the recent tax cuts for corporations led to a 50% increase in job creation nationwide.' },
    { id: 'scientific', icon: BeakerIcon, text: 'Scientific Study', claim: 'Researchers have discovered that drinking coffee can reverse the effects of aging at a cellular level.' },
    { id: 'health', icon: HeartIcon, text: 'Health/Medical', claim: 'Eating a tablespoon of apple cider vinegar every day is a proven method for losing 20 pounds in a month.' },
];

const verdictStyles: Record<string, { bg: string, text: string, border: string, progress: string }> = {
    'TRUE': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', progress: 'bg-green-500' },
    'FALSE': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', progress: 'bg-red-500' },
    'MISLEADING': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', progress: 'bg-yellow-500' },
    'UNSUPPORTED': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500', progress: 'bg-gray-500' },
};

const getVerdictStyle = (verdict: Verdict) => {
    const key = verdict.toUpperCase().trim();
    return verdictStyles[key] || verdictStyles['UNSUPPORTED'];
};


// --- Sub-components defined outside App to prevent re-renders ---

interface InputScreenProps {
    claim: string;
    setClaim: (claim: string) => void;
    onFactCheck: () => void;
    disabled: boolean;
}
const InputScreen: React.FC<InputScreenProps> = ({ claim, setClaim, onFactCheck, disabled }) => (
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
                disabled={!claim.trim() || disabled}
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

        <main className="flex-grow flex flex-col space-y-6 overflow-y-auto pb-6">
            <div className="bg-[#2D2A5C] p-6 rounded-[40px] shadow-lg space-y-4 text-white">
                 <p className="font-medium italic">"{claim}"</p>
            </div>
            
            <div className={`${verdictStyle.bg} ${verdictStyle.text} p-6 rounded-[40px] shadow-lg space-y-4`}>
                <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold">
                       <span>Verdict</span>
                       <span>Confidence</span>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className={`px-4 py-1 rounded-full font-bold text-lg border-2 ${verdictStyle.border}`}>
                            {result.verdict.toUpperCase()}
                        </div>
                        <div className="w-full bg-gray-300/50 rounded-full h-2.5">
                            <div className={`${verdictStyle.progress} h-2.5 rounded-full`} style={{ width: `${result.confidence_score}%` }}></div>
                        </div>
                        <span className="font-bold w-12 text-right">{result.confidence_score}%</span>
                    </div>
                </div>
                <div className="border-t border-gray-400/30 pt-4">
                    <h2 className="text-lg font-bold">Summary</h2>
                    <p>{result.summary_explanation}</p>
                </div>
            </div>

            {sources && sources.length > 0 && (
                <div className="bg-[#2D2A5C] p-6 rounded-[40px] shadow-lg text-white space-y-4">
                    <h2 className="text-lg font-bold">Sources</h2>
                    <ul className="space-y-3">
                        {sources.map((source, index) => source.web && (
                            <li key={index} className="flex items-center space-x-3 bg-[#201F3C] p-3 rounded-lg">
                                <LinkIcon className="w-5 h-5 text-[#FFC947] flex-shrink-0" />
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="truncate hover:underline" title={source.web.title}>
                                    {source.web.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </main>
    </div>
    );
};

const loadingMessages = [
    'Engaging neural networks...',
    'Consulting knowledge graphs...',
    'Synthesizing information...',
    'Compiling verification report...',
];

const LoadingScreen: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-white p-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#FFC947]"></div>
            <h2 className="text-2xl font-bold mt-6">Verifying...</h2>
            <p className="text-lg mt-2 text-gray-300 transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
        </div>
    )
};


const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>('input');
    const [claim, setClaim] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [sources, setSources] = useState<GroundingChunk[]>([]);

    const handleFactCheck = useCallback(async () => {
        if (!claim.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const { result: apiResult, sources: apiSources } = await performFactCheck(claim);
            setResult(apiResult);
            setSources(apiSources);
            setScreen('report');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [claim]);

    const handleReset = () => {
        setScreen('input');
        setResult(null);
        setSources([]);
        setError(null);
        setIsLoading(false);
    };

    const renderContent = () => {
        if (isLoading) {
            return <LoadingScreen />;
        }
    
        if (screen === 'report' && result) {
            return <ReportScreen claim={claim} result={result} sources={sources} onReset={handleReset} />;
        }
        
        return (
            <div className="relative h-full">
                <InputScreen claim={claim} setClaim={setClaim} onFactCheck={handleFactCheck} disabled={isLoading} />
                 {error && (
                    <div className="absolute bottom-6 left-6 right-6 bg-red-500 text-white p-3 rounded-lg text-center shadow-lg flex justify-between items-center">
                        <span><strong>Error:</strong> {error}</span>
                        <button onClick={() => setError(null)} className="font-bold text-xl px-2 leading-none">&times;</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-lg mx-auto h-full min-h-screen md:h-auto md:min-h-0 md:max-h-[90vh] md:my-8 bg-[#201F3C] text-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex-grow">
              {renderContent()}
            </div>
        </div>
    );
};

export default App;