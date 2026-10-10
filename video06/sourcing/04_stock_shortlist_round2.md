# Video 06 — Stock shortlist, round 2 (still unverified)

**Status: no clip can be approved yet.** Nothing has been opened, previewed, downloaded, licensed or provenance-checked.

- The session still cannot reach any stock library: the organisation network policy returns 403 for Pexels, Artlist, Adobe Stock, Getty, Shutterstock, Storyblocks and Pixabay. No API key is configured.
- All leads come from web-index search (titles, URLs, machine-written summaries).
- "Playable reference" below means the clip page on the provider's site, where the preview plays. I have not seen any of those previews.

Register: [`stock_leads_register.csv`](stock_leads_register.csv) — 45 leads. Round 2 added L31–L45 and updated L01–L07 and L30.

## What round 2 established

| Thread | Result |
|---|---|
| Getty "…, Delhi, India" series | **Most roles from one probable shoot.** Confirmed titles: tea with daughter (~14 s), breakfast (~18 s), Diwali with "senior woman" (~12 s), dancing (~21 s), combing hair (~11 s). No asset IDs or contributor surfaced. **No laptop/tablet clip** in the series. Only the Diwali title calls the mother senior. |
| Adobe "old mom in saree + young daughter, modern home" | **Best casting match.** The morning-coffee clip is confirmed as *video*, with its full title. No ID yet. Matching laptop / sofa / tea scenes exist only as **photos** (Shutterstock). The suspected producer is StockImageFactory (unconfirmed). |
| iStock "interested senior mother + adult daughter, web shopping on a laptop" | **Exact R5 action** plus an embrace (R6), confirmed on three iStock listing pages. Ethnicity is not stated; no gm ID yet. |
| Pexels / Pixabay | No older South Asian mother + adult daughter shoot is indexed. The Indian-family material (RDNE Diwali batch) is festive and has no confirmed grandmother. Pixabay warns some results are AI-generated or animated. |
| Artlist | No South Asian casting surfaced. Only off-casting fallbacks (L43–L45). |

**Excluded as AI-generated** (labelled in titles or summaries):
- Adobe 558084142 ("created using Generative AI technology")
- Adobe 1325020252 ("ai generated")
- Adobe "Happy young indian daughters hug retired senior mother at home" (summary: "AI illustration")

## Proposed edit with scene timings (24 fps)

Use this table to verify and approve; it is not a selection. Frame ranges match the built composition (`remotion/src/video06/constants.ts`). "Handle" is the minimum usable source length needed around the cut.

| Panel | Frames | Screen time | Role | First choice to verify | Alternate | Handle / framing notes |
|---|---|---|---|---|---|---|
| 01 | 0–48 | 2.0 s | R1 daughter on laptop | **Gap.** Needs the R5 family's own laptop coverage | L44 Artlist 463567 (off-casting) | ≥ 4 s steady; screen visible enough to corner-pin; 9:16 crop must keep hands and screen |
| 02 | 48–96 | 2.0 s | R2 pause close-up | Punch-in on the R1 clip's reaction moment (same actor) | — | Needs 4K source for a ~1.6× punch-in |
| 03 | 96–144 | 2.0 s | R3 everyday activity | L37 Getty Delhi breakfast (~18 s) | L17 iStock senior Indian woman stirring rice | ≥ 3 s with motivated hand action for the matched cut |
| 04 | 144–216 | 3 × 1.0 s | R3/R4 montage | L04 tea (~14 s) · L39 combing hair (~11 s) · L03 Diwali (~12 s, only if non-festive section exists) | L35 Pexels rangoli | 1 s each; pick frames where action peaks on the cut |
| 05 | 216–288 | 3.0 s | R4 comfort | L04 Getty Delhi tea (~14 s) | L02 Adobe morning coffee (saree) | Slow, intimate; ≥ 4 s |
| 06 | 288–352 + push to 388 | 2.7 s + 1.5 s | **R5 anchor** | L06/L07 iStock senior mother + adult daughter on laptop | L33 Pexels 8097529 (check ages) · L15 Getty 1288836033 (tablet; wrong casting, $499 per summary) | Laptop screen must be trackable for the corner-pin and push-in. Needs ≥ 5 s |
| 11 | 664–708 | 1.8 s | R6 closing | L38 Getty Delhi dancing (~21 s) or L02 morning coffee | L07 iStock embrace · L32 Pexels smile | Natural light; genuine, not to-camera if possible |

There are **two coherent routes**, and they depend on what manual checks find:

- **Route A — one Indian family (preferred):** the Getty Delhi series for R3/R4/R6. **Risk:** it has no laptop/tablet clip and no R1/R2. Without them the anchor must come from elsewhere, which breaks the single-family rule.
- **Route B — one exact-action family:** the iStock senior mother + adult daughter laptop shoot for R5 and R6. Its R1/R2/R3 may come from the same session. **Risk:** casting may not be South Asian. Use it only if the casting direction allows.

If neither shoot has the laptop coverage, the honest options are:

1. a commissioned 1-day shoot with one family; or
2. relaxing the casting direction.

Generated footage is not an option.

## Licensing notes (library level — confirm per clip at checkout)

| Library | Model | Notes |
|---|---|---|
| Getty Images / iStock | Royalty-free per clip (Getty) or credits (iStock) | Getty 1288836033 showed $499 in a search summary. Check *sensitive-use* rules: a health-device ad must not imply a model has a medical condition without the provider's required disclosure. |
| Adobe Stock | Per clip, Standard/Extended, or credits | Reject anything labelled "Generated with AI". |
| Shutterstock | Per clip or subscription | The saree series found so far is photos only. |
| Artlist | Footage subscription | Free accounts are watermark-only (summary). |
| Pexels | Pexels licence: free, commercial use, no attribution | Identifiable people must not be shown in a bad light; no implied endorsement. |

Nothing has been purchased. Each purchase needs your approval.

## What unblocks approval

Either option works:

1. Open the listing pages in the register (threads A and B first) in a normal browser and send back the asset IDs worth keeping. **Or:**
2. Allow the chosen library's site, API and media domains in the environment's network settings, and add its API key as an environment secret.

With access I can pull preview frames and metadata and present real extracted frames for approval.
