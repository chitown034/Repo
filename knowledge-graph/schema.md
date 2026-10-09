# Knowledge graph — schema

Small, closed vocabularies. A graph with an open vocabulary is a graph nobody can query.
Adding a type or a relation is a deliberate change to this file, not something a run invents.

## Entity types

| Type | Is | Key |
|---|---|---|
| `Person` | A named human in the business network — partner, lender rep, agent, vendor | label |
| `Client` | A borrower or buyer/seller. **Opaque label only** — see the never-graph-a-secret rule | opaque label |
| `Org` | Lender, brokerage, title, escrow, builder, vendor, nonprofit funder | name |
| `Agent` | An AI seat in the team (Vanessa, an executive, a report, a bench) | seat name |
| `Tool` | An MCP server, connector, skill, CLI or app | tool name |
| `Task` | A Mac scheduled task or a cloud routine | task name |
| `Doc` | A `state` DB document, or a registered source in `references/` | doc key |
| `Program` | A loan program | program name |
| `Property` | A property, by market area — never a client's address | area + label |
| `Topic` | A wiki topic or subject area | topic slug |
| `Decision` | A dated entry in `context/decisions.md` | date + slug |

## Relationship vocabulary

Typed, directed, and written `SUBJECT --REL--> OBJECT`.

| Relation | From → To | Means |
|---|---|---|
| `OWNS` | Agent → Task / Doc / Topic | This seat is accountable for it |
| `REPORTS_TO` | Agent → Agent | Org-chart line |
| `USES` | Agent / Task → Tool | Runtime dependency |
| `WRITES` | Task → Doc | This task produces that document |
| `READS` | Doc / Agent → Doc | Consumption, for blast-radius questions |
| `REPLACED_BY` | Tool → Tool | A retired tool → the tool that took over from it |
| `BLOCKED_BY` | Task / Doc → Decision / Tool | Why something is not running |
| `WORKS_WITH` | Person → Org | Affiliation |
| `REFERRED_BY` | Client → Person / Org | Lead source, opaque on the client side |
| `OFFERS` | Org → Program | Lender offers a program |
| `ELIGIBLE_FOR` | Client → Program | **Opaque client label only** |
| `LOCATED_IN` | Property / Org → Topic(market area) | Geography |
| `DECIDED` | Decision → anything | A dated decision that changed a thing |
| `SUPERSEDES` | Decision → Decision | Reversal chain |

## Node shape

```yaml
id: tool.lofty-bridge          # type.slug — stable, lowercase
type: Tool
label: lofty-bridge
sensitivity: public            # public | internal | sensitive
source: context/decisions.md#2026-09-22-lofty
asOf: 2026-09-22
props: {}                      # small scalars only — never a document body
edges: []                      # a Tool node's only outbound relation is REPLACED_BY,
                               # written on the RETIRED tool's node, pointing at its
                               # successor — so the successor's own node carries none
```

## Rules

1. **`sensitivity: sensitive` never reaches the graph build.** The builder drops it and logs the drop.
2. **Every node carries `source` and `asOf`.** A node without provenance is deleted, not trusted.
3. **No document bodies in `props`.** Scalars and short labels only; the body stays in its store.
4. **No new type or relation without editing this file** in the same change.
5. **Ids are stable.** Rename the `label`, never the `id` — an id change silently orphans edges.
6. Contradicting edges are kept, both dated, and raised to the Sunday review. The graph records
   disagreement; it does not resolve it on its own.
