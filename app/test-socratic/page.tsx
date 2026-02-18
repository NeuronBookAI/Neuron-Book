'use client';
import SocraticPopUp from '@/components/ui/SocraticPopUp';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-8">Neuron Book Test Environment</h1>
        <p className="text-gray-400 mb-4">The Socratic Tutor should appear on the right/bottom.</p>
      </div>
      <SocraticPopUp />
    </main>
  );
}