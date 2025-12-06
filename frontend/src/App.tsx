// App.tsx
import React, { useState } from 'react';
import { TestSample, SignalData } from './types';
import ResultDisplay from './components/ResultDisplay';
import TestSamples from './components/TestSamples';
import UploadECG from './components/UploadECG';
import AboutModal from './components/AboutModal';

// Response type from your backend for uploaded ECG
interface UploadResponse {
  predicted_class: string;
  confidence: number;
  is_uncertain: boolean;
  Normal: number;
  Supraventricular: number;
  Ventricular: number;
  Fusion: number;
  Unknown: number;
  signal_for_plot: number[];
  signal_normalized: number[];
  threshold: number;
}

// Union of result types
type ResultType = TestSample | UploadResponse;

const App: React.FC = () => {
  const [result, setResult] = useState<ResultType | null>(null);

  // Make sure this matches your `SignalData` definition in ./types
  const [signal, setSignal] = useState<SignalData>({
    raw: [],
    normalized: [],
  });

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Type guard to distinguish TestSample from UploadResponse
  const isTestSample = (data: ResultType): data is TestSample => {
    return 'true_label' in data && 'is_correct' in data;
  };

  const handleBack = () => {
    setResult(null);
    setSignal({ raw: [], normalized: [] });
  };

  const hasSignal = signal.raw.length > 0 || signal.normalized.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo from public/logo.png */}
            <img
              src="/logo.png"
              alt="ECG AI"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                ECG Arrhythmia Classifier
              </h1>
              <p className="text-sm text-gray-600">
                AI-powered heart rhythm analysis with MIT-BIH dataset
              </p>
            </div>
          </div>

          {/* Right side button: About / Back */}
          {result ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition whitespace-nowrap ml-4"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition whitespace-nowrap ml-4"
            >
              About Project
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* If no result yet: show upload + test sample sections */}
        {!result ? (
          <div className="space-y-6">
            {/* UPLOAD */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <UploadECG
                onResult={(uploadedResult, uploadedSignal) => {
                  // `uploadedResult` is typed as TestSample (from UploadECG props),
                  // but we know it can also be an UploadResponse, so cast to ResultType.
                  setResult(uploadedResult as ResultType);
                  setSignal(uploadedSignal);
                }}
              />
            </div>

            {/* MIT-BIH TEST */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                MIT-BIH Test Data
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Click button to load random ECG sample from MIT-BIH Arrhythmia
                Database
              </p>
              <TestSamples
                onSelect={(sample: TestSample, sig: SignalData) => {
                  setResult(sample);
                  setSignal(sig);
                }}
              />
            </div>
          </div>
        ) : (
          // If result exists: show the result screen
          <div className="bg-white rounded-xl shadow-lg p-8">
            {hasSignal && (
              <>
                {isTestSample(result) ? (
                  <ResultDisplay result={result} signal={signal} />
                ) : (
                  // if it's UploadResponse
                  <ResultDisplay result={result as UploadResponse} signal={signal} />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
};

export default App;
