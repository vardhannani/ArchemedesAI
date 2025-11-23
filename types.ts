export enum AppState {
  INTRO = 'INTRO',
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS'
}

export interface ResearchParams {
  query: string;
  timeframe: string;
  sources: {
    patents: boolean;
    journals: boolean;
    preprints: boolean;
  };
  exclusions: string;
}

export interface Citation {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
}

export interface Section {
  heading: string;
  content: string; // Markdown text with [x] citation markers
}

export interface ResearchReport {
  title: string;
  summary: string; // Brief executive summary
  sections: Section[];
  novel_hypothesis: string;
  citations: Citation[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ExperimentalStep {
  step_number: number;
  action: string;
  conditions: string; // e.g. "500C for 2 hours"
  equipment: string;
}

export interface ExperimentalPlan {
  title: string;
  objective: string;
  steps: ExperimentalStep[];
  safety_warnings: string[];
}

export interface ComparisonPoint {
  attribute: string; // e.g. "Synthesis Method", "Yield", "Operating Temp"
  details: {
    citation_id: number;
    value: string;
  }[];
}

export interface PaperComparison {
  summary: string; // Brief overview of the comparison
  points: ComparisonPoint[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'material' | 'property' | 'method' | 'application';
}

export interface GraphEdge {
  source: string; // Node ID
  target: string; // Node ID
  relationship: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}