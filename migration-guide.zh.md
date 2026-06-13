# 迁移指南

## 从 v2 迁移

### 导入路径

`astal` 命名空间已被移除。AGS 现在使用
[Gnim](https://github.com/aylur/gnim)，它从 `ags` 命名空间重新导出。

```ts
// [!code --:2]
import { App, Gtk } from "astal/gtk3"
import { bind, Variable } from "astal/state"
// [!code ++:3]
import app from "ags/gtk3/app"
import Gtk from "gi://Gtk?version=3.0"
import { createBinding, createState } from "ags"
```

### 子类化

`astalify` 已被移除，`jsx` 函数和 JSX 表达式处理一切。可以直接使用 Gtk 组件，无需任何预先设置。

```tsx
// [!code --:2]
const Calendar = astalify(Gtk.Calendar)
const _ = <Calendar />
// [!code ++:1]
const _ = <Gtk.Calendar />
```

如果你仍更喜欢使用常规 JS 函数而不是 JSX，可以这样做：

```ts
import { CCProps } from "ags"
import { Gtk } from "ags/gtk4"
type BoxProps = Partial<CCProps<Gtk.Box, Gtk.Box.ConstructorProps>>
const Box = (props: BoxProps) => jsx(Gtk.Box, props)

Box({
  orientation: state,
  children: [Box()],
})
```

### GObject 装饰器

它们已更新到阶段 3 提案。你可以在
[Gnim](https://aylur.github.io/gnim/gobject.html) 文档中了解更多。

```ts
@register()
class MyObj extends GObject.Object {
  @property(String) declare myProp: string // [!code --]
  @property(String) myProp = "" // [!code ++]

  @property(String) // [!code --]
  @getter(String) // [!code ++]
  get myProp() {
    return ""
  }

  @property(String) // [!code --]
  @setter(String) // [!code ++]
  set myProp(v: string) {
    //
  }
}
```

确保同时更新 `tsconfig.json`：

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": false, // [!code ++]
    "target": "ES2020", // [!code ++]
  },
}
```

### 语法变更

- `setup` → `$`
- `className` → `class`

```tsx
<button class="my-button" $={(self) => print("ref", self)} />
```

### Variable

`Variable` 已被移除，取而代之的是 `Accessor` 和 `createState`。你可以在
[Gnim](https://aylur.github.io/gnim/jsx.html#state-management) 文档中了解更多。

```tsx
// [!code --:3]
const v = Variable("")
return <label label={v()} />
v.set("新值")
// [!code ++:3]
const [v, setV] = createState("")
return <label label={v} />
setV("新值")
```

Variable 方法有对应的 Accessor 创建函数：

- `.poll`：[`createPoll`](./utilities.md#createpoll)
- `.watch`：[`createSubprocess`](./utilities.md#createsubprocess)
- `.observe`：[`createConnection`](https://aylur.github.io/gnim/jsx#createconnection)
- `.derive`：[`createComputed`](https://aylur.github.io/gnim/jsx#createcomputed)
- `.drop`：Accessor 不能被显式清理。使用预定的创建函数，它们会被自动清理。

### Binding

`Binding` 和 `bind` 已被移除，但 API 是相同的，唯一区别是你需要使用 Accessor 创建函数。

```tsx
// [!code --:2]
import { bind } from "astal"
const v = bind(object, "prop")
// [!code ++:2]
import { createBinding } from "ags"
const v = createBinding(object, "prop")
return <label label={v((v) => `转换后的 ${v}`)} />
```

### 动态渲染

动态子元素渲染使用 `<With>` 和 `<For>` 组件完成。`children` 属性不能再接受 `Binding`。

<!-- prettier-ignore -->
```tsx
const value: Binding<object>
const list: Binding<Array<object>>

return (
  <box>
    {/* [!code --:3] */}
    {value.as((value) => (
      <></>
    ))}
    {/* [!code ++:3] */}
    <With value={value}>
      {(value) => <></>}
    </With>
    {/* [!code --:3] */}
    {list.as(list => list.map(item => (
      <></>
    )))}
    {/* [!code ++:3] */}
    <For each={list}>
      {(item) => <></>}
    </For>
  </box>
)
```

## 从 v1 迁移

AGS 从头重写了，不幸的是几乎所有东西都发生了根本性变化，你需要从头开始重写你的项目。

变化太多，无法一一列举，以下是些一些重点。

### 入口点

不再使用固定的 `~/.config/ags/config.js` 入口，你可以任意命名主文件，并将其作为参数传递给 `ags run </path/to/entry>`。

如果你希望继续将源代码放在 `~/.config/ags` 中，则将入口文件命名为 `app.js`、`app.ts`、`app.jsx` 或 `app.tsx`，`ags run` 将默认使用它。

代码中的入口点从 `App.config` 变为 `app.start`：

```js
// [!code --:5]
App.config({
  windows: [
    // 窗口实例
  ],
})
// [!code ++:7]
import app from "astal/gtk4/app"

app.start({
  main() {
    // 任何初始化代码
  },
})
```

### 实例化组件

不再建议创建顶级实例，因为脚本可以在
[客户端模式](https://aylur.github.io/astal/guide/typescript/cli-app#client) 下运行，建议只在 `main` 或 `client` 代码块中执行代码。

```js
// [!code --:5]
const win = Widget.Window()

App.config({
  windows: [win],
})
// [!code ++:5]
app.main({
  main() {
    new Widget.Window()
  },
})
```

### 模板

AGS 现在支持并推荐使用 [JSX](./first-widgets#创建和嵌套组件)。

```jsx
// [!code --:4]
const _ = Widget.Box({
  vertical: true,
  children: [Widget.Label("你好")],
})
// [!code ++:5]
const _ = (
  <box vertical>
    <label label="你好" />
  </box>
)
```

### 响应式

`Variable` 已被移除，取而代之的是信号。

```jsx
const label = Variable("你好") // [!code --:5]

Label({
  label: label.bind().as((hello) => `${hello} 世界`),
})
import { createState } from "ags" // [!code ++:6]
const [label, setLabel] = createState("你好")
return <label label={label((hello) => `${hello} 世界`)} />
```

### Hooks

组件不再被子类化，添加的方法已被移除。

```jsx
// [!code --:6]
Widget.Button({
  setup: (self) => {
    self.on("signal-name", handler)
    self.hook(obj, handler, "changed")
  },
})
import { onCleanup } from "ags" // [!code ++:14]

function MyWidget() {
  const id = obj.connect("signal-name", callback)

  onCleanup(() => {
    obj.disconnect(id)
  })

  return <button onClicked={handler} />
}
```

> [!NOTE]
>
> `.keybind` 和 `.poll` hooks 已被移除。轮询应使用 `createPoll`。按键绑定应使用预期的 Gtk API。

### 组件

`JSX` 处理一切，不再需要子类化组件。

```jsx
import Gtk from "gi://Gtk"
const calendar = <Gtk.Calendar />
```

### 全局对象

`App`、`Service`、`Utils`、`Widget`、`Variable` 不再是全局可用的。

```js
import app from "ags/gtk4/app"
import * as fileUtils from "ags/file"
import * as procUtils from "ags/process"
import * as timeUtils from "ags/time"
import { createBinding, createState } from "ags"
```

### Services

这些不再称为 `Service`。`Service` 和 `GObject.Object` 之间不再有区别，也不再内置 Service。

它们现在只是外部[库](https://aylur.github.io/astal/guide/libraries/references#astal-库)，需要安装在 AGS 旁边。它们现在用 Vala 或 C 实现，这使得它们也可以在 AGS 之外使用。

但它们的工作方式非常相似。

```js
// 导入
const battery = await Service.import("battery") // [!code --]
import Battery from "gi://AstalBattery" // [!code ++:2]
const battery = Battery.get_default()

// 绑定
const b = battery.bind("percentage") // [!code --]
import { createBinding } from "ags" // [!code ++:2]
const b = createBinding(battery, "percentage")
```

创建自定义的"Service"现在意味着创建一个 `GObject.Object` 子类。

```ts
// [!code --:16]
class MyService extends Service {
  static {
    Service.register(
      this,
      {
        "my-signal": ["float"],
      },
      {
        "my-value": ["float", "rw"],
      },
    )
  }

  get my_value(): number
  set my_value(v: number)
}
import GObject, { register, signal, property } from "ags/gobject" // [!code ++:9]

@register()
class MyService extends GObject.Object {
  @property(Number) myValue = 0

  @signal(Number)
  mySignal(n: number): void {}
}
```

### Utils

- File、Process 和 Time 工具函数可从各自的[模块](./utilities)获取：

  ```js
  Utils.exec("command") // [!code --:4]
  Utils.readFile("file")
  Utils.timeout(1000, callback)
  Utils.fetch("url")
  import { exec } from "ags/process" // [!code ++:4]
  import { readFile } from "ags/file"
  import { timeout } from "ags/time"
  import { fetch } from "ags/fetch"
  ```

- 图标查找没有替代方案。请使用 `Gtk.IconTheme`。

- 身份验证已移至
  [AstalAuth](https://aylur.github.io/astal/guide/libraries/auth)

- 发送通知将在
  [AstalNotifd](https://aylur.github.io/astal/guide/libraries/notifd) 中可用。在此之前请参见 [#26](https://github.com/Aylur/astal/issues/26)。

### CLI

要使窗口可通过 CLI 切换，你现在需要
[将 `app` 实例传递给 `Window`](./app-cli#通过名称切换窗口可见性)，而不是将窗口数组传递给 `App.config`。

```js
// [!code --:3]
App.config({
  windows: [Widget.Window({ name: "window-name" })],
})
// [!code ++:5]
app.start({
  main() {
    return <window name="window-name" application={app}></window>
  },
})
```

`ags --run-js` 已被移除，取而代之的是[请求](./app-cli#从-cli-发送消息)。

```ts
// [!code --:3]
globalThis.myfunction = () => {
  print("你好")
}
// [!code ++:8]
app.start({
  requestHandler(request: string, res: (response: any) => void) {
    if (request == "myfunction") {
      res("你好")
    }
    res("未知命令")
  },
})
```

```sh
ags -r "myfunction()" # [!code --]
ags request myfunction # [!code ++]
```

实例名称现在在代码中定义，而不是在首次启动的 CLI 中定义：

```js
app.start({
  instanceName: "name",
})
```

```sh
ags -i name # [!code --:2]
ags -t window-name -i name
ags run # [!code ++:2]
ags toggle window-name -i name
```
