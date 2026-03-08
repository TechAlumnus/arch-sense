export enum ComponentType {
  LOAD_BALANCER = 'LOAD_BALANCER',
  L4_LOAD_BALANCER = 'L4_LOAD_BALANCER',
  L7_LOAD_BALANCER = 'L7_LOAD_BALANCER',
  API_GATEWAY = 'API_GATEWAY',
  MICROSERVICE = 'MICROSERVICE',
  DATABASE = 'DATABASE',
  CACHE = 'CACHE',
  MESSAGE_QUEUE = 'MESSAGE_QUEUE',
  CDN = 'CDN',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  COMMENT = 'COMMENT',
}

export interface SystemNode {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  label: string;
  properties: Record<string, any>;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface SimulationState {
  phase: 'PROBLEM_STATEMENT' | 'DESIGN' | 'STRESS' | 'EVALUATION';
  scenario: string;
  stressEvents: StressEvent[];
  currentStressIndex: number;
}

export interface StressEvent {
  id: string;
  title: string;
  description: string;
  impact: string;
  triggered: boolean;
}

export interface Message {
  id: string;
  role: 'architect' | 'user';
  content: string;
  timestamp: number;
}

export interface Evaluation {
  scalability: number;
  reliability: number;
  clarity: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}
