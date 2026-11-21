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

## 下载包（U3 对象存储，已上线）

- 直链：`https://dlc-dl.u3.altare.global/DeepLiveCam3Pro.7z` —— 桶 `dlc-dl`，Location **asia**，桶上开了 **Public access → Serve files publicly**。
- 包 = 本机 `E:\DeepLiveCam3Pro.7z`，**3,943,968,824 字节**（3.67 GB），2026-11-21 上传；S3 多片 ETag `5ebd75e11ffa392faea854eecc3dec07-59`（64 MB × 59 片，多片 ETag 不是文件 MD5，别拿它比对）。**不能进仓库**（GitHub 单文件 100 MB 上限）。
- 上传脚本：`C:\Users\zhjf\AppData\Local\Temp\x340\u3_upload.js`（S3 SigV4 分片，`--loc=asia`，path-style 走 `https://u3-asia.altare.global`）。密钥是控制台那把 `dlc-upload`（只授权 `dlc-dl`、读写）。
- 实测口径，改链接时照这个来：
  - **公开下载只用 `https://<桶>.u3.altare.global/<key>`**。`https://u3-asia.altare.global/<桶>/<key>` 匿名访问回 `403 Garage does not support anonymous access yet`，只能签名访问。
  - 公开地址上**加查询串会 501 Not Implemented**（`?v=` 这类版本号加不了），要换包就得换 key 名或让边缘缓存过期（现在是 `max-age=31536000`，4 小时）。
  - 匿名 `HEAD` 会 403，但 `GET`/`Range: GET` 正常 ⇒ 校验大小用 `curl -r 0-0` 看 `Content-Range: bytes 0-0/<总大小>`，别用 `-I`。
  - 支持 Range ⇒ 用户断点续传没问题。
- 重打包后重传：跑一次上面的脚本即可（同名覆盖）。校验：签名 `ListObjects` 看 `Size`、再 `Range` 拉首尾各 1 MB 跟本地比 sha256。

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


## 自己触发部署（不用去控制台点）

它是 Altare 的 App Hosting，有正经 API（文档 `https://docs.altare.gg/altare-api`）。用队伍 API 令牌就能部署，我们这台机器上的令牌叫 `dlc`，权限里有 `servers:*`，但**没有** `servers:deploy`——实测照样能发部署：

```bash
API=https://console.altare.gg/api
AUTH="Authorization: Bearer <令牌>"
TEAM=6047863a-aa82-44ec-98ca-c0f63951b8b2                      # /api-tokens/self 里的 team.id
APP=84394d9e-6eae-44e3-979f-e0d1764977f2                       # /tenants/$TEAM/servers 里 name=deeplivecam
curl -s -X POST $API/tenants/$TEAM/servers/$APP/git/deploy \
  -H "$AUTH" -H 'Content-Type: application/json' -d '{"ref":"main"}'   # 回包给 deployment.id
curl -s $API/tenants/$TEAM/servers/$APP/git/deployments/<deployment.id> -H "$AUTH"   # .done 为真即部署完
```

`git/deploy` 永远部署 main 的最新提交，所以 push 卡住不自动部署时（这段时间经常卡），补一发就行。
读-only 的排查：`GET /api-tokens/self` 看令牌归属与权限，`GET /tenants/$TEAM/servers` 看应用与其 `settings`（当前是 `runtime: static`、`start: npx -y serve@14 -s . -l tcp://0.0.0.0:$PORT`、`cacheStatic: true`）。

## 边缘缓存会把「还没有这个文件」缓存四小时

`cacheStatic: true` + Cloudflare：某个路径第一次访问时如果文件还不存在，回退的首页 HTML 会被缓存成 `Cache-Control: public, max-age=14400`（`CF-Cache-Status: HIT`），之后即使文件部署上去了，这个 URL 仍然回你首页。
⇒ **所有 `assets/` 引用都带内容哈希版本号**（`?v=<sha256 前 10 位>`）。改了样式就把 `?v=` 换成新哈希；换文件名也能解决，但哈希更省事，不用记名字。

## 线上打开下载页/教程页一片空白：多余的 </div>

症状：导航四项正常、页面确实有内容（DOM 里字数都在），但正文区域看不见，滚很久才看到东西。

根因：features 页面包后面多了一个 `</div>`。浏览器解析到它会把 `main#main` 和外面的
`div.redesign-site.redesign-frame` 连着关掉，于是后面的下载页、教程页、三篇教程全被挂到 `<body>` 上：
既拿不到 `main.container.site-main` 的容器样式，又排在已经关掉的那层壳后面——那层壳有 `min-height:100vh`，
所以先空出一整屏，正文被推到 900 多像素以下。同时这些块脱离 `.redesign-site` 作用域后，
`--ink` 等变量取的是深色主题那套，浅色字压在浅底上，看着就是空白页（作者 881 条规则挂在 `.redesign-site` 上）。

修法：删掉多余的 `</div>`，并在页脚前补上 `redesign-frame` 真正的闭合（`</div></main>` -> `</div></main></div>`）。
`dlcgate/fix_div_nesting3.py` 就是这次改的脚本，带配对校验。

排查手段（别只 curl 看字节数，字节数是对的但渲染是空的）：本机起一个
`npx -y serve@14 -s . -l 8791`，用带 `--remote-debugging-port=9333` 的 Chrome 连 CDP，
打印 `.dlc-page` 的父节点和 `getBoundingClientRect().top`。
父节点是 `body` 而不是 `main`、正文 top 在 900 以上，就是这个问题。
脚本：`x340/cdp_topgap.js`（谁占了顶部）、`x340/cdp_blocks.js`（每块占位）、`x340/cdp_all.js`（五页面整页截图 + 可见页校验）。

约定：改过页面结构以后，必须在浏览器里确认七页都挂在 `main#main` 里、每条路由只有一页可见，再说上线。

## 源站表头会被 cacheStatic 覆盖

仓库里的 `serve.json` 给 HTML 写 `no-cache`、给 `assets/**` 写一年 `immutable`，本机用同款
`serve` 命令验过确实生效。但 Altare 的 `cacheStatic: true` 会在边缘重写：静态素材统一
`Cache-Control: public, max-age=14400`（4 小时），HTML 走 `CF-Cache-Status: DYNAMIC` 不缓存。
结论：HTML 不会被边缘缓存，浏览器要看新版直接 Ctrl+F5；素材仍然靠 URL 里的
`?v=<sha256 前 10 位>` 版本号换缓存键，这条约定继续有效。
