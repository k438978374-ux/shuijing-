# 水晶库存系统项目上下文备忘

更新时间：2026-06-11

## 当前决定

项目暂时按“本地使用、本地保存”继续，不作为正式在线系统使用。

原因：

- 用户当前主要想先把系统本身用顺
- 在线部署已经试过，但国内访问链路和后续维护成本暂时不想继续投入
- 当前阶段优先保证本地使用稳定，数据先保存在浏览器本地

## 当前本地模式

当前代码默认仍包含一部分在线接入代码，但用户当前实际使用方式是：

- 本地打开项目
- 本地录入库存、进货、配方、制作、销售
- 数据保存在浏览器 `localStorage`
- 默认云同步关闭。只有把 `VITE_CLOUD_SYNC_ENABLED=true` 时，才会启用 Supabase 同步。

本地存储入口文件：

- [src/storage/store.ts](C:/Users/Administrator/Documents/水晶库存系统/src/storage/store.ts)

本地存储 key：

- `crystal-inventory-system:v1`

## 已完成的业务逻辑

系统已经完成这些核心逻辑：

- 材料管理
- 进货管理
- 配方管理
- 制作管理
- 成品管理
- 销售管理
- 成本、库存、利润统计

另外，规格逻辑已经调整为：

- 材料本身不带规格
- 规格在“进货”里选择
- 库存按 `材料 + 规格` 记录
- 配方用料时从已有规格库存中选择

## 已做过的在线方案尝试

### 1. Supabase

已经接入过一版 Supabase 方案，相关代码仍在项目里：

- [src/storage/cloudStore.ts](C:/Users/Administrator/Documents/水晶库存系统/src/storage/cloudStore.ts)
- [src/storage/cloudStore.test.ts](C:/Users/Administrator/Documents/水晶库存系统/src/storage/cloudStore.test.ts)
- [docs/supabase-setup.sql](C:/Users/Administrator/Documents/水晶库存系统/docs/supabase-setup.sql)

当时使用的信息：

- Supabase URL: `https://jcjmhvanbyzbsefibwzl.supabase.co`
- Supabase anon key: 已配置过，但不建议在文档里重复扩散

说明：

- 这套方案代码已通
- 但因为用户后续更倾向本地使用，当前不作为正式使用方案推进

### 2. Vercel

已经试过部署到 Vercel，并且部署成功过。

问题：

- 中国大陆访问 `vercel.app` 域名不稳定
- 不适合作为用户当前正式使用入口

### 3. CloudBase 静态网站托管

已经试过部署到腾讯云 CloudBase 静态网站托管，并确认网页可访问。

但当前决定是：

- 先不继续维护线上版本
- 暂不把它作为正式工作流
- 之后若要恢复在线版，可以继续沿 CloudBase 方向推进

## 当前代码里与在线有关的内容

项目里还保留了这些在线相关内容：

- Supabase 环境变量支持
- 云端同步状态提示
- 访问密码页 `AccessGate`

相关文件：

- [src/App.tsx](C:/Users/Administrator/Documents/水晶库存系统/src/App.tsx)
- [src/components/AccessGate.tsx](C:/Users/Administrator/Documents/水晶库存系统/src/components/AccessGate.tsx)
- [src/components/AccessGate.test.tsx](C:/Users/Administrator/Documents/水晶库存系统/src/components/AccessGate.test.tsx)
- [src/vite-env.d.ts](C:/Users/Administrator/Documents/水晶库存系统/src/vite-env.d.ts)
- [.env.example](C:/Users/Administrator/Documents/水晶库存系统/.env.example)

说明：

- 这些代码目前可以保留，不影响后续继续本地使用
- 如果未来要彻底简化成纯本地版，可以再移除

## 未来如果恢复在线版，推荐顺序

如果之后用户决定重新做在线版，推荐优先顺序：

1. 优先考虑 CloudBase 前端托管
2. 再决定数据库是否迁到 CloudBase 文档型数据库
3. 若只是临时在线演示，也可以重新启用 Supabase 方案

推荐原因：

- CloudBase 在国内访问更友好
- 比 Vercel 更适合用户当前网络环境

## 下次继续时建议先确认的事

下次继续前，先问用户这次想走哪条线：

1. 继续只做本地版优化
2. 恢复在线版，但只做前端在线
3. 恢复完整在线版，包含云端数据库

## 本阶段结论

当前最重要的结论是：

这个项目现在**以本地使用为主**，  
**数据以本地保存为准**，  
在线部署相关内容先不继续推进。
