# 常见问题解答

## 标准库

GJS 不包含你可能用惯的 Node.js API。你可以在 [GLib](https://docs.gtk.org/glib/) 和 [Gio](https://docs.gtk.org/gio/) 中找到大多数 API 的替代方案。

## 避免使用 JSX

JSX 语法完全是可选的。在底层，它只是[函数组合](https://aylur.github.io/gnim/jsx#jsx-expressions-and-jsx-function)的语法糖。

```tsx
function Bar() {
  // [!code --:5]
  return (
    <window name="Bar">
      <box />
    </window>
  )
  // [!code ++:4]
  return jsx(Astal.Window, {
    name: "Bar",
    children: [jsx(Gtk.Box, {})],
  })
}
```

> [!TIP]
>
> 你可以将 Gtk/Astal 组件包装在一个简单的函数中，以实现 AGSv1 中使用的语法：
>
> ```ts
> import { CCProps, jsx } from "ags"
> import { Gtk, Astal } from "ags/gtk4"
>
> const Box = (props: Partial<CCProps<Gtk.Box, Gtk.Box.ConstructorProps>>) =>
>   jsx(Gtk.Box, props)
>
> const Window = (
>   props: Partial<CCProps<Astal.Window, Astal.Window.ConstructorProps>>,
> ) => jsx(Astal.Window, props)
>
> function Bar() {
>   return Window({
>     name: "Bar",
>     children: [Box({ children: ["你好啊"] })],
>   })
> }
> ```

## 显示器 ID 与合成器不匹配

窗口期望的显示器 id 属性是由 Gdk 映射的，并不总是与合成器一致。请改用 `gdkmonitor` 属性，它期望一个 `Gdk.Monitor` 对象。

```tsx
function Bar(gdkmonitor) {
  return <window gdkmonitor={gdkmonitor} />
}

function main() {
  for (const monitor of app.get_monitors()) {
    if (monitor.model == "your-desired-model") {
      Bar(monitor)
    }
  }
}
```

## 环境变量

JavaScript **不是** bash 或其他 shell 环境。

```ts
const HOME = exec("echo $HOME") // 不会按你期望的方式工作
```

`exec` 和 `execAsync` 按原样运行传递的程序，它**不**在 shell 环境中运行，因此上面的例子只是将 `$HOME` 作为字符串字面量传递给 `echo` 程序。

:::danger 请不要这样做

```ts
const HOME = exec("bash -c 'echo $HOME'")
```

:::

你可以使用 [GLib.getenv](https://gjs-docs.gnome.org/glib20~2.0/glib.getenv) 来读取环境变量。

```ts
import GLib from "gi://GLib"

const HOME = GLib.getenv("HOME")
```

## 自定义 SVG 符号图标

将 SVG 文件放在遵循 freedesktop 规范的目录中，命名为 `<icon-name>-symbolic.svg`，并使用 `app.add_icons()` 或 `app.start()` 中的 `icons` 参数。

```txt
.
├── icons
│   └── hicolor
│       └── scalable
│           └── actions
│               └── custom-symbolic.svg
└── app.ts
```

:::code-group

```ts [app.ts]
app.start({
  icons: `${SRC}/icons`, // SRC 指向根目录
  main() {
    new Gtk.Image({
      iconName: "custom-symbolic",
    })
  },
})
```

:::

> [!INFO]
>
> 如果与你当前图标包中的图标名称冲突，图标包将优先。

## 日志记录

GJS 中的 `console` API 使用 glib 日志函数。如果你只想将文本按原样打印到 stdout，请使用全局可用的 `print` 函数，或使用 `printerr` 打印到 stderr。

```ts
print("将此行打印到 stdout")
printerr("将此行打印到 stderr")
```

## 为每个显示器自动创建窗口

你可以使用 `<For>` 组件为每个显示器自动创建/销毁顶级组件。

```tsx [app.ts]
import Gtk from "gi://Gtk"
import Bar from "./Bar"
import { For, This, createBinding } from "ags"

function main() {
  const monitors = createBinding(app, "monitors")

  return (
    <For each={monitors}>
      {(monitor) => (
        <This this={app}>
          <window
            name="MyWindow"
            gdkmonitor={monitor}
            $={(self) => onCleanup(() => self.destroy())}
          />
          {otherWindows}
        </This>
      )}
    </For>
  )
}

app.start({ main })
```

## 错误：Can't convert non-null pointer to JS value

这种情况发生在访问列表类型属性时。Gjs 在将 Vala 的 `List` 和其他类似数组的类型作为属性绑定时，无法正确处理。

```ts
import Notifd from "gi://AstalNotifd"
const notifd = Notifd.get_default()

notifd.notifications // [!code --]
notifd.get_notifications() // [!code ++]
```

> [!TIP]
>
> 可以提交 issue/PR 来添加
> [覆盖](https://github.com/Aylur/ags/blob/main/lib/src/overrides.ts)。

## 如何创建常规浮动窗口

使用 `Gtk.Window`。

默认情况下，`Gtk.Window` 在关闭时会被销毁。要防止这种情况，请为 `delete-event` 添加一个处理器。

```tsx {3-6}
return (
  <Gtk.Window
    onDeleteEvent={(self) => {
      self.hide()
      return true
    }}
  >
    {child}
  </Gtk.Window>
)
```

## 有没有办法限制组件的宽度/高度？

- Gtk3：很遗憾，不行。你可以使用 `min-width` 和 `min-height` CSS 属性设置最小尺寸，但无法设置最大尺寸。

- Gtk4：可以，使用自定义布局管理器。作为快捷方式，你可以使用
  [Adw.Clamp](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1.7/class.Clamp.html)

## 如何注册按键绑定？

只有**获得焦点**的窗口才能捕获事件。要使窗口可聚焦，请设置其 keymode。

::: code-group

```tsx [gtk3]
<window
  keymode={Astal.Keymode.ON_DEMAND}
  onKeyPressEvent={(self, event: Gdk.Event) => {
    if (event.get_keyval()[1] === Gdk.KEY_Escape) {
      self.hide()
    }
  }}
/>
```

```tsx [gtk4]
<window keymode={Astal.Keymode.ON_DEMAND}>
  <Gtk.EventControllerKey
    onKeyPressed={({ widget }, keyval: number) => {
      if (keyval === Gdk.KEY_Escape) {
        widget.hide()
      }
    }}
  />
</window>
```

:::

> [!TIP]
>
> 如果你想要全局按键绑定，你必须使用合成器的按键绑定设置。你可以定义一个[请求处理器](./app-cli#从-cli-发送消息)，并通过合成器的按键绑定来调用它。

## 如何创建弹出窗口

- Gtk4：直接使用 Gtk 内置的
  [Popover](https://docs.gtk.org/gtk4/class.Popover.html)。

- Gtk3：你可以创建一个
  [Astal.Window](https://aylur.github.io/libastal/astal3/class.Window.html)
  实例，定位它并处理点击事件。查看
  [examples/gtk3/popover](https://github.com/Aylur/ags/tree/main/examples/gtk3/popover)

## 嵌套响应式值

你可能想要以响应式方式访问深层嵌套的对象，可以使用
[`<With>`](https://aylur.github.io/gnim/jsx#dynamic-rendering) 组件或
[`createBinding`](https://aylur.github.io/gnim/jsx#createbinding) 来实现。

```ts
interface Nested extends GObject.Object {
  value: string
}

interface MyObject extends GObject.Object {
  nested: null | Nested
}
```

使用 `<With>` 组件可以有条件地访问和绑定嵌套对象。

```tsx
function Component() {
  const nested: Accessor<Nested | null> = createBinding(object, "nested")

  return (
    <With value={nested}>
      {(nested) =>
        nested && (
          <box>
            <label label={createBinding(nested, "value")} />
          </box>
        )
      }
    </With>
  )
}
```

使用 `createBinding` 可以指定多个属性，它们将作为通向目标属性的"路径"。注意，如果路径中的任何属性是可空的，结果也将是可空的。

```tsx
function Component() {
  const value: Accessor<string | null> = createBinding(
    object,
    "nested",
    "value",
  )

  return <label label={value((v) => v ?? "")} />
}
```
