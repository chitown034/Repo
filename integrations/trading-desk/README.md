# Self-Improving Trading Research Desk (PAPER MODE ONLY)

A small, dependency-free Python package plus seven agent prompts for researching trading
ideas the disciplined way: one testable idea at a time, fixed pass/fail gates, every result
(including failures) remembered forever. **It is research, not financial advice. It never
places an order, never calls a broker, never touches a network.** Python 3.9+ standard library only.

## The team

| Seat | File | Job |
|---|---|---|
| Idea Agent | `agents/IDEA.md` | One simple, testable strategy at a time, with what would prove it wrong |
| Builder Agent | `agents/BUILDER.md` | Turns the approved idea into leak-free backtest code |
| Backtester | `agents/BACKTESTER.md` | Reports the metrics, out-of-sample result and PASS/FAIL |
| Risk Manager (extra) | `agents/RISK_MANAGER.md` | Vetoes on drawdown, exposure, correlation, tail and cost sensitivity |
| Regime Analyst (extra) | `agents/REGIME_ANALYST.md` | Tags trend / range / high-vol and says which strategy types fit |
| Paper Trader | `agents/PAPER_TRADER.md` | Simulates only PASS strategies, 1% risk, no leverage, logs everything |
| Memory Agent | `agents/MEMORY.md` | Stores every strategy including failures; flags duplicates and repeats |

All seats are proposal-only. The code in `desk/` is what enforces the rules; a prompt is not a control.

## Fixed rules

1. Paper mode only.
2. No strategy moves forward without out-of-sample testing.
3. Fees and slippage are always included.
4. Tiny samples are rejected (30 in-sample and 10 OOS trades minimum).
5. Max drawdown is tracked, not just profit (25% limit).
6. Failed strategies are never deleted (append-only memory; sqlite triggers abort DELETE and UPDATE).
7. No agent may rewrite the rules after seeing test results. `desk/gates.py` holds them as a frozen
   `Rules` object. It is created before the backtest, its hash is recorded in the result, and
   `evaluate()` fails any result whose hash does not match.

Gate thresholds: profitable after fees+slippage in-sample AND OOS; OOS profit factor >= 1.2;
max drawdown <= 25%; OOS Sharpe >= 0.5. Flags that fail a result: "tiny sample",
"suspiciously perfect" (win rate > 0.9, profit factor > 5, or Sharpe > 4), and "overfit"
(OOS per-bar return < 30% of in-sample). "Fragile params" (edge gone at +-20%) is reported as a warning.

## Common mistakes this desk is built to resist

- Optimising until the backtest looks perfect.
- Using the same data to invent and to validate an idea.
- Ignoring costs.
- Too few trades.
- Letting an AI invent market data.
- Saving only the winners.

## Run it

You supply the data: a CSV with columns `date,open,high,low,close,volume` (sorted ascending, no
duplicates, no NaN; the loader rejects anything else). No market data is bundled.

```bash
cd integrations/trading-desk
python3 -m desk selftest                      # whole pipeline on SYNTHETIC data
python3 -m desk run --data bars.csv --strategy samples/sma_cross_10_30.json --memory ./memory.sqlite3
python3 -m desk report --memory ./memory.sqlite3
# tests, from the repo root:
python3 -m unittest discover -s integrations/trading-desk/tests
```

`run` does: duplicate check -> backtest (in-sample) -> out-of-sample -> walk-forward, Monte Carlo
drawdown, parameter sensitivity -> gates -> memory record -> (only if PASS) paper-trade the last 20% of
bars. It prints a JSON summary and writes `desk-report.json` (tested, rejected_before_paper, oos_perf,
max_dd, after_costs, duplicates_prevented, backtest_vs_paper_gap) for the dashboard, plus
`paper-trades.csv` when a paper run happens. `--trades-csv PATH` exports every backtest trade.
An identical normalised spec already in memory is blocked, even if renamed. Memory defaults to
`~/.config/trading-desk/memory.sqlite3`, outside the repo.

A strategy spec is JSON (see `samples/`): `entry_rules.type` is one of `sma_cross`, `breakout`,
`rsi_reversion`, `zscore_reversion`, `always_long` (benchmark); numbers go in `params`. There is no
`eval`; unknown types are rejected. A signal read at bar t's close fills at bar t+1's open.

## Honest limits

- No data ships here, and the synthetic generator is for plumbing tests only. A synthetic pass proves the code
  runs, never an edge. Do not trust any result until it is on real data you supplied and checked.
- The paper trader replays bars; on data the strategy has already seen it is a plumbing check, not
  a forward test. `backtest_vs_paper_gap` is only informative on bars that arrived after the backtest.
- Sharpe is computed from per-bar mark-to-market equity returns, risk-free rate 0, annualised with
  sqrt(bars per year) (daily = 252; the strategy timeframe picks the factor, unknown = 252).
- Fills are idealised: next-bar open plus a flat slippage in bps, no partial fills, no borrow cost,
  no overnight financing, no dividends or splits (supply adjusted data), stops fill at the stop
  price unless the bar gaps through it. Fractional quantities are allowed.
- The gate thresholds are sensible defaults, not statistical proof. Passing 30/10 trades is a low bar;
  expect false positives when many ideas are tested on one data set (multiple-comparison risk).
- Parameter sensitivity runs on in-sample bars only, one parameter at a time.
- Nothing here is financial advice. No live trading, no broker API, ever.
