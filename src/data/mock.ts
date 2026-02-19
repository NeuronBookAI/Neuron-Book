/**
 * Mock data for NeuronBook dashboard
 * This file contains all the demo data used in the frontend
 * Later, replace these with actual API calls to the backend
 */

import { StatCard, DecayItem, NeuralNode, NeuralEdge, Session, SidebarItem } from '../types/dashboard';

export const mockStats: StatCard[] = [
  /*mock labels*/
  {
    label: 'Active Neurons',
    value: '127',
    icon: 'Brain',
  },
  {
    label: 'Daily Reading Streak',
    value: '1 days',
    icon: 'Flame',
  },
  {
    label: 'Mastery Level',
    value: 'Level 8',
    icon: 'Trophy',
  }
];
/*content material to add here whenever*/
export const mockDecayItems: DecayItem[] = [
  {
    id: '1',
    topic: 'Alegbra I',
    decayPercent: 78,
    lastStudied: '3 days ago',
    priority: 'high'
  },
  {
    id: '2',
    topic: 'Geometry',
    decayPercent: 45, /*decay percentage meter implemented, delete if its ugly*/
    lastStudied: '1 week ago',
    priority: 'medium'
  }
];

export const mockNeuralNodes: NeuralNode[] = [
  // Empty placeholder - will be populated by backend API later
];

export const mockNeuralEdges: NeuralEdge[] = [
  // Empty placeholder - will be populated by backend API later
];

export const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Alegbra I (insert placehlder image later)',
    thumbnail: '/api/placeholder/300/400', //replace with image after
    progress: 75,
  },
  {
    id: '2',
    title: 'Geometry',
    thumbnail: '/api/placeholder/300/400',
    progress: 40,
  },
  {
    id: '3',
    title: 'Stacks and Queues',
    thumbnail: '/api/placeholder/300/400',
    progress: 90,
  }
];

export const mockSidebarItems: SidebarItem[] = [
  { id: '1', label: 'Dashboard', icon: 'Home', route: '/dashboard', isActive: true },
  { id: '2', label: 'Add Content', icon: 'Plus', route: '/library', action: 'upload' },
  { id: '3', label: 'Library', icon: 'BookOpen', route: '/library' },
  { id: '4', label: 'Reader', icon: 'BookMarked', route: '/reader' },
  { id: '5', label: 'Network', icon: 'Network', route: '/network' },
];
