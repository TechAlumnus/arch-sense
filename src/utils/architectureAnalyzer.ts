import { SystemNode, SystemEdge, ComponentType } from '../types';

export type DesignSignal = 
  | 'HAS_MESSAGE_QUEUE'
  | 'DIRECT_EXTERNAL_CALL'
  | 'ASYNC_PROCESSING'
  | 'SPOF_DATABASE'
  | 'NO_LOAD_BALANCER';

export function analyzeArchitecture(nodes: SystemNode[], edges: SystemEdge[]): DesignSignal[] {
  const signals = new Set<DesignSignal>();

  // 1. Check for Message Queue
  const hasQueue = nodes.some(n => n.type === ComponentType.MESSAGE_QUEUE);
  if (hasQueue) {
    signals.add('HAS_MESSAGE_QUEUE');
  }

  // 2. Check for Load Balancer
  const hasLB = nodes.some(n => n.type === ComponentType.LOAD_BALANCER);
  if (!hasLB && nodes.length > 2) {
    signals.add('NO_LOAD_BALANCER');
  }

  // 3. Check for Direct External Calls (e.g., Microservice -> External Service without Queue)
  const externalNodes = nodes.filter(n => n.type === ComponentType.EXTERNAL_SERVICE);
  const queueNodes = nodes.filter(n => n.type === ComponentType.MESSAGE_QUEUE);

  const hasDirectExternalCall = edges.some(edge => {
    const targetIsExternal = externalNodes.some(n => n.id === edge.target);
    const sourceIsQueue = queueNodes.some(n => n.id === edge.source);
    return targetIsExternal && !sourceIsQueue;
  });

  if (hasDirectExternalCall) {
    signals.add('DIRECT_EXTERNAL_CALL');
  }

  // 4. Check for Async Processing (Queue -> Microservice)
  const hasAsyncProcessing = edges.some(edge => {
    const sourceIsQueue = queueNodes.some(n => n.id === edge.source);
    const targetIsMicroservice = nodes.some(n => n.id === edge.target && n.type === ComponentType.MICROSERVICE);
    return sourceIsQueue && targetIsMicroservice;
  });

  if (hasAsyncProcessing) {
    signals.add('ASYNC_PROCESSING');
  }

  // 5. Check for SPOF Database (Only 1 DB)
  const dbNodes = nodes.filter(n => n.type === ComponentType.DATABASE);
  if (dbNodes.length === 1) {
    signals.add('SPOF_DATABASE');
  }

  return Array.from(signals);
}
