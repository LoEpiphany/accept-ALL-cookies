# accept-ALL-cookies
软件工程团队合作成果  
团队成员：魏心玥（LoEpiphany）、卢紫慧（luzihui1024）



# 万物归序 (SnapBox)

面向个人与家庭场景的本地化物品收纳、临期提醒与家居管理应用。支持智能拍照录入、物理空间映射、口语化模糊搜索与原生系统横幅提醒，真正做到“给每件物品一个角落”。

- **在线网站**：https://wanwu.dns.navy/ （网页版纯离线运行）
- **客户端形态**：基于 Capacitor 封装的 Android App（支持原生硬件调用）
- **数据隐私**：100% 纯本地存储，不经过任何云端服务器。
- **开发语言**：原生 HTML5 / CSS3 / Vanilla JavaScript (无前端框架)

---

## 一、 核心功能与业务痛点

### 1. 录入与保质期管理
- **大模型视觉识别**：接入第三方大模型 Vision API（腾讯混元/智谱等），支持拍照/相册多选识别，即使在昏暗光线下也能自动提取名称、分类与保质期。
- **双重保质期计算**：支持“未开封”与“已开封”独立逻辑，用户勾选开封后，系统自动按新保质期重新计算临期状态。
- **智能字典推算**：内置 `SHELF_LIFE_PRESETS`，输入物品名称自动匹配推荐保质期（如输入“酸奶”推荐 21 天，若存于冷藏区则缩短为 14 天）。

### 2. 查找与搜索
- **反向查找**：输入物品名，不仅返回库存数量，还会智能推荐其最可能存放的位置（解决“知道有，但不知道放哪”的终极痛点）。
- **场景与口语化模糊搜索**：底层内置同义词与场景映射库，打通“口语化”与“分类”的隔阂。例如搜“生病”可出感冒药，搜“吃的”可出零食，搜“礼物”可出茶叶礼盒，搜“冷”可出棉被羽绒服。

### 3. 空间管理与交互
- **自定义“我家布局”**：支持多级物理空间层级管理（如“厨房 → 冰箱冷藏区”）。
- **长按拖拽归位**：在储物网格页，支持长按物品直接拖拽至其他房间或储物柜。
- **原生系统通知**：通过 Capacitor 桥接，实现每日整理提醒与临期物品的**系统横幅通知**，点击通知可直达物品详情。

### 4. 数据与安全
- **双数据库分离**：文字及配置存 `localStorage`，高清大体积图片存 `IndexedDB`，并在页面提供存储容量可视化仪表盘。
- **软删除机制**：所有删除物品进入回收站保留 30 天，支持一键恢复。
- **数据导入导出**：支持 JSON 备份与 CSV 导出，针对跨设备迁移支持“合并”与“覆盖”双重模式。

### 5. 游戏化与数据看板
- **习惯养成**：每日签到积分系统 + 30 余项成就解锁（如“断舍离”、“磁场清道夫”）。
- **智能周报**：自动统计本周物品新增、过期、丢弃与签到数据。

---

## 二、 技术栈与架构设计

本项目采用 **单页应用 (SPA) + 混合开发 (Hybrid)** 架构。为了保证极速启动和极致轻量，**无任何第三方前端框架依赖（纯原生 JS）**，依靠原生事件代理和模板字符串渲染页面。

### 1. 分层架构
- **视图层 (UI Layer)**：基于模板字符串与 `render()` 总控函数动态渲染，配合 `document.addEventListener('click')` 全局事件委托处理交互。
- **业务逻辑层 (Business Logic)**：包含模糊搜索算法 (`fuzzySearch`)、临期状态计算 (`effectiveExpDate`)、保质期推算等纯函数。
- **数据存储层 (Data Layer)**：`Store` 模块封装轻量文本存储，`PhotoDB` 模块封装 IndexedDB 图片存储。
- **原生桥接层 (Native)**：利用 Capacitor 调用 Camera、LocalNotifications、Filesystem 等原生插件。

### 2. 核心算法与优化
- **图片压缩**：前端使用 Canvas 的 `toDataURL` 将图片压缩至 800px（质量 0.6），大幅降低大模型 API 传输耗时。
- **大文件导出优化**：将 JSON 导出改为 `async` 异步，用 `FileReader` 替代旧的 `btoa`，解决 Base64 大图导出崩溃问题。

---

## 三、 目录结构

```text
wanwu-app/
├─ index.html               # 核心单文件：包含完整的 HTML、CSS 与原生 JavaScript 逻辑
├─ www/                     # Capacitor 生成的 Web 静态资源目录
├─ assets/                  # 图标与启动图源文件
├─ android/                 # Android 原生工程目录
│  └─ app/src/main/res/     # App 图标、自适应图标与原生通知小图标配置
├─ capacitor.config.json    # Capacitor 配置（含原生插件参数）
└─ README.md                # 项目说明文档
```

---

## 四、 核心代码组织架构（index.html 完整拆解）

虽然项目采用单文件（`index.html`）形式进行开发，但内部代码严格遵循了**高内聚、低耦合**的工程化分层设计，具体代码架构树如下：

```text
index.html
├── <head>
│   ├── meta（viewport / theme-color / PWA 相关）
│   └── <style>
│       ├── CSS 变量：亮色 :root  /  暗色 [data-theme="dark"]
│       ├── 布局：#app / #topbar / #view / #tabbar
│       ├── 通用组件：.card .btn .field .tag .item .chip .seg .switch …
│       ├── 专用组件：.item.compact（网格卡）、.stat-capsules、.week-report、
│       │              .achievements、.layout-floor、.zone-card、.sheet、
│       │              .img-viewer-mask、.confirm-mask …
│       └── @media (hover:hover) 桌面端增强
│
├── <body> （DOM 结构）
│   ├── #splash          启动屏
│   ├── #onboard         新手引导（4 页 slide）
│   ├── #app             主容器
│   │   ├── #topbar      顶部栏（由 JS 渲染）
│   │   └── #view        当前 tab 内容（由 JS 渲染）
│   ├── #tabbar          底部 5 个 tab（由 JS 渲染）
│   ├── #mask > #sheet   通用底部抽屉
│   ├── #toast           轻提示
│   ├── #imgViewer       图片全屏查看
│   ├── #confirmMask     通用确认弹层（1 按钮/2 按钮/3 按钮共用）
│   ├── #fileInput       隐藏的导入 input
│   ├── #photoInput      隐藏的拍照 input
│   └── <script>         全部逻辑（见下）
│
└── <script> （JavaScript 核心代码架构）
    │
    ├── 【1. 基础配置与工具函数 (Utils & Config)】 —— 基建
    │   ├── $ (DOM选择器) / uid (唯一ID生成) / esc (防XSS转义)
    │   ├── todayStr / addDays / daysUntil (日期处理三剑客)
    │   ├── toast (轻提示) / customConfirm (自定义确认框)
    │   ├── ICON (全局 SVG 图标库)
    │   ├── LANG (中英双语字典) / BRAND_MAP (中英品牌翻译字典)
    │   └── DEFAULT_CATS / ACHIEVEMENTS / HOUSE_TEMPLATES (系统初始配置)
    │
    ├── 【2. 数据存储层 (Data Layer)】 —— 保证数据不丢
    │   ├── Store (封装 localStorage，存文本和配置)
    │   ├── PhotoDB (封装 IndexedDB，存大体积图片)
    │   ├── load() / save() (全局数据读写防抖)
    │   └── migratePhotosToIDB() (旧数据迁移)
    │
    ├── 【3. 核心业务逻辑 (Business Logic)】 —— App 的大脑
    │   ├── fuzzySearch() (同义词/场景映射模糊搜索)
    │   ├── matchShelfLife() (基于字典的保质期智能推算)
    │   ├── expStatus() / effectiveExpDate() (临期状态计算，含开封后逻辑)
    │   ├── checkAchievements() (成就系统解锁逻辑)
    │   ├── suggestLocation() (反向查找：物品在哪)
    │   └── mergeQuantities() / parseCSV() (导入导出数据处理)
    │
    ├── 【4. 视图渲染层 (View Layer)】 —— 负责长什么样
    │   ├── render() (总控函数，根据当前 UI.tab 渲染页面)
    │   ├── renderTopbar() / renderTabbar() (全局导航)
    │   ├── viewHome() / viewItems() / viewZones() / viewMe() (4大主页面)
    │   ├── viewAlerts() / viewStats() (提醒中心和统计看板)
    │   └── itemRow() / compactItemRow() (物品列表项 UI 生成)
    │
    ├── 【5. 弹窗与表单 (Sheets & Forms)】 —— 负责怎么交互
    │   ├── openSheet() / closeSheet() (底部抽屉控制)
    │   ├── itemFormSheet() / saveItemForm() (物品录入/编辑核心表单)
    │   ├── itemDetailSheet() (物品详情及操作)
    │   ├── layoutManageSheet() / trashSheet() / achievementsSheet() 
    │   └── rebuySheet() / addActionSheet() (补货与添加动作)
    │
    ├── 【6. 高级能力与原生桥接 (Native & AI)】 —— 突破网页限制
    │   ├── runHybridRecognition() / callLlmVision() (大模型拍照识别)
    │   ├── compressImage() / compressDataUrl() (前端 Canvas 图片压缩)
    │   ├── LocalNotify (本地通知模块：权限申请、每日/临期横幅定时)
    │   ├── handleExportFile() (原生文件导出：保存到手机本地)
    │   └── nativeCameraShot() / nativeGalleryPick() (原生相机与相册调用)
    │
    └── 【7. 全局事件代理与启动 (Events & Init)】 —— 统一路由
        ├── document.addEventListener('click') (全局事件委托，处理所有 data-act)
        ├── document.addEventListener('input') (实时表单联动)
        ├── 物理返回键监听 (Android BackButton)
        └── 启动保护机制 (try-catch load() -> applyTheme() -> render())
```

---

## 五、 运行与打包指南

### 1. Web 端本地预览
无需任何构建工具，直接启动本地静态服务器：
```bash
npx serve .
# 或使用 VSCode 的 Live Server 插件打开 index.html
```

### 2. Android App 编译与部署
环境要求：Node.js、Android Studio、Java JDK 17。

```bash
# 安装依赖
npm install

# 同步 Web 资源到 Android 工程
npx cap copy android
npx cap sync android

# 打开 Android Studio 编译运行
npx cap open android
```

---

## 六、 踩坑与工程记录 (Development Notes)

1. **跨域与网络环境问题**：因本地代理无法在手机端运行，自建了专属域名做 API 中转。调试中发现电信网络存在解析限制，系统已加入 **降级处理**（超时/失败自动提示手动输入），保证核心功能不断档。
2. **存储容量重构**：初期使用 `localStorage` 存储导致 50 件物品即空间溢出，随后进行底层重构，成功将图片数据迁移至 `IndexedDB`。
3. **系统返回键拦截**：通过原生 App 插件监听 `backButton` 事件，重写了返回逻辑，使 Hybrid App 拥有与原生一致的路由体验（弹窗优先关闭，其次返回首页）。
4. **物理图标适配**：重新设计品牌 VI，通过 `@capacitor/assets` 生成全尺寸自适应图标，并配置了纯白透明通知小图标 (`ic_stat_wanwu.png`)。

---

## 七、 后续规划

- **性能优化**：引入“虚拟列表 (Virtual List)”技术，解决单机存储物品过多时，首页列表渲染卡顿的问题。
- **端侧 AI 探索**：此前尝试过本地离线图片识别，因效果不尽人意暂时移除，未来计划引入轻量级端侧模型。
- **多端协同**：探索局域网同步或轻量级云端方案，让家庭成员可以共享同一份“我家布局”。
- **网络兼容性**：持续优化 API 中转服务节点，解决部分运营商网络无法访问的问题。

---

## 附录：答辩模拟 Q&A (内部资料)

> *此为项目内部记录，用于软件工程期末答辩及代码审查。*

### Q1：你们的页面是一整个 index.html，物品多了会不会卡顿？
**A**：确实存在这个问题，这也是我们小范围测试时发现的痛点。目前如果物品多达几百上千件，DOM 节点过多会导致首屏渲染变慢。但我们已经做了**分页加载**，每次只渲染前 60 件。如果未来要优化，我们会引入**虚拟列表（Virtual List）**技术，只渲染屏幕可见区域的 DOM 节点。

### Q2：你们那个“模糊搜索”底层具体是怎么实现的？
**A**：我们手写了一个 `fuzzySearch` 函数。它不仅仅是简单的 `includes` 匹配。我们在底层建了一个**场景与同义词映射字典（SMART_MAP）**。比如用户搜“生病”，函数会自动把这个词扩展成“感冒药、退烧贴、体温计”等十几个关键词，再去物品库里去匹配。并且它还会去匹配物品所属的分类名称，做到了真正的语义级联想。

### Q3：最开始存了几十件物品就崩溃，你们后来是怎么解决存储瓶颈的？
**A**：我们最初存在 `localStorage` 里，上限只有 5MB。后来我们做了**双数据库分离架构**。把文字类的配置、名称存在 `Store`（封装了 localStorage）；把大体积的图片剥离出来，经过前端 Canvas 压缩后，存进重型的 `PhotoDB`（封装了 IndexedDB）。这样就突破了容量限制。

### Q4：你们的“软删除”（回收站）在代码里是怎么实现的？是直接 splice 吗？
**A**：不是直接删。我们在数据对象里加了一个 `deletedAt` 时间戳。用户点删除，我们只记录删除时间，渲染列表时过滤掉带有这个字段的物品。如果去回收站恢复，只要把这个时间戳删掉，物品就回来了。超过 30 天，系统才会真正清理并释放图片存储空间。

### Q5：调大模型识别图片，如果返回乱码或格式不对，你们怎么处理异常？
**A**：大模型的输出确实具有不确定性。所以在 `callLlmVision` 里，我们做了严格的约束。第一，在 Prompt 里强制要求它返回特定的 JSON 格式；第二，前端收到数据后，我们用正则表达式去提取 JSON 字段，并用 `try-catch` 包裹 `JSON.parse`。如果解析失败，或者网络超时（我们加了 30 秒的 `AbortController`），系统会自动降级，提示用户“网络异常，请手动填写”，保证主流程不卡死。

### Q6：你们不用 Vue/React，纯原生 JS 怎么保证高内聚低耦合？
**A**：我们在代码里做了严格的分层架构。比如 `view*` 开头的函数专门负责渲染 HTML 页面；`document.addEventListener('click')` 作为统一的全局事件代理负责路由；而 `fuzzySearch` 等函数专门处理业务逻辑。我们把数据和视图完全解耦了，所有的状态都统一挂载在全局对象 `S` 中，这样就不会出现变量满天飞的情况。
```
