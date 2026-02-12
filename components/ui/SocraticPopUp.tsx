'use client';
import { useState } from 'react';

export default function SocraticPopUp() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("Why was it important to highlight the text?");

  const handleConfidence = async (level: string) => {
    // Send data to Terminal 2 (Flask)
    const res = await fetch('http://127.0.0.1:5328/api/socratic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: "page_1", // This triggers fetch_page_node
        user_answer: answer, // This goes to commit_to_sanity_node
        user_confidence: level
      })
    });
    const data = await res.json();
    if (data.question) setQuestion(data.question);
    setAnswer(""); 
  };

  return (
    <div className="p-6 bg-[#1a1c1e] text-white rounded-xl w-80 border border-gray-700 shadow-2xl">
      <h3 className="text-blue-400 font-bold mb-2">Socratic Question</h3>
      <p className="text-sm mb-4 leading-relaxed">{question}</p>
      
      <textarea 
        className="w-full h-24 p-3 bg-[#2c2e33] rounded-lg text-sm border border-gray-600 focus:border-blue-500 outline-none mb-4"
        placeholder="Because... lorem ipsum..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <p className="text-center text-xs text-gray-400 mb-3">Confidence Check</p>
      <div className="flex flex-col gap-2">
        <button onClick={() => handleConfidence('instantly')} className="bg-[#2d5a27] hover:bg-[#3a7232] py-2 rounded-md text-xs">Got it instantly</button>
        <button onClick={() => handleConfidence('thought')} className="bg-[#856404] hover:bg-[#a67c05] py-2 rounded-md text-xs">Took some thought</button>
        <button onClick={() => handleConfidence('review')} className="bg-[#721c24] hover:bg-[#92242e] py-2 rounded-md text-xs">Review This</button>
        <button onClick={() => handleConfidence('submit')} className="bg-[#0069d9] hover:bg-[#0056b3] py-2 rounded-md text-xs font-bold mt-2">Submit Answer</button>
      </div>
    </div>
  );
}