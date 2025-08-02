# Mock

## 概述

Fun Mock 测试框架是 Fun WebSocket 框架的一部分，用于在不依赖真实服务的情况下测试代码逻辑。它通过 WebSocket 连接与测试服务进行通信，支持模拟请求和代理消息处理。

## 核心组件

### MockRequest 函数

用于模拟发送请求并获取响应结果。

```go
func MockRequest[T any](requestInfo any) Result[T]
```


**参数说明**:
- `requestInfo`: 请求信息对象，包含请求的 ID、类型和数据

**返回值**:
- `Result[T]`: 泛型结果对象，包含状态码和返回数据

**使用示例**:
```go
request := GetRequestInfo(service, "methodName", params, headers)
result := MockRequest[ResponseType](request)
```


### MockProxy 函数

用于模拟代理消息处理，支持长时间连接和消息监听。

```go
func MockProxy(requestInfo any, proxy ProxyMessage, seconds int64)
```


**参数说明**:
- `requestInfo`: 请求信息对象
- `proxy`: 代理消息处理器，包含消息处理和连接关闭回调函数
- `seconds`: 超时时间（秒）

### ProxyMessage 结构体

定义代理消息处理的回调函数。

```go
type ProxyMessage struct {
    Message func(message any)  // 消息处理函数
    Close   func()             // 连接关闭处理函数
}
```


### MockProxyClose 函数

用于主动关闭代理连接。

```go
func MockProxyClose(id string)
```


**参数说明**:
- `id`: 需要关闭的连接 ID

## RequestInfo 结构体

[RequestInfo] 是 Mock 测试框架中用于封装请求信息的核心结构体。

```go
type RequestInfo[T any] struct {
    Id          string
    MethodName  string
    ServiceName string
    Dto         *T
    State       map[string]string
    Type        uint8
}
```


### 属性详解

#### Id (string)
请求的唯一标识符，使用 nanoid 自动生成的唯一字符串，用于匹配请求和响应。

#### MethodName (string)
要调用的服务方法名称，必须是服务结构体中定义的公开方法名。

#### ServiceName (string)
服务结构体的名称，例如对于 [UserService](file:///Volumes/未命名/代码/fun/dist/UserService.ts#L3-L17) 结构体，ServiceName 为 "UserService"。

#### Dto (*T)
数据传输对象，包含传递给方法的参数。如果方法不需要参数，该值为 nil。

#### State (map[string]string)
状态信息映射，用于传递客户端状态信息，如认证信息、会话数据等。

#### Type (uint8)
请求类型标识，可选值：
- [FuncType] (值为 0): 普通方法调用
- [ProxyType] (值为 1): 代理方法调用（支持推送）
- [CloseType] (值为 2): 关闭连接请求

## 使用方法

### 基本请求模拟

```go
// 创建请求信息
request := GetRequestInfo(UserService{}, "MethodName", requestData, headers)
// 发送模拟请求并获取结果
result := MockRequest[ExpectedResultType](request)
```


### 代理消息处理

```go
// 创建代理消息处理器
proxy := ProxyMessage{
    Message: func(message any) {
        // 处理接收到的消息
        fmt.Printf("Received message: %+v\n", message)
    },
    Close: func() {
        // 处理连接关闭事件
        fmt.Println("Connection closed")
    },
}

// 发送代理请求
request := GetRequestInfo(Service{}, "ProxyMethod", params, headers)
MockProxy(request, proxy, timeoutSeconds)
```


### 创建 RequestInfo

使用 [GetRequestInfo] 函数创建 RequestInfo 实例：

```go
func GetRequestInfo[T any](service any, methodName string, dto T, state map[string]string) RequestInfo[T]
```


**参数说明**:
- `service`: 服务结构体实例或类型
- `methodName`: 要调用的方法名称
- `dto`: 传递给方法的参数数据
- `state`: 状态信息映射

**使用示例**:

```go
// 普通方法调用
request := fun.GetRequestInfo(
    userService.UserService{}, 
    "HelloWord", 
    userService.User{
        Name: "test",
        User: "123456",
    }, 
    map[string]string{}
)

// 代理方法调用
request := fun.GetRequestInfo(
    userService.UserService{}, 
    "ProxyMethod", 
    map[string]string{}, // 代理方法通常不需要 DTO
    map[string]string{"token": "abc123"}
)
```


## 配置选项

### 设置测试客户端 ID

可以通过 [SetTestClientId]函数设置测试客户端的 ID：

```go
func SetTestClientId(id string)
```


**使用示例**:
```go
// 在测试开始前设置自定义客户端ID
fun.SetTestClientId("your-custom-client-id")

// 然后运行你的测试
fun.Test(YourTestStruct{})
```


## 内部函数

### getMessage 函数

从消息队列中获取指定 ID 的消息。

```go
func getMessage(id string, result any)
```


### GetProxyMessage 函数

处理代理消息的主循环，监听消息队列并调用相应的回调函数。

```go
func GetProxyMessage(id string, proxy ProxyMessage, seconds int64)
```


## WebSocket 客户端

框架内部使用 WebSocket 客户端与测试服务通信：

- 自动重连机制
- 心跳包维持连接（每5秒发送一次）
- 消息队列处理接收到的数据
- 线程安全的写入操作

## 注意事项

1. 所有 WebSocket 写入操作都通过互斥锁保护，确保线程安全
2. 消息队列缓冲区大小为100条消息
3. 默认客户端 ID 为 "lGbk6IVcT965Qs_zb30KS"，可通过 [SetTestClientId]修改
4. 框架会在初始化时自动启动测试服务和客户端连接

## 错误处理

框架在遇到以下情况时会触发 panic：
- JSON 序列化/反序列化失败
- WebSocket 写入错误
- 消息解析错误

在生产环境中应适当处理这些错误情况。
