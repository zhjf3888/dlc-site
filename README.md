# dlc-site —— DeepLiveCam 中文门面站（要推到 Altare 的那份）

三个页面：**首页 / 功能 / 教程 / 下载**（首页算上共 4 个 html）。
纯 HTML + 一个 `style.css`，**没有 JS、没有 CDN、没有外链字体** ⇒ 国内打开不会卡；
图片全在 `assets\` 里（4 张产品图 + 3 张教程缩略图 + 1 张本机实拍 3.4.0 界面）。
只有两处是指向外面的：教程详情页（原作者站）、下载页里「原版线路」那一组链接。

功能文案、配置要求表、下载线路都是照原作者官网抄的真实内容
（`deeplivecam.pro/deeplivecam-pro/features`、`/guides`、`/deeplivecam-pro/download`），
授权那几段（一卡一机、到期锁、60 秒解锁、更新通道冻住）按咱们这套的实际行为写的 ✓

---

## 一、要他点头的四件事（现在都还是空的 ✗）

1. **补丁版下载链接** ⇒ `download.html` 里那句 `下载补丁版（链接待填）`（现在是 `href="#"`）
   他那份客户包 213 文件 / 7.22 GB 放哪个网盘或直链，填进去就行 ✓
2. **买卡 / 售后的联系方式** ⇒ `index.html` 里那张「卡在哪买、怎么续」的卡，里面写着 `【待填：购买入口 / 店铺 / 微信 QQ】`
3. **用哪个子域名**：`www.3263888.xyz` 或 `dl.3263888.xyz`（两个都查过，还没建记录 ✓）
4. **GitHub 仓库**：他有没有 GitHub 账号、仓库叫什么名（Altare 连 GitHub 才建得起来）

## 二、推到 Altare（App Hosting，免费档就够）

```
cd C:\Users\zhjf\Documents\Strata\Workspace\dlc-site
git init -b main
git add -A
git commit -m "门面站第一版：功能 / 教程 / 下载"
git remote add origin <他的仓库地址>
git push -u origin main
```

然后控制台 `console.altare.gg`：**Apps → New app → GitHub repository → Connect GitHub**，
选中仓库；**Build and run** 里运行时会自己认成 **Static site**（根目录只有 html ⇒ 不用装依赖）；
region 挑近的（伦敦 / 美西都行，客户在国内 ⇒ 后面挂 CF 或 Altare CDN 再调），创建即可 ✓
上线后先拿到一个 `https://<应用名>.go.altare.global` ✓ 先点开看看对不对 ✓

## 三、绑自己的域名（用 3263888.xyz 的新子域名）

1. Altare 里给应用加名字：控制台应用的 **Network** 页加 `www.3263888.xyz`，
   或命令行 `altr domains add <应用名> www.3263888.xyz`；
   加完控制台会给一个目标地址（就是 `<应用名>.go.altare.global`）✓
2. Cloudflare（`3263888.xyz` 的 NS 在这儿）加一条记录：
   - 类型 `CNAME`，名字 `www`（或 `dl`），内容 = Altare 给的那个地址
   - **代理状态必须改成「仅 DNS」（橙云 → 灰云）** ✗→✓
     不然 Altare 拿不到证书（它自己会签，免费）
3. 等 1～2 分钟，Altare 签好证书 ⇒ `https://www.3263888.xyz` 直接开 ✓
   证书不用他管，Altare 自动续 ✓

## 四、本地先看效果（不用上线）

直接双击 `index.html`，或者：

```
pwsh: Start-Process msedge -ArgumentList '--headless','--screenshot=...','file:///.../index.html'
```

改文案就改那四个 html；样式集中在 `style.css`，深浅色跟系统自动切 ✓
