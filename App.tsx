import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { VerificationResult, GroundingChunk, Verdict } from './types';
import { 
    BackArrowIcon, LinkIcon, CheckCircleIcon, XCircleIcon, 
    ExclamationTriangleIcon, QuestionMarkCircleIcon, GlobeAltIcon, 
    CpuChipIcon, SparklesIcon, FactzillaIcon 
} from './components/Icons';

type Screen = 'input' | 'report';

const exampleScenarios = [
    { id: 'space', icon: GlobeAltIcon, text: 'Space Fact', claim: 'Is the Great Wall of China visible from space with the naked eye?' },
    { id: 'biology', icon: CpuChipIcon, text: 'Biology Myth', claim: 'Humans only use 10% of their brains.' },
    { id: 'animal', icon: SparklesIcon, text: 'Animal Myth', claim: 'Goldfish have a three-second memory.' },
];

const verdictStyles: Record<string, { bg: string, text: string, border: string, progress: string, icon: React.FC<{className?: string}> }> = {
    'TRUE': { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-500', progress: 'bg-green-500', icon: CheckCircleIcon },
    'FALSE': { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-500', progress: 'bg-red-500', icon: XCircleIcon },
    'MISLEADING': { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-500', progress: 'bg-orange-500', icon: ExclamationTriangleIcon },
    'UNSUPPORTED': { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-500', progress: 'bg-slate-500', icon: QuestionMarkCircleIcon },
};

const getVerdictStyle = (verdict: Verdict) => {
    const key = verdict.toUpperCase().trim();
    return verdictStyles[key] || verdictStyles['UNSUPPORTED'];
};

// --- Gemini AI Configuration ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const systemInstruction = `You are a meticulous fact-checking AI. Your purpose is to analyze a given claim, use the provided Google Search results to determine its veracity, and return a structured JSON response.

The JSON object you return must have the following structure and nothing else:
{
  "verdict": "string",
  "confidence_score": number,
  "summary_explanation": "string"
}

- "verdict": Must be one of the following strings: 'TRUE', 'FALSE', 'MISLEADING', 'UNSUPPORTED'.
- "confidence_score": Must be an integer between 0 and 100, representing your confidence in the verdict.
- "summary_explanation": A concise, neutral explanation for your verdict based on the search results.

Analyze the user's claim and provide your response ONLY in the specified JSON format. Do not include any other text, markdown, or explanations outside of the JSON object.

For example, for the claim "The sky is green", your response should be a single JSON object like this:
{
  "verdict": "FALSE",
  "confidence_score": 100,
  "summary_explanation": "Scientific evidence and common observation confirm that the Earth's sky appears blue during the day due to Rayleigh scattering of sunlight in the atmosphere. It is not green."
}`;


// --- Sub-components ---

interface InputScreenProps {
    claim: string;
    setClaim: (claim: string) => void;
    onFactCheck: () => void;
    disabled: boolean;
}
const InputScreen: React.FC<InputScreenProps> = ({ claim, setClaim, onFactCheck, disabled }) => (
    <div className="flex flex-col flex-grow p-6 md:p-8 space-y-6">
        <header className="text-center flex flex-col items-center space-y-2">
            <FactzillaIcon className="w-16 h-16 text-purple-400" />
            <h1 className="text-5xl font-bold text-yellow-400 tracking-tighter" style={{fontFamily: "'Bangers', cursive"}}>Factzilla</h1>
            <p className="text-purple-300 font-medium">Your Friendly Neighborhood Fact Monster</p>
        </header>

        <main className="flex-grow flex flex-col justify-center space-y-6">
            <div className="bg-purple-900/70 p-6 rounded-2xl shadow-lg ring-1 ring-yellow-400/20">
                <label htmlFor="claim-input" className="text-purple-300 font-medium text-sm">Enter a claim for Factzilla to stomp</label>
                <textarea
                    id="claim-input"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., The moon is made of cheese..."
                    className="w-full h-32 bg-transparent text-slate-100 text-lg mt-2 resize-none focus:outline-none placeholder:text-purple-400/50"
                    aria-label="Claim input"
                />
            </div>
             <button
                onClick={onFactCheck}
                disabled={!claim.trim() || disabled}
                className="w-full bg-yellow-400 text-purple-950 font-bold text-lg py-4 rounded-full shadow-lg transition-all duration-200 hover:bg-yellow-300 active:scale-95 disabled:bg-purple-800 disabled:text-purple-400 disabled:cursor-not-allowed"
            >
                Verify Claim
            </button>
        </main>

        <footer className="space-y-4">
            <h2 className="text-slate-100 font-semibold text-center">Or try a sample claim</h2>
            <div className="grid grid-cols-3 gap-4">
                {exampleScenarios.map(scenario => (
                    <button 
                        key={scenario.id} 
                        onClick={() => setClaim(scenario.claim)} 
                        className="flex flex-col items-center justify-center space-y-2 text-slate-200 bg-purple-900/70 hover:bg-purple-800/80 rounded-xl p-3 text-center text-xs font-medium transition-all duration-200 active:scale-95 ring-1 ring-white/10 h-28"
                    >
                        <scenario.icon className="w-8 h-8 text-yellow-400"/>
                        <span className="leading-tight">{scenario.text}</span>
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
    const VerdictIcon = verdictStyle.icon;

    return (
    <div className="flex flex-col flex-grow p-4 md:p-6 space-y-4 min-h-0">
        <header className="flex items-center text-slate-100">
            <button onClick={onReset} className="p-2 -ml-2 transition-transform duration-200 active:scale-95" aria-label="Go back">
                <BackArrowIcon className="w-7 h-7" />
            </button>
            <h1 className="text-xl font-bold text-center flex-grow">Factzilla's Report</h1>
            <div className="w-7"></div>
        </header>

        <main className="flex-grow flex flex-col space-y-4 overflow-y-auto pb-4 px-2 min-h-0">
            <div className="bg-purple-900 p-4 rounded-xl shadow-lg space-y-4 text-slate-100 ring-1 ring-white/10">
                 <p className="font-medium italic">"{claim}"</p>
            </div>
            
            <div className={`${verdictStyle.bg} p-5 rounded-xl shadow-lg space-y-4 text-slate-100 ring-1 ${verdictStyle.border}`}>
                <div className="flex items-center space-x-3">
                    <VerdictIcon className={`w-10 h-10 flex-shrink-0 ${verdictStyle.text}`} />
                    <div>
                        <span className="text-slate-300 font-medium">Verdict</span>
                        <p className={`font-bold text-2xl ${verdictStyle.text}`}>{result.verdict.toUpperCase()}</p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center font-bold text-slate-300 mb-1">
                       <span className="text-sm">Confidence Score</span>
                       <span className={`text-sm ${verdictStyle.text}`}>{result.confidence_score}%</span>
                    </div>
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div className={`${verdictStyle.progress} h-2 rounded-full`} style={{ width: `${result.confidence_score}%` }}></div>
                    </div>
                </div>

                <div className="border-t border-slate-500/30 pt-4">
                    <h2 className="text-lg font-bold text-slate-100">Summary</h2>
                    <p className="text-slate-200">{result.summary_explanation}</p>
                </div>
            </div>

            {sources && sources.length > 0 && (
                <div className="bg-purple-900 p-5 rounded-xl shadow-lg text-slate-100 space-y-3 ring-1 ring-white/10">
                    <h2 className="text-lg font-bold text-yellow-400">Factzilla's Trail ({sources.length} {sources.length === 1 ? 'source' : 'sources'} found)</h2>
                    <p className="text-sm text-purple-300 pb-2">These are the web pages used to verify the claim.</p>
                    <ul className="space-y-2">
                        {sources.map((source, index) => source.web && (
                            <li key={index}>
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-start space-x-3 bg-purple-800/50 hover:bg-purple-800 p-3 rounded-lg ring-1 ring-white/5 transition-all duration-200"
                                >
                                    <LinkIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-slate-200 hover:underline text-sm font-medium" title={source.web.title}>
                                            {source.web.title}
                                        </p>
                                        <p className="text-xs text-purple-400 truncate">{source.web.uri}</p>
                                    </div>
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
    'Waking the monster...',
    'Stomping through the web...',
    'Sniffing out the facts...',
    'Delivering the verdict...',
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
        <div className="flex flex-col items-center justify-center h-full text-slate-100 p-8 text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-400"></div>
            <h2 className="text-2xl font-bold mt-6">Verifying...</h2>
            <p className="text-lg mt-2 text-purple-300 transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
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
        if (!process.env.API_KEY) {
            setError("API_KEY is not configured. Please set it up in your environment.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);
        
        try {
             const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: claim,
                config: {
                    systemInstruction: systemInstruction,
                    tools: [{googleSearch: {}}],
                },
            });

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            const apiSources = groundingMetadata?.groundingChunks ?? [];
            
            // Clean the raw text response to ensure it's a valid JSON string
            const resultText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();

            if (!resultText) {
                throw new Error("The API returned an empty response. The claim might be un-verifiable.");
            }

            const apiResult = JSON.parse(resultText);

            // Basic validation of the parsed response
            if (!apiResult.verdict || apiResult.confidence_score === undefined || !apiResult.summary_explanation) {
                 throw new Error("The API response was missing required fields.");
            }

            setResult(apiResult);
            setSources(apiSources);
            setScreen('report');
        } catch (err: any) {
            console.error("Error during Gemini API call:", err);
            let errorMessage = 'An unexpected error occurred while contacting the Gemini API.';
            if (err instanceof SyntaxError) {
                errorMessage = "Failed to parse the API response. The model may have returned an invalid format.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setScreen('input'); // Stay on input screen if there's an error
        } finally {
            setIsLoading(false);
        }
    }, [claim]);

    const handleReset = () => {
        setScreen('input');
        // Do not clear the claim so user can edit it if they want
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
        
        // Default to input screen
        return (
             <InputScreen 
                claim={claim} 
                setClaim={setClaim} 
                onFactCheck={handleFactCheck} 
                disabled={isLoading}
            />
        );
    };

    return (
        <div className="w-full max-w-lg mx-auto h-screen md:h-auto md:min-h-0 md:max-h-[95vh] md:my-4 bg-purple-950 text-slate-100 rounded-lg shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
            <div className="flex-grow min-h-0 flex flex-col relative">
              {renderContent()}
              {error && !isLoading && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg flex justify-between items-center animate-pulse">
                        <span className="text-sm"><strong>Error:</strong> {error}</span>
                        <button onClick={() => setError(null)} className="font-bold text-xl px-2 leading-none" aria-label="Dismiss error">&times;</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
