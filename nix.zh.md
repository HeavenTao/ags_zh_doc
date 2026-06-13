# 在 NixOS 上使用

使用模板初始化一个目录。

```sh
nix flake init --template github:aylur/ags
```

> [!TIP]
>
> 如果你是 NixOS 新手且不熟悉 flakes、derivations 或开发 shell，推荐使用
> [home-manager](#使用-home-manager) 模块来使用 AGS。

## 打包和开发 Shell

要构建一个 derivation，可以使用 `ags bundle` 命令。

:::code-group

```nix [<i class="devicon-nixos-plain"></i> flake.nix]
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };
  };

  outputs = { self, nixpkgs, ags, astal }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.${system}.default = pkgs.stdenv.mkDerivation { # [!code focus:31]
      pname = "my-shell";

      src = ./.;

      nativeBuildInputs = with pkgs; [
        wrapGAppsHook3
        gobject-introspection
        ags.packages.${system}.default
      ];

      buildInputs = [
        pkgs.glib
        pkgs.gjs
        astal.io
        astal.astal4
        # 像 astal.battery 或 pkgs.libsoup_4 这样的包
      ];

      installPhase = ''
        ags bundle app.ts $out/bin/my-shell
      '';

      preFixup = ''
        gappsWrapperArgs+=(
          --prefix PATH : ${pkgs.lib.makeBinPath ([
            # 运行时可执行文件
          ])}
        )
      '';
    };
  };
}
```

:::

在开发项目时，使用 `ags` CLI 比每次用 `nix` 构建更合理。

你可以进入一个带有 `agsFull` 包的 shell，它暴露了 AGS 以及每个
[Astal 库](https://aylur.github.io/astal/guide/libraries/references#astal-库)。

```sh
nix shell github:aylur/ags#agsFull
```

或者定义一个 `devShell` 并精选所需的包。

:::code-group

```nix [<i class="devicon-nixos-plain"></i> flake.nix]
{
  outputs = { self, nixpkgs, ags }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = [
        (ags.packages.${system}.default.override { # [!code focus:5]
          extraPackages = [
            # 精选所需的包
          ];
        })
      ];
    };
  };
}
```

## 使用 Home-Manager

如果你更喜欢"配置一个程序"的工作流，而不是"使用一个库"，可以使用 home-manager 模块。

:::

`flake.nix` 示例内容：

:::code-group

```nix [<i class="devicon-nixos-plain"></i> flake.nix]
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    astal.url = "github:aylur/astal";

    ags.url = "github:aylur/ags"; # [!code focus]
  };

  outputs = { home-manager, nixpkgs, ... }@inputs:
  let
    system = "x86_64-linux";
  in
  {
    homeConfigurations."${username}" = home-manager.lib.homeManagerConfiguration {
      pkgs = import nixpkgs { inherit system; };

      # 将 inputs 作为 specialArgs 传递 # [!code focus:2]
      extraSpecialArgs = { inherit inputs; };

      # 导入你的 home.nix # [!code focus:2]
      modules = [ ./home-manager/home.nix ];
    };
  };
}
```

:::

`home.nix` 文件示例内容：

:::code-group

```nix [<i class="devicon-nixos-plain"></i> home.nix]
{ inputs, pkgs, ... }:
{
  # 添加 home manager 模块
  imports = [ inputs.ags.homeManagerModules.default ];

  programs.ags = {
    enable = true;

    # 符号链接到 ~/.config/ags
    configDir = ../ags;

    # 添加到 gjs 运行时的额外包和可执行文件
    extraPackages = with pkgs; [
      inputs.astal.packages.${pkgs.system}.battery
      fzf
    ];
  };
}
```

:::

该模块仅包含核心的 `astal3`、`astal4` 和 `astal-io` 库。如果你想包含任何其他
[库](https://aylur.github.io/astal/guide/libraries/references#astal-库)，需要将它们添加到 `extraPackages`。你也可以添加二进制文件，它们将被添加到 gjs 运行时中。

> [!WARNING]
>
> `configDir` 选项将给定路径符号链接到 `~/.config/ags`。如果你的源代码已经在那里，请保留为 `null`。

## 使用 Astal CLI 工具

home-manager 模块不会将 Astal CLI 暴露给 home 环境，你需要自行处理：

:::code-group

```nix [<i class="devicon-nixos-plain"></i> home.nix]
home.packages = [ inputs.astal.packages.${pkgs.system}.notifd ];
```

```sh [<i class="devicon-bash-plain"></i> sh]
astal-notifd --help
```

:::
