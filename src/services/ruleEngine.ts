import { SystemNode, SystemEdge } from '../types';

export interface Signal {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export function evaluateGraph(nodes: SystemNode[], edges: SystemEdge[]): Signal[] {
  const signals: Signal[] = [];

  // Rule 1: Detect missing cache for high-traffic nodes
  const hasHighTraffic = nodes.some(n => n.type === 'API_GATEWAY' || n.type === 'LOAD_BALANCER');
  const hasCache = nodes.some(n => n.type === 'CACHE');
  
  if (hasHighTraffic && !hasCache) {
    signals.push({ 
      id: 'MISSING_CACHE', 
      severity: 'high', 
      message: 'High-traffic entry points detected without a caching layer.' 
    });
  }

  // Rule 2: Detect single points of failure
  // Simple check: if there's only one microservice or database
  const microservices = nodes.filter(n => n.type === 'MICROSERVICE');
  if (microservices.length === 1) {
    signals.push({ 
      id: 'SPOF', 
      severity: 'high', 
      message: 'Single microservice detected. This is a single point of failure.' 
    });
  }

  return signals;
}
