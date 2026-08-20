# dsh-openspec

DeepSeek Harness Web UI 插件：在会话标题栏打开当前项目的 `openspec/` 目录，浏览、预览、编辑并保存其中的文件。

## 它做什么

安装后，Web UI 会话标题栏 **Session log** 旁会出现 **OpenSpec** 按钮。点击弹出面板：

- 跟随当前会话的工作区（或会话目录），**不用再配置项目路径**
- 项目里有 `openspec/`：列出该文件夹下的全部内容（`config.yaml`、`specs/`、`changes/`、`archive/` 等）
- 没有 `openspec/`：提示「当前项目没有 OpenSpec」
- `.md` 做 Markdown 预览，其他文本按源码预览，都可以编辑保存
- 保存成功以 Host 写盘确认为准
- 不创建、删除或重命名文件，不调用 `openspec` CLI

配色跟随 Harness Web UI 主题（含明暗切换）。

针对 DeepSeek Harness **0.1.0-rc.5** 的 Web profile。其他版本请自行核对扩展点是否仍可用。

## 安装到自己的 DeepSeek Harness Web UI

需要本机已能运行 `dsh`，并且使用 **web** profile（`dsh web` 或 `dsh --profile web`）。

### 源码安装

先把仓库克隆到本地：

```sh
git clone https://github.com/wx971025/dsh-openspec.git
cd dsh-openspec
```

再用本仓库的绝对路径装进 web profile：

```sh
dsh plugin --profile web add /absolute/path/to/dsh-openspec
```

这是本地 `link:` 安装：profile 会指向这个目录，**目录要一直留着**，删掉或挪走后插件会加载失败。

### Git 安装

不克隆到本地，直接让 profile 从 GitHub 拉取：

```sh
dsh plugin --profile web add github:wx971025/dsh-openspec
```

等价写法：

```sh
dsh plugin --profile web add git+https://github.com/wx971025/dsh-openspec.git
```

pnpm 10 可能要求允许该包的构建脚本。若安装时提示 blocked，按终端说明把对应 key 写入 profile 的 `pnpm-workspace.yaml` 的 `allowBuilds`，再执行一次上面的 `dsh plugin add`。

### 启动

```sh
dsh web
```

浏览器打开 Harness Web（默认 `http://127.0.0.1:3080`）。打开一个**已经绑定了项目目录**的会话，点标题栏 **OpenSpec**。

该项目根目录下有 `openspec/` 就会列出文件；没有则提示没有 OpenSpec。

确认是否装上：

```sh
dsh --profile web --dump-config
```

输出里应能看到 `dsh-openspec`。

## 卸载

```sh
dsh plugin --profile web remove dsh-openspec
```

卸载后按钮和 `/openspec-viewer` 接口会消失。磁盘上的 `openspec/` 文件不会被删。
