# 主题

由于组件工具包是 **GTK**，主题定制通过 **CSS** 来完成。

- [CSS 教程](https://www.w3schools.com/css/)
- Gtk4
  - [GTK4 CSS 概览 Wiki](https://docs.gtk.org/gtk4/css-overview.html)
  - [GTK4 CSS 属性概览 Wiki](https://docs.gtk.org/gtk4/css-properties.html)
- Gtk3
  - [GTK3 CSS 概览 Wiki](https://docs.gtk.org/gtk3/css-overview.html)
  - [GTK3 CSS 属性概览 Wiki](https://docs.gtk.org/gtk3/css-properties.html)

> [!WARNING] GTK 不是 Web
>
> 虽然大多数功能在 GTK 中已实现，但你不能假设任何在 Web 上有效的东西在 GTK 中也有效。请参考 GTK 文档查看支持的功能。

## 加载静态样式表

你可以导入任何 `css` 或 `scss` 文件，它会被内联为字符串，你可以将其传递给 css 属性。

:::code-group

```ts [app.ts]
import css from "./style.css"
import scss from "./style.scss"

const inlineCss = `
  window {
    background-color: transparent;
  }
`

app.start({
  css: css,
  css: scss,
  css: inlineCss,
})
```

:::

## 组件上的 CSS 属性

你应该始终优先使用类名和样式表来进行样式设置。但在那些需要根据 JavaScript 值应用样式的罕见情况下，你可以使用 `css` 属性。

```tsx
<box css="padding 1em; border: 1px solid red;" />
```

> [!WARNING]
>
> 组件的 `css` 属性不会级联到其子组件。通常应避免使用 `css`，改用 `class` 和样式表。

## 在运行时应用样式表

你可以在运行时应用额外的样式。

```ts
app.apply_css("/path/to/file.css")
```

```ts
app.apply_css(`
  window {
    background-color: transparent;
  }
`)
```

```ts
app.reset_css() // 如有需要可重置
```

> [!WARNING]
>
> `apply_css()` 会叠加在之前应用的样式表之上。你可以使用 `reset_css()` 重置样式表。

## 检查器

如果你不确定组件层次结构或任何 CSS 选择器，可以使用 [GTK 检查器](https://wiki.gnome.org/Projects/GTK/Inspector)：

```sh [ags]
ags inspect
```
