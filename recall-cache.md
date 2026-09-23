# Recall cache — TTL rules

The cache is the cheapest part of the brain. A repeated question that hits cache costs one lookup
instead of a store sweep, and most questions in a working day are repeats.

## The entry

```json
{ "answer": "...", "storesHit": ["memory", "wiki/dashboard-ops"], "ts": "2026-09-22T08:30:00Z",
  "sourceStamp": "2026-09-21T20:24:36-07:00", "level": 2 }
```

- **`ts`** — when *this answer* was cached.
- **`sourceStamp`** — the underlying document's own stamp. These are different things, and confusing
  them is how a five-day-old number gets reported as fresh.
- **`level`** — which recall level produced it. Used to measure whether the ladder is working.

## TTL

| Store class | TTL | Why |
|---|---|---|
| Volatile — deck `state` docs, rates, calendar, weather, leads, runner status | **4 h** | A sync runs at least twice a day; four hours is the longest a number can be wrong without anyone noticing |
| Stable — Obsidian vault, Graphify graph, Ruflo summaries | **24 h** | Rebuilt daily at most; the graph's last build was 2026-09-13 |
| Repo files — wiki, context, projects, references | Until the file changes | They change by commit, not by clock |
| Research answers (level 3, Perplexity) | **24 h**, and always cited | A cited answer can be re-checked; an uncited one cannot |
| Client / full-context pages | **Not cached** | They are read whole, on the Mac, each time |

## The rules

1. **Never serve past TTL silently.** Either refresh, or answer and say the age:
   *"as of the 2026-09-21 20:24 PT sync — 12 hours old."*
2. **Report `sourceStamp`, not `ts`, and never today's date** unless the fact was verified today.
3. **A stale-store answer is still better than a guess** — serve it, label it, and raise the staleness.
4. **Invalidate on write.** Any task that writes a doc invalidates every cache entry whose
   `storesHit` includes it. A cache that outlives its source is worse than no cache.
5. **Cache the miss too.** "Not in the brain" is an expensive thing to rediscover five times.
6. **Never cache anything sensitive.** Client pages and anything flagged `sensitive` are out.
7. **A cache hit still names its sources.** `storesHit` goes into the answer, so a wrong answer can
   be traced to the store that produced it.

## Staleness thresholds worth alerting on

| Signal | Threshold |
|---|---|
| A deck doc older than twice its task's cadence | Alert |
| A task with **no completion recorded** for longer than its cadence | Alert — e.g. `brain-weekly-verify`, last end 2026-09-14 on a Sunday cron, so the 09-20 gate never ran (`runnerStatus`, 2026-09-23 02:10 UTC) |
| A task that reports **ok** while the document it owns has not moved | Alert — the silent no-write success, and the one this table used to miss. `openrouter-feeds-refresh` read `ok` on 2026-09-22 while `openrouterFeeds` had been frozen since 2026-09-13 (`feedFreshness`, 2026-09-23 00:50 UTC). Judge the doc stamp, never the task status |
| A vector index whose `builtAt` predates its source's stamp | Alert — the confident-and-wrong failure mode |
| A store the fabric count says is at **0** | Alert — e.g. the Drive folder, 0 files |

`brain-weekly-verify` raises these on Sunday. The weekly loop measures **cache hit %** and
**tokens per answer** against them — see `OPTIMIZATION.md`.
