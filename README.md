# Community 社群平台

以 Next.js 打造的社群互動應用，支援發文、留言、按讚、轉發與追蹤，並提供多種登入方式與即時更新。

---

## 專案介紹

本專案為一個輕量級社群平台，使用者可註冊／登入後發表動態、在貼文下留言，並對貼文與留言按讚，亦可轉發貼文、追蹤其他使用者。適合作為學習全端開發或作為小型社群服務的起點。

### 主要功能

- **使用者系統**：註冊、登入（信箱密碼）、OAuth（Google、Facebook、GitHub）
- **貼文**：發表動態（含圖片）、檢視貼文詳情、對貼文按讚、轉發（Retweet）
- **留言**：在貼文下留言（含圖片）、對留言按讚、回覆
- **草稿**：儲存未完成的貼文，稍後再發佈
- **追蹤**：追蹤／取消追蹤其他使用者
- **個人資料**：頭像、封面圖、顯示名稱、簡介（bio）、生日、唯一 handle（如 `@username`）
- **即時**：透過 Pusher 即時收到新貼文與互動通知

### 資料模型概要

- **User**：使用者（名稱、信箱、密碼雜湊、頭像、封面、handle、bio、生日）
- **Account**：OAuth 帳號綁定（provider、providerAccountId）
- **Post**：貼文（作者、內容、圖片、按讚數、轉發數）
- **Comment**：留言（所屬貼文、作者、內容、圖片、按讚數）
- **PostLike / CommentLike**：貼文與留言的按讚紀錄
- **PostRetweet**：轉發紀錄
- **Draft**：草稿（使用者、內容）
- **Follow**：追蹤關係（follower / following）

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
| **驗證** | [Zod](https://zod.dev)（表單與 API 驗證） |
| **密碼** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js)（雜湊儲存） |
| **圖片** | [Cloudinary](https://cloudinary.com)（上傳與 CDN） |
| **即時** | [Pusher](https://pusher.com)（即時推播） |

---

## 環境需求

- Node.js 18+
- MongoDB（本地或雲端連線）
- 若使用 OAuth，需在對應平台建立應用並取得 Client ID / Secret
- 若使用圖片上傳，需在 Cloudinary 建立應用
- 若使用即時功能，需在 Pusher 建立應用

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

複製 `.env.example` 為 `.env`，並填入下列變數。

**必填**

- `DATABASE_URL`：MongoDB 連線字串（例：`mongodb://localhost:27017/community` 或 MongoDB Atlas 連線字串）
- `AUTH_SECRET`：NextAuth 用於簽署 session 的密鑰（可執行 `npx auth secret` 或 `openssl rand -base64 32` 產生）

**OAuth（選填，有設定才會顯示對應登入按鈕）**

- Google：`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`
- Facebook：`AUTH_FACEBOOK_ID`、`AUTH_FACEBOOK_SECRET`
- GitHub：`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET`

**Cloudinary（選填，用於貼文／留言圖片上傳）**

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Pusher（選填，用於即時推播）**

- `NEXT_PUBLIC_PUSHER_APP_ID`
- `NEXT_PUBLIC_PUSHER_KEY`
- `PUSHER_SECRET`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

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
  (main)/              # 主版面：首頁、貼文詳情、個人頁
    post-detail/       # 貼文詳情與留言
    profile/           # 個人頁（含 [handle] 動態路由）
  api/                 # API 路由
    auth/              # NextAuth、註冊
    drafts/            # 草稿 CRUD
    posts/             # 貼文、留言、按讚、轉發
    profile/           # 個人資料、追蹤
    upload/cloudinary/ # 圖片上傳
  components/          # 共用元件（導覽、發文、留言、守衛、即時訂閱等）
  login/               # 登入頁
  register/            # 註冊頁
auth.ts                # NextAuth 設定與 providers
lib/                   # Prisma 單例、Pusher、Zod schemas
prisma/
  schema.prisma        # 資料庫 schema（MongoDB）
services/              # 貼文相關 API 封裝
store/                 # Zustand stores（貼文、使用者狀態）
types/                 # 型別與 NextAuth 擴充
```

---

## 延伸閱讀

- [Next.js 文件](https://nextjs.org/docs)
- [NextAuth.js 文件](https://authjs.dev)
- [Prisma 文件](https://www.prisma.io/docs)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)
- [Cloudinary 文件](https://cloudinary.com/documentation)
- [Pusher 文件](https://pusher.com/docs)

---

## 授權

本專案為私有（private）專案。
