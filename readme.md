# CodeRoad

## 背景

> 当你想要阅读vue或者其他优秀开源项目的源码，或者当你刚加入一个项目组需要尽快熟悉庞杂的项目代码，一定都感到非常头疼。因为其中的一个文件（模块），总是依赖于其他文件（dependencies），或者被其他文件依赖（dependents），各个模块之间形成一张巨大的网，使人非常混乱。CodeRoad基于依赖分析将这种依赖关系可视化，让你对代码的结构有更清晰直观的认识，就像看到“coderoad -- 代码所走的每一条路”

## 预览

<img src="./screenshot.png" width="1000"/>

## 安装

```
npm install -g coderoad
```

## 用法

进到项目根目录，然后执行命令即可
```
cd <dir>
coderoad
```
当然也可以手动指定项目路径
```
coderoad -d <dir>
```
可以排除若干目录
```
coderoad -x <ecludeDir1>,<exlcudeDir2>
```
可以指定alias配置文件
```
coderoad -a <path-to-alias-config>
```
以vue项目为例（vue自带了alias配置，位于`./scripts/alias.js`）
```
cd <path-to-vue>
coderoad -d src -a scripts/alias.js 
```
## 参数

参数  |   描述
------|--------
`-d`,`--dir` | 指定项目路径
`-x`,`--exclude` | 排除若干目录
`-a`,`--alias` | 指定alias配置文件