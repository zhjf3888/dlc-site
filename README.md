# dlc-site —— DeepLiveCam 3 Pro 中文门面站（推 Altare 的那份）

现在**是分页的**：一个 `index.html` + 前端路由（历史 API），URL 干净、前进后退能用、每页有自己的标题和描述。
全站**不出现订阅/价格，也不出现任何联系方式**（他的要求）。

| 路由 | 页面 | 内容 |
| --- | --- | --- |
| `/` | 首页 | 一句话介绍 + 三个入口卡（功能 / 下载 / 教程）+ 能力与机器要求 + 演示视频 |
| `/features` | 功能 | 实时换脸 / 内置虚拟相机 / 视频与图片 / 实时变声 / 头像动画 + 标准版与经典版对照表 |
| `/download` | 下载与安装 | 补丁版下载、系统要求、装机体检、卡密解锁步骤、常见问题 |
| `/guides` | 教程 | 三篇教程卡片目录 |
| `/guides/1` `/guides/2` `/guides/3` | 三篇教程 | 步骤 + 中文演示视频与字幕（`<track>`） |

路由怎么运作（`index.html` 里两段内联脚本，没有外部 JS、没有 CDN）：

1. `<head>` 里第一段先按 `location.pathname` 判定当前页，给 `<html>` 加 `dlc-js dlc-route-xxx`（认不出的地址再加 `dlc-notfound`，页顶显示一条提示条）——先定住再绘制，不会整站内容一闪。
2. `</body>` 前第二段管点击（`a[data-link]` → `history.pushState`）、`popstate`、当前页标题/描述/导航高亮。
3. `assets/ours-v3.css` 末尾那段决定显示哪一页：**没有 JS 时七页内容全部显示**（爬虫能拿到全部正文），有 JS 时只显示当前页。
4. 所有素材都是站点根绝对路径（`/assets/...`），二级路径 `/guides/1` 下也不会错位。
5. 旧写法兼容：`#guides`、`#guide-01`、`#download`、`/index`、`index.html` 都会落到对应路由。
6. `canonical` 固定指向 `https://www.3263888.xyz/`：同一个 HTML 回应所有地址，合并权重比七个重复页诚实。

## 为什么不放成真的多个 .html 文件（实测托管方规则，别再试第二遍）

线上 `www.3263888.xyz` 是 Altare 的 **Static site** 处理器，逐条实测：

- 小写 `*.html` 一律 **301 去掉后缀**：`/index.html → /index`、`/probe/d.html → /probe/d`
- 路径没命中真文件 → **200 返回首页 index.html**（响应头 `Content-Disposition: inline; filename="index.html"`）
- 目录页 `x/index.html` 不认（301 → `/x/index` → 首页）；**无后缀的真文件也不认**
- 小写 `.htm` 也当网页后缀处理 → 首页
- **只有大写 `.HTM` 直接命中真文件**，且 `Content-Type: text/html; charset=utf-8`（应急可用，URL 难看）
- 仓库里的文件全都部署了（`/server.js`、`/package.json` 线上都能取到），只是静态处理器不肯放网页走
- `robots.txt` 被 Altare 覆盖成它自己那份（2676 字节），我们仓库那份 23 字节没生效

⇒ Static 模式下结构性只能有一个 HTML 页。要真·多文件分页，只有两条：
**A** 在 Altare 控制台把这个应用的 cleanUrls / SPA 回退关掉；**B** 换 Node 运行时（`server.js` 已经写好并在线，就是为这个坑写的，还差视频 Range 支持）。
现在这套前端路由在 A/B 下也照样能用，页面不用重写。

## 文件

| 文件 | 内容 |
| --- | --- |
| `index.html` | 七页内容 + 两段路由脚本（约 53 KB） |
| `assets/author.css` | 原作者官网的整站样式表（里面没有外链字体） |
| `assets/ours-v3.css` | 我们加的收尾（含分页显隐规则）。**改样式必须换文件名**：它的 “Cache static files” 边缘缓存不会被部署刷新 |
| `assets/shots/` | 产品界面图（960 与全尺寸两套 webp） |
| `assets/videos/` | 三篇教程 mp4 + 中文 vtt + 封面 jpg + 两个功能演示 mp4（约 22 MB） |
| `server.js` | 自带的极简静态服务器，走 B 路线时才用到 |

素材全在本地，**全站没有外链、没有 JS 依赖**（只有站内两段路由脚本）。

## 待填

- 下载按钮：`index.html` 里 `https://REPLACE-ME.u3.altare.global/DeepLiveCam3Pro.7z` ⇒ 把 `REPLACE-ME` 换成 U3 桶名（桶建在 `asia`、公开读）。`E:\DeepLiveCam3Pro.7z` = 3.67 GB，**不能进仓库**（GitHub 单文件 100 MB 上限）。

## 上线

```
cd C:\Users\zhjf\Documents\Strata\Workspace\dlc-site
git push origin main
```

push 后 Altare 有时不会自动部署，要在控制台（应用 deeplivecam）点「部署最新版本」。
域名已经是 `CNAME www → deeplivecam.go.altare.global`（灰云 / 仅 DNS），裸域 `3263888.xyz` 与 `api. / auth. / update. / up. / m.` 都指向阿里云，**动这个站不碰阿里云**。

## 重新镜像原作者页面

```
python C:\Users\zhjf\AppData\Local\Temp\x340\mirror.py
```

原作者官网 `deeplivecam.pro` 的骨架（我们照它分页，但没做订阅页）：
`/`、`/deeplivecam-pro/features`、`/deeplivecam-pro/pricing`、`/deeplivecam-pro/download`、`/guides`、`/news`、`/support`、`/legal/*`、`/license/manage`、`sitemap.xml`、`llms.txt`。
