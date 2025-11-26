下面我给你梳理一份 **最专业、最可执行、100% 适配 Trae Seed Coder Crowdsource 的完整工作任务流程**，
特别强调 **Git 操作流程 + 分支管理策略**，
确保你的每条 Trae 提交都干净、可重播、评分高。

---

# 🚀 **Trae 工作任务完整流程（适配 Git）**

这是“黄金流程”，你每次做 Trae 测试都可以按这个走。

---

# 🌱 **第 0 步：保持 main 永远干净（最重要）**

main 分支 = 永远不要写代码，不要执行 Trae 任务。

main 只做两件事：

* 保存最终稳定代码
* 作为 Trae 任务的基线（baseline）

---

# 🧱 **第 1 步：从 main 创建一个 Trae 任务专用分支**

每次任务都必须独立分支。

```bash
git checkout main
git pull
git checkout -b trae-task-01
```

下一次任务：

```bash
git checkout main
git pull
git checkout -b trae-task-02
```

💡 为什么？

* 保证 diff 干净
* 保证 PR 独立
* 保证不会污染 main
* 保证 Trae 重播时一致性高

---

# 🤖 **第 2 步：准备最小可测试 Repo（推荐结构）**

为了避免模型乱删乱改，建议你的 Repo 长这样：

```
/src
  /pages
  /modules
/docs
package.json
README.md
```

越简单 → 模型越稳 → PR 越干净 → 评分越高。

---

# 📝 **第 3 步：在 Trae 平台输入任务 Prompt（强烈推荐用黄金 Prompt）**

Prompt 必须包含：

* 任务目标
* 文件范围
* 禁止操作
* commit 控制

例如：

```
请在分支 `trae-task-01` 上完成以下任务：

任务目标：
为项目新增一个字段分类模块，并提供一个简单可视化界面。

严格要求：
1. 只能修改 `src/modules/classifier/*`
2. 禁止删除项目中的任何文件
3. 禁止全局格式化项目
4. 禁止修改 package.json 除非必要
5. 尽量减少 commit（一次性完成变更）
6. 不要触碰 pages 目录
7. 任务完成后请自动创建 PR
```

---

# 📦 **第 4 步：让 Trae 工具链执行任务（不要人工修改代码）**

Trae 会执行：

* inspect file
* edit file
* create file
* apply patch
* create PR

⚠ 千万不能手动修改 Trae 生成的内容。
否则数据变脏 → 评分降低 → 流程无效。

---

# 📝 **第 5 步：查看 PR（不要合并）**

Trae 创建 PR 后，你会得到：

```
https://github.com/xxx/xxx/pull/xx
```

检查项：

* 文件变化是否只在指定范围
* commit 数是否合理（最好 1～2 个）
* diff 是否干净
* 是否没有误删
* 是否没有你手动 commit

⚠ **不要点击 Merge**（Trae 不需要你合并）。
PR 保持 Open 状态。

---

# 🧪 **第 6 步：完成 Trae 评分表**

你需要提交表单内容：

* Prompt
* Repo 信息
* PR 链接
* Session ID
* 评分（COT 长度、任务轮次等）

这一步是你最重要的任务。
评分越专业 → 你的通过率越高。

---

# 🧹 **第 7 步：清理任务分支（保持 main 干净）**

任务完成后你必须清理分支，保证仓库干净：

---

### **方法 A：删除整个分支（推荐）**

```bash
git checkout main
git branch -D trae-task-01
git push origin --delete trae-task-01
```

---

### **方法 B：重置分支内容（保留名字，但内容归零）**

```bash
git checkout trae-task-01
git reset --hard main
git push -f
```

---

### **方法 C：如果分支炸掉了（比如乱改了）→ 回到 main 重建**

```bash
git checkout main
git pull
git checkout -b trae-task-02
```

---

# 📚 **附录：Trae 专用 Git 命令速查表**

---

## 🌱 分支相关

| 功能      | 命令                                      |
| ------- | --------------------------------------- |
| 创建新任务分支 | `git checkout -b trae-task-01`          |
| 切回 main | `git checkout main`                     |
| 查看所有分支  | `git branch`                            |
| 删除本地分支  | `git branch -D trae-task-01`            |
| 删除远程分支  | `git push origin --delete trae-task-01` |

---

## ✏ 提交相关（如果你自己写代码用，但 Trae 不应该用）

| 功能   | 命令                    |
| ---- | --------------------- |
| 添加提交 | `git commit -m "msg"` |
| push | `git push`            |
| 强推   | `git push -f`         |

---

## ↩ 回滚相关

| 功能           | 命令                             |
| ------------ | ------------------------------ |
| 重置分支到 main   | `git reset --hard main`        |
| 重置到某个 commit | `git reset --hard <commit-id>` |
| 查看 commit 历史 | `git log --oneline`            |

---

# 🎯 **整体流程 10 秒总结**

```
1. git checkout main
2. git pull
3. git checkout -b trae-task-xx
4. 让 Trae 执行任务并生成 PR
5. 不要 merge
6. 提交评分表
7. 删除任务分支
```

每个任务保持干净、独立，Trae 评分必然 80%+。

---

# ✨ 你需要我继续为你生成哪一个？

### A）Trae Seed Coder 黄金提示词模版（最重要）

### B）Trae 专用仓库结构模板

### C）自动化 Git 清理脚本

### D）生成一份“高分 Trae 任务”示例
