FTA AGENT ARCHITECTURE - CURRENT DELIVERABLES
Prepared 23 November 2026

The current diagrams incorporate Ali's correction about preparing plain-language instructions in section files and loading them before planning and specialist execution. They combine that approach and Ali's normal flow with Sulieman's specialist-agent responsibilities.

Primary deliverables:
  fta-agent-architecture-detailed.svg
  fta-agent-architecture-detailed.png
  fta-agent-architecture-overview.svg
  fta-agent-architecture-overview.png

Canonical editable presentation source:
  fta-agent-architecture-detailed.html
  fta-agent-architecture-overview.html
  build-editorial.cjs
  diagram-tokens.json

Email addressed to both team members:
  ../../output/FTA-reply-Ali-and-Sulieman.txt

Main architectural distinction:
  PREPARATION: domain/model owners prepare and approve plain-language section files from model/rule behavior, output meanings and reason mappings.
  RUNTIME INSTRUCTIONS: the Supervisor loads relevant sections before planning; specialists receive applicable sections before task execution.
  RUNTIME EVIDENCE: an authorized adapter resolves reason identifiers into approved descriptions and returns the available prediction facts and evidence references. The ML Explanation Agent does not interpret source code or invent a reason from a bare code.
  RETRIEVAL: source documents provide cited evidence and remain separate from executable task instructions.

The design is proposed, not an assertion of an existing deployed FTA system. The record schema, evidence availability and supported integrations must be agreed with their owners. General model guidance alone cannot establish the reason for an individual prediction.

Design method:
  All six requested diagram skills were installed. diagram-design is the primary design skill for these presentation images. Its architecture/flow, typography, connector and SVG-export guidance shaped the final artifacts. Excalidraw's clean-geometry and visual-hierarchy guidance informed the composition. The build uses manually specified vector geometry and local rendering; it does not use image generation.
  System fonts are used for portable offline artifacts. SVG export uses diagram-design's packaged export_svg.py. PNG capture and geometric text checks use the environment's bundled Playwright for Node with a locally installed Edge browser because the bundled Python environment does not include Playwright. No diagram source is uploaded to a remote renderer.
  The editable Mermaid/draw.io and PlantUML files in this folder are supplementary topology sources; the presentation HTML/SVG is the visual source of truth. They are revised to the same instruction/evidence architecture before handoff.

Checks:
  render-checks.json records rendered canvas bounds and text overlap checks.
  Visual inspection is performed on the exported PNGs; any repair is applied to the vector source and re-exported.

Installed skill sources:
  drawio-skill: https://github.com/Agents365-ai/drawio-skill
  diagram-design: https://github.com/cathrynlavery/diagram-design
  Archify (matching the requested "Archifi"): https://github.com/tt-a1i/archify
  code-to-diagram: https://github.com/AIPris/code-to-diagram
  Excalidraw: https://github.com/coleam00/excalidraw-diagram-skill
  PlantUML: https://github.com/DoubleMice/plantuml-skill

The installed skills are available for automatic selection on the next turn; they were read directly for this task. No email has been sent.
