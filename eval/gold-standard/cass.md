# Gold Standard Evaluation: "An Introduction to Productive Markets" & "Global Tariff: Eliminate the Trade Deficit"
## Oren Cass / American Compass, *Rebuilding American Capitalism*, 2023

**Source:** https://americancompass.org/rebuilding-american-capitalism/productive-markets/introduction/ and https://americancompass.org/rebuilding-american-capitalism/productive-markets/eliminate-the-trade-deficit/
**Evaluator:** Joseph Steinberg, University of Toronto
**Purpose:** Third benchmark output for the "Show Me the Model" economics slop detector

---

# Part I: Passage-Level Annotations

---

### Annotation 1: Comparative Advantage Doesn't Have an Expiration Date

**Severity:** Critical
**Issue type:** `MISSING_MECHANISM`

**Passage:**
> *Misunderstanding their own theory, economists presumed that abstract concepts like "the invisible hand" and "comparative advantage" would ensure that free trade enhanced the prospects and prosperity of all who participated. This may well have been true several hundred years ago, when international trade meant placing bales of wool on ships and sending them abroad, receiving cases of wine in return. But in the modern global economy, where capital is mobile and large imbalances can persist indefinitely, free trade has meant in practice the hollowing out of American industry, the loss of millions of jobs, and the accumulation of trillions in debt.*

**Explanation:**

The essay claims that comparative advantage — the principle that countries benefit from specializing in what they're relatively good at and trading for the rest — worked in the age of wool and wine but doesn't apply in the modern economy with mobile capital. This is a fundamental misunderstanding of what comparative advantage actually says.

Comparative advantage is about *relative* productivity, not absolute productivity. Even if one country is better at producing everything, both countries benefit from trading if they specialize in what they're *relatively* best at. This logic doesn't depend on what's being traded — wool, wine, semiconductors, software — and it doesn't depend on whether capital is mobile or immobile. The theorem is a mathematical result about the gains from specialization, and it holds as long as countries differ in their relative productivities across goods.

Capital mobility actually *strengthens* the case for trade in most models, because it allows capital to flow to where it's most productive, increasing total output. The essay asserts that capital mobility breaks comparative advantage but doesn't explain the mechanism by which it does so. Why would the ability to move capital across borders eliminate the gains from countries specializing in what they're relatively good at?

The sentence also asserts as established fact that free trade has "hollowed out American industry, lost millions of jobs, and accumulated trillions in debt." This is a massive empirical claim presented without evidence, and it doesn't survive scrutiny. US manufacturing *output* is near all-time highs — American factories produce more than ever, just with fewer workers, because of automation and productivity growth. Manufacturing *employment* has been declining as a share of total employment since the 1960s, in every developed economy including those running trade surpluses (Germany, Japan, South Korea). This is primarily a story about technology, not trade. And the "trillions in debt" framing confuses the trade deficit with the fiscal deficit — the national debt is accumulated by government spending exceeding tax revenue, not by importing goods. Attributing all of these trends to "free trade" is the same SUTVA error we see in the Pettis essay: tracing what happened in the most visible import-competing sectors while ignoring the expanding sectors that absorbed the reallocation, and conflating correlation (these things happened during a period of trade liberalization) with causation.

The essay is also conflating two different claims: (1) free trade is beneficial in general, and (2) every specific outcome of the current trade regime is optimal. You can accept (1) while questioning (2) — for instance, by arguing that China's non-market practices create distortions that should be addressed. But Cass goes further and rejects the underlying principle itself, which requires a much stronger argument than he provides.

---

### Annotation 2: The Trade Deficit Isn't "Mortgaging the Future" — It's the Flip Side of Capital Inflows

**Severity:** Critical
**Issue type:** `IDENTITY_VIOLATION`, `EXOG_ENDO_CONFUSION`

**Passage:**
> *America's enormous trade deficits are a double disaster for the nation. First, they represent a mortgaging of the future, as we pay for our consumption of goods and services produced abroad by sending back our assets: ownership of our corporations and real estate and bonds that promise future payments.*

**Explanation:**

The essay frames the trade deficit as Americans selling off their patrimony to fund a consumption binge. This gets the economics substantially wrong in several ways.

The balance of payments identity tells us that a trade deficit is *exactly equal* to net capital inflows. When the US runs a trade deficit, foreigners are investing in the US — buying stocks, bonds, real estate, and building factories. The essay treats this as "mortgaging the future," but that framing depends entirely on what the capital inflows fund. If foreign investment funds productive capacity — new factories, R&D, infrastructure — then it's building the future, not mortgaging it. This is precisely what happened during the 19th century, which the Pettis essay (and Cass elsewhere) acknowledges was beneficial.

Moreover, the framing implies that the US is passively selling assets to fund consumption. But in many cases, the causation runs the other direction: foreigners *want* to invest in the US because it has deep, liquid financial markets, strong property rights, and attractive investment opportunities. The capital inflows come first, and the trade deficit follows as a matter of accounting. The US doesn't run a trade deficit because Americans are profligate; it runs a trade deficit in large part because the US is an attractive place to invest. In fact, the US is one of the world's biggest destinations for foreign direct investment.

The essay also ignores that "sending back our assets" is not a one-way street. Americans own enormous quantities of foreign assets too. The relevant measure is the *net* international investment position, and even that doesn't tell you whether the arrangement is good or bad — only whether, on net, foreigners own more US assets than Americans own foreign ones.

---

### Annotation 3: Tariffs Can't Close the Trade Deficit Because They Don't Change S − I

**Severity:** Critical
**Issue type:** `IDENTITY_VIOLATION`, `MISSING_MECHANISM`

**Passage:**
> *Establish a uniform Global Tariff on all imports, set initially at 10% and adjusted automatically each year based on the trade deficit. After any year when the trade deficit has persisted, the tariff would increase by five percentage points for the following year.*

And:

> *The first and best option is for the United States to make imports relatively less attractive than domestic products by imposing a Global Tariff that rises until the trade deficit is eliminated.*

**Explanation:**

This is the proposal's most consequential error: the belief that tariffs can eliminate the trade deficit by making imports more expensive. The mechanism sounds intuitive — tax imports, people buy fewer imports, deficit shrinks — but it doesn't survive contact with basic macroeconomic accounting.

The trade balance is governed by the identity: current account ≈ national saving − investment (CA ≈ S − I). For the trade deficit to shrink, either saving must rise or investment must fall (or both). Tariffs don't directly change either one. They change the *composition* of trade — what you import and export — but not the *balance*, unless they happen to shift saving or investment.

In fact, the most likely macroeconomic effect of a broad tariff is to appreciate the real exchange rate (the dollar strengthens or domestic prices rise), which makes exports less competitive and partially offsets the reduction in imports. This is a well-established result in international macro and has been observed in practice: the Trump-era tariffs did not reduce the overall trade deficit.

It's important to distinguish between *bilateral* and *aggregate* trade deficits here. There is some quantitative and empirical evidence that targeted tariffs can reduce the bilateral trade deficit with a specific country. The US-China case is instructive: the Chinese share of total US imports has fallen back roughly to its level before China's WTO accession. But this didn't shrink the *aggregate* US trade deficit — it reshuffled it from China to Vietnam, Mexico, and other countries. The total deficit barely budged. This is exactly what the S − I framework predicts: the aggregate deficit is determined by macro fundamentals, not by the tariff structure. Tariffs targeted at one country just reroute trade through other countries, and an across-the-board tariff triggers the exchange rate offset described above. Neither changes the underlying saving-investment gap.

The automatic escalation mechanism makes this worse. If the tariff fails to close the deficit (because it can't, for the reasons above), it ratchets up by 5 percentage points every year. After a decade of persistent deficits, you'd have a 60% across-the-board tariff. After two decades, 110%. The mechanism has no natural stopping point short of autarky — which *would* eliminate the trade deficit, by eliminating trade altogether.

**Dig Deeper:** The S − I identity isn't just an accounting curiosity — it reflects the fundamental constraint. If Americans collectively save less than they invest, the difference must be financed by borrowing from abroad, which *is* the trade deficit. Unless tariffs cause Americans to save more (they don't — by raising prices, they likely reduce real income and saving) or invest less (possible, but that defeats the stated goal of boosting domestic industry), the deficit won't budge. The composition of trade shifts — maybe fewer imported consumer goods, more imported intermediates or capital goods — but the aggregate gap persists. Economists call this the "macroeconomic determination of the trade balance," and it's one of the most robust results in international economics.

---

### Annotation 4: Trade Deficits Don't Create a "Shortfall in Demand" — Resources Reallocate

**Severity:** Critical
**Issue type:** `PARTIAL_EQUILIBRIUM`, `SUTVA_VIOLATION`

**Passage:**
> *Second, they represent a shortfall in demand for American industry, because other nations are not increasing what they buy from America as quickly as American consumers have shifted their own purchasing abroad. This shortfall has reduced domestic business investment, weakened supply chains, and transferred our technical know-how to other nations.*

**Explanation:**

The essay claims that trade deficits create a "shortfall in demand" for American industry, as if spending that goes to imports simply vanishes from the domestic economy. This is a partial-equilibrium error that ignores the general-equilibrium reallocation.

When American consumers buy imported goods instead of domestic ones, two things happen simultaneously. First, spending shifts away from the domestic import-competing sector (e.g., apparel manufacturing). Second, the dollars spent on imports flow back to the US as capital inflows (this is the balance of payments identity) and fund investment, or the consumers who saved money on cheaper imports spend their savings on other domestically produced goods and services.

The economy doesn't experience a net "shortfall in demand." It experiences a *reallocation* of demand — away from tradeable goods where foreign producers have a cost advantage, and toward non-tradeable services and other sectors where domestic producers have an advantage. Total domestic output doesn't fall; its composition changes.

This is the same error identified in the Pettis essay (Annotation 4), and the empirical evidence is the same: the China shock literature finds localized harm in directly competing sectors but positive or neutral aggregate effects, with expanding non-tradeable and less-exposed sectors absorbing the reallocation.

The claim that deficits have "reduced domestic business investment" is particularly puzzling given that, as noted in Annotation 2, US investment rates are *positively* correlated with current account deficits. Capital inflows bring investable funds, and cheaper imported capital goods lower the cost of investing.

---

### Annotation 5: The Services Blind Spot

**Severity:** Moderate
**Issue type:** `COMPOSITION_FALLACY`, `MISSING_MECHANISM`

**Passage:**
> *At the outset of globalization, the United States ran a $60 billion trade surplus in advanced technology surplus. Thirty years later it ran a deficit approaching $200 billion.*

And:

> *Globalization severed the bond between capital and labor, so that growth and profit no longer depended on investment in a domestic workforce. Shareholders in multinational corporations saw their wealth skyrocket while workers saw their wages stagnate. Entire industries shifted overseas, decimating communities, reducing productive capacity, and slowing innovation.*

**Explanation:**

The essay presents the swing from surplus to deficit in advanced technology *goods* as evidence that the US has lost its technological edge. But it measures only goods trade, ignoring the enormous and growing US surplus in services — particularly the high-value technology-intensive services (software, cloud computing, R&D, financial services, intellectual property licensing) that represent exactly the kind of advanced, high-productivity activity the essay claims to value.

The US runs a services trade surplus of roughly $250–300 billion per year. A large and growing share of this is in precisely the sectors — technology, finance, professional services — that drive productivity growth and innovation. When you include services, the picture of American competitiveness looks very different from the one the essay paints.

This omission matters because it distorts the diagnosis. The US hasn't "lost" its advanced technology capacity — it has shifted the form in which it delivers that capacity. Apple designs iPhones in California and captures most of the profit, while assembly happens in China. In the goods trade statistics, this shows up as a US deficit (importing assembled phones). In reality, the high-value work — design, software, marketing — happens in the US. The essay's exclusive focus on goods trade mistakes a change in the *form* of American production for a decline in its *substance*.

This point goes deeper than just the services surplus. Much of US goods trade — both exports and imports — has a large amount of US services-sector value added embedded in it. When the US imports an iPhone from China, it's re-importing a lot of value originally created by American workers: the design itself, the software, and many of the more sophisticated components. Research by Johnson and Noguera and others on value-added trade shows that services are far more exposed to international trade than they appear in the gross trade statistics, precisely because their value is embedded in goods that cross borders. When you measure the US-China trade deficit in value-added terms — counting only the value actually created in each country — it's substantially smaller than the headline gross trade figures suggest. The standard trade statistics that the essay relies on dramatically overstate how much of the value in imported goods is actually foreign.

---

### Annotation 6: "Only Balanced Trade Is Mutually Beneficial" Is an Argument for Autarky

**Severity:** Critical
**Issue type:** `INTERNAL_CONTRADICTION`, `MISSING_MECHANISM`

**Passage:**
> *Policymakers should welcome international trade only if it is balanced, exchanging goods and services produced here for those produced abroad. Such reciprocal trade is mutually beneficial, maintains domestic industrial capacity, and ensures in turn a balance in capital flows.*

And:

> *For trade to work, it must be balanced: goods and services produced by foreign workers for America exchanged for ones made by American workers for the world.*

**Explanation:**

The claim that "only balanced trade is mutually beneficial" is one of the strongest assertions in the essay and one of the least defensible. Taken at face value, it implies that any trade deficit — regardless of size, cause, or context — is harmful. But this leads to absurd conclusions.

Consider: is it harmful for a young household to borrow money (running a "deficit" with the bank) to buy a house? The household is "mortgaging its future" and "sending back assets" — a promise of future payments — in exchange for current consumption of housing services. In the Cass framework, this is only beneficial if the borrowing and lending are perfectly balanced each period. But that would eliminate all borrowing and lending, which would make almost everyone worse off.

Countries, like households, have good reasons to borrow and lend across time. A country with abundant investment opportunities and scarce domestic saving benefits from importing capital (running a trade deficit). A country with aging demographics and abundant saving benefits from exporting capital (running a surplus). Insisting on balance in every period eliminates these gains from *intertemporal* trade, which are just as real as gains from trade in goods.

It's also worth flagging a related fallacy that, while not explicit in this essay, underpins much of the broader policy movement Cass is part of — including the "Liberation Day" tariff formula, which computed tariff rates based on *bilateral* trade deficits with individual countries. The idea that each bilateral trade relationship should be individually balanced is the equivalent of insisting that you should have balanced trade with your grocery store. You run a trade deficit with your grocery store (you buy food, they don't buy anything from you) and a trade surplus with your employer (they pay you a salary, you don't buy anything from them). It would be absurdly inefficient to require balance in each relationship — working as a bagger at the grocery store to pay for your groceries, and having your employer give you Spanish lessons to offset your salary. The entire point of a market economy, domestic or international, is that multilateral exchange through money allows each party to specialize and trade with *different* partners on each side. "Triangle trade" — where A sells to B, B sells to C, and C sells to A — is a feature of a well-functioning trading system, not a bug.

Moreover, this principle, combined with the escalating tariff mechanism in Annotation 3, creates an internal contradiction. If the tariff doesn't close the deficit (because tariffs don't change S − I), and the tariff keeps escalating, the logical endpoint is tariffs so high that trade ceases altogether. At that point, trade is "balanced" — at zero. The essay explicitly says "this doesn't mean closing our borders to trade," but the mechanism it proposes has no other stable equilibrium if the underlying saving-investment gap persists.

---

### Annotation 7: The Empirical Evidence from Tariff Episodes Contradicts the Proposal

**Severity:** Moderate
**Issue type:** `PARTIAL_EQUILIBRIUM`

**Passage:**
> *Policymakers have tools such as tariffs to do this — they only need the will.*

**Explanation:**

The essay treats the effectiveness of tariffs in boosting domestic manufacturing as self-evident — the only obstacle is political will. But the empirical evidence from recent tariff episodes tells a different story.

The tariffs imposed during the 2018–2019 US-China trade war have been extensively studied. The findings are remarkably consistent across studies: the tariffs raised consumer prices, reduced trade volumes, and invited retaliatory tariffs from trading partners. Critically, they did *not* increase manufacturing employment or output in the aggregate. Some protected sectors saw modest gains, but these were offset by losses in downstream sectors that used the now-more-expensive imports as inputs, and by losses in export-oriented sectors hit by retaliation.

This pattern is consistent with the theory outlined in Annotation 3: tariffs change the composition of production but don't boost aggregate manufacturing, because they raise input costs for some firms as much as they provide protection for others. The tariff on imported steel, for example, helped US steelmakers but hurt every US manufacturer that uses steel — automakers, appliance manufacturers, construction companies — because their input costs rose.

The essay's confidence that tariffs only need "political will" to be effective ignores this evidence. A rigorous policy proposal would need to explain why a 10% across-the-board tariff, escalating annually, would produce different results from the tariffs already tried and found wanting.

---

### Annotation 8: What the Essay Gets Right

**Severity:** N/A (Positive)
**Issue type:** N/A

**Passages:** Various

**Explanation:**

The essay raises several legitimate concerns that deserve serious engagement rather than dismissal:

*Concentrated losses from trade.* The China shock did cause real, lasting damage to specific communities and workers. The essay is right that economists were too slow to acknowledge and address these adjustment costs. The problem is that the essay treats these localized harms as evidence that trade is bad for the economy as a whole, which the evidence doesn't support.

*China's non-market practices.* The concern about trading with a country that subsidizes industries, manipulates its currency, steals intellectual property, and uses state power to distort markets is legitimate and widely shared across the political spectrum. Targeted measures to address these specific distortions are very different from an across-the-board tariff on all imports from all countries.

*The importance of industrial capacity for national security.* The argument that some domestic manufacturing capacity is strategically necessary — for defense, critical supply chains, and technological sovereignty — has merit. But this argument supports targeted industrial policy for specific strategic sectors, not a blanket tariff designed to eliminate the entire trade deficit.

*The political economy critique.* The observation that the gains from trade have been unevenly distributed, while the losers received inadequate support, is a fair critique of how trade liberalization was managed in practice. The appropriate response, however, is better redistribution and adjustment assistance — not reversing the trade that creates the gains.

The essay's core error is not in identifying these problems but in prescribing a solution (blanket tariffs to eliminate the trade deficit) that wouldn't fix any of them and would create new problems of its own.

---

# Part II: Synthesis Report

---

## Central Claim

The essay argues that globalization has undermined American capitalism by severing the link between capital and labor, hollowing out domestic industry, and transferring wealth and know-how abroad. It proposes a 10% across-the-board tariff on all imports, escalating by 5 percentage points annually until the trade deficit is eliminated, as the primary tool to reverse these trends and restore "productive markets."

## Key Assumptions Inventory

| # | Assumption | Stated or Unstated? | Plausible? |
|---|-----------|---------------------|------------|
| 1 | Comparative advantage doesn't apply in the modern economy with mobile capital | Stated | Incorrect — comparative advantage is about relative productivity, which capital mobility doesn't eliminate |
| 2 | Trade deficits represent a "mortgaging of the future" through asset sales | Stated | Misleading — capital inflows fund investment as well as consumption; the effect depends on how inflows are used |
| 3 | Tariffs can eliminate the trade deficit by making imports less attractive | Stated | Incorrect — the trade balance is determined by S − I; tariffs change trade composition but not the aggregate balance |
| 4 | Trade deficits create a net "shortfall in demand" for domestic industry | Stated | Incorrect — resources reallocate to non-tradeable and other sectors; the China shock evidence shows aggregate effects are neutral to positive |
| 5 | Only balanced trade is mutually beneficial | Stated | Incorrect — intertemporal trade (borrowing/lending across countries) creates real welfare gains, just as borrowing to buy a house does |
| 6 | The US has lost its technological edge due to trade | Stated | Misleading — this is measured only in goods; the US runs a $250B+ services surplus in precisely the advanced technology-intensive sectors the essay values |
| 7 | Tariffs would boost domestic manufacturing if policymakers had the "will" | Stated | Contradicted by the empirical evidence from the 2018–2019 tariff episodes, which did not increase aggregate manufacturing employment |

## Internal Consistency Check

The proposal has several significant internal tensions:

**The S − I problem.** The entire proposal rests on the assumption that tariffs can close the trade deficit. But the trade deficit is determined by the gap between national saving and investment. Unless the tariff changes one or both of these — and there's no mechanism in the proposal by which it would — the deficit persists and the tariff escalates indefinitely. The proposal's logic leads to autarky, which contradicts its stated goal of maintaining trade.

**The investment paradox.** The essay aims to boost domestic investment and industrial capacity. But the trade deficit *is* capital inflows — foreign money funding US investment. Eliminating the trade deficit means eliminating net capital inflows, which means *less* capital available for the domestic investment the essay wants to increase. You can have more foreign investment or a smaller trade deficit, but not both simultaneously — the balance of payments identity doesn't allow it.

**The intermediate inputs problem.** The proposal would impose a 10%+ tariff on *all* imports, including the intermediate inputs, capital goods, and raw materials that American manufacturers use. This would raise production costs for domestic manufacturers, making them *less* competitive — the opposite of the stated goal. The essay frames imports as competing with domestic production, but a large share of imports are *inputs to* domestic production.

**The 19th century comparison.** Both this essay and the broader American Compass framework acknowledge that 19th-century trade deficits were beneficial because they funded productive investment. Today's US economy also has abundant investment opportunities (technology, energy transition, infrastructure). The essay doesn't explain what structural difference makes today's capital inflows harmful when 19th-century capital inflows were beneficial — it simply asserts the difference.

**The escalation mechanism.** The proposal includes an automatic escalator: +5pp/year if the deficit persists. Since tariffs don't change S − I, the deficit is likely to persist, and the tariff ratchets up without bound. At some point, prohibitively high tariffs would indeed eliminate imports — and with them, the imported inputs that American manufacturers depend on. The proposal has no safety valve, no sunset clause, and no mechanism to distinguish between "deficit persists because the tariff isn't working" and "deficit persists because the S − I gap hasn't changed."

## What a Rigorous Version Would Look Like

A rigorous version of this policy agenda would need to:

**1. Engage with the S − I identity.** The most fundamental question any deficit-reduction proposal must answer is: what happens to saving and investment? If you want a smaller trade deficit, you need Americans to save more, invest less, or both. Tariffs don't directly accomplish either. A rigorous proposal might instead target the fiscal deficit (the government's contribution to S − I), incentivize private saving, or address the structural reasons why the US absorbs so much foreign capital.

**2. Distinguish between types of imports.** Consumer goods, intermediate inputs, and capital goods have very different implications for the domestic economy. A policy that makes imported steel or semiconductors more expensive hurts American manufacturers. A rigorous proposal would at minimum exempt intermediate inputs and capital goods, or explain why the benefit of protecting import-competing sectors outweighs the cost to downstream producers.

**3. Engage with the empirical evidence on tariffs.** The 2018–2019 tariffs are the most direct natural experiment available. A rigorous proposal would need to explain why an across-the-board tariff would produce different results from these sector-specific tariffs — particularly given that the across-the-board version would also raise input costs for every domestic manufacturer.

**4. Address services trade.** The US runs an enormous services surplus. A goods-focused analysis of American competitiveness ignores the sectors where the US actually has its strongest comparative advantage. A rigorous analysis would explain why manufacturing jobs are more valuable than services jobs, and why the US should shift resources from sectors where it has a comparative advantage (services) to ones where it doesn't (many categories of manufactured goods).

**5. Specify the counterfactual.** What does the US economy look like after the trade deficit hits zero? If the mechanism is tariffs escalating until trade collapses, the result is higher prices for consumers, higher input costs for manufacturers, disrupted supply chains, and retaliation from trading partners. A rigorous proposal would model the full general-equilibrium effects of its policy — not just the direct effect on import-competing sectors, but the effects on export sectors, downstream manufacturers, consumers, and the exchange rate.

**6. Consider targeted alternatives.** The legitimate concerns in the essay — China's non-market practices, adjustment costs for displaced workers, strategic industrial capacity — have targeted policy responses: countervailing duties against subsidized imports, trade adjustment assistance for displaced workers, industrial policy for defense-critical sectors. These address the real problems without the collateral damage of a blanket tariff on all imports from all countries.

## Bottom Line

The proposal correctly identifies several real problems — concentrated losses from trade in specific communities, China's non-market practices, inadequate adjustment assistance for displaced workers — but prescribes a solution that wouldn't fix any of them and would create substantial new costs. The central mechanism — an escalating tariff to eliminate the trade deficit — fails on its own terms because tariffs don't change the saving-investment gap that determines the trade balance. The empirical evidence from recent tariff episodes confirms this: tariffs change the composition of trade but don't shrink the deficit, and they raise costs for domestic manufacturers who rely on imported inputs.

The deeper analytical error is treating the trade deficit as a standalone problem that can be fixed with trade policy, when it's actually a macroeconomic phenomenon reflecting the gap between national saving and investment. Addressing the trade deficit requires addressing *that* gap — through fiscal policy, saving incentives, or other macro instruments — not through tariffs that change what gets traded without changing how much.

The proposal's legitimate concerns — about China, about adjustment costs, about strategic industrial capacity — deserve serious policy responses. But those responses look like targeted countervailing duties, robust adjustment assistance, and strategic industrial policy — not an across-the-board tariff on all imports from all countries that escalates without bound until trade ceases.
