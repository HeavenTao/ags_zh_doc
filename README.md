<p align="center">
  <img src="https://aylur.github.io/astal/icon.svg" width="96" alt="AGS Logo">
</p>

<h1 align="center">AGS 中文教程</h1>

<p align="center">
  <strong>一个用于构建 Wayland 桌面 Shell 的框架</strong><br>
  使用 JavaScript / TypeScript 和 JSX 编写你的桌面 Shell
</p>

<p align="center">
  <a href="#-快速开始">🚀 快速开始</a> &nbsp;|&nbsp;
  <a href="#-教程目录">📚 教程目录</a> &nbsp;|&nbsp;
  <a href="https://github.com/aylur/ags" target="_blank">⭐ GitHub</a> &nbsp;|&nbsp;
  <a href="https://discord.gg/CXQpHwDuhY" target="_blank">💬 Discord</a>
</p>

> 翻译自 [AGS 官方文档](https://aylur.github.io/ags/)（v2，基于 Astal + Gnim）。代码块全部保留原文以确保语法高亮正常。所有 `.zh.md` 文件可独立在 VSCode / GitHub 中预览。

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🚀 **初始化项目** | `ags init` 一键生成项目模板 |
| 📝 **TypeScript 类型** | `ags types` 从 GObject 库自动生成类型 |
| 📦 **打包项目** | `ags bundle` 打包为单个可执行脚本 |
| ▶️ **运行项目** | `ags run` 无需预先打包即可运行 |

### 使用熟悉的主流语言

AGS 使用 JavaScript / TypeScript，JSX 语法借鉴 React / Solid 等 Web 框架：

```tsx
function Bar() {
  const [counter, setCounter] = createState(0)
  const date = createPoll("", 1000, `date "+%H:%M - %A %e."`)

  return (
    <window visible anchor={TOP | LEFT | RIGHT}>
      <centerbox>
        <label $type="start" label={date} />
        <button $type="end" onClicked={() => setCounter((c) => c + 1)}>
          <label label={counter((c) => `已点击 ${c} 次`)} />
        </button>
      </centerbox>
    </window>
  )
}
```

### 电池功能已内置

通过 [Astal](https://aylur.github.io/astal/) 库直接查询系统信息：

```tsx
function BatteryLabel() {
  const percentage = createBinding(Battery.get_default(), "percentage")
  return <label label={percentage((p) => `${Math.round(p * 100)}%`)} />
}

function MediaPlayers() {
  const players = createBinding(Mpris.get_default(), "players")
  return (
    <For each={players}>
      {(player) => (
        <button
          label={createBinding(player, "title")}
          onClicked={() => player.play_pause()}
        />
      )}
    </For>
  )
}
```

### 使用 CSS 定制样式

GTK 支持 CSS 样式，AGS 还支持 SASS，涵盖 CSS 变量、关键帧动画、变换等：[支持的 CSS 特性 →](https://docs.gtk.org/gtk4/css-properties.html)

```css
button {
  animation: wiggle 2s linear infinite;
}

@keyframes wiggle {
  0%  { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40% { transform: rotateZ(0); }
  100% { transform: rotateZ(0); }
}
```

---

## 🖼️ 作品展示

| [![Delta Shell](https://i.imgur.com/rnEX49B.png)](https://github.com/Sinomor/delta-shell) | [![Epik Shell](https://raw.githubusercontent.com/Aylur/astal/f5c1d29a37d6404999aee9210cdbf09ed6a278be/docs/public/showcase/ezerinz.webp)](https://github.com/ezerinz/epik-shell) |
|:---:|:---:|
| [**Delta Shell**](https://github.com/Sinomor/delta-shell) by Sinomor | [**Epik Shell**](https://github.com/ezerinz/epik-shell) by ezerinz |

| [![colorshell](https://raw.githubusercontent.com/retrozinndev/colorshell/238fde6e287c79dbcbe5df9f478aa4b71c602e37/repo/shots/center-window-control-center.png)](https://github.com/retrozinndev/colorshell) | [![OkPanel](https://raw.githubusercontent.com/JohnOberhauser/OkPanelScreenshots/refs/heads/main/menu.png)](https://github.com/JohnOberhauser/OkPanel) |
|:---:|:---:|
| [**colorshell**](https://github.com/retrozinndev/colorshell) by retrozinndev | [**OkPanel**](https://github.com/JohnOberhauser/OkPanel) by John Oberhauser |

<p align="center">
  <a href="https://github.com/Aylur/marble-shell" target="_blank">
    <img src="https://marble-shell.pages.dev/full.png" width="600" alt="Marble Shell"><br>
    <strong>Marble Shell</strong> by Aylur
  </a>
</p>

---

## 🚀 快速开始

### 安装

#### Arch Linux

```sh
yay -S aylurs-gtk-shell-git
```

#### Nix

```sh
nix shell github:aylur/ags
```

#### 从源码编译

1. 安装 [Astal 包](https://aylur.github.io/astal/guide/installation)：`astal-io` `astal3` `astal4`

2. 安装依赖：

<details>
<summary><b>Arch</b></summary>

```sh
sudo pacman -Syu \
    npm meson ninja go gobject-introspection \
    gtk3 gtk-layer-shell \
    gtk4 gtk4-layer-shell
```
</details>

<details>
<summary><b>Fedora</b></summary>

```sh
sudo dnf install \
    npm meson ninja golang gobject-introspection-devel \
    gtk3-devel gtk-layer-shell-devel \
    gtk4-devel gtk4-layer-shell-devel
```
</details>

3. 克隆并编译：

```sh
git clone https://github.com/aylur/ags.git
cd ags
npm install
meson setup build
meson install -C build
```

> ⚠️ 默认情况下，meson 安装到 `/usr/local` 目录。

### 第一个组件

```tsx
import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import { createPoll } from "ags/time"

app.start({
  main() {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    const clock = createPoll("", 1000, "date")

    return (
      <window visible anchor={TOP | LEFT | RIGHT}>
        <label label={clock} />
      </window>
    )
  },
})
```

```sh
ags run ./mybar.tsx
```

---

## 📚 教程目录

| # | 页面 | 文件 | 说明 |
|---|------|------|------|
| 1 | **安装** | [install.zh.md](install.zh.md) | Arch / Nix / 源码编译 |
| 2 | **快速开始** | [quick-start.zh.md](quick-start.zh.md) | 单文件启动、模板使用 |
| 3 | **首个组件** | [first-widgets.zh.md](first-widgets.zh.md) | JSX 语法、状态管理、动态渲染 |
| 4 | **主题** | [theming.zh.md](theming.zh.md) | CSS 样式表、运行时主题 |
| 5 | **应用与 CLI** | [app-cli.zh.md](app-cli.zh.md) | 入口点、实例、请求处理 |
| 6 | **工具函数** | [utilities.zh.md](utilities.zh.md) | 文件/进程/时间/HTTP |
| 7 | **资源** | [resources.zh.md](resources.zh.md) | Astal 库、GJS 参考 |
| 8 | **内建元素** | [intrinsics.zh.md](intrinsics.zh.md) | Gtk3/Gtk4 内置组件参考 |
| 9 | **常见问题** | [faq.zh.md](faq.zh.md) | 环境变量、图标、按键绑定等 |
| 10 | **示例** | [examples.zh.md](examples.zh.md) | 官方示例截图与链接 |
| 11 | **Nix** | [nix.zh.md](nix.zh.md) | NixOS / home-manager 集成 |
| 12 | **迁移指南** | [migration-guide.zh.md](migration-guide.zh.md) | 从 v1 / v2 迁移 |

---

## 🔗 参考链接

| 资源 | 链接 |
|------|------|
| AGS 官方文档 | https://aylur.github.io/ags/ |
| AGS GitHub | https://github.com/aylur/ags |
| Astal 库 | https://aylur.github.io/astal/ |
| Gnim（JSX 引擎） | https://aylur.github.io/gnim/ |
| GJS 指南 | https://gjs.guide/ |
| GJS 参考 | https://gjs-docs.gnome.org/ |
| GTK4 CSS 属性 | https://docs.gtk.org/gtk4/css-properties.html |
| GTK 检查器 | https://wiki.gnome.org/Projects/GTK/Inspector |

---

<p align="center">
  <sub>AGS 基于 GPL v3.0 许可证发布 | Logo 由 VDawg 制作 | 中文翻译仅供参考，以<a href="https://aylur.github.io/ags/">官方文档</a>为准</sub>
</p>
