# 快速开始

只需几行代码即可在你的屏幕上运行一个状态栏。

## 你将会用到的工具

- [Gnome JavaScript (GJS)](https://gjs.guide/) 是 JavaScript 运行时
- [Astal](https://aylur.github.io/astal/) 是一套库，可让你查询和与系统的各个部分进行交互
- [Gnim](https://aylur.github.io/gnim/) 是一个 GJS 库，允许你使用 JSX 编写组件
- [AGS](https://aylur.github.io/ags/) 是一个 CLI 工具，让你跳过搭建开发环境的步骤，直接以 TypeScript 编写桌面 Shell

## 单文件启动

首先在系统任意位置创建一个文件。

::: code-group

```tsx [<i class="devicon-typescript-plain"></i> mybar.tsx]
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

:::

使用以下命令运行：

```sh
ags run ./mybar.tsx
```

或者，你可以添加 shebang 并使其可执行：

```ts [mybar.tsx]
#!/usr/bin/env -S ags run
import app from "ags/gtk4/app"

app.start({
  main() {
    // 入口点
  },
})
```

```sh
chmod +x mybar.tsx
./mybar.tsx
```

要搭建 TypeScript 开发环境，请使用 `types` 命令：

```sh
ags types -u -d /path/to/project/root
```

## 使用模板

建议从模板开始，它会为你设置好 TypeScript 开发环境所需的文件。

使用以下简单命令即可通过模板开始：

```sh
ags init -d /path/to/project
```

如果你使用 Nix，还有一个 flake 模板：

```sh
nix flake init --template github:aylur/ags
```
