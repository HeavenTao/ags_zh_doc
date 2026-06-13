# 应用与 CLI

`app` 是 [Gtk.Application](https://docs.gtk.org/gtk4/class.Application.html) 的单例**实例**。

根据 Gtk 版本，导入路径会有所不同：

```ts
import app from "astal/gtk3/app"
import app from "astal/gtk4/app"
```

> [!TIP]
>
> `app` 实例的 DBus 名称前缀为 `io.Astal`。如果你编写的 Shell 是用于分发的，你可能希望避免使用 `app`，而是创建 `Gtk.Application` 或 `Adw.Application` 的子类，同时遵循
> [打包约定](https://gjs.guide/guides/gtk/application-packaging.html)。

::: details 示例：自定义 App 实现

```tsx
import Astal from "gi://Astal?version=4.0"
import Gio from "gi://Gio?version=2.0"
import GObject from "gi://GObject?version=2.0"
import Gtk from "gi://Gtk?version=4.0"
import { programInvocationName, programArgs } from "system"
import { createRoot } from "gnim"

class App extends Gtk.Application {
  static {
    GObject.registerClass(this)
  }

  constructor() {
    super({
      applicationId: "my.awesome.app",
      flags: Gio.ApplicationFlags.HANDLES_COMMAND_LINE,
    })
  }

  vfunc_command_line(cmd: Gio.ApplicationCommandLine): number {
    const args: string[] = cmd.get_arguments()

    if (cmd.isRemote) {
      console.log("从远程实例调用")
      cmd.print_literal("来自主实例的问候")
      cmd.done()
    } else {
      this.main(args)
    }

    return 0
  }

  private main(args: string[]) {
    createRoot((dispose) => {
      this.connect("shutdown", dispose)

      return (
        <Astal.Window name="bar" application={this}>
          <Gtk.CenterBox>
            <Gtk.Label $type="center" label="我的超棒状态栏" />
          </Gtk.CenterBox>
        </Astal.Window>
      )
    })
  }
}

const app = new App()
app.runAsync([programInvocationName, ...programArgs])
```

:::

## 入口点

通常应避免在模块的顶层创建资源，而是在 `main` 函数的作用域内创建所有内容。这是因为可能以[客户端](./app-cli#客户端)进程的方式运行。

:::code-group

```tsx [app.tsx]
const globalInstance = SomeLibrary.get_default() // [!code --]

function Bar() {
  const globalInstance = SomeLibrary.get_default() // [!code ++]

  return <></>
}

app.start({
  main() {
    Bar()
  },
})
```

:::

## 实例标识符

你可以通过定义唯一的实例名称来运行多个实例。

```ts
app.start({
  instanceName: "my-instance", // 默认为 "ags"
  main() {},
})
```

## 从 CLI 发送消息

如果你想从 CLI 与实例交互，可以通过发送请求来实现。请求是一个参数数组。

```ts
app.start({
  requestHandler(argv: string[], response: (response: string) => void) {
    const [cmd, arg, ...rest] = argv
    if (cmd == "say") {
      return response(arg)
    }
    response("未知命令")
  },
  main() {},
})
```

`response` 函数每个请求只能调用一次。`ags request` 命令会等待直到收到响应，然后将响应打印出来并退出。

```sh
ags request say hi
# hi
```

也可以通过连接 `request` 信号来定义请求处理器。

```ts
app.connect("reqeust", (app, [cmd, arg, ...rest], response) => {
  if (cmd === "say") {
    response(arg)
  }
})
```

## 通过名称切换窗口可见性

为了让应用程序了解你的窗口，你需要注册它们。可以通过指定一个**唯一**的 `name` 并调用 `app.add_window()` 来实现：

```tsx {5}
import app from "astal/gtk4/app"

function Bar() {
  return (
    <window name="Bar" $={(self) => app.add_window(self)}>
      <box />
    </window>
  )
}
```

你也可以通过简单地将 `app` 传递给 `application` 属性来调用 `app.add_window()`。

```tsx {5}
import app from "astal/gtk4/app"

function Bar() {
  return (
    <window name="Bar" application={app}>
      <box />
    </window>
  )
}
```

> [!WARNING]
>
> 分配 `application` 属性时，请确保 `name` 在前。属性是按顺序设置的，如果 name 在 application 之后应用，则不会生效。

使用 `ags` CLI 切换窗口的可见性。

```sh
ags toggle Bar
```

> [!TIP]
>
> 在 JavaScript 中，你可以获取窗口实例并使用 `app.get_window()` 来切换它：
>
> ```ts
> const bar = app.get_window("Bar")
> if (bar) bar.visible = true
> ```

## 客户端

首次调用 `app.start()`（例如使用 `ags run`）时，`main` 块会被执行。当该实例正在运行时，任何后续对 app 的执行都将简单地调用[请求](#从-cli-发送消息)。例如，再次运行 `ags run` 将等同于运行 `ags request`。

:::code-group

```ts [app.ts]
app.start({
  requestHandler(argv, response) {
    console.log("请求", ...argv)
    response("来自主实例的问候")
  },
  main(...argv: string[]) {
    console.log(...argv)
  },
})
```

:::
