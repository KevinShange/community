# Community 社群平台

以 Next.js 打造的社群互動應用，支援發文、留言與按讚，並提供多種登入方式。

---

## 專案介紹

本專案為一個輕量級社群平台，使用者可註冊／登入後發表動態、在貼文下留言，並對貼文與留言按讚。適合作為學習全端開發或作為小型社群服務的起點。

### 主要功能

- **使用者系統**：註冊、登入（信箱密碼）、OAuth（Google、Facebook、GitHub）
- **貼文**：發表動態、檢視貼文詳情、對貼文按讚
- **留言**：在貼文下留言、對留言按讚
- **個人識別**：頭像、顯示名稱、唯一 handle（如 `@username`）

### 資料模型概要

- **User**：使用者（名稱、信箱、密碼雜湊、頭像、handle）
- **Post**：貼文（作者、內容、按讚數）
- **Comment**：留言（所屬貼文、作者、內容、按讚數）
- **PostLike / CommentLike**：貼文與留言的按讚紀錄

---

## 技術棧

| 類別 | 技術 |
|------|------|
| **框架** | [Next.js](https://nextjs.org) 16（App Router） |
| **前端** | [React](https://react.dev) 19、[TypeScript](https://www.typescriptlang.org) |
| **樣式** | [Tailwind CSS](https://tailwindcss.com) 4 |
| **認證** | [NextAuth.js](https://authjs.dev) v5（Credentials + OAuth） |
| **資料庫** | [MongoDB](https://www.mongodb.com) + [Prisma](https://www.prisma.io) ORM |
| **狀態管理** | [Zustand](https://zustand-demo.pmnd.rs) |
| **密碼** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js)（雜湊儲存） |

---

## 環境需求

- Node.js 18+
- MongoDB（本地或雲端連線）
- 若使用 OAuth，需在對應平台建立應用並取得 Client ID / Secret

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 環境變數

複製 `.env.example` 為 `.env`，並填入：

- `DATABASE_URL`：MongoDB 連線字串
- `AUTH_SECRET`：NextAuth 用於簽署 session 的密鑰（可執行 `openssl rand -base64 32` 產生）
- 若使用 OAuth：`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET` 等（依你啟用的 provider 設定）

### 3. 資料庫

```bash
npm run db:generate   # 產生 Prisma Client
npm run db:push       # 將 schema 同步到 MongoDB
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可使用。

---

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建置生產版本 |
| `npm run start` | 啟動生產伺服器 |
| `npm run db:generate` | 產生 Prisma Client |
| `npm run db:push` | 同步 Prisma schema 至資料庫 |
| `npm run db:studio` | 開啟 Prisma Studio 管理資料 |
| `npm run lint` | 執行 ESLint |

---

## 專案結構（概要）

```
app/
  (main)/           # 主版面：首頁、貼文詳情
  api/              # API 路由：auth、posts、comments、like
  components/       # 共用元件（導覽、發文、留言、守衛等）
  login/            # 登入／註冊頁
auth.ts             # NextAuth 設定與 providers
prisma/
  schema.prisma     # 資料庫 schema（MongoDB）
services/           # 貼文相關 API 封裝
store/              # Zustand stores（貼文、使用者狀態）
```

---

## 延伸閱讀

- [Next.js 文件](https://nextjs.org/docs)
- [NextAuth.js 文件](https://authjs.dev)
- [Prisma 文件](https://www.prisma.io/docs)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)

---

## 授權

本專案為私有（private）專案。
