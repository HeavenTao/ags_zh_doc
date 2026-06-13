# 首个组件

本页你将学习 JSX 语法。要深入了解，可以阅读 [Gnim 文档](https://aylur.github.io/gnim/jsx.html)。

> [!TIP]
>
> `gnim` 的符号会从 `ags` 模块重新导出。

## 应用程序的入口点

每个应用程序的入口点都是 `app.start` 调用。`app` 是
[Gtk.Application](https://docs.gtk.org/gtk4/class.Application.html) 的单例实例。

```ts [<i class="devicon-typescript-plain"></i> app.ts]
import app from "ags/gtk4/app"

app.start({
  main() {
    // 在这里实例化组件
    // 并进行其他必要的设置
  },
})
```

## 每个 Shell 组件的根：Window

桌面 Shell 由组件组成。组件是具有自己逻辑和样式的 UI 片段。组件可以小到一个按钮，也可以大到一个完整的状态栏。顶层（也称为根）组件始终是一个
[Window](https://aylur.github.io/libastal/astal4/class.Window.html)。

```tsx [widget/Bar.tsx]
function Bar(monitor = 0) {
  return (
    <window visible class="Bar" monitor={monitor}>
      <box>组件的内容</box>
    </window>
  )
}

app.start({
  main() {
    Bar(0)
    Bar(1) // 为每个显示器实例化
  },
})
```

> [!IMPORTANT]
>
> 在 Gtk4 中，与其他组件不同，window 组件默认不可见。别忘了显式设置为 `visible`。

## 创建和嵌套组件

组件是 JavaScript 函数，通过 JSX 表达式返回 `GObject.Object`（通常是 `Gtk.Widget`）实例。

:::code-group

```tsx [MyButton.tsx]
function MyButton() {
  return (
    <button onClicked={(self) => console.log(self, "被点击")}>
      <label label="点我！" />
    </button>
  )
}
```

:::

现在你已经声明了 `MyButton`，可以将其嵌套到另一个组件中。

```tsx
function MyBar() {
  return (
    <window visible>
      <box>
        点击按钮
        <MyButton />
      </box>
    </window>
  )
}
```

请注意，你定义的组件以大写字母开头 `<MyButton />`。小写标签是内置的[内建元素](./intrinsics)，而大写字母表示自定义组件。

## 显示数据

JSX 允许你将标记放入 JavaScript 中。花括号让你可以"转义回"JavaScript，以便嵌入代码中的变量并显示它。

```tsx
function MyWidget() {
  const label = "你好"

  return <button>{label}</button>
}
```

你也可以将 JavaScript 传递给标记属性：

```tsx
function MyWidget() {
  const label = "你好"

  return <button label={label} />
}
```

## 条件渲染

你可以使用编写常规 JavaScript 代码时使用的相同技术。例如，你可以使用 if 语句来有条件地包含 JSX：

```tsx
function MyWidget() {
  let content

  if (condition) {
    content = <True />
  } else {
    content = <False />
  }

  return <box>{content}</box>
}
```

你还可以内联使用[条件 `?`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Conditional_operator)（三元）表达式。

```tsx
function MyWidget() {
  return <box>{condition ? <True /> : <False />}</box>
}
```

当你不需要 `else` 分支时，也可以使用更短的[逻辑 && 语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_AND#%E7%9F%AD%E8%B7%AF%E8%AE%A1%E7%AE%97)：

```tsx
function MyWidget() {
  return <box>{condition && <True />}</box>
}
```

> [!TIP]
>
> [假值](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)不会被渲染。

## 渲染列表

你可以使用
[`for` 循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for)
或[数组 `map()` 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)。

```tsx
function MyWidget() {
  const labels = ["标签1", "标签2", "标签3"]

  return (
    <box>
      {labels.map((label) => (
        <label label={label} />
      ))}
    </box>
  )
}
```

## 组件信号处理器

你可以通过在组件内部声明事件处理函数来响应事件：

```tsx
import Gtk from "gi://Gtk"

function MyButton() {
  function onClicked(self: Gtk.Button) {
    console.log(self, "被点击了")
  }

  return <button onClicked={onClicked} />
}
```

> [!TIP]
>
> 使用 Gtk4，你可以使用
> [EventControllers](https://docs.gtk.org/gtk4/class.EventController.html) 进行更复杂的事件处理。
>
> ```tsx
> <box>
>   <Gtk.GestureClick
>     propagationPhase={Gtk.PropagationPhase.CAPTURE}
>     button={Gdk.BUTTON_PRIMARY}
>     onPressed={() => print("主键点击")}
>   />
> </box>
> ```

## 属性如何传递

使用 JSX 时，自定义组件始终将单个对象作为其参数。

```ts
type Props = {
  myprop: string
  children?: JSX.Element | Array<JSX.Element>
}

function MyWidget({ myprop, children }: Props) {
  //
}
```

> [!TIP]
>
> `JSX.Element` 是 `GObject.Object` 的别名。

`children` 属性是特殊的，用于传递 JSX 表达式中给出的子元素。

```tsx
// MyWidget 的 `children` 属性是 box
return (
  <MyWidget myprop="你好">
    <box />
  </MyWidget>
)
```

```tsx
// MyWidget 的 `children` 属性是 [box, box]
return (
  <MyWidget myprop="你好">
    <box />
    <box />
  </MyWidget>
)
```

## 状态管理

状态通过称为 [`Accessor`](https://aylur.github.io/gnim/jsx#state-management) 的信号来管理。

- 使用 `createState` 可以实例化一个可写的响应式值
- 使用 `createBinding` 可以挂钩到 GObject 属性
- 使用 `createComputed` 可以派生响应式值

:::code-group

```tsx [State 示例]
import { createState, createComputed } from "ags"

function Counter() {
  const [count, setCount] = createState(0)

  function increment() {
    setCount((v) => v + 1)
  }

  const label = createComputed(() => count().toString())

  return (
    <box>
      <label label={label} />
      <button onClicked={increment}>点击增加计数</button>
    </box>
  )
}
```

```tsx [GObject 示例]
import GObject, { register, property } from "ags/gobject"
import { createBinding, createComputed } from "ags"

@register()
class CounterStore extends GObject.Object {
  @property(Number) count = 0
}

function Counter() {
  const counter = new CounterStore()

  function increment() {
    counter.count += 1
  }

  const count = createBinding(count, "count")
  const label = createComputed(() => count().toString())

  return (
    <box>
      <label label={label} />
      <button onClicked={increment}>点击增加计数</button>
    </box>
  )
}
```

:::

注意在 `createComputed` 体中，`count` 被作为函数调用，以便自动追踪它作为派生 `label` 属性的依赖。

> [!TIP]
>
> `createComputed` 有一个简写形式。
>
> ```ts
> // 这两行意思相同，效果也相同
> const label = createComputed(() => count().toString())
> const label = count((c) => c.toString())
> ```

## 集成外部程序

除了上述管理状态的函数外，AGS 还提供了集成你可能已熟悉的 CLI 工具的方法：
[`createPoll`](./utilities#createpoll) 按给定间隔轮询程序，
[`createSubprocess`](./utilities#createsubprocess) 启动给定程序并监控其标准输出。

例如，假设你想使用 `date` CLI 命令获取格式化的日期。

```tsx
const date = createPoll("", 1000, `bash -c "date +%H:%M"`)

return <label label={date} />
```

> [!WARNING]
>
> 运行子进程相对昂贵，因此当有可用的[库](./resources.html#astal-库)时，始终优先使用它们。

实际使用中，你会使用
[`GLib.DateTime`](https://docs.gtk.org/glib/struct.DateTime.html) 或 JavaScript 的
[`Date`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)。
在较新版本的 GJS (>= 1.85.2) 中，你还可以使用新的
[`Temporal`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Temporal) JavaScript 内置对象。

```tsx
const date = createPoll("", 1000, () => new Date().toString())

return <label label={date} />
```

> [!WARNING] 尽可能避免轮询。
>
> 请记住，轮询通常被认为是坏实践。你应该尽可能使用事件和信号，只在必要时执行操作。

## 动态渲染

当你想要基于某个值进行渲染时，可以使用 `<With>` 组件。

```tsx
import { With, Accessor } from "ags"

let value: Accessor<{ member: string } | null>

return (
  <box>
    <With value={value}>
      {(value) => value && <label label={value.member} />}
    </With>
  </box>
)
```

> [!TIP]
>
> 在大多数情况下，最好始终渲染组件并设置其 `visible` 属性。在需要解包可空对象或需要访问嵌套值时使用 `<With>`。

<!-- -->

> [!WARNING]
>
> 当值发生变化且组件被重新渲染时，前一个组件会从父组件中移除，新组件会被**追加**。组件的顺序**不会**保持，因此请确保将 `<With>` 包装在容器中以避免此问题。这是因为 Gtk 没有通用的 API 来对容器中的组件进行排序。

## 动态列表渲染

`<For>` 组件允许你基于数组动态渲染。每次数组更改时，会与之前的状态进行比较。新项目的组件被插入，与已移除项目关联的组件被删除。

```tsx
import { For, Accessor } from "ags"

let list: Accessor<Array<any>>

return (
  <box>
    <For each={list}>
      {(item, index: Accessor<number>) => (
        <label label={index((i) => `${i}. ${item}`)} />
      )}
    </For>
  </box>
)
```

> [!WARNING]
>
> 与 `<With>` 类似，当列表更改且新项目被添加时，它只是被**追加**到父组件中。组件的顺序不会保持，因此请确保将 `<For>` 包装在容器中以避免此问题。
