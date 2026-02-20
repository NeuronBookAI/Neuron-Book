/**
 * Neural Trace Graph component for NeuronBook
 * Placeholder container for neural network visualization
 *
 * This component is intentionally simple to make backend integration easy later.
 * When backend is ready, replace the placeholder content with actual graph implementation.
 *
 * Data source: Currently uses empty mock data from src/data/mock.ts
 * To replace with real data: Pass real neural trace data from your knowledge graph API
 *
 * Usage: <NeuralTraceGraph nodes={mockNeuralNodes} edges={mockNeuralEdges} />
 */

import { NeuralNode, NeuralEdge } from "../../src/types/dashboard";

interface NeuralTraceGraphProps {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
}

export function NeuralTraceGraph({ nodes, edges }: NeuralTraceGraphProps) {
  // If no data, show placeholder
  if (!nodes || nodes.length === 0) {
    return (
      <div className="w-full h-96 bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-white font-semibold">Neural Network</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            Neural trace visualization will be implemented here when backend is
            connected
          </p>
          <div className="text-xs text-gray-500">
            <p>Backend integration points:</p>
            <p>• API endpoint: /api/neural-graph</p>
            <p>• Data format: nodes[] and edges[]</p>
          </div>
        </div>
      </div>
    );
  }

  // Future implementation will go here
  return (
    <div className="w-full h-96 bg-black/20 rounded-2xl border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white">Graph implementation coming soon...</p>
      </div>
    </div>
  );
}
