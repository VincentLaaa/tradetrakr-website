# Trading Metrics Cheat Sheet

Keep this one-pager alongside your trading journal so you can audit the numbers that matter.

## Core Metrics

### Win Rate
- **Formula:** Wins ÷ Total Trades × 100
- **Example:** 62 wins / 100 trades = **62%**
- **Use When:** Gauging consistency; combine with expectancy to avoid high-win, low-payoff traps.

### Average Win & Average Loss
- **Formula:** Mean of winning trade profits vs. mean of losing trade losses
- **Example:** Avg Win = +$275, Avg Loss = -$180
- **Use When:** Spotting outlier influence; consider trimming outliers before recalculating.

### Expectancy (per trade)
- **Formula:** (Win Rate × Avg Win) − (Loss Rate × Avg Loss)
- **Example:** (0.62 × 275) − (0.38 × 180) = **$102.10**
- **Use When:** Deciding if the plan scales; track in both dollars and R-multiples.

### R-Multiple
- **Formula:** Trade P&L ÷ Initial Risk (R)
- **Example:** +$540 gain on $180 risk = **+3.0R**
- **Use When:** Normalizing setups across assets; target average R > 1 to offset losses.

### Profit Factor
- **Formula:** Gross Wins ÷ Gross Losses
- **Example:** $18,700 ÷ $10,400 = **1.80**
- **Use When:** Validating risk/reward balance; combine with drawdown for full picture.

### Drawdown (Max & Average)
- **Formula:** Peak-to-trough equity drop (in $ or R)
- **Example:** Max DD = -$4,200 (−7.5%) ; Avg DD = -$1,150
- **Use When:** Setting daily/weekly pain thresholds; calculate recovery % needed.

### MAE / MFE
- **Formula:** MAE = Largest unrealized loss per trade; MFE = Largest unrealized gain
- **Example:** Avg MAE = -0.85R, Avg MFE = +1.9R
- **Use When:** Optimizing stop distance (MAE) and profit targets (MFE); look for mismatches.

### Consistency Proxy
- **Formula:** Mean(R) ÷ StdDev(R) per trade or per day
- **Example:** Mean = +0.42R, StdDev = 0.95R → Score = **0.44**
- **Use When:** Tracking smoothness of returns; beware of small sample noise.

## Quick Checks
- ✅ Recalculate after 30–50 new trades or when you add/remove a setup.
- ✅ Segment by instrument, session, or strategy tag before making changes.
- ⚠️ Beware of small samples or outliers—wins/losses > 3σ should be inspected.

---
See the full guide: /blog/posts/key-trading-performance-metrics-to-track.html
