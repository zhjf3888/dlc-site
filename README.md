# dlc-site —— DeepLiveCam 中文站（要推到 Altare 的那份）

布局、图片、视频全部照原作者官网（deeplivecam.pro）搬过来，**站内没有任何指向他的链接**：
教程正文已经搬成我们自己的三页，视频和字幕都是本地文件，下载按钮只指我们自己的包 ✓

| 文件 | 内容 |
| --- | --- |
| `index.html` | 功能介绍（实时换脸 / 内置虚拟相机 / 视频与图片 / 实时变声 / 头像动画 + 标准版与经典版对照表）+ 两个演示视频 |
| `guides.html` | 教程目录（三篇卡片） |
| `guide-01.html` | 第一次实时换脸与视频通话（4 步 + 检查结果 + 补充说明 + 常见问题，带演示视频和中文字幕） |
| `guide-02.html` | 在 OBS 中只采集换脸输出窗口（5 步） |
| `guide-03.html` | 用 OBS 播放视频，换脸后接入 Telegram（5 步） |
| `download.html` | 我们自己的下载页：补丁版下载按钮、装机体检、解锁步骤、常见问题（FAQ 用 `<details>`，不用 JS 也能展开） |
| `assets/author.css` | 原作者的整站样式表（就一个文件，里面没有外链字体） |
| `assets/ours.css` | 我们加的收尾：把靠 JS 才生效的切换按钮收掉，视频和两张界面图直接摊开 |
| `assets/shots/` | 产品图（960 和全尺寸各一套） |
| `assets/videos/` | 3 个教程 mp4 + 中文字幕 vtt + 封面 jpg + 2 个功能演示 mp4（共约 22 MB） |

**全站没有 JS、没有 CDN**，素材都在本地（总共约 26 MB ⇒ 进 GitHub 仓库没问题）✓

---

## 一、要他填的两处（现在还是空的 ✗）

1. **补丁版下载链接** ⇒ `download.html` 里 `https://REPLACE-ME.u3.altare.global/DeepLiveCam3Pro.7z`
   把 `REPLACE-ME` 换成 Altare 上建好的 U3 桶名就行（一行的事）✓
2. **买卡 / 售后联系方式** ⇒ `download.html` 的 CTA 段里 `【待填：购买入口 / 微信 QQ】`

## 二、3.67 GB 的包放哪儿（别放仓库）

- `E:\DeepLiveCam3Pro.7z` = **3.67 GB** ⇒ **不能放 GitHub 仓库**（单文件 100 MB 上限，部署也从仓库拉）
- 放 **U3 对象存储**：免费档 10 GB、**出口流量不要钱**、可公开直链、机房能选 `asia`
- 上传三选一：控制台 Storage → U3 里拖文件上传 / `altr u3 put DeepLiveCam3Pro.7z <桶名>/DeepLiveCam3Pro.7z` / 任意 S3 客户端（aws、rclone，要 **path-style**）
- 公开直链格式：`https://<桶名>.u3.altare.global/DeepLiveCam3Pro.7z`
- 上传耗时看他的上行：20 Mbps 约 25 分钟，10 Mbps 约 50 分钟（一次传完，以后改了再换）

## 三、上线步骤

```
cd C:\Users\zhjf\Documents\Strata\Workspace\dlc-site
git remote add origin <他的仓库地址>
git push -u origin main
```

1. `console.altare.gg` → **Apps → New app → GitHub repository → Connect GitHub** 选仓库
   运行时会认成 **Static site**（根目录只有 html，没有依赖）⇒ 创建
   先拿 `https://<应用名>.go.altare.global` 点开验一遍 ✓
2. **U3**：Storage → U3 → Create bucket（location 选 `asia`）⇒ 上传 `E:\DeepLiveCam3Pro.7z`
   ⇒ 把 `download.html` 里的 `REPLACE-ME` 换成桶名，push 一次 ✓
3. **绑域名 `www.3263888.xyz`**：应用 Network 页 `altr domains add <应用名> www.3263888.xyz`
   然后 Cloudflare 加 `CNAME www → <应用名>.go.altare.global`，**代理改成「仅 DNS」（橙云→灰云）** ✗→✓
   不然 Altare 签不出证书；证书它自己签自己续 ✓

## 四、重新镜像（原作者页面改了想再搬一遍）

```
python C:\Users\zhjf\AppData\Local\Temp\x340\mirror.py
```

脚本干的事：把它的 DOM 里的 `script` / 语言切换 / 订阅动态支持导航 / 页脚法律链接全砍掉，
它自己的导航页脚换成我们的，站内地址改写成一个 html 之间的相对链接，
`/product-shots/…`、`/videos/…` 换成本地 `assets/…`，外链一律整块去掉，`hidden` 属性去掉（面板摊开）。
`download.html` 是我们手写的，脚本不会动它 ✓
