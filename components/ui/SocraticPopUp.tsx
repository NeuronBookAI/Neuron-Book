'use client';
import { useState, useEffect } from 'react';

export default function SocraticPopUp() {
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<string>(""); // Selected confidence
  const [question, setQuestion] = useState("Loading question...");
  const [pdfContext, setPdfContext] = useState<string[]>([]);
  const [showContext, setShowContext] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [currentPage] = useState(15);
  const [pdfId] = useState("c3ad59b5-2dc2-41a8-9418-16c439b35758");
  const [selectedText] = useState("the pumping lemma is used to prove that certain languages are not regular");

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5328/api/question/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId: pdfId,
          pageNumber: currentPage,
          selectedText: selectedText
        })
      });
      
      const data = await res.json();
      
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
      // Map confidence to difficulty for the API
      const difficultyMap: Record<string, string> = {
        'instantly': 'easy',
        'thought': 'medium',
        'review': 'hard'
      };

      const res = await fetch('http://127.0.0.1:5328/api/answer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId: pdfId,
          pageNumber: currentPage,
          selectedText: selectedText,
          question: question,
          answer: answer,
          difficulty: difficultyMap[confidence] || 'medium'
        })
      });
      
      const data = await res.json();
      console.log('Submit response:', data);
      
      if (res.ok) {
        // Show success feedback
        alert(data.evaluation || 'Answer submitted successfully!');
        
        // Clear form and load next question
        setAnswer("");
        setConfidence("");
        await loadQuestion();
      } else {
        alert(`Failed to submit: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 p-6 bg-[#1a1c1e] text-white rounded-xl w-96 border border-gray-700 shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">Socratic Question</h3>
        {pdfContext.length > 0 && (
          <button
            onClick={() => setShowContext(!showContext)}
            className="text-xs text-gray-400 hover:text-blue-400"
          >
            {showContext ? 'Hide' : 'Show'} Context
          </button>
        )}
      </div>
      
      {showContext && pdfContext.length > 0 && (
        <div className="mb-4 p-3 bg-[#2c2e33] rounded-lg text-xs max-h-32 overflow-y-auto">
          <p className="text-gray-400 mb-2 font-semibold">Related pages:</p>
          {pdfContext.map((ctx, i) => (
            <div key={i} className="mb-2 text-gray-300 text-xs">
              {ctx}
            </div>
          ))}
        </div>
      )}
      
      <div className="mb-4 p-4 bg-[#2c2e33] rounded-lg">
        <p className="text-sm leading-relaxed">
          {loading ? "Loading..." : question}
        </p>
      </div>
      
      <textarea 
        className="w-full h-24 p-3 bg-[#2c2e33] rounded-lg text-sm border border-gray-600 focus:border-blue-500 outline-none mb-4"
        placeholder="Because..... lorem ipsum..."
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
        {loading ? 'Submitting...' : 'Submit Answer'}
      </button>
    </div>
  );
}