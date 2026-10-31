# Motion graphics and Claude repos — the reference shelf (2026-10-31)

Nothing here is installed globally. Libraries are added inside a web or video project when one needs them; lists and
guides are reading. Full review and decisions: `integrations/skill-packs/REGISTRY-2026-10-31.md`.

## Motion libraries (npm, add inside a project)
| Need | Package | Licence note |
|---|---|---|
| 3D scenes | `three` (three.js), `@react-three/fiber` | MIT |
| Light motion for text/SVG | `animejs` | MIT |
| Springy site motion | `motion` | MIT |
| After Effects files on the web | `lottie-web` | MIT |
| Timed animation | `gsap` (skills installed for Claude) | GSAP "standard no-charge" licence, commercial use OK |
| UI kits | shadcn/ui, `@magicui/*`, react-bits, motion-primitives | MIT; react-bits adds Commons Clause (no reselling the components) |
| Sound and waveforms | `tone`, `wavesurfer.js` | MIT / BSD |

Video rendering already lives in `integrations/openmontage/` (FFmpeg, HyperFrames, Remotion). Remotion is free for
individuals and companies of up to 3 employees; a bigger company needs its paid licence (HOLD for Steven).

## Claude reading
- anthropics/claude-cookbooks, anthropics/claude-quickstarts — API recipes and demo apps (need an API key to run).
- modelcontextprotocol/mcpb (formerly claude-desktop-extensions / dxt) — packaging MCP servers as one-click bundles.
- hesreallyhim/awesome-claude-code — link only (CC BY-NC-ND: do not copy its text).
- punkpeye/awesome-mcp-servers — MCP directory (already on the shelf).

## API and data lists (cporter202)
- agentic-ai-apis, API-mega-list, lovable-for-beginners — link lists and a beginner guide.
- real-estate-data-apis — 1,000+ paid Apify scrapers of Zillow, Redfin, Realtor.com and Crexi. No MLS or free source.
  Scraping portals breaks their terms: Alexandra reviews before any use; an Apify account or spend is Steven's yes.
