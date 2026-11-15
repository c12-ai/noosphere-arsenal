# Current C12 AI full-stack role baseline

Use this role baseline only when the user requests the current C12 AI full-stack interview workflow without supplying another JD. A JD supplied in the current request always overrides this reference.

Last updated from the hiring manager's JD: 2026-08-17.

Hard-gate confirmation: Drake confirmed on 2026-11-15 that the bachelor's-degree requirement below remains a non-waivable gate for this role. A clearly related discipline qualifies; ambiguous matches require HR verification.

## 岗位职责

1. 根据经验独立负责一条产品线，或在指导下负责子系统，覆盖需求澄清、方案设计、开发实现、部署上线与后续迭代。产品包括 AI Agent 系统、实验室机器人编排管理系统和配套前后端应用。
2. 连接用户侧产品、内部 AI 化学引擎和机器人系统，与算法、机器人团队共同定义跨系统接口、状态语义与数据回流，确保任务从发起、执行到结果回传可追踪、可校验。
3. 把模糊需求拆解为清晰、可验收的 spec，驱动 AI agent 高效完成实现，并对最终质量负责。
4. 参与代码评审，建立并执行可重复的质量机制，包括自动化测试、CI 检查、上线验证和故障复盘。
5. 将有效的 AI 研发实践沉淀为文档模板、验证脚本和工作流程等，在团队内复用并持续迭代。

## 硬性要求

1. 本科及以上学历，计算机科学或相关专业；年限不限，以实际能力为准。
2. 有端到端交付的完整项目经历（工作、实习或个人项目均可）：从设计、开发到部署上线/发布都实际参与过，能讲清自己负责部分的关键决策和踩过的坑。前端框架（React 优先）、后端语言（Python 优先）、数据库（PostgreSQL/MySQL）、RESTful API、容器化部署（Docker）等基本功，理应在这个过程中覆盖。
3. 日常深度使用 AI 编码工具（Claude Code / Codex / Cursor 等），有自己拆解任务、验证 AI 产出的方法。
4. 具备跨系统架构与数据流思维：能讲清系统边界、关键状态和数据走向，能判断需求、接口或数据格式变化会影响哪些模块，以及如何兼容、迁移和验证。

对初级候选人，不要求大型生产系统经历，但应有可运行、可发布的完整作品，能讲清个人贡献、验证方式和下一步改进。

## 核心素质

1. 交付意识：为结果负责到底，不把“代码写完”当终点。
2. 沟通表达能力：面对模糊需求，先澄清问题、界定范围、定义验收标准，再动手实现——包括向非工程背景的协作方澄清需求。
3. 验证纪律：默认任何产出（AI 的、他人的、自己的）都需要验证；踩过的坑会固化成检查。
4. 务实的演进判断：根据变化发生的可能性和失败代价，决定要做多少兼容、隔离和验证。为已知或高概率变化留出余地，把改动影响控制在局部。不为没有证据的未来场景预建复杂框架。
5. 好奇心与自驱：在工作要求之外主动探索，愿意打破自己的能力边界。

## 加分项

1. AI Agent 系统开发经验（LangChain / LangGraph / MCP 等）。
2. RAG 系统工程化经验（向量数据库、Embedding、检索优化）。
3. 具身智能 / 机器人相关开发经验（ROS、VLA 模型、物理 AI）。
4. AI 原生产品从 0 到 1 的构建经验。
5. 开源项目贡献、技术博客、论文阅读笔记等持续输出。
6. 有生产系统的长期维护与迭代经历。

## Role-specific assessment calibration

Define the bar before reading the candidate evidence. Use these dimensions and weights for this role unless a supplied JD changes the bar:

| Dimension | Weight | Core evidence to seek |
|---|---:|---|
| End-to-end delivery and ownership | 20 | Requirement clarification, design, implementation, release or deployment, iteration, personal decisions, failures, and follow-through |
| Cross-system architecture and data flow | 20 | Boundaries, contracts, state semantics, data lineage, impact analysis, compatibility, migration, traceability, and validation |
| Full-stack implementation fundamentals | 15 | React or equivalent frontend work, Python or equivalent backend work, SQL database design, REST APIs, Docker, debugging, and maintainable code |
| Problem framing, specs, and communication | 15 | Clarifying ambiguity, defining scope and acceptance criteria, communicating with non-engineers, and converting needs into testable specs |
| Verification, quality, and reliability | 15 | Automated tests, CI, review discipline, release verification, observability, incident learning, and reusable checks |
| AI-native development workflow | 10 | Daily AI coding use, task decomposition, constraints, review of generated work, testing, correction loops, and accountability for final quality |
| Pragmatic evolution, learning, and reuse | 5 | Evidence-based extensibility, localizing likely change, avoiding speculative frameworks, self-directed learning, and reusable engineering artifacts |

Apply these rules:

- Treat the bachelor's degree in computer science or a clearly related discipline as an explicit gate because it appears under “硬性要求.” If whether a discipline is related is genuinely ambiguous, mark it for HR verification instead of inferring failure from a title alone.
- Do not impose a years-of-experience gate. Calibrate expected independence to demonstrated experience: product-line ownership for stronger candidates, guided subsystem ownership for junior candidates.
- Treat a complete work, internship, coursework, or personal project as valid end-to-end evidence when it is runnable or published and the candidate can explain personal contribution, decisions, verification, and next improvements.
- Do not award end-to-end credit for code-only work without evidence of release, deployment, user validation, or an equivalent completion boundary.
- Treat React and Python as preferences, not exclusive technologies. Judge whether adjacent experience demonstrates fast transfer while still verifying the listed frontend, backend, database, API, and container fundamentals.
- Assess AI-tool depth from the candidate's method for scoping, directing, reviewing, testing, and correcting AI output—not from tool names or token volume.
- Require deterministic controls for authorization, state integrity, safety-critical actions, and final validation. Prompt instructions or model self-checks alone are insufficient.
- Evaluate bonus experience only after core dimensions. Agent, RAG, robotics, open-source, or publication signals cannot compensate for material gaps in delivery, full-stack fundamentals, cross-system reasoning, or verification discipline.
- For junior candidates, lower the expected scale, not the expected clarity, ownership, or verification discipline.
