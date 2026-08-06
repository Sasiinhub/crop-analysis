import React from 'react';
import { AnalysisResult } from '../types';
import { Sparkles, TrendingUp, CheckCircle, BrainCircuit } from 'lucide-react';

interface AiInsightsProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  onAnalyze: () => void;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ analysis, loading, onAnalyze }) => {
  if (!analysis && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white text-center shadow-lg">
        <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-indigo-200" />
        <h3 className="text-2xl font-bold mb-2">Unlock AI Insights</h3>
        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">
          Use Gemini AI to analyze your crop data, find hidden patterns, and generate an actionable enhancement strategy.
        </p>
        <button
          onClick={onAnalyze}
          className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Generate ML Analysis
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-slate-800">Analyzing Data...</h3>
        <p className="text-slate-500">Gemini is running predictive models on your crop metrics.</p>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Executive Summary</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">
            {analysis.summary}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Strategic Recommendations</h3>
            </div>
            <ul className="space-y-4">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-500 font-medium mb-2 uppercase tracking-wide text-sm">Efficiency Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * analysis.profitabilityScore) / 100}
                  className={`transition-all duration-1000 ease-out ${
                    analysis.profitabilityScore > 75 ? 'text-emerald-500' : 
                    analysis.profitabilityScore > 50 ? 'text-amber-500' : 'text-red-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-slate-800">{analysis.profitabilityScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <p className="mt-4 text-slate-600 px-4">
              Calculated based on yield-to-cost ratios and market potential.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
