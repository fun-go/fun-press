# 守卫(Guard)

## 概述

在 Fun 框架中，守卫(Guard)是一种用于在服务方法执行前进行权限检查、身份验证或状态验证的机制。它允许您在请求到达具体业务逻辑之前执行预处理逻辑，确保只有满足特定条件的请求才能继续执行。

## 守卫接口定义

```go
type Guard interface {
    Guard(serviceName string, methodName string, state map[string]string) *Result[any]
}
```


## 方法参数说明

- `serviceName`: 被调用的服务名称
- `methodName`: 被调用的方法名称
- `state`: 客户端传递的状态信息，通常包含认证信息如 token 等

## 返回值

- 返回 `*Result[T]` 类型，如果验证失败，可以通过返回错误结果来阻止方法执行
- 如果验证通过，应返回 `nil`

## 工作原理

1. 在服务方法被调用之前，框架会先执行所有相关的守卫
2. 守卫按照注册顺序依次执行
3. 如果任何一个守卫返回错误结果，整个调用链将被中断
4. 只有当所有守卫都通过验证后，服务方法才会被执行

## 守卫类型

Fun 框架支持两种类型的守卫：

### 1. 全局守卫

全局守卫会对所有服务的所有方法生效。

```go
func init()  {
    fun.BindGuard(AuthGuard{})
}
```


### 2. 服务级别守卫

服务级别守卫只对特定服务生效。

```go
fun.BindService(MyService{}, AuthGuard{})
```


## 使用示例

### 基础守卫实现

```go
type AuthGuard struct {
    // 可以注入依赖
}

func (g *AuthGuard) Guard(serviceName string, methodName string, state map[string]string) *Result[any] {
    // 检查认证信息
    token, exists := state["token"]
    if !exists || !isValidToken(token) {
        return &Result[any]{
            Msg:    stringPtr("Unauthorized"),
            Status: errorCode,
        }
    }
    
    // 验证通过
    return nil
}

func stringPtr(s string) *string {
    return &s
}

//全局注册守卫
func init()  {
    fun.BindGuard(AuthGuard{})
}
```
## 守卫执行顺序

1. 全局守卫按照注册顺序执行
2. 服务级别守卫按照注册顺序执行
3. 所有守卫都必须通过验证，服务方法才会被执行

## 注意事项

1. 守卫中可以通过返回特定的 [*Result] 来中断请求处理流程
2. 守卫可以访问请求上下文中的状态信息，但不能修改请求参数
3. 守卫的执行顺序很重要，应根据业务逻辑合理安排
4. 避免在守卫中执行耗时操作，以免影响系统性能
5. 合理使用全局守卫和服务守卫，避免重复验证