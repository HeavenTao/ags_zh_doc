# 工具函数

AGS 提供了一些内置的工具函数用于常见操作。

## 文件函数

### 读取文件

```ts
import { readFile, readFileAsync } from "ags/file"

function readFile(path: string): string
function readFileAsync(path: string): Promise<string>
```

### 写入文件

```ts
import { writeFile, writeFileAsync } from "ags/file"

function writeFile(path: string, content: string): void
function writeFileAsync(path: string, content: string): Promise<void>
```

### 监控文件

如果 `path` 是目录，则会递归监控。

```ts
import { monitorFile } from "ags/file"

function monitorFile(
  path: string,
  callback: (file: string, event: Gio.FileMonitorEvent) => void,
): Gio.FileMonitor
```

## 超时和间隔

```ts
import { interval, timeout, idle, createPoll } from "ags/time"
```

你可以使用 JavaScript 原生的 `setTimeout` 或 `setInterval` 函数，它们返回
[GLib.Source](https://docs.gtk.org/glib/struct.Source.html) 实例。
或者，你也可以使用 AGS 提供的这些函数，它们返回 `Timer` 实例。

```ts
class Timer extends GObject.Object {
  declare $signals: {
    now(): void
    cancelled(): void
  }

  cancel(): void
}
```

### Interval（间隔）

立即执行函数，并每隔 `interval` 毫秒执行一次。

```ts
function interval(interval: number, callback?: () => void): Timer
```

### Timeout（超时）

在 `timeout` 毫秒后执行 `callback`。

```ts
function timeout(timeout: number, callback?: () => void): Timer
```

### Idle（空闲）

当没有更高优先级的事件待处理时执行 `callback`。

```ts
function idle(callback?: () => void): Timer
```

示例：

```ts
const timer = interval(1000, () => {
  console.log("可选的回调")
})

timer.connect("now", () => {
  console.log("滴答")
})

timer.connect("cancelled", () => {
  console.log("已取消")
})

timer.cancel()
```

### createPoll

`createPoll` 创建一个信号，仅在至少有一个订阅者时才进行轮询。

```ts
function createPoll(
  init: string,
  interval: number,
  exec: string | string[],
): Accessor<string>

function createPoll<T>(
  init: T,
  interval: number,
  exec: string | string[],
  transform: (stdout: string, prev: T) => T,
): Accessor<T>

function createPoll<T>(
  init: T,
  interval: number,
  fn: (prev: T) => T | Promise<T>,
): Accessor<T>
```

示例：

```tsx
function Counter() {
  const counter = createPoll(0, 1000, (prev) => prev + 1)

  return <label label={counter((c) => c.toString())} />
}
```

> [!WARNING]
>
> 在底层，当传递命令作为第三个参数时，它使用
> [`execAsync`](#subprocess) 按原样运行给定的程序。它们**不**在 shell 环境中执行，**不**会展开像 `$HOME` 这样的环境变量，也**不**处理像 `&&` 和 `||` 这样的逻辑运算符。
>
> 如果你需要 bash，请使用 bash 运行它们。
>
> ```ts
> createPoll("", 1000, "bash -c 'command $ENV_VAR && command'")
> ```

## 进程函数

从 `ags/process` 导入：

```ts
import { subprocess, exec, execAsync, createSubprocess } from "ags/process"
```

### Subprocess（子进程）

你可以启动一个子进程，并在其输出到 stdout 或 stderr 时运行回调函数。返回的 `Process` 实例具有 `stdout` 和 `stderr` 信号。

```ts
class Process extends GObject.Object {
  declare $signals: {
    stdout(out: string): void
    stderr(err: string): void
    exit(code: number, signaled: boolean): void
  }

  kill(): void
  write(str: string): void
  async writeAsync(str: string): Promise<void>
}

function subprocess(args: {
  cmd: string | string[]
  out?: (stdout: string) => void
  err?: (stderr: string) => void
}): Process

function subprocess(
  cmd: string | string[],
  onOut?: (stdout: string) => void,
  onErr?: (stderr: string) => void,
): Process
```

示例：

```ts
const proc = subprocess(
  "some-command",
  (out) => console.log(out), // 可选
  (err) => console.error(err), // 可选
)

// 或使用信号
const proc = subprocess("some-command")
proc.connect("stdout", (_, out) => console.log(out))
proc.connect("stderr", (_, err) => console.error(err))
```

### 执行外部命令和脚本

```ts
function exec(cmd: string | string[]): string
function execAsync(cmd: string | string[]): Promise<string>
```

> [!WARNING]
>
> 通常应避免使用 `exec`，而使用其异步变体 `execAsync`，因为前者会阻塞 IO，意味着整个 Shell 会冻结并变得无响应，直到它返回。

示例：

```ts
try {
  const out = exec("/path/to/script")
  console.log(out)
} catch (err) {
  console.error(err)
}

execAsync(["bash", "-c", "/path/to/script.sh"])
  .then((out) => console.log(out))
  .catch((err) => console.error(err))
```

> [!WARNING]
>
> `subprocess`、`exec` 和 `execAsync` 按原样执行传递的可执行文件。它们**不**在 shell 环境中执行，**不**会展开像 `$HOME` 这样的环境变量，也**不**处理像 `&&` 和 `||` 这样的逻辑运算符。
>
> 如果你需要 bash，请使用 bash 运行它们。
>
> ```ts
> exec(["bash", "-c", "command $ENV_VAR && command"])
> exec("bash -c 'command $ENV_VAR' && command")
> ```

### createSubprocess

`createSubprocess` 创建一个信号，在第一个订阅者出现时启动子进程，在订阅者数量降至零时终止子进程。

```ts
export function createSubprocess(
  init: string,
  exec: string | string[],
): Accessor<string>

export function createSubprocess<T>(
  init: T,
  exec: string | string[],
  transform: (stdout: string, prev: T) => T,
): Accessor<T>
```

示例：

```tsx
function Log() {
  const log = createSubprocess("", "journalctl -f")

  return <label label={log} />
}
```

## HTTP 请求

```ts
import { fetch, URL } from "ags/fetch"

const url = new URL("https://some-site.com/api")
url.searchParams.set("hello", "world")

const res = await fetch(url, {
  method: "POST",
  body: JSON.stringify({ hello: "world" }),
  headers: {
    "Content-Type": "application/json",
  },
})

const json = await res.json()
```
