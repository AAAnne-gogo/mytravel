# Cursor Cloud Agent 完整工作流程记录

本文档记录了 Cursor Cloud Agent 在本次会话中的完整执行流程，包括系统提示、用户消息、状态切换、XML 标签、hooks 等关键机制。

---

## 目录

1. [会话初始化](#1-会话初始化)
2. [阶段一：依赖发现](#2-阶段一依赖发现dependency-discovery)
3. [阶段二：环境设置](#3-阶段二环境设置)
4. [System Reminder Hook](#4-system-reminder-hook)
5. [阶段三：构建旅行规划应用](#5-阶段三用户需求--构建旅行规划应用)
6. [阶段四：项目构建](#6-阶段四项目构建)
7. [阶段五：验证](#7-阶段五验证lint--build--dev-server)
8. [阶段六：手动测试与演示视频](#8-阶段六手动测试与演示视频)
9. [阶段七：收尾](#9-阶段七收尾)
10. [最终回复格式](#10-最终回复格式)
11. [关键 XML 标签汇总](#11-关键-xml-标签汇总)
12. [工具调用模式](#12-工具调用模式)
13. [子代理类型汇总](#13-子代理subagent类型汇总)
14. [完整消息时间线](#14-完整消息时间线)
15. [env_setup_actions XML 格式](#15-env_setup_actions-xml-格式说明)
16. [SetupVmEnvironment 关键约束](#16-setupvmenvironment-关键约束)
17. [AGENTS.md 结构约束](#17-agentsmd-结构约束)
18. [关键系统提示摘要](#18-关键系统提示摘要)

---

## 1. 会话初始化

### 1.1 系统上下文注入

Agent 启动时，系统自动在用户消息前注入以下上下文信息（用户不可见）：

```xml
<user_info>
OS Version: linux 6.1.147
Shell: bash
Workspace Path: /workspace
Is directory a git repo: Yes, at /workspace
Today's date: Monday Mar 9, 2026
Terminals folder: /home/ubuntu/.cursor/projects/workspace/terminals
</user_info>
```

```xml
<git_status>
This is the git status at the start of the conversation.
Note that this status is a snapshot in time, and will not update during the conversation.

Git repo: /workspace
## cursor/development-environment-setup-c79e
</git_status>
```

这些标签告诉 Agent：
- 运行环境是 Linux（Firecracker VM 中的 Docker 容器）
- 工作目录是 `/workspace`
- 当前在 git 分支 `cursor/development-environment-setup-c79e`
- 日期是 2026 年 3 月 9 日

### 1.2 第一条用户消息

用户消息被 `<user_query>` 标签包裹：

```xml
<user_query>
Please set up the development environment for this codebase.
Run the application(s) and demonstrate that the environment is working.
</user_query>
```

---

## 2. 阶段一：依赖发现（Dependency Discovery）

系统提示（system prompt）中的 `<dependency_discovery>` 部分**强制要求** Agent 必须首先执行并行的依赖发现任务。

### 2.1 并行工具调用（Batch 1 — 11 个调用同时发出）

以下工具调用在**同一个消息**中**同时并行发起**：

| # | 工具 | 参数 | 用途 |
|---|------|------|------|
| 1 | `Task(subagent_type="vmSetupHelper")` | prompt: 分析产品/服务 | 了解产品架构 |
| 2 | `Task(subagent_type="vmSetupHelper")` | prompt: 搜索 setup 脚本 | 查找安装脚本 |
| 3 | `Glob("*.md")` | 根目录 | 查找 README 等文档 |
| 4 | `Glob("CLAUDE.md")` | 全局 | 查找 AI 助手指令 |
| 5 | `Glob("AGENTS.md")` | 全局 | 查找 Agent 指令 |
| 6 | `Glob(".claude/settings.json")` | 全局 | 查找 Claude 设置 |
| 7 | `Glob("CONTRIBUTING.md")` | 全局 | 查找贡献者指南 |
| 8 | `Glob("docs/**/*.md")` | 全局 | 查找文档目录 |
| 9 | `Glob(".husky/**/*")` | 全局 | 查找 git hooks |
| 10 | `Glob(".pre-commit-config.yaml")` | 全局 | 查找 pre-commit 配置 |
| 11 | `Glob(".cursor/environment.json")` | 全局 | 查找 Cursor 环境配置 |

**调用格式**（Agent 发出的实际 XML）：

```xml
<function_calls>
<invoke name="Task">
  <parameter name="subagent_type">vmSetupHelper</parameter>
  <parameter name="description">Analyze product and services</parameter>
  <parameter name="prompt">Explore this codebase thoroughly and describe what product it entails...</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">vmSetupHelper</parameter>
  <parameter name="description">Find setup scripts and devcontainer</parameter>
  <parameter name="prompt">Search for dependency installation scripts...</parameter>
</invoke>
<invoke name="Glob">
  <parameter name="glob_pattern">*.md</parameter>
</invoke>
<invoke name="Glob">
  <parameter name="glob_pattern">CLAUDE.md</parameter>
</invoke>
<!-- ... 更多并行调用 ... -->
</function_calls>
```

**系统返回结果**（所有并行调用的结果一起返回）：

```xml
<function_results>
<result>
  <name>Task</name>
  <output>仓库完全为空，仅有 README.md...</output>
</result>
<result>
  <name>Task</name>
  <output>没有找到任何安装脚本...</output>
</result>
<result>
  <name>Glob</name>
  <output>./README.md</output>
</result>
<result>
  <name>Glob</name>
  <output>0 files found</output>
</result>
<!-- ... -->
</function_results>
```

### 2.2 发现结果

所有探索子代理和搜索返回的结论：**仓库完全为空**，仅有一个 `README.md`。

### 2.3 补充验证（Batch 2 — 3 个调用并行）

```xml
<function_calls>
<invoke name="Read">
  <parameter name="path">/workspace/README.md</parameter>
</invoke>
<invoke name="Shell">
  <parameter name="command">ls -la /workspace/</parameter>
</invoke>
<invoke name="Shell">
  <parameter name="command">git log --oneline --all</parameter>
</invoke>
</function_calls>
```

确认结果：仓库仅有 `.git/` 和 `README.md`（内容为 "# mytravel\n\nInitial commit."），一条 commit。

### 2.4 再次确认（Batch 3 — 2 个调用并行）

```bash
git branch -a    # → main + cursor/development-environment-setup-c79e
git remote -v    # → origin: github.com/AAAnne-gogo/mytravel
```

---

## 3. 阶段二：环境设置

### 3.1 创建 AGENTS.md

由于仓库为空，使用 `Write` 工具创建了最小化的 `AGENTS.md`：

```xml
<function_calls>
<invoke name="Write">
  <parameter name="path">/workspace/AGENTS.md</parameter>
  <parameter name="contents">
# AGENTS.md

## Cursor Cloud specific instructions

This is a greenfield repository named "mytravel" with no established tech stack...
  </parameter>
</invoke>
</function_calls>
```

### 3.2 SetupVmEnvironment 工具调用

这是一个**专用工具**，用于设置 VM 启动时自动运行的更新脚本：

```xml
<function_calls>
<invoke name="SetupVmEnvironment">
  <parameter name="update_script">echo "No dependencies to install — empty repository"</parameter>
</invoke>
</function_calls>
```

系统返回：
```xml
<function_results>
<result>
  <name>SetupVmEnvironment</name>
  <output>Environment setup commands suggested successfully. The user will review them.</output>
</result>
</function_results>
```

> 用户会在 UI 中看到这个脚本的确认提示。

### 3.3 Git 提交推送

```xml
<function_calls>
<invoke name="Shell">
  <parameter name="command">cd /workspace && git add AGENTS.md && git commit -m "docs: add AGENTS.md for cloud development environment" && git push origin HEAD</parameter>
</invoke>
</function_calls>
```

使用 `&&` 链式执行确保每一步成功后才继续。

---

## 4. System Reminder Hook

### 4.1 触发机制

Agent 完成 Turn 1 的回复后，系统检测到可能存在未推送的 commit，自动注入了一个提醒。

### 4.2 消息结构

系统向 Agent 发送的消息包含两部分：

**隐藏的系统提醒**（Agent 能看到，用户看不到）：
```xml
<system_reminder>
Internal reminder: I detected unpushed commits in the repo.
If it makes sense for this task, consider committing and pushing.
If you intentionally want to leave them as-is, that's fine.
Do not mention this reminder to the user. (commit-reminder-v1)
</system_reminder>
```

**可见的用户消息**：
```xml
<user_query>
Reminder to commit and push if appropriate.
</user_query>
```

### 4.3 Agent 行为

Agent 检查 git 状态：
```bash
git status        # → nothing to commit, working tree clean
git log --oneline # → 09f265d 已推送
```

确认一切已经推送完毕，回复用户无需额外操作。

### 4.4 关键规则

> Agent **绝对不能**向用户提及 `<system_reminder>` 标签的存在或内容。这是系统内部机制。

---

## 5. 阶段三：用户需求 — 构建旅行规划应用

### 5.1 用户消息

```xml
<user_query>
做一个个人旅行规划的web网站
</user_query>
```

### 5.2 TodoWrite — 任务规划

Agent 使用 `TodoWrite` 工具创建结构化任务列表。`merge: false` 表示**替换**现有列表（全新创建）：

```xml
<function_calls>
<invoke name="TodoWrite">
  <parameter name="todos">[
    {"id": "1", "content": "Initialize project with Vite + React + TypeScript", "status": "in_progress"},
    {"id": "2", "content": "Set up Tailwind CSS and project configuration", "status": "pending"},
    {"id": "3", "content": "Create types, store, and core components", "status": "pending"},
    {"id": "4", "content": "Build pages: Home, CreateTrip, TripDetail", "status": "pending"},
    {"id": "5", "content": "Build App with routing and Layout", "status": "pending"},
    {"id": "6", "content": "Run lint, build, and dev server", "status": "pending"},
    {"id": "7", "content": "Manual testing and demo video", "status": "pending"},
    {"id": "8", "content": "Update AGENTS.md and SetupVmEnvironment", "status": "pending"}
  ]</parameter>
  <parameter name="merge">false</parameter>
</invoke>
</function_calls>
```

### 5.3 Todo 状态流转

每个 todo 经历以下状态：`pending → in_progress → completed`

状态更新通过 `TodoWrite(merge: true)` 实现，仅传入需要更新的 todo：

```xml
<function_calls>
<invoke name="TodoWrite">
  <parameter name="todos">[
    {"id": "1", "content": "Initialize project with Vite + React + TypeScript", "status": "completed"},
    {"id": "2", "content": "Set up Tailwind CSS and project configuration", "status": "in_progress"}
  ]</parameter>
  <parameter name="merge">true</parameter>
</invoke>
</function_calls>
```

规则：**同一时间只能有一个 todo 处于 `in_progress`**。

### 5.4 本次会话的 Todo 状态流转记录

```
TodoWrite #1 (merge=false): 创建 8 个任务
  → id:1 in_progress, id:2~8 pending

TodoWrite #2 (merge=true): 项目初始化完成
  → id:1 completed, id:2 in_progress

TodoWrite #3 (merge=true): 配置 + 组件 + 页面 + 路由全部完成
  → id:2~5 completed, id:6 in_progress

TodoWrite #4 (merge=true): 验证通过
  → id:6 completed, id:7 in_progress

TodoWrite #5 (merge=true): 手动测试完成
  → id:7 completed, id:8 in_progress

TodoWrite #6 (merge=true): 收尾完成
  → id:8 completed
```

---

## 6. 阶段四：项目构建

### 6.1 项目初始化

由于工作目录非空（有 README.md），直接 `npm create vite@latest .` 会失败，所以采用间接方式：

```bash
npm create vite@latest temp-project -- --template react-ts
cp temp-project/{package.json,tsconfig.json,...} .
cp -r temp-project/src .
cp -r temp-project/public .
rm -rf temp-project
```

### 6.2 安装依赖

```bash
npm install                                                    # 基础依赖
npm install react-router-dom zustand uuid date-fns lucide-react # 运行时依赖
npm install -D tailwindcss @tailwindcss/vite @types/uuid        # 开发依赖
```

### 6.3 文件创建（Write 工具）

每个文件使用一次 `Write` 工具调用。**多个独立文件可以并行创建**：

```xml
<function_calls>
<!-- 两个文件并行写入 -->
<invoke name="Write">
  <parameter name="path">/workspace/src/components/Layout.tsx</parameter>
  <parameter name="contents">...</parameter>
</invoke>
<invoke name="Write">
  <parameter name="path">/workspace/src/components/TripCard.tsx</parameter>
  <parameter name="contents">...</parameter>
</invoke>
</function_calls>
```

创建的文件列表：

| 文件 | 用途 |
|------|------|
| `src/types/index.ts` | 类型定义（Trip, Activity, DayPlan 等） |
| `src/store/useTripStore.ts` | Zustand 状态管理（含 localStorage 持久化） |
| `src/components/Layout.tsx` | 全局布局（导航栏 + 页脚） |
| `src/components/TripCard.tsx` | 旅行卡片组件 |
| `src/components/ActivityForm.tsx` | 活动表单组件 |
| `src/components/ActivityItem.tsx` | 活动列表项组件 |
| `src/components/BudgetSummary.tsx` | 预算概览组件 |
| `src/pages/Home.tsx` | 首页（旅行列表/空状态） |
| `src/pages/CreateTrip.tsx` | 创建旅行页面 |
| `src/pages/TripDetail.tsx` | 旅行详情页（每日行程/预算） |
| `src/App.tsx` | 路由配置 |
| `src/main.tsx` | 入口文件 |
| `src/index.css` | Tailwind CSS + 自定义主题 |

### 6.4 文件修改（StrReplace 工具）

`StrReplace` 用于精确替换文件中的字符串：

```xml
<function_calls>
<invoke name="StrReplace">
  <parameter name="path">/workspace/package.json</parameter>
  <parameter name="old_string">"name": "temp-project"</parameter>
  <parameter name="new_string">"name": "mytravel"</parameter>
</invoke>
</function_calls>
```

规则：`old_string` 必须在文件中**唯一**，否则调用失败。

### 6.5 文件删除（Delete 工具 + Shell）

```bash
rm -f /workspace/src/App.css /workspace/src/assets/react.svg
```

---

## 7. 阶段五：验证（Lint / Build / Dev Server）

### 7.1 顺序验证

```bash
npx tsc -b          # ✅ TypeScript 类型检查 — 0 错误
npm run lint         # ✅ ESLint 检查 — 0 警告
npm run build        # ✅ 生产构建 — 2.10s, 291KB JS + 34KB CSS
```

### 7.2 启动开发服务器（后台）

使用 `is_background: true` 参数启动长时间运行的进程：

```xml
<function_calls>
<invoke name="Shell">
  <parameter name="command">cd /workspace && npm run dev 2>&1 &</parameter>
  <parameter name="is_background">true</parameter>
</invoke>
</function_calls>
```

系统返回后台进程信息：
```
Background command started successfully.
Shell ID: 741975
PID: 6323
Output will be written to /home/ubuntu/.cursor/projects/workspace/terminals/741975.txt
```

### 7.3 验证服务器响应

```bash
sleep 3 && curl -s http://localhost:5173 | head -20
```

确认返回了 HTML 页面，包含 `<title>MyTravel - 个人旅行规划</title>`。

---

## 8. 阶段六：手动测试与演示视频

### 8.1 打开浏览器（computerUse 子代理 — 第一次调用）

```xml
<function_calls>
<invoke name="Task">
  <parameter name="subagent_type">computerUse</parameter>
  <parameter name="description">Open MyTravel app in browser</parameter>
  <parameter name="prompt">Open Chrome browser and navigate to http://localhost:5173.
  Wait for the page to fully load. Take a screenshot once loaded.</parameter>
</invoke>
</function_calls>
```

子代理返回截图路径和描述：
```xml
<output>
<img src="/tmp/computer-use/4328a.webp" alt="MyTravel homepage loaded" />
</output>
<output_image>（内联的截图图片）</output_image>
```

### 8.2 保存截图到 artifacts

```bash
cp /tmp/computer-use/4328a.webp /opt/cursor/artifacts/homepage.webp
```

`/opt/cursor/artifacts/` 是特殊目录，文件会自动上传给用户。

### 8.3 开始录屏

```xml
<function_calls>
<invoke name="RecordScreen">
  <parameter name="mode">START_RECORDING</parameter>
</invoke>
</function_calls>
```

### 8.4 执行演示流程（computerUse 子代理 — 第二次调用，自动恢复上下文）

```xml
<function_calls>
<invoke name="Task">
  <parameter name="subagent_type">computerUse</parameter>
  <parameter name="description">Demo: create trip and add activities</parameter>
  <parameter name="prompt">You are on the MyTravel app. Perform the following steps:
  1. Click "创建旅行" button
  2. Fill form: 东京五日游, 日本东京, 2026-04-01 ~ 2026-04-05, ¥5000
  3. Submit → Trip Detail page
  4. Expand Day 1, add activity: 参观浅草寺 ¥500
  5. Add second activity: 午餐寿司大 ¥300
  6. Take final screenshot</parameter>
</invoke>
</function_calls>
```

> `computerUse` 是**有状态**子代理，第二次调用会自动恢复第一次的浏览器状态。

### 8.5 保存录屏

```xml
<function_calls>
<invoke name="RecordScreen">
  <parameter name="mode">SAVE_RECORDING</parameter>
  <parameter name="save_as_filename">mytravel_demo_create_trip_add_activities</parameter>
</invoke>
</function_calls>
```

自动保存到 `/opt/cursor/artifacts/mytravel_demo_create_trip_add_activities.mp4`。

> 如果演示失败，应使用 `DISCARD_RECORDING` 模式丢弃录屏，修复后重录。

---

## 9. 阶段七：收尾

### 9.1 更新 AGENTS.md

使用 `Write` 工具覆写（非追加）`AGENTS.md`，添加完整的开发指令（技术栈、命令表、注意事项）。

### 9.2 更新 SetupVmEnvironment

```xml
<function_calls>
<invoke name="SetupVmEnvironment">
  <parameter name="update_script">npm install</parameter>
</invoke>
</function_calls>
```

从空仓库的 `echo` 更新为实际的 `npm install`。

### 9.3 创建 .gitignore

```xml
<function_calls>
<invoke name="Write">
  <parameter name="path">/workspace/.gitignore</parameter>
  <parameter name="contents">node_modules
dist
*.local
</parameter>
</invoke>
</function_calls>
```

### 9.4 Git 提交推送

```bash
git add -A
git status                   # 确认 24 个文件待提交
git commit -m "feat: build MyTravel personal trip planning web app

- React 19 + TypeScript + Vite 7 + Tailwind CSS 4
- Homepage with trip list and empty state
- Trip creation with cover image, dates, budget, notes
- Trip detail with day-by-day itinerary planning
- Activity management with categories
- Real-time budget tracking with category breakdown
- Data persisted in localStorage via Zustand
- Fully responsive modern UI with Chinese localization"

git push origin HEAD
```

---

## 10. 最终回复格式

Agent 的最终回复遵循严格的格式规范：

```markdown
**Walkthrough**
<video src="/opt/cursor/artifacts/demo.mp4" controls></video>
简短描述（一行）

<img src="/opt/cursor/artifacts/screenshot.webp" alt="描述" />

**Summary**
* 变更点 1
* 变更点 2

**Testing**
* ✅ `command` — 通过说明
* ⚠️ `command` — 环境限制警告
* ❌ `command` — 失败（应修复后重试）
```

### 关键规则

- 每个测试命令前必须有状态 emoji：✅ 通过 / ⚠️ 警告 / ❌ 失败
- 视频使用 `<video>` HTML 标签，截图使用 `<img>` HTML 标签
- Artifact 文件放在 `/opt/cursor/artifacts/` 目录
- 如果有 UI 变更，**必须**包含演示视频
- Walkthrough 描述必须简洁，在视频/图片**下方**
- 不使用 markdown 代码块引用代码（用反引号即可）

---

## 11. 关键 XML 标签汇总

### 系统生成的标签

| 标签 | 位置 | 用途 | 可见性 |
|------|------|------|--------|
| `<user_info>` | 第一条消息前 | OS、shell、workspace 等环境信息 | 仅 Agent |
| `<git_status>` | 第一条消息前 | 当前 git 状态快照（不会更新） | 仅 Agent |
| `<user_query>` | 每条用户消息 | 包裹用户的实际输入文本 | 仅 Agent |
| `<system_reminder>` | Agent 回复后 | 系统内部提醒（如 commit 提醒） | 仅 Agent，**禁止向用户提及** |

### Agent 生成的标签

| 标签 | 位置 | 用途 |
|------|------|------|
| `<function_calls>` | Agent 消息中 | 工具调用容器块 |
| `<invoke name="...">` | function_calls 内 | 单个工具调用 |
| `<parameter name="...">` | invoke 内 | 工具参数 |
| `<env_setup_actions>` | 最终回复末尾 | 声明需要用户介入的阻塞操作 |
| `<add_secrets>` | env_setup_actions 内 | 请求用户添加密钥 |
| `<add_test_login>` | env_setup_actions 内 | 请求测试账号 |
| `<external_action>` | env_setup_actions 内 | 请求用户执行外部操作 |

### 系统返回的标签

| 标签 | 用途 |
|------|------|
| `<function_results>` | 工具调用结果容器 |
| `<result>` | 单个工具的返回结果 |
| `<output>` | 工具输出文本 |
| `<output_image>` | computerUse 子代理返回的截图 |

---

## 12. 工具调用模式

### 12.1 并行调用

多个**独立**的工具在同一个 `<function_calls>` 块中并行执行：

```xml
<function_calls>
<invoke name="Task">
  <parameter name="subagent_type">vmSetupHelper</parameter>
  <parameter name="prompt">分析产品架构...</parameter>
</invoke>
<invoke name="Glob">
  <parameter name="glob_pattern">*.md</parameter>
</invoke>
<invoke name="Glob">
  <parameter name="glob_pattern">CLAUDE.md</parameter>
</invoke>
</function_calls>
```

### 12.2 顺序调用

有依赖关系的操作必须等前一个完成后再执行（分成多个 `<function_calls>` 块）：

```xml
<!-- 第一步：读取文件 -->
<function_calls>
<invoke name="Read">
  <parameter name="path">/workspace/package.json</parameter>
</invoke>
</function_calls>

<!-- Agent 等待结果... -->

<!-- 第二步：基于读取内容修改文件 -->
<function_calls>
<invoke name="StrReplace">
  <parameter name="path">/workspace/package.json</parameter>
  <parameter name="old_string">"name": "old"</parameter>
  <parameter name="new_string">"name": "new"</parameter>
</invoke>
</function_calls>
```

### 12.3 Shell 链式命令

```bash
# 有依赖 — 用 && （前一个失败则停止）
git add -A && git commit -m "message" && git push origin HEAD

# 无依赖 — 用 ; （前一个失败也继续）
rm -f old-file; echo "done"
```

### 12.4 后台命令

长时间运行的命令（如 dev server）使用 `is_background: true`：

```json
{
  "command": "npm run dev",
  "is_background": true
}
```

后台命令的输出写入终端文件（如 `/home/ubuntu/.cursor/projects/workspace/terminals/741975.txt`），Agent 可通过 `Read` 工具查看。

---

## 13. 子代理（Subagent）类型汇总

| 类型 | 用途 | 有状态 | 典型场景 |
|------|------|--------|----------|
| `vmSetupHelper` | 探索代码库结构、依赖分析 | 否 | 环境设置阶段 |
| `explore` | 快速代码搜索和文件模式匹配 | 否 | 查找文件/代码 |
| `generalPurpose` | 通用多步骤任务 | 否 | 复杂研究任务 |
| `computerUse` | GUI 手动测试（浏览器/桌面交互） | **是** | UI 测试、演示 |
| `debug` | 假设驱动的 bug 调查 | **是** | 调试可复现的 bug |
| `videoReview` | 分析视频内容 | 否 | 验证录屏内容 |

**有状态子代理**的含义：同一会话中再次调用会自动恢复之前的上下文（浏览器状态、调试状态等），无需重新传入 `resume` 参数。

---

## 14. 完整消息时间线

```
┌─────────────────────────────────────────────────────────────────────┐
│ Turn 1: 环境设置                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ [System]  注入 <user_info>, <git_status>                             │
│ [User]    "Please set up the development environment..."             │
│ [Agent]   并行发起 11 个工具调用（2×Task + 9×Glob）                    │
│ [System]  返回 11 个结果 → 仓库为空                                   │
│ [Agent]   补充验证（Read + 2×Shell 并行）                             │
│ [Agent]   再次确认（2×Shell 并行: git branch + git remote）           │
│ [Agent]   确认（1×Shell: git log main）                              │
│ [Agent]   创建 AGENTS.md (Write) + SetupVmEnvironment 并行           │
│ [Agent]   git commit + push (Shell)                                  │
│ [Agent]   输出最终总结（无 <env_setup_actions>）                      │
├─────────────────────────────────────────────────────────────────────┤
│ Turn 2: System Reminder Hook                                        │
├─────────────────────────────────────────────────────────────────────┤
│ [System]  注入 <system_reminder> (commit-reminder-v1)                │
│ [User]    "Reminder to commit and push if appropriate."              │
│ [Agent]   Shell: git status + git log → 确认已推送                    │
│ [Agent]   回复："Everything is already committed and pushed."         │
├─────────────────────────────────────────────────────────────────────┤
│ Turn 3: 构建旅行规划应用                                              │
├─────────────────────────────────────────────────────────────────────┤
│ [User]    "做一个个人旅行规划的web网站"                                │
│ [Agent]   TodoWrite(merge=false) — 创建 8 个任务                     │
│ [Agent]   Shell: npm create vite → 失败（目录非空）                    │
│ [Agent]   Shell: npm create vite temp-project → 成功                 │
│ [Agent]   Shell: cp + rm 移动文件                                    │
│ [Agent]   Shell: npm install（基础依赖）                              │
│ [Agent]   Shell: npm install（运行时 + 开发依赖）                     │
│ [Agent]   TodoWrite(merge=true) — id:1 completed, id:2 in_progress  │
│ [Agent]   Read: vite.config.ts + package.json（并行）                 │
│ [Agent]   StrReplace: package.json + vite.config.ts（并行）           │
│ [Agent]   Shell: mkdir -p src/{types,store,components,pages}         │
│ [Agent]   Write: index.css + types/index.ts（并行）                   │
│ [Agent]   Write: useTripStore.ts                                     │
│ [Agent]   Write: Layout.tsx + TripCard.tsx（并行）                    │
│ [Agent]   Write: ActivityForm.tsx + ActivityItem.tsx（并行）           │
│ [Agent]   Write: BudgetSummary.tsx                                   │
│ [Agent]   Write: Home.tsx + CreateTrip.tsx（并行）                    │
│ [Agent]   Write: TripDetail.tsx                                      │
│ [Agent]   Write: App.tsx + main.tsx（并行）                           │
│ [Agent]   Read: index.html + Shell: ls src/（并行）                   │
│ [Agent]   StrReplace: index.html + Shell: rm 模板文件（并行）          │
│ [Agent]   TodoWrite(merge=true) — id:2~5 completed, id:6 in_progress│
│ [Agent]   Shell: npx tsc -b → ✅                                     │
│ [Agent]   Shell: npm run lint → ✅                                    │
│ [Agent]   Shell: npm run build → ✅                                   │
│ [Agent]   Shell: npm run dev（is_background=true）                    │
│ [Agent]   Shell: curl localhost:5173 → ✅                             │
│ [Agent]   TodoWrite(merge=true) — id:6 completed, id:7 in_progress  │
│ [Agent]   Task(computerUse): 打开浏览器                               │
│ [Agent]   Shell: cp 截图 + RecordScreen(START_RECORDING)（并行）      │
│ [Agent]   Task(computerUse): 完整演示流程                             │
│ [Agent]   RecordScreen(SAVE_RECORDING) + Shell: cp 截图（并行）       │
│ [Agent]   TodoWrite(merge=true) — id:7 completed, id:8 in_progress  │
│ [Agent]   Write: AGENTS.md + SetupVmEnvironment（并行）               │
│ [Agent]   Write: .gitignore                                          │
│ [Agent]   Shell: git add -A + status                                 │
│ [Agent]   Shell: git commit + push                                   │
│ [Agent]   TodoWrite(merge=true) — id:8 completed                    │
│ [Agent]   输出最终总结（含 <video> + <img>）                          │
├─────────────────────────────────────────────────────────────────────┤
│ Turn 4: 编写本文档                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ [User]    "写下整个流程到 md 文件"                                    │
│ [Agent]   Write: docs/cloud-agent-workflow.md                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. env_setup_actions XML 格式说明

当环境设置被阻塞（需要用户操作）时，Agent 在最终回复的**最末尾**输出此 XML 块。

### 完整示例

```xml
<env_setup_actions version="1">

  <!-- 请求用户添加密钥 -->
  <add_secrets>
    <secret name="DB_CONNECT_STRING" />
    <secret name="STRIPE_API_KEY" />
    <reason><![CDATA[
      需要这些密钥来运行 API 启动检查和 Stripe 集成测试。
    ]]></reason>
  </add_secrets>

  <!-- 请求测试登录账号（含 OTP 2FA） -->
  <add_test_login
    username_secret_name="TEST_LOGIN_USERNAME"
    password_secret_name="TEST_LOGIN_PASSWORD"
    otp_seed_secret_name="TEST_LOGIN_OTP_SEED">
    <reason><![CDATA[
      需要此账号来运行端到端登录 + 2FA 测试。
    ]]></reason>
  </add_test_login>

  <!-- 请求用户执行外部操作 -->
  <external_action id="create_oauth_app" title="创建 OAuth 应用">
    <instructions><![CDATA[
      1. 访问 OAuth 提供商控制台
      2. 创建应用并添加回调 URL
      3. 保存更改
    ]]></instructions>
  </external_action>

  <!-- 请求用户在桌面面板登录 -->
  <external_action id="desktop_login" title="通过桌面面板登录">
    <instructions><![CDATA[
      1. 打开桌面面板，导航到目标服务
      2. 使用您的账号登录并完成 MFA
      3. 返回这里确认完成

      注意：VM 快照中的 session/cookie 持久性取决于目标服务，可能会过期。
    ]]></instructions>
  </external_action>

</env_setup_actions>
```

### 关键规则

| 规则 | 说明 |
|------|------|
| 位置 | **必须在消息最末尾**，XML 块后面不能有任何内容 |
| 非空 | 如果没有阻塞操作，**不输出此块** |
| 不重复 | `add_test_login` 中的 secret name 不要在 `add_secrets` 中重复 |
| CDATA | 包含 `<`, `>`, `&` 等特殊字符时必须用 `<![CDATA[...]]>` 包裹 |
| 先检查 | 在请求 secret 前，**必须先检查**环境变量中是否已存在 |

本次会话中**未使用**此标签，因为没有被阻塞的操作。

---

## 16. SetupVmEnvironment 关键约束

`update_script` 是在每个 Cloud Agent 会话启动时（拉取最新代码后）自动执行的脚本。

### 允许 vs 不允许

| ✅ 允许 | ❌ 不允许 |
|---------|-----------|
| `npm install` | `npm run dev`（服务启动） |
| `pip install -r requirements.txt` | `docker compose up`（服务启动） |
| `pnpm install` | `npm run build`（构建命令） |
| `uv sync` | `python manage.py runserver`（服务启动） |
| | `export FOO=bar`（环境变量） |
| | `echo ... >> ~/.bashrc`（shell 配置） |
| | `python manage.py migrate`（迁移） |

### 核心原则

1. **幂等** — 多次运行结果完全相同
2. **最小化** — 仅依赖刷新，不含服务启动/构建/迁移
3. **健壮** — 即使 PR 未合并，脚本也不应失败
4. **多行格式** — 复杂脚本用换行分隔（不用 `&&`）

---

## 17. AGENTS.md 结构约束

`## Cursor Cloud specific instructions` 部分的内容规范：

### 应该包含

- 技术栈简述
- 非显而易见的启动/运行注意事项和 gotchas
- 服务的简要描述和运行命令（或指向文档的引用）
- 关键发现（如"Tailwind CSS 4 无需 config 文件"）

### 不应包含

- 依赖安装步骤（属于 update_script）
- 一次性设置操作
- 系统依赖安装
- pre-commit hook 设置
- 已在 README/package.json 中有文档的显而易见的内容（应引用而非复制）

---

## 18. 关键系统提示摘要

Agent 的行为受系统提示（system prompt）中以下核心规则约束：

| # | 规则 | 说明 |
|---|------|------|
| 1 | 不修改现有代码 | 环境设置阶段，假设仓库已经可以工作 |
| 2 | 必须测试 | 不能提交未经端到端验证的代码 |
| 3 | 必须提供证据 | 截图、视频、日志等 walkthrough artifacts |
| 4 | 不提及 system_reminder | Agent 绝不能向用户提及系统提醒的存在 |
| 5 | 不用 pkill -f | 杀进程必须用具体 PID |
| 6 | 不杀测试服务 | 留给用户继续使用 |
| 7 | Git 操作明确 | add → commit → push，不 force push |
| 8 | 不创建 PR | 系统自动处理 PR/MR |
| 9 | 优先正确性 | 不跳过验证步骤 |
| 10 | 使用专用工具 | 不用 cat/head/tail 读文件，不用 sed/awk 编辑 |
| 11 | 不用 emoji | 除非用户明确要求 |
| 12 | 自主运行 | Cloud Agent 不向用户提问，直接根据信息行动 |

---

## 19. 工具清单

本次会话中使用的所有工具：

| 工具 | 调用次数 | 用途 |
|------|----------|------|
| `Shell` | ~20 | 执行终端命令 |
| `Write` | ~16 | 创建/覆写文件 |
| `Read` | ~4 | 读取文件内容 |
| `Glob` | 9 | 按模式搜索文件 |
| `StrReplace` | 4 | 精确替换文件内容 |
| `Task` | 4 | 启动子代理 |
| `TodoWrite` | 6 | 管理任务列表 |
| `SetupVmEnvironment` | 2 | 设置 VM 更新脚本 |
| `RecordScreen` | 2 | 录屏控制 |
| `Delete` | 0 | （本次未使用，可删除文件） |
| `Grep` | 0 | （本次未使用，可搜索文件内容） |
| `WebSearch` | 0 | （本次未使用，可搜索互联网） |
| `EditNotebook` | 0 | （本次未使用，可编辑 Jupyter） |

---

*文档生成于 2026-03-09，记录 Cursor Cloud Agent 会话全流程。*
