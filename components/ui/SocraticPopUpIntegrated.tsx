'use client';
import { useState, useEffect } from 'react';

interface ReaderEvent {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
}

interface SocraticPopUpIntegratedProps {
  event: ReaderEvent;
  onClose: () => void;
  onAnswerSubmitted?: () => void;
}

export default function SocraticPopUpIntegrated({
  event,
  onClose,
  onAnswerSubmitted
}: SocraticPopUpIntegratedProps) {
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<string>("");
  const [question, setQuestion] = useState("Loading question...");
  const [pdfContext, setPdfContext] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [event]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/question/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId: event.pdfId,
          pageNumber: event.pageNumber,
          selectedText: event.selectedText || ""
        })
      });
      
      const data = await res.json();
      console.log('Question response:', data);
      
      if (data.question) {
        setQuestion(data.question);
      }
      
      if (data.pdfContext && data.embeddingsUsed) {
        const contextLines = data.pdfContext.split('\n---\n');
        setPdfContext(contextLines);
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      setQuestion("Error loading question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert("Please write an answer before submitting!");
      return;
    }

    if (!confidence) {
      alert("Please select a confidence level!");
      return;
    }

    setLoading(true);
    
    try {
      const confidenceMap: Record<string, number> = {
        'instantly': 5,
        'thought': 3,
        'review': 1
      };

      const res = await fetch('/api/answer/save-to-sanity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId: event.pdfId,
          pageNumber: event.pageNumber,
          selectedText: event.selectedText,
          question: question,
          answer: answer,
          confidenceScore: confidenceMap[confidence],
          pdfContext: pdfContext.join('\n---\n')
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('Answer saved successfully to Sanity!');
        setAnswer("");
        setConfidence("");
        onAnswerSubmitted?.();
      } else {
        alert(`Save failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#1a1c1e] text-white min-h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">Socratic Question</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        Page {event.pageNumber}
        {event.selectedText && (
          <span className="block mt-1 text-gray-400">
            "{event.selectedText.slice(0, 60)}..."
          </span>
        )}
      </p>
      
      <div className="mb-4 p-4 bg-[#2c2e33] rounded-lg">
        <p className="text-sm leading-relaxed">
          {loading ? "Loading question..." : question}
        </p>
      </div>
      
      <textarea 
        className="w-full h-24 p-3 bg-[#2c2e33] rounded-lg text-sm border border-gray-600 focus:border-blue-500 outline-none mb-4 text-white placeholder-gray-400"
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={loading}
      />

      <p className="text-center text-sm font-semibold mb-3">Confidence Check</p>
      
      <div className="flex flex-col gap-2 mb-4">
        <button 
          onClick={() => setConfidence('instantly')}
          className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
            confidence === 'instantly' 
              ? 'bg-teal-600 ring-2 ring-teal-400' 
              : 'bg-teal-700 hover:bg-teal-600'
          }`}
          disabled={loading}
        >
          Got it instantly
        </button>
        
        <button 
          onClick={() => setConfidence('thought')}
          className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
            confidence === 'thought' 
              ? 'bg-yellow-600 ring-2 ring-yellow-400' 
              : 'bg-yellow-700 hover:bg-yellow-600'
          }`}
          disabled={loading}
        >
          Took some thought
        </button>
        
        <button 
          onClick={() => setConfidence('review')}
          className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
            confidence === 'review' 
              ? 'bg-red-600 ring-2 ring-red-400' 
              : 'bg-red-700 hover:bg-red-600'
          }`}
          disabled={loading}
        >
          Review This
        </button>
      </div>

      <button 
        onClick={handleSubmit}
        className="w-full bg-teal-600 hover:bg-teal-700 py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={loading || !answer.trim() || !confidence}
      >
        {loading ? 'Saving...' : 'Submit Answer'}
      </button>
    </div>
  );
}