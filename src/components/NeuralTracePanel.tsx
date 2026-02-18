/**
 * Neural Trace Panel component for NeuronBook
 * Container for neural network visualization with header and stats
 * 
 * This component wraps the NeuralTraceGraph and provides a clean container.
 * When backend is ready, you can add real statistics and controls here.
 * 
 * Data source: Currently uses empty mock data from src/data/mock.ts
 * To replace with real data: Pass real neural trace data from your knowledge graph API
 * 
 * Usage: <NeuralTracePanel nodes={mockNeuralNodes} edges={mockNeuralEdges} />
 */

import { Card } from '../../components/ui/card';
import { Network } from 'lucide-react';
import { NeuralTraceGraph } from './NeuralTraceGraph';
import { NeuralNode, NeuralEdge } from '../../src/types/dashboard';

interface NeuralTracePanelProps {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
}

export function NeuralTracePanel({ nodes, edges }: NeuralTracePanelProps) {
  return (
    <Card className="glass-panel border-0 p-6 h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-white">Neural Trace at a Glance</h3>
          </div>
        </div>

        {/* Graph Container */}
        <NeuralTraceGraph nodes={nodes} edges={edges} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-400">{nodes.length}</p>
            <p className="text-xs text-gray-400">Concepts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-400">{edges.length}</p>
            <p className="text-xs text-gray-400">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">87%</p>
            <p className="text-xs text-gray-400">Mastery</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
