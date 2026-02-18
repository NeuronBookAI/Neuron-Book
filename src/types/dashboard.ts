/**
 * Dashboard type definitions for NeuronBook
 * These types define the structure of mock data used throughout the dashboard
 * Later, these can be replaced with API responses from the backend
 */

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export interface DecayItem {
  id: string;
  topic: string;
  decayPercent: number;
  lastStudied: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NeuralNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: 'teal' | 'purple' | 'grey';
  size: 'small' | 'medium' | 'large';
}

export interface NeuralEdge {
  from: string;
  to: string;
  strength: number;
}

export interface Session {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  action?: "upload";
  isActive?: boolean;
}
