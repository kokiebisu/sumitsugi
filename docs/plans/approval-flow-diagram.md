# tsumugi 大家承諾フロー図

本ドキュメントは、tsumugiの残置物引き継ぎにおける大家承諾フローを可視化したものです。
Figma図作成時の参考資料として使用してください。

---

## 1. メインフロー図（全体プロセス）

```mermaid
graph TD
    Start([前の住人: 退去決定]) --> CreateListing[リスティング作成<br/>写真・説明・管理会社名]
    CreateListing --> GeneratePDF[PDF自動生成<br/>残置物引き継ぎのご相談]
    GeneratePDF --> PublishListing[リスティング公開<br/>status: pending]

    PublishListing --> BuyerView{次の住人が閲覧}
    BuyerView -->|興味あり| ContactSeller[前の住人に連絡]

    PublishListing --> TenantContact[退去連絡時に<br/>管理会社へ相談]
    TenantContact --> AttachPDF[PDF添付]
    AttachPDF --> MgmtProcess[管理会社が<br/>通常の残置物相談として処理]

    MgmtProcess --> CheckLandlord[管理会社→大家へ確認]
    CheckLandlord --> LandlordDecision{大家の判断}

    LandlordDecision -->|予備承認| PreliminaryOK[回答: 内見後に正式判断]
    LandlordDecision -->|拒否| Rejected[回答: 不可]

    PreliminaryOK --> TenantUpdate1[前の住人がステータス更新<br/>conditional]
    Rejected --> TenantUpdate2[前の住人がステータス更新<br/>rejected]

    TenantUpdate1 --> ConditionalStatus[status: conditional<br/>黄色バッジ表示]
    ConditionalStatus --> Viewing[次の住人が内見]
    Viewing --> FormalApproval[正式署名後に承認]
    FormalApproval --> TenantUpdate3[前の住人がステータス更新<br/>approved]
    TenantUpdate3 --> ApprovedStatus[status: approved<br/>緑バッジ表示]

    TenantUpdate2 --> RejectedStatus[status: rejected<br/>リスティング非表示]

    PublishListing --> ReminderFlow[リマインダーフロー]
    ReminderFlow --> Day7[7日後: 通知]
    Day7 --> Day14[14日後: 通知]
    Day14 --> Day21[21日後: 通知]
    Day21 --> Day30{30日後}
    Day30 -->|更新なし| AutoExpire[自動非表示<br/>status: expired]
    Day30 -->|更新済み| Continue[フロー継続]

    style PublishListing fill:#f0f0f0
    style ConditionalStatus fill:#fff4cc
    style ApprovedStatus fill:#d4edda
    style RejectedStatus fill:#f8d7da
    style AutoExpire fill:#e2e3e5
```

---

## 2. ステータス遷移図（ConsentStatus）

```mermaid
stateDiagram-v2
    [*] --> pending: リスティング公開

    pending --> conditional: 大家予備承認<br/>(内見後に正式判断)
    pending --> rejected: 大家が拒否
    pending --> expired: 30日間更新なし

    conditional --> approved: 内見後に正式署名
    conditional --> rejected: 大家が最終的に拒否
    conditional --> expired: 30日間更新なし

    rejected --> [*]
    approved --> [*]
    expired --> [*]

    note right of pending
        グレーバッジ
        「大家確認中」
    end note

    note right of conditional
        黄色バッジ
        「予備承認済み」
    end note

    note right of approved
        緑バッジ
        「承認済み」
    end note

    note right of rejected
        非表示
    end note

    note right of expired
        非表示
        (30日間未更新)
    end note
```

---

## 3. ステータス別表示仕様

| ConsentStatus | 日本語表示   | バッジ色 | 表示状態 | 説明                                       |
| ------------- | ------------ | -------- | -------- | ------------------------------------------ |
| `pending`     | 大家確認中   | グレー   | 公開     | リスティング作成直後、管理会社への確認待ち |
| `conditional` | 予備承認済み | 黄色     | 公開     | 大家が予備承認、内見後に正式判断           |
| `approved`    | 承認済み     | 緑       | 公開     | 大家が正式承認、引き継ぎ可能               |
| `rejected`    | 不可         | -        | 非表示   | 大家が拒否、リスティング非公開             |
| `expired`     | 期限切れ     | -        | 非表示   | 30日間更新なし、自動非表示                 |

---

## 4. リマインダースケジュール

```mermaid
gantt
    title リマインダー通知スケジュール
    dateFormat  D
    axisFormat %d日

    section リマインダー
    公開           :milestone, m1, 0, 0d
    1回目通知      :milestone, m2, 7, 0d
    2回目通知      :milestone, m3, 14, 0d
    3回目通知      :milestone, m4, 21, 0d
    自動非表示     :crit, milestone, m5, 30, 0d
```

**通知タイミング:**

- Day 0: リスティング公開
- Day 7: 1回目リマインダー
- Day 14: 2回目リマインダー
- Day 21: 3回目リマインダー（最終警告）
- Day 30: 自動非表示（status: expired）

---

## 5. 登場人物と役割

```mermaid
graph LR
    subgraph Actors[登場人物]
        Tenant[前の住人<br/>テナント]
        Buyer[次の住人<br/>購入希望者]
        Mgmt[管理会社]
        Landlord[大家]
        System[tsumugiシステム]
    end

    subgraph Actions[主要アクション]
        Tenant --> A1[リスティング作成]
        Tenant --> A2[PDF添付して相談]
        Tenant --> A3[ステータス更新]

        Buyer --> B1[リスティング閲覧]
        Buyer --> B2[内見申込]

        Mgmt --> M1[残置物相談処理]
        Mgmt --> M2[大家へ確認]
        Mgmt --> M3[回答を転送]

        Landlord --> L1[予備承認/拒否]
        Landlord --> L2[正式承認/拒否]

        System --> S1[PDF自動生成]
        System --> S2[リマインダー送信]
        System --> S3[自動非表示]
    end
```

---

## 6. 実装上の注意点

### 前の住人側

- リスティング作成時に管理会社名を必須入力
- PDF生成は自動（管理会社名を含む）
- ステータス更新は手動（管理会社からの回答を受けて）
- リマインダー通知を確認して期限内に更新

### 次の住人側

- ステータスバッジで承認状況を確認
- pending/conditional でも興味があれば連絡可能
- approved になったら引き継ぎ確実

### システム側

- PDF生成: 管理会社名、物件情報、残置物リストを含む
- リマインダー: 7/14/21/30日で自動送信
- 自動非表示: 30日後にステータスを expired に変更

---

## 7. Figma作成時のポイント

1. **レーン分け**: 前の住人、次の住人、管理会社、大家、システムの5レーン
2. **色分け**: ステータス別に色を統一（グレー/黄色/緑/赤/灰色）
3. **PDF**: 実際のフォーマットのモックアップを含める
4. **通知UI**: リマインダー通知のモックアップ
5. **バッジデザイン**: pending/conditional/approved の3種類のバッジ
6. **タイムライン**: 0日〜30日のタイムラインを視覚化

---

以上
