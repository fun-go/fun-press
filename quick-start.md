# 快速入门

Fun 是一个基于 WebSocket 的实时通信框架，本文档将指导你如何快速启动一个 Fun 项目并从前端调用后端接口。

## 🚀 快速启动项目

### 1. 安装框架

首先，使用以下命令安装 Fun 框架：

```bash
go get github.com/chiyikj/fun
```


### 2. 定义服务

创建一个服务文件，例如 [userService.go]：

```go
// userService.go
package userService

import (
    "fun"
)

type UserService struct {
    fun.Ctx
    // 其他依赖字段
}

type User struct {
    User string
    Name *string
}

func (ctx UserService) HelloWord(user User) *int8 {
    // 业务逻辑
    return nil
}

func init() {
    fun.BindService(UserService{})
}
```


### 3. 启动服务

创建主程序文件 [main.go]：

```go
// main.go
package main

import (
    "fun"
    _ "your-module/service/userService" // 导入你的服务
)

func main() {
    fun.Gen()      // 生成客户端代码到 ../gen/ts/ 目录
    fun.Start(3000) // 启动服务在端口 3000
}
```


运行以下命令启动项目：

```bash
go run main.go
```


现在你的 Fun 项目已经在 3000 端口启动并运行了！

## 📁 代码生成位置

执行 [fun.Gen()] 后，框架会自动生成 TypeScript 客户端代码到以下目录：

```
../gen/ts/
```


该目录将包含所有服务的 TypeScript 客户端实现和相关类型定义。

## 📞 前端调用后端接口

### 1. 生成的代码结构

执行 [fun.Gen()] 后，框架会在 `../gen/ts/` 目录下生成以下代码：

```
../gen/ts/
├── fun.ts                 # 客户端入口文件
├── UserService.ts          # UserService 服务客户端
└── test/service/userService/
    └── User.ts            # User 数据类型定义
```


### 2. 前端调用示例

```typescript
import fun from "../gen/ts/fun";

// 创建客户端连接
const api = fun.create("ws://localhost:3000");

// 调用 UserService 的 HelloWord 方法
const result = await api.userService.helloWord({
  user: "test",
  name: "John Doe"
});

console.log(result);
```


### 3. 完整的前端调用示例

```typescript
import fun from "../gen/ts/fun";
import type user from "../gen/ts/test/service/userService/user";

// 创建客户端连接
const api = fun.create("ws://localhost:3000");

// 定义请求数据
const userData: user = {
  user: "testUser",
  name: "John Doe"
};

// 调用服务方法
const result = await api.userService.helloWord(userData);

// 处理响应
if (result.status === 0) { // 成功状态
  console.log("Success:", result.data);
} else {
  console.error("Error:", result.msg);
}
```


通过这种方式，前端可以类型安全地调用后端服务，享受完整的 TypeScript 类型检查和自动补全功能。Fun 客户端不会抛出异常，所有错误都会通过 `result.status` 和 `result.msg` 返回。
