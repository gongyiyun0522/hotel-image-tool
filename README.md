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
| 前端 | React + TypeScript + Vite |
| UI | Tailwind CSS |
| 后端 | Cloudflare Workers |
| 图片处理 | Sharp |
| AI | MiniMax API |
| 部署 | Cloudflare Pages + Workers |

## 快速开始

### 安装依赖

```bash
npm install
cd frontend && npm install
cd ../api && npm install
```

### 本地开发

```bash
npm run dev
```

- 前端: http://localhost:5173
- API: http://localhost:8787

### 部署

```bash
npm run deploy
```

## 项目结构

```
hotel-image-tool/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   └── utils/       # 工具函数
│   └── vite.config.ts
├── api/               # Cloudflare Workers API
│   ├── src/
│   │   └── index.ts    # 入口文件
│   └── wrangler.toml
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
