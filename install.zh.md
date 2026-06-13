# 安装

## Arch Linux

维护者: [@kotontrion](https://github.com/kotontrion)

```sh
yay -S aylurs-gtk-shell-git
```

## Nix

维护者: [@Aylur](https://github.com/Aylur)

```sh
nix shell github:aylur/ags
```

了解更多关于在 [Nix](./nix) 上运行 AGS 的信息。

## 从源码安装

1. 安装以下三个
   [Astal 包](https://aylur.github.io/astal/guide/installation)

   - astal-io
   - astal3
   - astal4

2. 安装依赖

   :::code-group

   ```sh [<i class="devicon-archlinux-plain" /> Arch]
   sudo pacman -Syu \
       npm meson ninja go gobject-introspection \
       gtk3 gtk-layer-shell \
       gtk4 gtk4-layer-shell
   ```

   ```sh [<i class="devicon-fedora-plain" /> Fedora]
   sudo dnf install \
       npm meson ninja golang gobject-introspection-devel \
       gtk3-devel gtk-layer-shell-devel \
       gtk4-devel gtk4-layer-shell-devel
   ```

   :::

3. 克隆并安装 AGS

   ```sh
   git clone https://github.com/aylur/ags.git
   cd ags
   npm install
   meson setup build
   meson install -C build
   ```

> [!IMPORTANT]
>
> 默认情况下，meson 安装到 `/usr/local` 目录。
