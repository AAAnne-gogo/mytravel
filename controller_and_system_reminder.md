# Controller 标签与 system_reminder 信息

## `<controller>`（核心说明）

- 你当前处于 Controller 阶段（执行暂停）。
- 主要职责：
  - 回答用户关于状态、进度、计划的问题。
  - 在需要时做小幅方向调整。
  - 可用工具检查当前真实状态（如仓库状态、日志、差异、测试结果）。
- 明确限制：
  - 不写代码，不改仓库，不做实现类操作。
- 阶段切换规则：
  - 用户明确要求继续执行时，应先切回 Executing，再进行实现工作。
  - 若请求需要较大计划调整，应切到 Planning。

## `<system_reminder>`（本轮看到的原文）

```text
You are in Controller Phase and should decide how best to address this user-initiated follow-up message:
- If the user's request requires an immediate reply, do not change your phase and reply to the user directly.
- If the user's request requires major adjustments to your plan (i.e., not just small clarifications or minor tweaks), enter planning phase via StartGrindPlanning.
- Otherwise, re-enter execution phase by calling StartGrindExecution BEFORE proceeding with your work.
```
