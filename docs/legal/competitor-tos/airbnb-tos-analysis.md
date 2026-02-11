# Airbnb 利用規約分析 — tsumugi ToS への示唆

**作成日:** 2026-02-11
**分析対象:** Airbnb Terms of Service（2025年2月6日発効、2025年4月17日既存ユーザー適用）
**目的:** tsumugi 利用規約ドラフト（v0.1）の改善に向けた、Airbnb規約の参考条項メモ
**参照元:**

- [Airbnb Terms of Service（英語）](https://www.airbnb.com/help/article/2908)
- [Airbnb サービス利用規約（日本語PDF）](https://assets.airbnb.com/help/Terms_of_Service_for_Users_Outside_of_the_EEA_UK_and_Australia_-_Japanese.pdf)
- [Airbnb Terms of Service 分析（Ts&Zzz）](https://tsandzzz.com/airbnb-terms-of-service)
- [Airbnb Payments Terms of Service](https://www.airbnb.com/help/article/2909)
- [Airbnb Host Damage Protection Terms](https://www.airbnb.com/help/article/2869)
- [Airbnb サービス手数料](https://www.airbnb.com/help/article/1857)

---

## 目次

1. [プラットフォーム免責](#1-プラットフォーム免責)
2. [ホスト・ゲスト間の関係](#2-ホストゲスト間の関係)
3. [紛争解決メカニズム](#3-紛争解決メカニズム)
4. [手数料構造](#4-手数料構造)
5. [保証・保険プログラム（AirCover）](#5-保証保険プログラムaircover)
6. [キャンセルポリシー](#6-キャンセルポリシー)
7. [禁止事項](#7-禁止事項)
8. [tsumugiへの示唆](#8-tsumugiへの示唆)

---

## 1. プラットフォーム免責

### 1.1 Airbnbの立場：「プラットフォーム提供者」であり取引当事者ではない

Airbnb規約 Section 1.2 において、Airbnbは自社の立場を明確に定義している。

> "The Airbnb Platform is an online marketplace that enables registered users ('Members') and certain third parties who offer services [...] to publish such Host Services on the Airbnb Platform ('Listings') and to communicate and transact directly with Members that are seeking to book such Host Services."

さらに以下のように明記している。

> "As the provider of the Airbnb Platform, Airbnb does not own, create, sell, resell, provide, control, manage, offer, deliver, or supply any Listings or Host Services, nor is Airbnb an organiser or retailer."

つまり Airbnb は以下であると明確に否定している：

- 不動産仲介業者 (real estate intermediary)
- 旅行会社 (travel company)
- 保険会社 (insurance company)

**Airbnbが担う唯一の代理機能:** Airbnb Payments が「支払い回収代理人（payment collection agent）」として機能する場合のみ。

### 1.2 保証の否認（Disclaimer of Warranties）— Section 18

> "Airbnb does not endorse or warrant the existence, conduct, performance, safety, quality, legality or suitability of any Guest, Host, Host Service, Listing or third party."

> "Airbnb does not warrant that verification, identity or background checks conducted on Listings or Members will identify past misconduct or prevent future misconduct."

これにより、Airbnbは以下について一切の保証を行わない：

- リスティングの正確性・品質
- ホスト・ゲストの身元確認の完全性
- プラットフォームの中断なき運用

### 1.3 責任制限（Limitations on Liability）— Section 19

Airbnbの損害賠償責任には明確な上限が設けられている。

| 対象者 | 責任上限額                             |
| ------ | -------------------------------------- |
| ゲスト | 過去12か月間にゲストとして支払った金額 |
| ホスト | 過去12か月間にホストとして受領した金額 |
| その他 | 100米ドル（US$100）                    |

さらに、以下の損害については一切責任を負わないと明記：

- 付随的損害、特別損害、懲罰的損害、結果的損害
- 逸失利益、データ損失、信用の喪失
- サービス中断、コンピュータ故障
- 人身傷害・精神的苦痛に関する損害

> "These limitations [...] are fundamental elements of the agreement between you and Airbnb."

### tsumugiとの比較

tsumugi規約ドラフト第10条では「プラットフォーム手数料相当額を上限」としているが、Airbnbのように過去12か月の取引額を上限とするアプローチのほうが、取引規模に応じた柔軟な上限設定となる。ただし、tsumugiは基本的に1回限りの取引が中心であるため、「当該取引のプラットフォーム手数料相当額」という現行の上限設定も合理的。

---

## 2. ホスト・ゲスト間の関係

### 2.1 直接契約関係の明確化 — Section 2.2, 5.2

Airbnb規約では、ホストとゲストの間に直接的な契約関係が成立することを明確にしている。

> "When you receive a booking confirmation, a contract for Host Services [...] is formed directly between you and the Host."

この規定により：

- ホストがサービスの提供義務を負う
- ゲストが代金の支払義務を負う
- Airbnbはあくまで「場」を提供するのみ

### 2.2 ホストの独立事業者としての地位

> "Hosts' relationship with Airbnb is that of an independent individual or entity, not an employee, agent, joint venturer, or partner of Airbnb."

Airbnbはホストを以下のいずれにも該当しないと明確にしている：

- 被雇用者（employee）
- 代理人（agent）
- 合弁事業者（joint venturer）
- パートナー（partner）

**例外:** Airbnb Payments が「支払い回収代理人」として機能する場合のみ。

### 2.3 ホストの物件アクセス権 — Section 2.3

> "Hosts may re-enter the Accommodation during your stay, to the extent: (i) it is reasonably necessary, (ii) permitted by your contract with the Host, and (iii) consistent with applicable law."

### tsumugiとの比較

tsumugi規約ドラフト第3条3項では「賃貸契約の仲介を行うものではなく、残置物の引き継ぎおよび決済代行のみを提供」と明記しているが、Airbnbのように「前の住人」と「次の住人」の間に直接契約が成立することをより明示的に記載すべき。特に、前の住人の「独立当事者」としての地位を明確にすることで、tsumugiの責任範囲をより限定できる。

---

## 3. 紛争解決メカニズム

### 3.1 多段階紛争解決プロセス — Section 23-25

Airbnbは地域ごとに異なる紛争解決メカニズムを設けている。

**米国ユーザー（Section 23）：**

1. **30日間の直接交渉期間** — まず当事者間での話し合いを義務付け
2. **仲裁（Arbitration）** — 交渉不成立の場合、American Arbitration Association (AAA) による仲裁
   - 個別仲裁のみ（class action waiver）
   - 仲裁場所：ユーザー居住地の米国郡、サンフランシスコ、または電話・ビデオ会議
3. **集団訴訟の放棄** — ユーザーは集団訴訟の権利を放棄

**中国ユーザー（Section 24）：**

- 国内取引：CIETAC仲裁（北京）
- 国際取引：SIAC仲裁（シンガポール）

**その他のユーザー（Section 25）：**

- 消費者：アイルランド裁判所の非専属的管轄
- 事業者：アイルランド裁判所の専属的管轄

### 3.2 Resolution Center（解決センター）

Airbnbは利用規約とは別に、実務的な紛争解決ツールとして「Resolution Center」を運用している。

**プロセス:**

1. **当事者間の直接交渉** — まずホスト・ゲスト間でAirbnbメッセージを通じて解決を試みる
2. **Resolution Centerでの申請** — 直接交渉が不調の場合、72時間以内に申請
3. **Airbnbの介入** — 相手方が72時間以内に応答しない場合、Airbnbサポートが介入
4. **専任ケースマネージャーの割当** — 双方から情報収集、7-14日で判定
5. **任意の調停サービス** — 中立的第三者による調停（最近導入）

**損害請求の期限:**

- 発見から72時間以内に報告（リブッキング・返金ポリシー適用のため）
- チェックアウトから60日以内に損害請求を開始
- 相手方は3日以内に応答義務（応答なしの場合、申請内容どおり処理）

### tsumugiとの比較

tsumugi規約ドラフト第13条は3段階（協議→仲裁→裁判所）の紛争解決を定めているが、Airbnbのようなプラットフォーム主導のResolution Centerに相当する仕組みが欠けている。残置物の状態に関するトラブル（「同意書と実物が異なる」等）は頻発が予想されるため、プラットフォーム内での解決フローの詳細化が重要。特に：

- 異議申し立ての証拠提出要件（写真・動画）の明記
- Airbnbの72時間ルールに類似した応答期限の設定
- 専任担当者による調査プロセスの明記

---

## 4. 手数料構造

### 4.1 Airbnbの手数料モデルの変遷

Airbnbは2025年に手数料構造を大きく変更した。

**旧モデル（Split-Fee / 分割手数料）：**

| 対象   | 手数料率                           |
| ------ | ---------------------------------- |
| ホスト | 3-4%（予約小計に対して）           |
| ゲスト | 14-16.5%（チェックアウト時に加算） |

**新モデル（Host-Only Fee / ホスト負担型） — 2025年10月27日以降：**

| 対象   | 手数料率                      |
| ------ | ----------------------------- |
| ホスト | 15.5%（ペイアウトから天引き） |
| ゲスト | 0%（追加手数料なし）          |

**ロールアウトスケジュール:**

- 2025年8月25日：PMS利用の新規ホストに適用開始
- 2025年10月27日：PMS利用の既存ホストに自動移行
- 2025年12月1日：PMS未使用で旧15%ホスト負担型を選択していたホストを15.5%に統一
- ブラジルのホストは16%

**例外:** PMS（プロパティマネジメントソフトウェア）未使用のホストは引き続きSplit-Feeモデルを選択可能。

### 4.2 追加料金 — Section 6.1

Airbnbはリスティングに関連する追加料金も規定している：

- クリーニング料金
- リゾートフィー
- セキュリティデポジット
- オフライン料金

### 4.3 手数料の非返金性 — Section 11

> "Service fees are non-refundable except as provided on the platform."

Airbnbはサービス手数料の変更について30日前通知を義務付けているが、変更は既存の予約には影響しないと明記。

### tsumugiとの比較

tsumugiの現行手数料（前の住人12%負担、次の住人0%）はAirbnbの新モデル（Host-Only Fee 15.5%）に近い構造。ただし以下の点で異なる：

| 項目                  | Airbnb                     | tsumugi               |
| --------------------- | -------------------------- | --------------------- |
| ホスト/前の住人負担率 | 15.5%                      | 12%                   |
| ゲスト/次の住人負担率 | 0%                         | 0%                    |
| 決済手数料の負担      | ホスト負担（手数料に含む） | tsumugi負担（約3.6%） |
| 大家への分配          | なし                       | 1%（最低¥3,000）      |

tsumugiの12%はAirbnbの15.5%より低いが、決済手数料（3.6%）をtsumugiが負担しているため、実質的なtsumugiの受取は約8.4%。Airbnbは決済手数料をホスト手数料15.5%の中から捻出しているため、実質マージンは概ね同水準と考えられる。

---

## 5. 保証・保険プログラム（AirCover）

### 5.1 AirCover for Hosts の概要

Airbnbは全てのホストに対して、追加費用なしで以下の保護を自動提供している。

**ホスト損害保護（Host Damage Protection）— 最大300万米ドル:**

- 住居および内容物の損害
- 美術品・貴金属・コレクションの保護
- 駐車中の車両・ボートの保護
- ペットによる損害
- ディープクリーニング費用（シミ・臭い除去）
- 収益損失保護（ゲスト損害によるキャンセル時の逸失利益）

**ホスト責任保険（Host Liability Insurance）— 最大100万米ドル:**

- ゲストの怪我・所持品損傷に対する補償
- 補助ホスト（co-host）・清掃員も対象

### 5.2 請求プロセスと期限

- **請求期限:** 責任あるゲストのチェックアウトから14日以内にResolution Centerで申請
- **証拠提出期限:** 損害・損失発生から30日以内にAirbnbサポートに提出
- **必要書類:** 写真、動画、見積書、領収書、コミュニケーション記録

### 5.3 2025年の重要な変更点

2025年3月1日以降、6件以上のアクティブリスティングを持つホストは、他の保険との調整が必要になる場合がある（他保険が優先適用される可能性）。

### 5.4 AirCoverの限界

Airbnbは AirCover の具体的な補償条件・除外事項を利用規約本文ではなく、別文書（Host Guarantee Terms、Japan Host Insurance Terms）に規定しており、規約本文では参照のみ（Section 26.1）。

> "Section 26.1 incorporates 'Host Guarantee Terms' and 'Japan Host Insurance Terms' by reference."

さらに、ホストに対して適切な保険の取得を推奨している（Section 6.1）：

> "Hosts should carefully review policy terms, including coverage details and exclusions."

### tsumugiとの比較

tsumugi規約ドラフトには保証・保険プログラムに相当する規定が存在しない。残置物（家具・インテリア等）の引き継ぎにおいて、以下のリスクに対する保護制度の検討が必要：

- **残置物の破損・紛失:** 引き継ぎ時の損傷、搬入中の事故
- **残置物の状態に関する虚偽申告:** 写真と実物の乖離
- **引き継ぎ後の故障:** 使用開始直後の家電故障等

ただし、Airbnbのような大規模保証プログラムはフェーズ1では現実的ではない。まずは残置物同意書（第7条）の証拠力強化と、異議申し立て時のエスクロー保留メカニズムの整備が優先事項。

---

## 6. キャンセルポリシー

### 6.1 Airbnbのキャンセルポリシー体系（2025年10月1日改定）

Airbnbはホストが選択できるキャンセルポリシーを複数提供しており、2025年10月に「Strict」を廃止し「Limited」を新設した。

**短期滞在用ポリシー:**

| ポリシー              | 全額返金の条件           | 部分返金          | 返金不可                         |
| --------------------- | ------------------------ | ----------------- | -------------------------------- |
| Flexible（柔軟）      | チェックイン24時間前まで | —                 | 24時間以内                       |
| Limited（限定）[新設] | チェックイン14日前まで   | —                 | 14日以内                         |
| Moderate（普通）      | チェックイン5日前まで    | —                 | 5日以内（初泊+清掃料は返金不可） |
| Firm（やや厳格）      | チェックイン30日前まで   | 7-30日前：50%返金 | 7日以内                          |

**2025年10月の重要変更 — 24時間猶予期間の導入:**

全てのスタンダード短期ポリシーに「24時間キャンセル猶予期間（Grace Period）」が導入された：

- 予約確定から24時間以内はペナルティなしでキャンセル可能
- ただし、チェックイン7日前以降の予約には適用されない

### 6.2 ホスト側のキャンセル — Section 7.1

ホストによるキャンセルには厳しいペナルティが課される：

> "Hosts shouldn't cancel without valid reason. Unjustified cancellations trigger 'cancellation fee and other consequences.'"

ゲストに返金が行われた場合：

> "Airbnb (via Airbnb Payments) may recover that amount from you, including by offsetting the refund against your future payouts."

### 6.3 不可抗力（Extenuating Circumstances）

Airbnbは「Extenuating Circumstances Policy（やむを得ない事情ポリシー）」により、通常のキャンセルポリシーとは別の返金ルールを適用する場合がある。対象例：

- 自然災害
- 政府による渡航制限
- 重大な疾病・怪我

### tsumugiとの比較

tsumugi規約ドラフト第8条のキャンセルポリシーは以下の構造：

| 状況                 | 次の住人都合               | 前の住人都合   | 双方合意 |
| -------------------- | -------------------------- | -------------- | -------- |
| 支払い前             | ペナルティなし             | ペナルティなし | —        |
| 支払い後・引き継ぎ前 | 12%キャンセル料            | 全額返金       | 全額返金 |
| 引き継ぎ完了後       | 異議申し立て（48時間以内） | —              | —        |

**Airbnbとの違いと改善点：**

1. **猶予期間の導入を検討** — Airbnbの24時間Grace Periodに倣い、支払い後の一定期間（例：24時間）は無料キャンセルを可能にすることで消費者保護を強化
2. **段階的キャンセル料の導入** — 引き継ぎ予定日からの日数に応じた段階的キャンセル料（Airbnbの Firm ポリシーの考え方）
3. **不可抗力条項の追加** — 自然災害・物件の滅失等、やむを得ない事情による特例ルール
4. **異議申し立て期間の検討** — 現行48時間はAirbnbの14日間（損害請求）と比較して短い。残置物の瑕疵は入居後に発覚することも多いため、7日間程度への延長を検討

---

## 7. 禁止事項

### 7.1 Airbnbの禁止事項 — Section 12.1

Airbnbは包括的な禁止事項リストを設けている。

**主な禁止事項：**

- 虚偽表示・差別行為
- スクレイピング、ハッキング、リバースエンジニアリング
- **プラットフォーム外取引**（手数料回避等の理由による直接取引）
- 検索アルゴリズムの操作
- 実際にサービスを利用しない予約
- 無許可のパーティ・イベント
- 売春・人身売買

> "No off-platform bookings 'to avoid paying fees, taxes or for any other reason.'"

### 7.2 違反時の対応

Airbnb規約では以下の措置を規定：

- 利用停止
- リスティングの削除
- アカウントの永久停止
- セキュリティデポジットからの回収（Section 15）

### tsumugiとの比較

tsumugi規約ドラフト第9条はAirbnbと概ね同様の禁止事項を網羅しているが、以下の追加を検討すべき：

1. **プラットフォーム外取引の禁止の強調** — Airbnb同様、手数料回避目的の直接取引を明確に禁止。tsumugiの場合、不動産仲介業者・管理会社経由で前の住人と次の住人が直接やり取りするリスクがある
2. **コンテンツポリシーの明確化** — 残置物写真の加工・偽装の禁止
3. **複数アカウント作成の禁止** — 同一人物による複数アカウントでの手数料回避
4. **レビュー操作の禁止** — 将来的にレビュー機能を実装した場合の虚偽レビュー対策
5. **危険物の具体的リスト** — 残置物として引き継いではならない物品の具体例（ガスボンベ、薬品等）

---

## 8. tsumugiへの示唆

### 8.1 規約構造の改善

| 改善項目                       | Airbnbの手法                     | tsumugiへの適用                                    | 優先度     |
| ------------------------------ | -------------------------------- | -------------------------------------------------- | ---------- |
| プラットフォームの立場の明確化 | Section 1.2で詳細に定義          | 第3条を拡充し、取引当事者ではないことをより明確に  | 高         |
| 直接契約関係の明示             | Section 2.2で直接契約を明記      | 前の住人・次の住人間の直接契約であることを明記     | 高         |
| 損害賠償上限の具体化           | Section 19で対象者別に上限設定   | 現行の手数料上限は合理的だが、対象者別の記載を検討 | 中         |
| 多段階紛争解決                 | Resolution Center → 仲裁 → 裁判  | プラットフォーム内解決フローの詳細化               | 高         |
| キャンセル猶予期間             | 24時間Grace Period               | 支払い後24時間の無料キャンセルを導入               | 中         |
| 不可抗力条項                   | Extenuating Circumstances Policy | 自然災害・物件滅失等の特例ルール追加               | 中         |
| 補償制度                       | AirCover（300万ドル保証）        | Phase 1では残置物同意書の強化で対応                | 低（将来） |

### 8.2 最優先で追加すべき条項

**1. プラットフォームの立場の詳細定義（第3条の拡充）**

Airbnbの Section 1.2 を参考に、tsumugiが「所有、管理、提供」しないものを列挙する。

```
当社は以下の行為を行わず、これらについて責任を負いません：
- 残置物の品質・状態の保証
- 賃貸契約の仲介
- 残置物の所有権に関する紛争の解決
- 前の住人の身元・信用の保証
- 次の住人の支払能力の保証
```

**2. 直接契約条項の新設**

```
前の住人と次の住人の間の残置物引き継ぎ合意は、両当事者間の直接契約であり、
当社は当該契約の当事者ではありません。前の住人は独立した個人であり、
当社の被雇用者、代理人、パートナーではありません。
```

**3. プラットフォーム内紛争解決フローの詳細化（第13条の拡充）**

Airbnb Resolution Center を参考に：

```
(1) 当事者間の直接交渉（48時間以内）
(2) プラットフォームへの異議申し立て（直接交渉不調の場合、72時間以内）
(3) 証拠の提出（写真、動画、残置物同意書との照合）
(4) 当社による調査・判定（7日以内）
(5) 判定に不服の場合、外部仲裁または裁判所
```

**4. 不可抗力条項の追加**

```
以下の事由により引き継ぎが不可能となった場合、双方にキャンセル料は発生しません：
- 自然災害による物件の損壊
- 賃貸契約の予期せぬ解除（大家都合）
- 法令による規制
- その他、当社が合理的に認めるやむを得ない事情
```

**5. 補償（Indemnification）条項の追加 — Section 20 参考**

tsumugi規約ドラフトには補償（indemnification）条項がない。Airbnbの Section 20 を参考に、ユーザーによるtsumugiの免責・補償義務を規定すべき。

```
ユーザーは、以下に起因する請求、損害、損失から当社を免責し補償するものとします：
- 本規約またはポリシーへの違反
- プラットフォームの不適切な使用
- 他のユーザーとのやり取り
- 法令または第三者の権利の侵害
```

### 8.3 Phase 2以降で検討すべき事項

1. **保証プログラムの導入** — AirCover に倣い、残置物の引き継ぎ時の損害に対する保証制度（例：最大10万円までの損害補償）
2. **レビュー・評価システム** — 前の住人の信頼性評価制度と、それに基づく表示順位の調整
3. **地域別紛争解決メカニズム** — 将来的な海外展開時に備えた地域別条項の構造設計
4. **セキュリティデポジット** — Airbnb Section 15のようなデポジット制度の導入（高額残置物の場合）
5. **ホスト（前の住人）プロテクション** — 次の住人の引き継ぎ不履行に対する保護制度

### 8.4 注意点

- Airbnb規約は米国法を基盤としており、日本法への適用には弁護士による確認が必要
- 特に仲裁条項（arbitration clause）・集団訴訟放棄条項（class action waiver）は日本の消費者契約法との整合性を要検討
- Airbnbの「Japan Host Insurance」は住宅宿泊事業法（民泊新法）に対応した日本固有の制度であり、tsumugiの事業モデルとは直接的な関連は低い
- 損害賠償上限の設定は消費者契約法第8条との関係で、消費者の利益を不当に害する条項とならないよう注意が必要

---

## まとめ

Airbnbの利用規約は、プラットフォーム事業者としての責任範囲を最小化しつつ、ユーザー間の直接契約関係を明確にし、多段階の紛争解決メカニズムを整備するという構造を持つ。tsumugi規約ドラフト v0.1 は基本的な骨格は整っているが、以下の3点が最も重要な改善領域である：

1. **プラットフォームの立場の明確化** — 取引当事者ではないこと、何を保証しないかの列挙
2. **紛争解決フローの詳細化** — Resolution Center 相当の段階的プロセス
3. **補償条項（Indemnification）の追加** — ユーザーによる当社の免責・補償義務

これらの改善により、CLOレビューおよび外部弁護士確認の際に、より強固な法的基盤を持つ規約となる。
