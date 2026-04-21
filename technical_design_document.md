# 《秒视单词 FlashBlitz》技术设计文档（TDD）

| 项目 | 内容 |
| --- | --- |
| 文档版本 | V2.0（完整版） |
| 更新时间 | 2026-04-20 |
| 技术栈 | uni-app（Vue3）+ uniCloud（阿里云）+ uni-id + uni-pay |
| 适用对象 | 前端、云函数、测试、运维 |

## 1. 设计目标

- 与 PRD 对齐，形成可开发、可测试、可上线的技术闭环。
- 保持当前四页结构（`index/game/paywall/result`）基础上可扩展。
- 保证高频交互（闪词答题）性能稳定与状态一致。
- 建立支付、权益、排行、埋点的数据一致性机制。

---

## 2. 现状与目标架构

### 2.1 现状（代码仓库）
- 页面已存在：
  - `pages/index/index.vue`
  - `pages/game/game.vue`
  - `pages/paywall/paywall.vue`
  - `pages/result/result.vue`
- 公共模块已存在：
  - `common/store.js`
  - `common/dict-loader.js`
  - `common/audio-manager.js`
  - `common/config.js`
- 当前为前端骨架，部分能力为 TODO 或模拟逻辑。

### 2.2 目标分层
- 展示层：uni-app 页面与组件。
- 状态层：`store` 管理用户、会话、权益。
- 领域层：游戏引擎、计分、词汇统计、锁定判定。
- 接口层：uniCloud 云函数（登录鉴权、词库、成绩、支付、排行、邀请）。
- 数据层：uniCloud DB（用户、成绩、词库、词汇量、订单、邀请记录、事件日志）。

---

## 3. 目录与模块规范

```text
FlashBlitz_App/
|- pages/
|  |- index/
|  |- game/
|  |- paywall/
|  `- result/
|- common/
|  |- config.js
|  |- store.js
|  |- dict-loader.js
|  |- game-engine.js            # 新增：游戏循环与状态机
|  |- scoring.js                # 新增：计分算法
|  |- entitlement.js            # 新增：权益与锁定判定
|  |- telemetry.js              # 新增：埋点上报
|  `- audio-manager.js
|- components/
|  |- NeonButton.vue            # 新增：主 CTA
|  |- RankCard.vue              # 新增：排行项
|  `- StatChip.vue              # 新增：统计展示
|- uniCloud-aliyun/
|  |- cloudfunctions/
|  |  |- fb-check-auth/
|  |  |- fb-get-words/
|  |  |- fb-submit-round/
|  |  |- fb-rank-query/
|  |  |- fb-create-order/
|  |  |- fb-pay-notify/
|  |  |- fb-invite-reward/
|  |  `- fb-telemetry-batch/
|  `- database/
|     |- uni-id-users.schema.json
|     |- fb-dictionary.schema.json
|     |- fb-user-vocab.schema.json
|     |- fb-rounds.schema.json
|     |- fb-orders.schema.json
|     |- fb-ranks.schema.json
|     |- fb-invites.schema.json
|     `- fb-events.schema.json
`- docs/
   |- product_requirements_document.md
   `- technical_design_document.md
```

---

## 4. 核心状态模型

### 4.1 前端全局状态（store）

```js
{
  user: {
    uid: string | null,
    nickname: string,
    avatar: string,
    isVip: boolean,
    vipExpireAt: number | null,
    vocabCount: number,
    unlockedDatasets: [{ datasetKey: string, expireAt: number }]
  },
  game: {
    datasetKey: string,
    difficulty: 'godlike' | 'pro' | 'fast' | 'rookie',
    exposureMs: number,
    score: number,
    combo: number,
    maxCombo: number,
    answered: number,
    correct: number,
    currentWordIndex: number,
    roundId: string | null,
    phase: 'idle' | 'flash' | 'input' | 'feedback' | 'paused' | 'finished'
  },
  paywall: {
    visible: boolean,
    reason: 'free_limit' | 'dataset_locked',
    freeLimit: number,
    consumed: number
  }
}
```

### 4.2 状态机（游戏页）

```text
idle -> flash -> input -> feedback -> flash(next)
input -> paused -> input
feedback -> finished
任何状态 -> paywall_blocked
```

---

## 5. 数据库设计

> 说明：以下字段名为落地建议，若与线上历史表冲突，需通过迁移脚本平滑升级。

### 5.1 `uni-id-users`
- `_id`：用户 ID（主键）
- `nickname`、`avatar`
- `mobile`（可选）
- `vipExpireAt`
- `vocabCount`
- `bestScore`
- `createdAt`、`updatedAt`

索引建议：
- `vipExpireAt`
- `vocabCount`

### 5.2 `fb-dictionary`
- `_id`
- `datasetKey`
- `word`
- `definition`
- `phonetic`
- `level`
- `distractorGroup`（用于干扰项分组）
- `version`

索引建议：
- `datasetKey + word`（唯一）
- `datasetKey + level`

### 5.3 `fb-user-vocab`
- `_id`
- `uid`
- `word`
- `datasetKey`
- `firstCorrectAt`

索引建议：
- `uid + word`（唯一）

### 5.4 `fb-rounds`
- `_id`（roundId）
- `uid`
- `datasetKey`
- `difficulty`
- `score`
- `maxCombo`
- `correctCount`
- `answerCount`
- `newWords`
- `durationMs`
- `createdAt`

索引建议：
- `uid + createdAt`
- `score`（倒序查询）

### 5.5 `fb-orders`
- `_id`（orderId）
- `uid`
- `productType`（month/lifetime）
- `amountFen`
- `status`（pending/success/failed/closed）
- `transactionId`
- `createdAt`、`paidAt`

索引建议：
- `uid + createdAt`
- `transactionId`（唯一）

### 5.6 `fb-ranks`
- `_id`
- `uid`
- `bestScore`
- `vocabCount`
- `updatedAt`

索引建议：
- `bestScore`（倒序）

### 5.7 `fb-invites`
- `_id`
- `inviterUid`
- `inviteeUid`
- `status`（pending/qualified/rewarded）
- `rewardDatasetKey`
- `rewardExpireAt`
- `createdAt`

索引建议：
- `inviterUid + inviteeUid`（唯一）
- `status`

### 5.8 `fb-events`
- `_id`
- `uid`
- `event`
- `payload`
- `clientTs`
- `serverTs`

索引建议：
- `event + serverTs`
- `uid + serverTs`

---

## 6. 云函数接口契约

### 6.1 `fb-check-auth`
- 用途：校验登录态并返回用户信息。
- 输入：`{}`
- 输出：
  - `code`
  - `user`
  - `entitlement`

### 6.2 `fb-get-words`
- 用途：拉取词库与版本信息。
- 输入：`{ datasetKey, clientVersion }`
- 输出：`{ version, words, hasUpdate }`
- 规则：支持分页/分片返回，避免单次过大。

### 6.3 `fb-submit-round`
- 用途：提交单局结果，服务端复核分数、更新排行与词汇量。
- 输入：
  - `datasetKey`
  - `difficulty`
  - `answers`（词与作答明细）
  - `clientScore`
  - `durationMs`
- 输出：
  - `roundId`
  - `finalScore`
  - `newWords`
  - `rankChanged`

### 6.4 `fb-rank-query`
- 用途：查询好友榜/世界榜。
- 输入：`{ type: 'friend' | 'world', page, pageSize }`
- 输出：`{ list, total, cacheTs }`

### 6.5 `fb-create-order`
- 用途：创建支付订单。
- 输入：`{ productType }`
- 输出：`{ orderId, payParams }`

### 6.6 `fb-pay-notify`
- 用途：支付回调，幂等更新订单与权益。
- 输入：微信支付回调报文。
- 输出：标准回调确认。

### 6.7 `fb-invite-reward`
- 用途：处理邀请达标与发奖。
- 输入：`{ inviteCode | inviterUid }`
- 输出：`{ rewarded, expireAt }`

### 6.8 `fb-telemetry-batch`
- 用途：批量上报埋点事件。
- 输入：`{ events: [] }`
- 输出：`{ accepted, dropped }`

---

## 7. 核心算法设计

### 7.1 计分公式（建议）

```text
base = answerCorrect ? 100 : 0
comboBonus = answerCorrect ? min(combo, 20) * 8 : 0
difficultyFactor = { godlike: 1.6, pro: 1.3, fast: 1.1, rookie: 1.0 }
wordLevelBonus = level * 5
scoreDelta = (base + comboBonus + wordLevelBonus) * difficultyFactor
```

### 7.2 锁定判定
- 若 `isVip = true`，直接放行。
- 若存在 `datasetKey` 临时解锁且未过期，放行。
- 否则按免费额度判断：
  - `consumed >= FREE_LIMIT` -> 进入 paywall。

### 7.3 动态降级
- 统计前 10 题正确率。
- `< 30%` 则弹“建议降级”。
- 用户拒绝后，本局不再重复弹（防打断）。

---

## 8. 前端实现要点

### 8.1 首页 `pages/index/index.vue`
- 接入登录态检测。
- 读取并展示当前难度与用户状态。
- 主按钮直达对局准备态。

### 8.2 游戏页 `pages/game/game.vue`
- 引入 `game-engine.js` 管理时序，避免在组件内散落 `setTimeout`。
- 每题生成不可预测选项顺序。
- 支持暂停与前后台恢复。

### 8.3 解锁页 `pages/paywall/paywall.vue`
- 根据 `reason` 展示文案。
- 点击支付按钮前写入埋点。
- 支付成功后自动关闭拦截并回到游戏。

### 8.4 结果页 `pages/result/result.vue`
- 只展示服务端确认后的结果值。
- 支持再来一局时保留用户选定词库与难度。

### 8.5 UI 主题变量（示例）

```css
:root {
  --bg-main: #050806;
  --bg-panel: #11151a;
  --text-main: #e8ffe8;
  --text-muted: #6e7a72;
  --neon-green: #1edc74;
  --accent-orange: #f5a623;
  --accent-blue: #4a84ff;
  --danger-red: #ff4d4f;
}
```

---

## 9. 安全与合规

### 9.1 严禁明文密钥
- 当前 `common/config.js` 出现明文 API Key（高风险）。
- 必须迁移到云端环境变量（uniCloud secrets）。
- 前端只保留无敏感配置。

### 9.2 接口鉴权
- 所有写操作接口必须验证 uid。
- 排行/成绩写入以服务端签名数据为准。

### 9.3 幂等与防重
- 支付回调按 `transactionId` 幂等处理。
- 单局提交按 `roundId` 去重，避免重复加分。

### 9.4 防刷策略
- 同设备/同账号短时异常高频答题触发风控标记。
- 邀请关系去重 + 行为达标后发奖。

---

## 10. 性能设计

- 词库本地缓存（按 `datasetKey + version`）。
- 题目预取队列，保证闪词切换不卡顿。
- 排行榜服务端缓存（建议 5 分钟）。
- 埋点批量上报与失败重传。
- 动画与重绘控制：保持每帧渲染成本低于 16ms（中端机目标）。

---

## 11. 测试方案

### 11.1 单元测试（总时长 <= 60s）
- `scoring.js`：计分与连击逻辑。
- `entitlement.js`：锁定/解锁判定。
- `game-engine.js`：状态机流转。
- `dict-loader.js`：缓存命中与版本更新分支。

### 11.2 接口测试
- 云函数入参校验。
- 支付成功/失败/重复回调。
- 邀请奖励达标与防重。

### 11.3 E2E 冒烟
- 登录 -> 对局 -> 结果 -> 再来一局。
- 免费额度耗尽 -> 解锁页 -> 支付成功 -> 继续。
- 邀请后奖励生效。

### 11.4 UI 回归
- 核验黑绿终端主题。
- 核验关键页面在常见机型不溢出、不遮挡。

---

## 12. 发布与灰度

- 阶段 1：内部体验版（白名单）
- 阶段 2：10% 灰度发布，观察崩溃率、支付成功率、接口耗时。
- 阶段 3：全量发布。

回滚条件（任一满足即回滚）：
- 支付成功率连续 30 分钟低于基线 20%。
- 对局提交失败率 > 5%。
- 主要页面白屏/崩溃率超阈值。

---

## 13. 与现有代码差距清单（必须补齐）

- [ ] `common/config.js` 明文密钥迁移到云端环境变量。
- [ ] `dict-loader.js` 从模拟返回改为真实云函数调用。
- [ ] `pages/game/game.vue` 完成闪词循环、选项生成、反馈与提交流。
- [ ] `pages/paywall/paywall.vue` 接入真实下单与支付。
- [ ] `pages/result/result.vue` 改为动态结果渲染。
- [ ] 新增 `game-engine/scoring/entitlement/telemetry` 模块。
- [ ] 新增云函数与数据库 schema。
- [ ] 增加单元测试与 E2E 冒烟脚本。

---

## 14. 待确认项（含建议方案）

### 待确认项 1：排行榜数据来源
- 待确认原因：好友榜依赖微信关系链能力，具体实现受平台能力限制。
- 本期先实现“世界榜 + 站内好友榜（通过邀请关系）”，微信原生好友榜作为后续增强。

### 待确认项 2：错题本范围
- 待确认原因：是否仅 VIP 可见会影响数据结构与前端入口。
- 本期错题本仅 VIP 可用，免费用户只展示入口与引导。

### 待确认项 3：词库版本策略
- 待确认原因：全量更新会增加流量成本，增量更新增加实现复杂度。
- 本期采用“按词库版本全量更新 + 本地缓存”，后续迭代增量。

### 待确认项 4：单局时长上限
- 待确认原因：无上限可能造成异常长局影响统计。
- 单局上限 10 分钟，超时自动结算。
