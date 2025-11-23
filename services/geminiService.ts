import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearchParams, ResearchReport, ExperimentalPlan, ChatMessage, PaperComparison, Citation, KnowledgeGraph } from '../types';

// Initialize the client with the API key from Vite environment variables.
// Uses `VITE_API_KEY` (set in .env). Provides a clear runtime error if missing.
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
if (!apiKey) {
  console.warn("[Archimedes] Missing VITE_API_KEY. API calls will fail until it's set.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const ensureApiKey = () => {
  if (!apiKey) {
    throw new Error("Missing API key (VITE_API_KEY). Set it in a .env file.");
  }
};

// --- Schemas ---

const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A formal scientific title." },
    summary: { type: Type.STRING, description: "A 2-3 sentence executive summary." },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          content: { type: Type.STRING, description: "Paragraph content with [x] citations." }
        },
        required: ["heading", "content"]
      }
    },
    novel_hypothesis: { type: Type.STRING, description: "A testable, novel scientific hypothesis." },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          authors: { type: Type.STRING },
          journal: { type: Type.STRING },
          year: { type: Type.STRING }
        },
        required: ["id", "title", "authors", "journal", "year"]
      }
    }
  },
  required: ["title", "summary", "sections", "novel_hypothesis", "citations"]
};

const experimentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    objective: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step_number: { type: Type.INTEGER },
          action: { type: Type.STRING },
          conditions: { type: Type.STRING },
          equipment: { type: Type.STRING }
        },
        required: ["step_number", "action", "conditions", "equipment"]
      }
    },
    safety_warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["title", "objective", "steps", "safety_warnings"]
};

const comparisonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief synthesis of the key differences." },
    points: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          attribute: { type: Type.STRING, description: "The specific scientific criteria being compared (e.g. 'Temperature Range')" },
          details: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                citation_id: { type: Type.INTEGER },
                value: { type: Type.STRING, description: "The value or finding for this specific paper." }
              },
              required: ["citation_id", "value"]
            }
          }
        },
        required: ["attribute", "details"]
      }
    }
  },
  required: ["summary", "points"]
};

const graphSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING, description: "Short label for the entity (e.g., 'Graphene')" },
          type: { 
            type: Type.STRING, 
            enum: ["material", "property", "method", "application"] 
          }
        },
        required: ["id", "label", "type"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, description: "ID of the source node" },
          target: { type: Type.STRING, description: "ID of the target node" },
          relationship: { type: Type.STRING, description: "Short verb phrase (e.g., 'improves', 'synthesized via')" }
        },
        required: ["source", "target", "relationship"]
      }
    }
  },
  required: ["nodes", "edges"]
};

// --- API Calls ---

export const generateResearchReport = async (params: ResearchParams): Promise<ResearchReport> => {
  ensureApiKey();
  const modelId = 'gemini-2.5-flash';
  
  const systemInstruction = `
    You are Archimedes AI, an elite Material Science Research Assistant.
    Your goal is to produce a high-level literature review based on the user's query.
    
    Constraints:
    1. Tone: Professional, academic, concise.
    2. Format: JSON.
    3. Content: Focus on chemical compositions, mechanical properties, synthesis methods, and performance metrics.
    4. Citations: You must include 4-8 citations. Use specific, realistic (or real if found via grounding) papers.
    5. Ensure the [x] markers in the text strictly correspond to the 'id' in the citations array.
  `;

  const userPrompt = `
    Research Topic: ${params.query}
    Timeframe Constraints: ${params.timeframe}
    Source Types: ${JSON.stringify(params.sources)}
    Exclusions: ${params.exclusions}

    Generate a literature review structure with:
    - 3 distinct sections (e.g., Current State, Methodologies, Performance).
    - A 'Novel Hypothesis' identifying a gap.
    - A list of citations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ResearchReport;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateExperimentalPlan = async (hypothesis: string, context: string): Promise<ExperimentalPlan> => {
  ensureApiKey();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on this hypothesis: "${hypothesis}" and the following context: ${context}, generate a concrete laboratory experimental protocol.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: experimentSchema,
        systemInstruction: "You are a Lab Director. Convert hypotheses into actionable, step-by-step experimental recipes with clear conditions (temp, pressure, duration) and safety warnings."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as ExperimentalPlan;
  } catch (error) {
    console.error("Experiment Generation Error:", error);
    throw error;
  }
};

export const queryReportContext = async (query: string, reportContext: ResearchReport, history: ChatMessage[]): Promise<string> => {
  if (!apiKey) return "API key missing. Please configure VITE_GEMINI_API_KEY.";
  // Convert report to a context string
  const contextStr = `
    Title: ${reportContext.title}
    Summary: ${reportContext.summary}
    Novel Hypothesis: ${reportContext.novel_hypothesis}
    Sections: ${reportContext.sections.map(s => s.heading + ": " + s.content).join('\n')}
  `;

  const systemInstruction = `
    You are Archimedes, answering questions specifically about the generated research report provided in context.
    Context: ${contextStr}
    
    Rules:
    1. Answer primarily based on the provided context.
    2. If the user asks for clarification, explain the scientific concepts.
    3. Keep answers concise and helpful for a PhD researcher.
  `;

  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: query });
    return result.text || "I could not generate a response.";
  } catch (e) {
    console.error(e);
    return "Error communicating with Archimedes agent.";
  }
};

export const generatePaperComparison = async (citations: Citation[], context: string): Promise<PaperComparison> => {
  ensureApiKey();
  const citationsStr = citations.map(c => `ID: ${c.id}, Title: ${c.title}, Authors: ${c.authors}`).join('\n');
  
  const systemInstruction = `
    You are a Senior Researcher comparing multiple papers.
    Analyze the provided citations in the context of the literature review.
    Create a comparison matrix focusing on: Methodologies, Key Findings, Pros, Cons, and Material Properties.
    Extract the values from the context provided. If exact values aren't in the context, infer based on standard knowledge of the authors/papers referenced or state 'Not Specified'.
  `;

  const prompt = `
    Context from Report: ${context}
    
    Papers to Compare:
    ${citationsStr}
    
    Generate a JSON comparison matrix.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: comparisonSchema,
        systemInstruction: systemInstruction
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as PaperComparison;
  } catch (error) {
    console.error("Comparison Generation Error:", error);
    throw error;
  }
};

export const generateKnowledgeGraph = async (context: string): Promise<KnowledgeGraph> => {
  ensureApiKey();
  const systemInstruction = `
    You are a Data Scientist visualizing scientific concepts.
    Extract key entities and relationships from the text to build a Knowledge Graph.
    
    Entities (Nodes):
    - Identify key Materials, Properties, Synthesis Methods, and Applications.
    - Keep labels short (1-3 words).
    - Limit to 10-20 most important nodes.
    
    Relationships (Edges):
    - Connect related nodes.
    - Provide a short verb for the relationship (e.g., 'enhances', 'reduces', 'uses').
  `;

  const prompt = `
    Analyze this text and extract a Knowledge Graph:
    ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: graphSchema,
        systemInstruction: systemInstruction
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as KnowledgeGraph;
  } catch (error) {
    console.error("Graph Generation Error:", error);
    throw error;
  }
};