import { GoogleGenAI } from "@google/genai";
import { SystemNode, SystemEdge, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getArchitectFeedback(
  nodes: SystemNode[],
  edges: SystemEdge[],
  history: Message[],
  currentPhase: string,
  scenario: string,
  scalingChallenge: string
) {
  const model = "gemini-3.1-pro-preview";
  
  const systemPrompt = `You are a Senior Architect Reviewer. Your goal is to validate a user's system design thinking.
  
  Problem Statement: ${scenario}
  Current Phase: ${currentPhase}
  User's Scaling Goal: ${scalingChallenge}
  
  Design Graph:
  Nodes: ${JSON.stringify(nodes)}
  Edges: ${JSON.stringify(edges)}
  
  Note: Nodes of type 'COMMENT' represent user annotations. If a comment node is connected to another node via an edge, it means the comment specifically applies to that connected component.
  
  Principles:
  - Never provide a full "correct" architecture.
  - Challenge assumptions actively.
  - Ask probing questions about trade-offs (e.g., "Why a SQL database here?", "How does this handle a 10x traffic spike?").
  - If in STRESS phase, introduce a specific failure or load event and ask how the system handles it.
  - Be demanding but fair.
  
  Response Format:
  - Keep it concise.
  - Focus on one or two specific areas of the design.
  - Use a professional, slightly critical but constructive tone.`;

  const response = await ai.models.generateContent({
    model,
    contents: history.map(m => ({
      role: m.role === 'architect' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  return response.text;
}

export async function getFinalEvaluation(
  nodes: SystemNode[],
  edges: SystemEdge[],
  history: Message[],
  scenario: string,
  scalingChallenge: string
) {
  const model = "gemini-3.1-pro-preview";
  
  const systemPrompt = `You are a Senior Architect Reviewer. Provide a final evaluation of the user's system design.
  
  Problem Statement: ${scenario}
  User's Scaling Goal: ${scalingChallenge}

  Design Graph:
  Nodes: ${JSON.stringify(nodes)}
  Edges: ${JSON.stringify(edges)}
  
  Note: Nodes of type 'COMMENT' represent user annotations. If a comment node is connected to another node via an edge, it means the comment specifically applies to that connected component.
  
  Evaluate across:
  1. Scalability (0-100)
  2. Reliability (0-100)
  3. Clarity of Thought (0-100)
  
  Provide structured feedback in JSON format.
  {
    "scalability": number,
    "reliability": number,
    "clarity": number,
    "feedback": "Overall summary",
    "strengths": ["string"],
    "weaknesses": ["string"]
  }`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: "Evaluate my design based on our discussion and the final graph." }] },
      ...history.map(m => ({
        role: m.role === 'architect' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
