# 快速开始

## 安装

```bash
go get github.com/chiyikj/fun
```


## 项目结构

```
project/
├── main.go
└── service/
    └── hello.go
```


## 创建服务

创建 `service/hello.go`：

```go
package service

import "github.com/chiyikj/fun"

type HelloService struct {
    Ctx fun.Ctx
}

type UserDto struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

func (s *HelloService) SayHello(dto UserDto) string {
    return "Hello, " + name
}

func init() {
    fun.BindService(HelloService{})
}
```


## 启动服务器和生成客户端代码

创建 `main.go`：

```go
package main

import (
    _ "your-module-name/service"
    "github.com/chiyikj/fun"
)

func main() {
    fun.Gen() // 生成客户端代码到 dist/ 目录
    fun.Start() // 启动服务器，默认端口 3000
}
```


运行应用：

```bash
go run main.go
```


服务器将在 `localhost:3000` 启动，客户端代码生成在 `dist/` 目录。