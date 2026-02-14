# Quick Start Guide: First User Interview

> For: CFO | Task: sumitsugi-763 | Time Required: 30 min total (15 min interview + 15 min notes)

---

## Step 1: Find Your Interviewee (5 min)

**Ideal candidate:**

- Has moved within the last 1-2 years, OR
- Is planning to move soon
- Lives in Tokyo area (bonus if 世田谷区)
- Age 25-40 (primary target demographic)

**Where to find:**

- Personal network (friends, colleagues)
- LinkedIn/Facebook announcement
- Local community groups
- Co-working space members

**Invitation message template:**

```
こんにちは！

新しい引越しサービスを開発中で、ユーザーリサーチをしています。
引越し経験のある方に15分ほどお話を伺いたいのですが、
ご協力いただけませんか？

日時: [候補日時を3つ提示]
方法: オンライン（Zoom/Google Meet）または対面
謝礼: スターバックスカード ¥1,000

ご検討いただけますと幸いです！
```

---

## Step 2: Prepare for Interview (5 min before)

1. **Open template**: `docs/research/user-interviews/TEMPLATE-interview-notes.md`
2. **Copy to new file**: Save as `INT-001.md` (do not commit yet)
3. **Test recording** (if using): Get consent first
4. **Have ready**:
   - Note-taking app/paper
   - sumitsugi concept explanation (1-2 sentences)
   - Timer (set for 15 min)

**Concept explanation:**

```
sumitsugiは「住人の暮らしを引き継ぐ」プラットフォームです。
引越しする前の住人が、家具や家電をそのまま次の住人に引き継げるサービスで、
処分の手間とコストを削減し、物件と一緒に「暮らし」ごと譲渡できます。
```

---

## Step 3: Conduct Interview (15 min)

### Opening (1-2 min)

```
本日はお時間いただきありがとうございます。
これから15分ほど、引越しのご経験について伺わせてください。
録音させていただいてもよろしいでしょうか？（任意）
```

### Core Questions (必ず聞く)

**1. 背景 (2 min)**

- 「最近の引越しはいつ頃でしたか？」
- 「その時、家具や家電はどうされましたか？」

**2. 問題 (3 min)**

- 「引越しで最も大変だったことは何ですか？」
- 「不要な物の処分にかかった費用・時間はどれくらいですか？」
- 「もっと楽にできたら良かったと思うことは？」

**3. 既存解決策 (2 min)**

- 「ジモティーやメルカリを使いましたか？」
- 「（使った場合）良かった点、不満だった点は？」

**4. コンセプト提示 (3 min)**

- sumitsugiのコンセプトを説明
- 「このサービス、使いたいと思いますか？」
- 「懸念点はありますか？」

**5. 価格感 (2 min)**

- 「家具一式を引き継ぐとしたら、いくらまで払えますか？」
- 「または、いくらで譲りたいですか？」

**6. クロージング (1 min)**

- 「他に何かご意見はありますか？」
- 「貴重なお話ありがとうございました！」

---

## Step 4: Write Notes (15 min - within 24 hours)

**Immediately after interview:**

1. **Fill in template** (`INT-001.md`):
   - インタビュイーのプロフィール（匿名化）
   - 各質問への回答
   - 印象的な発言（引用）
   - 気づいたペインポイント

2. **Extract insights** (3-5 bullet points):
   - 最も重要な発見
   - 想定外の回答
   - プロダクトへの示唆

3. **Action items**:
   - 機能要件への反映
   - 価格戦略の修正
   - 次のインタビューでの追加質問

---

## Step 5: Share & Document (10 min)

1. **Create PR**:

   ```bash
   cd /home/runner/work/sumitsugi/sumitsugi
   bun run worktree:create docs/add-first-interview
   cd /workspace/.worktrees/docs/add-first-interview
   git add docs/research/user-interviews/INT-001.md
   git add docs/research/user-interviews/README.md
   git commit -m "docs: add first user interview (INT-001)"
   git push -u origin HEAD
   gh pr create --title "docs: add first user interview notes" --body "First user interview conducted as part of Phase 1 user validation (sumitsugi-763)"
   ```

2. **Update DASHBOARD.md**:
   - Add to "Recent Decisions" or "Notes"
   - Mark interview as completed

3. **Close task**:

   ```bash
   bd close sumitsugi-763
   ```

4. **Share insights**:
   - Create summary for team
   - Update product requirements if needed
   - Plan next interviews (INT-002, INT-003...)

---

## Tips for Good Interviews

✅ **Do:**

- Listen more than you talk (80/20 rule)
- Ask "why" to dig deeper
- Stay neutral (don't lead the witness)
- Take notes on exact phrases
- Ask for examples/stories

❌ **Don't:**

- Pitch the product (you're learning, not selling)
- Interrupt or finish their sentences
- Ask yes/no questions only
- Assume you know what they mean
- Skip the "why"

---

## Success Criteria

This interview is successful if you can answer:

1. ✅ Is furniture disposal a real pain point? (Yes/No + evidence)
2. ✅ What's the biggest friction in current solutions?
3. ✅ Does the "引き継ぐ" concept resonate?
4. ✅ What's the acceptable price range?
5. ✅ What features are must-haves vs nice-to-haves?

---

Good luck! 🎤
