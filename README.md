# 酒店图片工坊 🏨

> 为酒店从业者提供快速、免费的图片在线处理工具

## 功能特性

- 📤 图片上传 - 支持拖拽上传，单张/批量
- ✂️ 图片裁剪 - 自由裁剪、预设比例
- 🔄 尺寸调整 - 宽高调整、比例缩放
- 🖼️ 格式转换 - jpg/png/webp 互转
- 📦 图片压缩 - 调整质量，减少体积
- 🤖 AI 画质增强 - 智能提升图片清晰度

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + TypeScript |
| UI | Tailwind CSS |
| 后端 | Cloudflare Workers |
| 图片处理 | Sharp (Workers 兼容) |
| AI | MiniMax API |
| 部署 | Cloudflare Pages + Workers |

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install
cd ../api && npm install
```

### 本地开发

```bash
npm run dev
```

- 前端: http://localhost:3000
- API: http://localhost:8787

### 部署

```bash
# 部署前端到 Cloudflare Pages
cd frontend && npm run build

# 部署 API 到 Cloudflare Workers
cd ../api && npm run deploy
```

## 项目结构

```
hotel-image-tool/
├── frontend/          # Next.js 前端项目
│   ├── src/
│   │   ├── app/        # App Router 页面
│   │   │   ├── page.tsx    # 主页面
│   │   │   ├── layout.tsx # 布局
│   │   │   └── globals.css
│   │   └── components/  # 组件
│   ├── tailwind.config.js
│   └── next.config.js
├── api/               # Cloudflare Workers API
│   ├── src/
│   │   └── index.ts    # 入口文件
│   └── wrangler.toml
├── mvp-requirements.md  # MVP 需求文档
└── README.md
```

## 配置

### 环境变量

在 `api/` 目录下创建 `.dev.vars` 文件：

```env
MINIMAX_API_KEY=your_api_key_here
```

## License

MIT
