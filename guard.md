# 拦截器

## 什么是拦截器？

拦截器（Guard）是 Fun 框架中用于在服务方法执行前进行预处理的组件。它们通常用于实现权限验证、身份认证、请求日志记录等通用逻辑。拦截器可以在方法执行前检查请求的合法性，并在必要时阻止方法的执行。

## 定义拦截器

### 基本拦截器结构

要定义一个拦截器，需要创建一个实现 `fun.Guard` 接口的结构体：

```go
type AuthGuard struct {
    // 可以注入依赖
    Config *Config
    Redis  *RedisClient
}

func (g AuthGuard) Guard(ctx fun.Ctx) {
    // 实现权限验证逻辑
    // 如果验证失败，可以 panic 抛出错误
}
```


### 拦截器方法

拦截器必须实现 `Guard` 方法，该方法接收一个 `fun.Ctx` 参数，包含请求的上下文信息：

```go
func (g AuthGuard) Guard(ctx fun.Ctx) {
    // 访问请求信息
    token := ctx.State["token"]
    ip := ctx.Ip
    serviceName := ctx.ServiceName
    methodName := ctx.MethodName
    
    // 实现验证逻辑
    if !isValidToken(token) {
        panic(fun.Error(401, "Unauthorized"))
    }
}
```


## 依赖注入

### 拦截器依赖注入

与服务类似，拦截器也支持依赖注入。拦截器的第一层字段会自动注入：

```go
type AuthGuard struct {
    // 第一层字段会自动注入
    Config *Config
    Redis  *RedisClient
    Logger *Logger
}
```


对于嵌套结构中的字段，需要使用 `fun:"auto"` 标签：

```go
type Config struct {
    // 嵌套结构中的字段需要使用 fun:"auto" 标签
    Logger *Logger `fun:"auto"`
}
```


## 注册拦截器

### 全局拦截器

可以通过 `fun.BindGuard` 方法注册全局拦截器，它将应用于所有服务：

```go
func init() {
    fun.BindGuard(AuthGuard{})
}
```


### 服务级拦截器

可以通过 `fun.BindService` 方法为特定服务注册拦截器：

```go
func init() {
    fun.BindService(UserService{}, AuthGuard{})
}
```


## 实际示例

### 身份验证拦截器

```go
type AuthGuard struct {
    Redis *RedisClient
}

func (g AuthGuard) Guard(ctx fun.Ctx) {
    // 检查是否存在 token
    token, exists := ctx.State["token"]
    if !exists {
        panic(fun.Error(401, "Missing authentication token"))
    }
    
    // 验证 token 有效性
    if !g.isValidToken(token) {
        panic(fun.Error(401, "Invalid token"))
    }
    
    // 检查 token 是否已过期
    if g.isTokenExpired(token) {
        panic(fun.Error(401, "Token expired"))
    }
}

func (g AuthGuard) isValidToken(token string) bool {
    // 实现 token 验证逻辑
    // ...
    return true
}

func (g AuthGuard) isTokenExpired(token string) bool {
    // 实现 token 过期检查逻辑
    // ...
    return false
}
```


### 权限检查拦截器

```go
type PermissionGuard struct {
    Database *Database
}

func (g PermissionGuard) Guard(ctx fun.Ctx) {
    userID := ctx.State["userID"]
    serviceName := ctx.ServiceName
    methodName := ctx.MethodName
    
    // 检查用户是否有权限访问该服务方法
    if !g.hasPermission(userID, serviceName, methodName) {
        panic(fun.Error(403, "Insufficient permissions"))
    }
}

func (g PermissionGuard) hasPermission(userID, serviceName, methodName string) bool {
    // 查询数据库检查用户权限
    // ...
    return true
}
```


## 多个拦截器

可以为服务注册多个拦截器，它们将按注册顺序依次执行：

```go
func init() {
    fun.BindService(
        UserService{}, 
        AuthGuard{},       // 首先执行身份验证
        PermissionGuard{}, // 然后执行权限检查
        LoggingGuard{},    // 最后执行日志记录
    )
}
```


## 错误处理

在拦截器中，可以通过 `panic` 抛出错误来阻止服务方法的执行：

```go
func (g AuthGuard) Guard(ctx fun.Ctx) {
    if !g.isAuthenticated(ctx.State["token"]) {
        // 抛出错误，阻止方法执行
        panic(fun.Error(401, "Authentication failed"))
    }
    
    if !g.isAuthorized(ctx.ServiceName, ctx.MethodName) {
        // 抛出错误，阻止方法执行
        panic(fun.Error(403, "Access denied"))
    }
}
```


## 最佳实践

1. **单一职责**：每个拦截器应该只负责一个特定的功能，如身份验证、权限检查等
2. **轻量级**：拦截器应该尽可能轻量，避免执行耗时操作
3. **错误处理**：在拦截器中使用 `panic(fun.Error())` 来抛出适当的错误
4. **依赖注入**：合理使用依赖注入来获取所需的资源和服务
5. **顺序考虑**：注意多个拦截器的执行顺序，确保逻辑正确性
6. **日志记录**：在拦截器中添加适当的日志记录，便于调试和监控

通过合理使用拦截器，可以将通用的验证和处理逻辑从服务方法中分离出来，使代码更加清晰和可维护。
