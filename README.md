# 投篮小游戏 🏀

## How to Run

```bash
# 使用 Docker Compose 启动
docker-compose up --build -d

# 停止服务
docker-compose down
```

## Services

| 服务          | 端口 | 描述           |
| ------------- | ---- | -------------- |
| frontend-user | 8081 | 投篮游戏用户端 |

访问地址：http://localhost:8081

## 测试账号

本项目为纯前端游戏，无需登录账号。

## 题目内容

帮我用网页技术开发一个投篮小游戏。

---

## 项目介绍

这是一个基于 HTML5 Canvas 开发的投篮小游戏，具有以下特性：

### 游戏玩法

- 拖拽篮球调整投篮力度和角度
- 松开鼠标/手指进行投篮
- 连续命中可获得连击加分

### 技术特点

- 纯原生 JavaScript 实现，无游戏引擎依赖
- 物理引擎模拟：重力、空气阻力、碰撞反弹
- 篮筐碰撞检测：篮圈、篮板、进球判定
- 轨迹预测：拖拽时显示预测弹道
- 粒子特效：进球时的庆祝效果
- 响应式设计：支持桌面和移动端

### 项目结构

```
frontend-user/
├── src/
│   ├── game/
│   │   ├── Game.js      # 游戏主逻辑
│   │   ├── Ball.js      # 篮球类
│   │   ├── Hoop.js      # 篮筐类
│   │   ├── Physics.js   # 物理引擎
│   │   └── Renderer.js  # 渲染器
│   ├── styles/
│   │   └── main.css     # 样式文件
│   └── main.js          # 入口文件
├── public/
│   └── favicon.svg      # 网站图标
├── index.html           # HTML 入口
├── Dockerfile           # Docker 构建文件
├── nginx.conf           # Nginx 配置
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

### 本地开发

```bash
cd frontend-user
npm install
npm run dev
```

访问 http://localhost:8081 开始游戏。
