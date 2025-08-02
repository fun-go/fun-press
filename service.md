# 服务(Service)

## 概述

Fun 框架中的服务是应用程序的核心组件，负责处理业务逻辑。每个服务都是一个 Go 结构体，其中包含一系列方法，这些方法可以通过 WebSocket 连接被客户端调用。

## 服务定义

### 基本结构

服务必须是一个结构体，且第一个字段必须是 `Ctx fun.Ctx`，这个字段提供了请求上下文信息：

```go
type MyService struct {
    Ctx fun.Ctx  // 必须是第一个字段
    // 其他字段...
}
```


### 服务方法

服务中的方法定义了可被客户端调用的操作。方法可以有以下几种形式：

1. 简单方法（无参数）：
```go
func (s *MyService) Hello() string {
    return "Hello World"
}
```



2. 带 DTO（数据传输对象）的方法：
```go
type UserDto struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

func (s *MyService) CreateUser(dto UserDto) *User {
    return &User{
        Id:    generateId(),
        Name:  dto.Name,
        Email: dto.Email,
    }
}
```


3. 实时监听方法（Proxy方法）：
```go
func (s *MyService) WatchEvents(close fun.ProxyClose) *string {
    // 发送实时数据
    s.Ctx.Push(s.Ctx.Id, s.Ctx.RequestId, "实时数据")
        
    // 在适当时候关闭连接
    close(func() {
        // 清理资源
    })
    
    text := "开始监听事件"
    return &text
}
```


## 服务注册

使用 `fun.BindService` 函数注册服务：

```go
func init() {
    fun.BindService(MyService{})
}
```


可以为服务指定守卫：

```go
func init() {
    fun.BindService(MyService{}, AuthGuard{})
}
```


## Ctx 上下文

`Ctx` 结构体提供了请求上下文信息，包含以下字段和方法：

- `Id`: 客户端连接ID
- `RequestId`: 请求ID
- `ServiceName`: 服务名称
- `MethodName`: 方法名称
- `State`: 客户端状态信息
- `Send`: 向客户端发送实时数据的方法
- `Close`: 关闭连接的方法


## 服务方法规则

1. 服务方法必须是导出的（首字母大写）
2. 方法可以有0个、1个或2个参数
3. 如果有2个参数，第二个参数必须是 [fun.ProxyClose] 类型（用于实时监听方法）
4. 方法可以返回0个或1个值
5. 返回值会被自动序列化并发送给客户端

## 服务生命周期

1. 服务在应用程序启动时通过 [fun.BindService] 注册
2. 当客户端调用服务方法时，Fun 框架会创建服务实例
3. 服务实例处理完请求后会被销毁
4. 每个请求都会创建新的服务实例，保证请求间隔离

## 最佳实践

1. 保持服务方法简洁，专注于单一职责
2. 合理使用 DTO 来组织复杂参数
3. 利用实时监听方法实现实时数据推送
4. 正确处理错误并返回有意义的错误信息
5. 在服务初始化时进行必要的资源准备
