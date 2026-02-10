---
description: Agent Teams pre-meeting research sprint. Spawns researchers for parallel investigation. CLI only.
allowed-tools: Bash, Read, Write, Grep, Glob, WebFetch, WebSearch
---

# /team:research - Pre-Meeting Research Sprint

Spawn an agent team to research topics before a C-suite meeting. Populates executive knowledge bases with fresh data so meetings start informed.

**Arguments:** `$ARGUMENTS` (meeting type + topic, e.g. `exec Q2戦略`, `product 内見予約フロー`, `tech リアルタイム通知`)

## Prerequisites

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be set
- Interactive CLI session

## When to Use

- Before `/meeting:exec` -- research market trends, competitor moves, industry data
- Before `/meeting:product` -- research user feedback, competitor UX, market needs
- Before `/meeting:tech` -- research technology options, architecture patterns, benchmarks
- Before `/meeting:gtm` -- research channels, marketing tactics, competitor positioning
- Before `/meeting:architecture` -- research design patterns, scalability approaches
- Before `/meeting:tools` -- research tool options, comparisons, pricing

## Phase 1: Research Brief

Parse `$ARGUMENTS` to determine:

1. **Target meeting type** (exec / product / tech / gtm / architecture / tools)
2. **Research topic(s)**

Based on meeting type, determine research team composition:

| Meeting Type | Researchers                     | Knowledge Bases to Populate |
| ------------ | ------------------------------- | --------------------------- |
| exec         | market, user, tech, competitive | CEO, CPO, CTO, CMO          |
| product      | user, competitive, market       | CPO, CMO                    |
| tech         | tech, architecture, tools       | CTO, CAIO                   |
| gtm          | competitive, channels, market   | CMO, CEO                    |
| architecture | tech, architecture, patterns    | CTO, CAIO                   |
| tools        | tools, benchmarks, pricing      | CTO, CAIO                   |

## Phase 2: Spawn Research Team

Create an agent team with researchers matched to the meeting type. Use **delegate mode**.

### For `exec` meetings (4 researchers):

```
Create an agent team for pre-meeting research.
Topic: {topic}. This feeds into a /meeting:exec.
Spawn 4 researcher teammates. Use delegate mode.

1. Teammate "market-researcher":
   Research market trends, industry benchmarks, funding landscape
   related to {topic}.
   Use WebSearch for current data (2025-2026).
   Focus on: Japanese real estate tech, proptech trends, C2C platforms.
   Save findings to: docs/team/ceo/knowledge/YYYY-MM-DD-research-{slug}.md

2. Teammate "user-researcher":
   Research user behavior, UX patterns, customer feedback
   related to {topic}.
   Read existing personas: docs/team/personas/
   Read existing requirements: docs/requirements/
   Save findings to: docs/team/cpo/knowledge/YYYY-MM-DD-research-{slug}.md

3. Teammate "tech-researcher":
   Research technical approaches, libraries, architecture patterns
   for {topic}.
   Compare options with pros/cons, consider our stack (Next.js/Bun/TypeScript).
   Save findings to: docs/team/cto/knowledge/YYYY-MM-DD-research-{slug}.md

4. Teammate "competitive-researcher":
   Research competitor products, their approaches to {topic}.
   Focus on: Japanese market (ジモティー, メルカリ), global (Airbnb, Zillow).
   Analyze strengths, weaknesses, opportunities for tsumugi.
   Save findings to: docs/team/cmo/knowledge/YYYY-MM-DD-research-{slug}.md

Share relevant findings with each other during research.
A market trend might affect technical feasibility, and vice versa.
```

### For `product` meetings (3 researchers):

```
Spawn 3 researcher teammates:

1. Teammate "user-researcher":
   Deep dive into user needs, pain points, and behavior patterns for {topic}.
   Read personas: docs/team/personas/
   Read past meeting notes: docs/requirements/meetings/
   Save to: docs/team/cpo/knowledge/YYYY-MM-DD-research-{slug}.md

2. Teammate "competitive-researcher":
   How do competitors handle {topic}? UX patterns, feature comparison.
   Save to: docs/team/cmo/knowledge/YYYY-MM-DD-research-{slug}.md

3. Teammate "market-researcher":
   Market size, demand signals, pricing benchmarks for {topic}.
   Save to: docs/team/ceo/knowledge/YYYY-MM-DD-research-{slug}.md
```

### For `tech` meetings (3 researchers):

```
Spawn 3 researcher teammates:

1. Teammate "tech-researcher":
   Research implementation approaches for {topic}.
   Compare libraries, frameworks, services. Benchmark performance.
   Consider our stack: Next.js 16, Bun, TypeScript, Tailwind, shadcn/ui.
   Save to: docs/team/cto/knowledge/YYYY-MM-DD-research-{slug}.md

2. Teammate "architecture-researcher":
   Research architecture patterns for {topic}.
   Scalability, maintainability, testing considerations.
   Read current design: docs/DESIGN_DOC.md
   Save to: docs/team/cto/knowledge/YYYY-MM-DD-research-{slug}-arch.md

3. Teammate "ai-researcher":
   Research AI/ML capabilities for {topic}.
   LLM APIs, embedding models, vector databases, automation patterns.
   Realistic assessment of what AI can/cannot do here.
   Save to: docs/team/caio/knowledge/YYYY-MM-DD-research-{slug}.md
```

### For `gtm` meetings (3 researchers):

```
Spawn 3 researcher teammates:

1. Teammate "competitive-researcher":
   Competitor positioning, messaging, channel strategy for {topic}.
   Save to: docs/team/cmo/knowledge/YYYY-MM-DD-research-{slug}.md

2. Teammate "channels-researcher":
   Marketing channels, CAC benchmarks, growth tactics for {topic}.
   Focus on: Japanese market, SNS (Twitter/X, Instagram, LINE), SEO, referral.
   Save to: docs/team/cmo/knowledge/YYYY-MM-DD-research-{slug}-channels.md

3. Teammate "market-researcher":
   Market sizing, target segments, demand validation for {topic}.
   Save to: docs/team/ceo/knowledge/YYYY-MM-DD-research-{slug}.md
```

## Researcher Output Format

Each researcher saves to their executive's knowledge folder:

```markdown
# Research: {topic}

**Date:** YYYY-MM-DD
**Researcher:** {role}
**For meeting:** /meeting:{type}

## Key Findings

1. **[Finding title]**
   [Details with data/evidence]
   Source: [URL or reference]

2. **[Finding title]**
   [Details with data/evidence]
   Source: [URL or reference]

## Implications for tsumugi

- [How this affects our strategy/product/tech]
- [Opportunities identified]
- [Risks to consider]

## Recommendations

- [Actionable recommendation for the meeting]

## Sources

- [URL 1]
- [URL 2]
```

## Phase 3: Research Brief Synthesis

After all researchers complete, the lead creates a unified brief:

```markdown
# Research Brief: {topic}

**Date:** YYYY-MM-DD
**For:** /meeting:{type}
**Researchers:** {list}

## Executive Summary

[2-3 sentence overview of key findings]

## Findings by Domain

### Market & Industry

[Key findings from market-researcher]

### User & Product

[Key findings from user-researcher]

### Technical

[Key findings from tech-researcher]

### Competitive Landscape

[Key findings from competitive-researcher]

## Cross-Cutting Insights

[Where findings from different domains connect or conflict]

## Suggested Meeting Agenda Points

1. [Informed by research -- most impactful topic first]
2. [...]
3. [...]

## Open Questions

[Questions that research couldn't fully answer -- bring to meeting]
```

Save brief to: `docs/research/YYYY-MM-DD-{topic-slug}.md`

## Phase 4: Cleanup

Dismiss the team after research is complete.

Print: "Research sprint complete. Knowledge bases updated. Run `/meeting:{type}` to start the meeting."

## Example Usage

```
/team:research exec 2026年Q1レビューとQ2戦略
/team:research product 内見予約フロー
/team:research tech リアルタイムマッチング通知
/team:research gtm ローンチキャンペーン
```

## Full Pipeline

```
/team:research {type} {topic}     -- Parallel research (Agent Teams)
  -> /meeting:{type}              -- C-suite decides (single session)
  -> /meeting:tasks               -- Decompose to tasks
  -> /team:dev                    -- Parallel implementation (Agent Teams)
  -> /team:review                 -- Parallel review (Agent Teams)
```
