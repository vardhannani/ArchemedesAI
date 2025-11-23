# Archimedes – Material Science Literature Review Agent

Archimedes is a React + TypeScript single-page application that accelerates Material Science R&D by transforming a research goal into an executive literature review, knowledge graph, experimental protocol, and comparative matrix using a powerful analysis engine.

## Features
- **Automated Literature Reviews**: Generates structured summaries from vast datasets.
- **Traceable Citations**: In-text clickable markers for easy source verification.
- **Experimental Protocol Synthesis**: Translates novel hypotheses into actionable lab procedures.
- **Comparative Analysis**: Dynamically creates comparison tables for selected papers.
- **Knowledge Graph Visualization**: Renders a force-directed graph of concepts and relationships.
- **Contextual Chat**: Ask follow-up questions grounded in the generated report.
- **Export & Share**: Built-in PDF export and link sharing capabilities.

## Tech Stack
- React 19 (functional components + hooks)
- TypeScript
- Vite 6
- Tailwind CSS (custom theme)
- Lucide-react icons

## Project Structure
```
App.tsx                 # App state orchestration
components/             # UI components (Intro, InputDashboard, Processing, ResultsReport)
services/geminiService.ts# Core analysis engine interactions
types.ts                # Central type & interface definitions
index.html              # Entry HTML + fonts
index.tsx               # React root
tailwind.config.js      # Tailwind theme extension
postcss.config.js       # PostCSS pipeline config
index.css               # Tailwind directives + custom utilities
```

## Environment Setup
Create a `.env.local` file in the project root:
```
VITE_API_KEY=your_api_key_here
```
Restart the development server after adding or changing the key. An in-app notification will appear if the key is missing.

## Installation & Development
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:5173` or the next available port.

## Scripts
| Command        | Description                       |
|----------------|-----------------------------------|
| `npm run dev`  | Start Vite dev server             |
| `npm run build`| Create a production-ready build   |
| `npm run preview` | Preview the production build   |

## Production Notes
- For multi-user deployments, consider implementing a server-side proxy for API keys to enhance security.
- For persistent storage of reports and user data, integration with a database (e.g., Supabase/Postgres) is recommended.
- For commercial applications, add user authentication and rate-limiting.

## License
Proprietary – Internal R&D demonstration.

