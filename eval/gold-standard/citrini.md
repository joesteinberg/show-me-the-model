# Gold Standard Evaluation: "The 2028 Global Intelligence Crisis"
## Citrini Research, February 22, 2026

**Source:** https://www.citriniresearch.com/p/2028gic
**Evaluator:** Joseph Steinberg, University of Toronto
**Purpose:** Benchmark output for the "Show Me the Model" economics slop detector

---

# Part I: Passage-Level Annotations

---

### Annotation 1: "Ghost GDP" Is Incoherent

**Severity:** Critical
**Issue type:** `IDENTITY_VIOLATION`

**Passage:**
> *The headline numbers were still great. Nominal GDP repeatedly printed mid-to-high single-digit annualized growth. Productivity was booming... When cracks began appearing in the consumer economy, economic pundits popularized the phrase "Ghost GDP": output that shows up in the national accounts but never circulates through the real economy.*

**Explanation:**

The concept of "Ghost GDP" — output that appears in the national accounts but doesn't reach the real economy — sounds intuitive but doesn't hold up.

GDP measures the total value of everything firms in the economy produce (more precisely, the value they add to the materials and other inputs they buy from other firms). But here's the crucial part: GDP simultaneously measures three things that must be equal to one another by definition. It measures total production, total income earned by everyone in the economy, and total spending on final goods and services. These aren't three different numbers that happen to be similar — they are the same number, counted three different ways.

This means that if we're producing more stuff, then in the aggregate, incomes and spending *have* to rise in tandem. Output can't "show up in the national accounts" without also showing up as someone's income and someone's spending. The national accounts don't sit apart from the real economy — they *are* the real economy, measured carefully.

The authors may be reaching for a legitimate concern — that the *distribution* of income is shifting, so that aggregate GDP growth masks declining incomes for many workers. That's a real phenomenon worth analyzing. But calling it "Ghost GDP" implies that there's output floating around that nobody earns and nobody spends, and that's not how economies work.

---

### Annotation 2: GDP Can't Easily Rise While Consumption Collapses

**Severity:** Critical
**Issue type:** `QUANTITATIVE_COMPOSSIBILITY`, `IDENTITY_VIOLATION`

**Passage:**
> *It should have been clear all along that a single GPU cluster in North Dakota generating the output previously attributed to 10,000 white-collar workers in midtown Manhattan is more economic pandemic than economic panacea. The velocity of money flatlined. The human-centric consumer economy, 70% of GDP at the time, withered.*

And later:

> *By Q2 2027, the economy was in recession... we'd had two consecutive quarters of negative real GDP growth.*

**Explanation:**

The essay describes an economy where GDP is growing robustly (earlier described as "mid-to-high single-digit annualized growth") while the "consumer economy" — 70% of GDP — is "withering." Later, the economy tips into recession with negative GDP growth. Let's work through the arithmetic of whether these claims can coexist.

GDP is the sum of four components: consumer spending (C, about 70% of GDP), investment (I, about 16–18%), government spending (G, about 16–18%), and net exports (NX, typically −2% to −4%). These shares have to add up.

If consumption is falling while GDP is rising, then investment, government spending, or net exports must be rising by *more* than enough to offset the decline in consumption. Because consumption is such a large share of GDP, the required increases in the other components would need to be enormous. For example, if GDP were to grow by 10% while consumption fell by 10%, investment would need to roughly *double*. That's not impossible in principle, but it's an extraordinary claim that would require an extraordinary explanation.

The essay doesn't provide one. It gestures at AI investment as the offset, but never quantifies whether the AI compute buildout could plausibly fill a gap of that magnitude. The authors should specify: exactly how much does consumption fall, exactly how much does AI investment rise, and do the numbers add up? This is what we call "quantitative compossibility" — the individual claims might each sound plausible in isolation, but when you put them together and check the arithmetic, the required magnitudes become implausible.

---

### Annotation 3: The Falling Labor Share Is Assumed, Not Derived

**Severity:** Critical
**Issue type:** `EXOG_ENDO_CONFUSION`

**Passage:**
> *Labor's share of GDP declined from 64% in 1974 to 56% in 2024, a four-decade grind lower driven by globalization, automation, and the steady erosion of worker bargaining power. In the four years since AI began its exponential improvement, that has dropped to 46%. The sharpest decline on record.*

**Explanation:**

This is the single most important assumption in the entire essay, and it's stated as a fait accompli rather than derived from clearly specified economic forces.

A falling labor share — meaning workers collectively receive a smaller fraction of total income — is an *outcome*, not a cause. Something in the economy has to change to produce it. An economist would ask: what specifically changed about the technology? There are many possibilities, and they have very different implications:

- Did total factor productivity (TFP) rise, meaning AI just makes everything cheaper to produce? If so, both labor and capital benefit, and the labor share might not fall much at all.
- Did the elasticity of substitution between labor and capital increase, meaning firms find it easier to replace workers with machines? This *could* push the labor share down — but whether it does depends on the relative costs of labor and compute, and the direction isn't guaranteed.
- Did the price of compute collapse, making AI capital effectively cheaper? Surprisingly, this doesn't straightforwardly reduce the labor share — the effect depends on how substitutable AI and labor are in production (see the "Dig Deeper" note below).

Each of these shocks has different implications for wages, prices, consumption, investment, and GDP growth — and crucially, not all of them even produce a falling labor share. Whether the labor share rises or falls depends on the *interaction* between the type of shock and how easily firms can substitute between AI and human workers. A collapse in compute costs, for instance, only reduces the labor share if AI and labor are sufficiently substitutable; if they're more complementary, cheaper compute could actually *raise* the labor share by making workers more productive and more valuable.

By assuming the labor share simply falls to 46% without specifying the mechanism, the authors free themselves to cherry-pick the implications they want (lower wages, collapsing consumption) while ignoring the ones they don't (lower prices, higher output, rising real purchasing power, increased demand for goods and services that are complements to AI).

A rigorous version of this argument would start by specifying the technological change precisely, then work through *all* of its implications — not just the scary ones — and check whether they're mutually consistent. The essay does it backwards: it assumes the outcome and builds a narrative around it.

> **Dig Deeper: Why the Labor Share Doesn't Just "Obviously" Fall**
>
> Whether a technological change raises or lowers labor's share of income depends on a key parameter economists call the *elasticity of substitution* between labor and capital — essentially, how easy it is for firms to swap workers for machines (or vice versa).
>
> With a standard benchmark production technology (called "Cobb-Douglas"), the labor share is *completely invariant* to changes in factor costs. If compute gets cheaper, firms use more of it, but labor's share of total income stays exactly the same. This is because the quantity effect (firms use more compute) is exactly offset by the price effect (each unit of compute earns less).
>
> The labor share falls when compute gets cheaper *only if* the elasticity of substitution is above one — meaning AI and labor are sufficiently substitutable that firms shift spending toward the cheaper factor more than proportionally. If the elasticity is below one (labor and AI are more complementary than substitutable), cheaper compute actually *raises* the labor share.
>
> There is emerging evidence that AI and other intangible capital may indeed be more substitutable for labor than traditional tangible capital is (which tends to be slightly complementary with labor). But this is an active area of research, and the answer likely varies across industries and occupations. The point is that a falling labor share is not an obvious or inevitable consequence of cheaper AI — it depends on empirical parameters that the essay never discusses.

---

### Annotation 4: The "Doom Loop" Ignores Price Adjustment

**Severity:** Critical
**Issue type:** `PARTIAL_EQUILIBRIUM`, `CETERIS_NON_PARIBUS`

**Passage:**
> *AI capabilities improved, companies needed fewer workers, white collar layoffs increased, displaced workers spent less, margin pressure pushed firms to invest more in AI, AI capabilities improved… It was a negative feedback loop with no natural brake.*

**Explanation:**

The essay presents the AI displacement spiral as a self-reinforcing loop with "no natural brake." But this traces out a story about quantities — how many workers, how much spending — while ignoring the most fundamental adjustment mechanism in economics: prices change.

When large numbers of white-collar workers are displaced, several things happen that the essay doesn't account for:

*Wages adjust.* If masses of workers are competing for fewer jobs, wages fall. The essay actually acknowledges this — the former Salesforce product manager earning $180,000 now drives for Uber at $45,000. But falling wages make human labor cheaper relative to AI compute. At some point, for many tasks, it becomes cheaper to hire a person than to run the servers. That's a brake.

*The return on investment falls.* If consumer spending is declining (as the essay claims), then firms face weaker demand for their products. That means the payoff from *any* new investment — including AI investment — is lower. Why automate a production line if you can't sell the output? The essay asserts this doesn't apply because AI adoption is "OpEx substitution," but that's looking at one firm in isolation. When *every* firm simultaneously cuts headcount and spending shrinks economy-wide, the incentive to invest in anything diminishes.

*Other sectors expand.* A shock that's bad for AI-exposed sectors can be good for other sectors. If millions of skilled workers are suddenly available at lower wages, sectors that were previously constrained by labor costs — manufacturing, construction, healthcare, education — can expand. Income and employment don't just disappear; they migrate. Economists call this a general-equilibrium effect: the price adjustments that transmit a negative shock in one part of the economy can create opportunities elsewhere.

None of these brakes guarantee that the transition is painless. It can be enormously disruptive for the workers involved. But the claim that there's "no natural brake" is inconsistent with basic price theory.

---

### Annotation 5: Redistribution to Low-MPC Owners ≠ Consumption Collapse

**Severity:** Critical
**Issue type:** `INTERNAL_CONTRADICTION`, `MISSING_MECHANISM`

**Passage:**
> *The owners of compute saw their wealth explode as labor costs vanished. Meanwhile, real wage growth collapsed.*

And:

> *The top 10% of earners account for more than 50% of all consumer spending in the United States... When these workers lost their jobs, or took 50% pay cuts to move into available roles, the consumption hit was enormous relative to the number of jobs lost.*

**Explanation:**

The essay's consumption-collapse story rests on a specific claim about the "marginal propensity to consume" (MPC) — the fraction of each additional dollar of income that gets spent rather than saved. The logic goes: income shifts from workers (who spend most of what they earn) to capital owners (who save most of what they earn), so aggregate consumption falls.

This reasoning has two problems.

*First, the MPC logic applies to temporary income changes, not permanent ones.* It's well-established that lower-income households spend a larger fraction of a temporary windfall (like a stimulus check) than wealthier households do, largely because poorer households are more likely to be borrowing-constrained. But the essay explicitly frames this as a *permanent* structural transformation, not a temporary shock. Standard consumption theory says that people adjust their spending to match their *permanent* income. If a capital owner's income is permanently higher, they will eventually spend a larger share of it — buying bigger houses, taking more vacations, hiring more personal services. The essay can't simultaneously argue that this is a permanent, structural shift *and* that the transitory MPC gap will persist indefinitely.

*Second, where does the capital owners' additional income go?* If labor's share of GDP falls by 10 percentage points, that income shifts to capital owners. Even if those owners save a large fraction, that saving has to go *somewhere*. Increased saving pushes down interest rates (more money chasing the available financial assets). Lower interest rates boost asset prices — stocks, bonds, real estate — and make borrowing cheaper, stimulating spending and investment. In other words, the redistribution toward high-saving capital owners should, in equilibrium, produce *rising* asset prices.

This directly contradicts the essay's central financial prediction: a 38% crash in the S&P 500. The essay's own logic — income shifts to people who save more — implies falling interest rates and rising asset prices, the opposite of what it predicts.

---

### Annotation 6: The "OpEx Substitution" Argument Is Partial Equilibrium

**Severity:** Moderate
**Issue type:** `PARTIAL_EQUILIBRIUM`, `EXOG_ENDO_CONFUSION`

**Passage:**
> *The intuitive expectation was that falling aggregate demand would slow the AI buildout. It didn't, because this wasn't hyperscaler-style CapEx. It was OpEx substitution. A company that had been spending $100M a year on employees and $5M on AI now spent $70M on employees and $20M on AI. AI investment increased by multiples, but it occurred as a reduction in total operating costs. Every company's AI budget grew while its overall spending shrank.*

**Explanation:**

This passage treats a single firm's cost-optimization decision as though it can be scaled up to the entire economy without any feedback. For one firm in isolation, replacing $30M of labor with $15M of AI compute makes perfect sense regardless of what's happening in the broader economy. But when *every* firm does this simultaneously, the aggregate consequences change the conditions that made the decision attractive.

If every firm is cutting headcount and total spending, then aggregate demand — the total amount of spending in the economy — is falling. That means each firm's *revenue* is also falling (someone's spending is someone else's revenue). A firm whose revenue is declining has a smaller total budget for everything, including AI. You can't treat the AI spending decision as independent of the demand conditions that the collective spending decisions create.

The firm's spending decisions are *endogenous* — they respond to economic conditions — not *exogenous* assumptions that just happen regardless. The essay acknowledges the demand feedback ("Companies that sell things to consumers sold fewer of them") but doesn't follow the logic to its conclusion: falling revenue eventually constrains AI spending too.

---

### Annotation 7: Eliminating Middlemen Is Good for Consumers

**Severity:** Moderate
**Issue type:** `COMPOSITION_FALLACY`, `INTERNAL_CONTRADICTION`

**Passage:**
> *Over the past fifty years, the U.S. economy built a giant rent-extraction layer on top of human limitations... Trillions of dollars of enterprise value depended on those constraints persisting.*

And:

> *Insurance renewals, where the entire renewal model depended on policyholder inertia, were reformed. Agents that re-shop your coverage annually dismantled the 15-20% of premiums that insurers earned from passive renewals.*

And:

> *Real estate, where buyers had tolerated 5-6% commissions for decades because of information asymmetry between agent and consumer, crumbled once AI agents... could replicate the knowledge base instantly.*

**Explanation:**

The essay presents the collapse of intermediation as evidence of economic doom. But look at it from the consumer's side.

If AI agents eliminate 15–20% of insurance premiums that were pure rent extraction, that's a 15–20% price cut for every policyholder. If real estate commissions fall from 5–6% to under 1%, that saves tens of thousands of dollars on every home purchase. If AI shopping agents find lower prices on everything from protein bars to flights, every consumer's purchasing power increases.

This is a massive *positive* supply shock for consumers. Every dollar of "enterprise value destroyed" in the intermediation layer is a dollar that stays in consumers' pockets. Their real income — what they can actually buy with their paychecks — goes up, even if their nominal wages don't change. This directly undercuts the essay's core narrative that consumers are getting poorer and spending less.

The authors are committing a composition fallacy: what's bad for intermediary firms (lost revenue) is good for the consumers and producers on either side of them (lower costs). The essay traces the losses to the firms that extracted rents, but never nets those against the gains to the consumers who were paying the rents. In aggregate, this kind of disintermediation makes the economy more efficient and consumers richer — the opposite of the "doom loop."

---

### Annotation 8: Fiscal Revenue Doesn't Necessarily Fall

**Severity:** Moderate
**Issue type:** `IDENTITY_VIOLATION`, `LUCAS_CRITIQUE`

**Passage:**
> *The system wasn't designed for a crisis like this. The federal government's revenue base is essentially a tax on human time. People work, firms pay them, the government takes a cut... federal receipts were running 12% below CBO baseline projections.*

**Explanation:**

The claim that federal revenue collapses because labor income falls has three problems.

*First, it ignores the accounting identities.* If GDP is rising (as the essay claims earlier), total income in the economy is rising. Income may be *redistributing* from labor to capital, but it's not shrinking. Corporate profits, capital gains, and the returns to AI compute are all taxable. The tax base shifts its composition, but doesn't obviously shrink.

*Second, the U.S. tax code is progressive.* Higher-income individuals and corporations face higher marginal tax rates. If income concentrates among wealthier capital owners, the government actually collects a larger percentage of each dollar, because those dollars are taxed at higher rates. A redistribution from a worker earning $80,000 (in the 22% bracket) to a capital owner earning $5 million (in the 37% bracket) increases, not decreases, the average tax rate on that income.

*Third, the essay treats tax policy as fixed.* In reality, governments respond to changing conditions — this is what economists call the Lucas Critique. If AI is generating enormous corporate profits while displacing workers, the political pressure (and economic logic) for taxing those profits is overwhelming. The essay actually describes exactly this response later (the "Transition Economy Act" and "Shared AI Prosperity Act"), but treats it as too slow to matter while simultaneously treating the economic disruption as a multi-year process. If the disruption takes years to unfold, the policy response has years to adapt as well.

---

### Annotation 9: Monetary Policy — Right Conclusion, Wrong Reasoning

**Severity:** Moderate
**Issue type:** `EXOG_ENDO_CONFUSION`

**Passage:**
> *The traditional policy toolkit (rate cuts, QE) can address the financial engine but cannot address the real economy engine, because the real economy engine is not driven by tight financial conditions. It's driven by AI making human intelligence less scarce and less valuable. You can cut rates to zero and buy every MBS and all the defaulted software LBO debt in the market… It won't change the fact that a Claude agent can do the work of a $180,000 product manager for $200/month.*

**Explanation:**

There's a kernel of truth here, but the reasoning is muddled in a way that leads to an overstatement.

Most economists agree that monetary policy is best suited for dealing with *demand* shocks — situations where people and firms suddenly want to spend less, even though the economy's productive capacity hasn't changed. In those cases, lowering interest rates can encourage borrowing and spending to fill the gap.

What the essay describes, however, is fundamentally a *supply* shock — a technological change that transforms how goods and services are produced. Monetary policy can't reverse a technological transformation, and in that narrow sense the essay is right.

But the essay overstates the point by implying monetary policy is useless. Even in the face of a supply shock, monetary policy helps manage the *adjustment process*. If the transition causes temporary unemployment and financial stress, lower interest rates can ease credit conditions, prevent unnecessary bankruptcies, and buy time for workers and firms to adapt. No economist claims the Fed can un-invent AI. The relevant question is whether policy can smooth the transition, and the answer is clearly yes — it's just not sufficient on its own.

The deeper confusion is that the essay never cleanly separates the supply shock (AI makes production cheaper) from the demand consequences it claims follow (consumers spend less). If the core problem is really a demand shortfall, monetary policy is precisely the right tool.

---

### Annotation 10: The $200/Month Agent vs. the $180K Product Manager

**Severity:** Minor
**Issue type:** `PARTIAL_EQUILIBRIUM`, `CETERIS_NON_PARIBUS`

**Passage:**
> *It won't change the fact that a Claude agent can do the work of a $180,000 product manager for $200/month.*

**Explanation:**

This comparison holds three things constant that wouldn't stay constant: the price of AI compute, the wage of the product manager, and the demand for the product manager's output.

If millions of product managers are displaced, the wage for that role falls dramatically (the essay's own Salesforce-to-Uber example illustrates this). Meanwhile, if every firm is competing for AI compute to replace its workforce, the demand for compute skyrockets, driving its price up. And if the overall economy is weakening (as the essay claims), the demand for whatever the product manager was producing may change too.

The comparison is a snapshot that freezes everything except the one variable the author wants to highlight. In reality, all these prices adjust simultaneously, and the gap between "$200/month" and "$180,000/year" would narrow considerably from both directions.

---

### Annotation 11: The Financial Contagion Chain — Conditionally Plausible

**Severity:** Note (not an error)
**Issue type:** N/A — conditional analysis

**Passage:**
> *Private credit had grown from under $1 trillion in 2015 to over $2.5 trillion by 2026... Apollo bought Athene. Brookfield bought American Equity. KKR took Global Atlantic... The "permanent capital" that was supposed to make the system resilient was... the savings of American households.*

**Explanation:**

The financial plumbing narrative — PE firms using insurance companies as funding vehicles, ARR-backed lending, the opacity of cross-entity loss allocation, the eventual contagion to the mortgage market — is the strongest section of the essay. The institutional details are accurate, the risk channels are real, and the contagion logic is internally consistent.

However, the entire chain is *conditional* on the labor displacement scenario developed in the earlier sections. The private credit defaults happen because white-collar displacement destroys SaaS revenue. The mortgage stress happens because displaced workers can't make payments. The insurance-to-PE contagion happens because the credit defaults hit insurer balance sheets.

Since the labor displacement scenario rests on the foundational errors identified above — the assumed (rather than derived) labor share collapse, the missing general-equilibrium adjustments, the GDP-without-consumption puzzle — the probability of this specific financial contagion path materializing is much lower than the essay implies.

This illustrates an important feature of economic analysis. Economics is at its core a *conditional* discipline: given a specific shock, we can trace its implications rigorously. The essay's financial analysis is a reasonable exercise in conditional prediction. Where it falls down is in the "if" part — the assumed shock doesn't survive scrutiny. The chain of "if A, then B, then C" is only as strong as the initial "if A."

---

# Part II: Synthesis Report

---

## Central Claim

The essay argues that rapid AI advancement will displace white-collar workers at scale, triggering a self-reinforcing "doom loop" of falling consumption, rising unemployment, financial contagion (through private credit and mortgage markets), and ultimately a crisis rivaling the 2008 Global Financial Crisis, with the S&P 500 falling ~57% from peak.

## Key Assumptions Inventory

The essay's argument depends on the following assumptions, many of them unstated:

| # | Assumption | Stated or Unstated? | Plausible? |
|---|-----------|---------------------|------------|
| 1 | AI capabilities improve rapidly enough to displace large numbers of white-collar workers within 2–3 years | Stated | Uncertain but not unreasonable as a scenario |
| 2 | The labor share of GDP falls from 56% to 46% in four years | Stated | Not derived from any specified technological mechanism; whether cheaper AI even reduces the labor share depends on empirical parameters the essay doesn't discuss |
| 3 | The income redistribution from workers to capital owners causes aggregate consumption to fall | Stated | Unlikely — relies on transitory MPC logic applied to a permanent shock |
| 4 | GDP can grow while consumption simultaneously collapses | Stated (early sections) then contradicted (recession later) | Arithmetically near-impossible given consumption's 70% share of GDP |
| 5 | Wages do not adjust enough to create a natural brake on displacement | Unstated | Contradicted by basic price theory |
| 6 | The return on AI investment is unaffected by falling aggregate demand | Unstated | Contradicted by basic investment theory |
| 7 | Other sectors of the economy do not expand to absorb displaced workers | Unstated | Contradicted by GE reasoning — falling wages in AI-exposed sectors make labor cheaper in other sectors |
| 8 | Fiscal policy cannot adapt quickly enough to offset the disruption | Stated | Debatable, but the essay's own timeline (years) gives policy time to respond |
| 9 | The tax base shrinks as income shifts from labor to capital | Stated | Contradicted by progressive taxation and the fact that total income rises if GDP rises |
| 10 | Consumer disintermediation (lower prices, eliminated middlemen) is contractionary | Unstated but implied | Wrong — it's a positive supply shock that raises real purchasing power |

## Internal Consistency Check

The essay's internal logic contains several contradictions that undermine its conclusions:

**The GDP–consumption paradox.** The essay claims both that GDP is growing robustly and that the consumer economy (70% of GDP) is "withering." For both to be true, the remaining 30% of GDP would need to grow at implausible rates. The essay later resolves this by stipulating a recession, but this contradicts the "productivity boom" and "record corporate profits" narrative that drives the first half of the argument. The essay wants GDP growth (to justify the AI investment boom) and GDP decline (to justify the crisis) at different points, without specifying what changes between them.

**The saving–asset price paradox.** The essay argues that income shifts to high-saving capital owners, which reduces consumption. But higher aggregate saving pushes down interest rates and pushes up asset prices. This is the opposite of the 38% equity crash the essay predicts. The mechanism the essay relies on for the consumption collapse (redistribution to savers) is the same mechanism that should, in equilibrium, support the asset prices it predicts will crash.

**The disintermediation paradox.** The essay spends thousands of words describing how AI agents eliminate middleman rents — cheaper insurance, lower commissions, better price comparison. Every one of these is a price reduction that makes consumers richer in real terms. The essay presents this as evidence of economic distress, when it is in fact a boost to consumer purchasing power that works against the consumption-collapse narrative.

**The permanent-shock, transitory-logic paradox.** The essay insists this is not a cyclical downturn — it's a permanent structural transformation. But it applies transitory-shock reasoning throughout: MPC differences that matter primarily for temporary income changes, savings buffers that delay but don't prevent behavioral shifts, and a doom loop that accelerates rather than attenuates. If the shock is truly permanent, households and firms adjust their behavior to the new permanent reality, and many of the predicted dynamics (delayed spending cuts, lagged data recognition) don't apply in the way described.

## What a Rigorous Version Would Look Like

The essay asks a legitimate and important question: what happens if AI rapidly displaces a large share of white-collar work? Answering it rigorously would require specifying the following:

**1. The shock.** What exactly is changing about the production technology? A rigorous approach would model a specific change — for example, a decline in the effective price of "cognitive capital" relative to human labor, or an increase in the elasticity of substitution between AI and human workers. This sounds technical, but it matters because different shocks have different implications for wages, prices, output, and distribution.

**2. All the margins of adjustment.** Once you specify the shock, you need to trace *all* of its consequences, not just the ones that support your narrative. A large technology shock affects wages, prices of goods and services, interest rates, exchange rates, the return on investment, government revenue, and the demand for labor in sectors that are complements to (not substitutes for) AI. Many of these adjustments work against the doom-loop story.

**3. Quantitative discipline.** Claims like "a 2% decline in white-collar employment translated to a 3–4% hit to discretionary spending" need to be checked against the accounting identities. If GDP is X, consumption is 0.7X, and consumption falls by 4%, what happens to the other 30% of GDP? Does the arithmetic work? The essay repeatedly makes claims that sound reasonable in isolation but are mutually inconsistent when you check the adding-up constraints.

**4. General equilibrium.** The essay reasons almost entirely in partial equilibrium — it examines what happens in one market (white-collar labor) or one sector (SaaS) while holding everything else constant. But when the shock is this large, nothing else stays constant. The whole point of general-equilibrium analysis is to trace these interconnections and find the new configuration of prices and quantities where everything is consistent.

## Bottom Line

The essay asks the right question — "what if our AI bullishness is right, and that's actually bearish?" — but answers it with economic reasoning that doesn't hold up to scrutiny. Its central prediction (simultaneous productivity boom, consumption collapse, and financial crisis) rests on a labor share decline that is assumed rather than derived from specified technological forces, and the implications of that assumed decline are traced selectively, emphasizing channels that support the doom narrative while ignoring general-equilibrium adjustments (falling wages, falling prices, lower interest rates, expanding non-AI sectors) that would substantially attenuate it.

The financial analysis — the PE-insurance nexus, the ARR-backed lending fragility, the mortgage contagion channel — is the essay's strongest contribution, but it is entirely conditional on the labor displacement scenario, which doesn't survive the scrutiny above. A more careful analysis, starting from a precisely specified technology shock and tracing all of its implications through a general-equilibrium lens, would likely conclude that AI-driven displacement causes real and painful disruption for affected workers, but not the self-reinforcing macroeconomic doom loop the essay describes.

Economics is at its strongest as a conditional discipline: given a well-specified shock, we can rigorously trace its consequences. The essay's error is not in asking "what if?" — that's exactly the right instinct. It's in assuming the answer to "what if?" and then building a narrative on that assumption, rather than working through the full set of implications and checking whether they're mutually consistent. The result is a story that *feels* compelling precisely because it skips the parts where the logic would push back.
