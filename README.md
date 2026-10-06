# Commodity Derivatives Intelligence (CDI)
### Cross-Contract Normalization, Cost-of-Carry Analytics & Relative Value Arbitrage on MCX Gold

**Hackathon:** Hack in Hills '26 • Track 03: Commodity Derivatives Intelligence  
**Team:** Bits and Bytes  
**Authors:** Harsh Deep Chak & Pallak Devi  

---

## 🌟 Executive Summary

Direct price comparisons across Multi Commodity Exchange of India (MCX) Gold futures are structurally misleading due to 4 compounding market microstructure frictions:
1. **Purity Asymmetry:** GOLDM (Mini) specifies 995 fineness, whereas GOLDTEN, GOLDGUINEA, and GOLDPETAL specify 999 fineness—creating a permanent baseline $\approx 0.402\%$ physical value wedge.
2. **Quotation & Lot Size Disparity:** Contracts quote per 10g, 8g, or 1g with underlying lot sizes ranging from 100g to 1g (a 100x capital commitment divergence).
3. **Maturity Desynchronization & Cost of Carry:** GOLDM contracts expire early (3rd–5th of the month), while others expire late (27th–31st), creating a 22–26 day financing gap ($r_{\text{Repo}} \approx 6.50\%$).
4. **Liquidity & Settlement Price Illusions:** Bhavcopy marks on illiquid contracts (e.g., GOLDPETAL) are exchange settlement prints, not executable market fills. Real trades suffer dynamic bid-ask slippage and statutory drag (**CTT 0.01%, Stamp Duty 0.002%, Exchange fees, and GST**).

**Commodity Derivatives Intelligence (CDI)** is an end-to-end quantitative platform that normalizes heterogeneous MCX contracts to a standardized **1g 999 Fine Gold equivalent**, strips out the forward financing basis, tests for cointegration stationarity, and executes a market-neutral relative value strategy with integer lot-size constraints ($\beta_{\text{Gold}} \approx 0.00$).

---

## 🧮 Mathematical Pipeline

### Stage 1: Cash-Equivalent Purity & Unit Normalization
$$\text{Price}_{\text{norm}, i} = \left(\frac{\text{Quoted Price}_i}{\text{Quoted Unit}_i}\right) \times \left(\frac{999}{\text{Purity}_i}\right)$$

### Stage 2: Term Structure & Cost-of-Carry Basis
$$\text{Basis}_{\text{carry}} = \text{Price}_{\text{near}} \times \left( e^{(r + s - y) \cdot \frac{\Delta t}{365}} - 1 \right)$$
* $r$: RBI Repo Rate / MIBOR financing cost (~6.50% p.a.)
* $s$: Insured vault storage cost (~0.25% p.a.)
* $y$: Convenience yield / Gold lease rate (~0.10% p.a.)
* $\Delta t$: Expiry difference in calendar days (~24 days)

### Stage 3: Cointegrated Spread & Rolling Z-Score
$$\text{Spread}_t = \text{Price}_{\text{norm}, A} \pm \text{Basis}_{\text{carry}} - \text{Price}_{\text{norm}, B}$$
$$Z_t = \frac{\text{Spread}_t - \mu_{60}}{\sigma_{60}}$$
* **Entry Hurdle:** $|Z| \ge 2.0\sigma$
* **Exit / Mean Reversion:** $|Z| \le 0.5\sigma$
* **Tender Period Boundary:** Automatic mandatory liquidation prior to delivery notice period.

### Stage 4: Discrete Integer Lot Allocation Solver
$$\mathbf{N}^* = \arg\min_{N_A, N_B \in \mathbb{N}} \left| N_A \cdot L_A \cdot P_A - N_B \cdot L_B \cdot P_B \cdot h \right|$$

### Stage 5: Alpha vs. Beta Regression Attribution
$$R_{\text{strategy}} = \alpha + \beta \cdot R_{\text{Gold}} + \epsilon \quad (\text{Target } \beta \approx 0.00)$$

---

## 💻 Tech Stack & Architecture

- **Frontend & Visualization:** Modern ES6+, HTML5 Glassmorphism UI, Plotly.js Interactive Financial Charts, KaTeX Math Rendering, Lucide Vector Icons.
- **Quant & Analytics Engine:** High-performance vectorized normalization, continuous cost-of-carry calculator, rolling 60-day statistical variance engine, discrete Integer Linear Programming (ILP) lot solver.
- **Data Engineering Defenses:** Automated MCX Bhavcopy sanitizer handling holiday duplicates, date format discrepancies (`DD/MM/YYYY` vs `MM/DD/YYYY` vs `04SEP2026`), trailing space truncation, and zero-volume liquidity gating.

---

## 🚀 How to Run Locally

1. Open the project folder:
   ```bash
   cd C:\Users\lenovo\.gemini\antigravity\scratch\commodity-derivatives-intelligence
   ```
2. Start any local static web server:
   - **Using Python:**
     ```bash
     python -m http.server 8080
     ```
   - **Using Node.js:**
     ```bash
     npx serve .
     ```
3. Open `http://localhost:8080` in your web browser.

---

## 🛡️ Hackathon Submission Checklist

- [x] Purity asymmetry formally normalized (995 vs 999).
- [x] Expiry mismatch and cost of carry decomposed.
- [x] Discrete integer lot size granularity solved.
- [x] Full Indian statutory cost model applied (CTT, Stamp Duty, GST, Exchange fee).
- [x] Look-ahead bias strictly eliminated with chronological walk-forward execution.
- [x] Empirical honesty: Verified strategy survival after dynamic bid-ask slippage.
