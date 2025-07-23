# 依赖注入

## 概述

Fun 框架提供了一个内置的依赖注入系统，允许您在服务和守卫中自动注入依赖项。依赖注入使得组件之间的耦合度降低，提高了代码的可测试性和可维护性。

## 基本用法

### 服务中的依赖注入

在服务结构体中，通过 `fun:"auto"` 标签启用自动依赖注入。注意，第一层依赖（直接依赖）不需要 `fun:"auto"` 标签，只有第二层及更深的依赖才需要：

```go
type Database struct {
    Host string
    Port int
}

type UserService struct {
    Ctx fun.Ctx        // 第一层依赖，不需要 fun:"auto" 标签
    DB  *Database      // 第一层依赖，不需要 fun:"auto" 标签
}

func (s *UserService) GetUser(id string) *User {
    // 可以直接使用注入的 DB 实例
    fmt.Printf("Connecting to database at %s:%d\n", s.DB.Host, s.DB.Port)
    return &User{Id: id, Name: "John Doe"}
}
```


### 深层依赖注入

当需要注入第二层及更深的依赖时，需要使用 `fun:"auto"` 标签：

```go
type Config struct {
    DatabaseURL string
    APIKey      string
}

func (c *Config) New() {
    // 初始化配置
    c.DatabaseURL = "localhost:5432"
    c.APIKey = "your-api-key"
}

type Database struct {
    Config *Config `fun:"auto"` // 第二层依赖，需要 fun:"auto" 标签
}

func (db *Database) New() {
    // 使用注入的配置进行初始化
    fmt.Printf("Connecting to database: %s\n", db.Config.DatabaseURL)
}
```


## 守卫中的依赖注入

守卫也支持依赖注入，与服务类似，第一层依赖不需要 `fun:"auto"` 标签：

```go
type AuthService struct {
    SecretKey string
}

func (a *AuthService) New() {
    a.SecretKey = "my-secret-key"
}

type AuthGuard struct {
    Auth *AuthService // 第一层依赖，不需要 fun:"auto" 标签
}

func (g *AuthGuard) Guard(serviceName string, methodName string, state map[string]string) *fun.Result[any] {
    token := state["token"]
    if token != g.Auth.SecretKey {
        return &fun.Result[any]{
            Msg:    &"Unauthorized",
            Status: fun.ErrorCode,
        }
    }
    return nil // 验证通过
}
```


对于深层依赖，需要使用 `fun:"auto"` 标签：

```go
type Logger struct {
    Level string
}

type AuthService struct {
    SecretKey string
    Log       *Logger `fun:"auto"` // 第二层依赖，需要 fun:"auto" 标签
}

func (a *AuthService) New() {
    a.SecretKey = "my-secret-key"
    fmt.Println("Auth service initialized with log level:", a.Log.Level)
}
```
## 依赖注入规则

1. 服务结构体的第一个字段必须是 `Ctx fun.Ctx`，不需要 `fun:"auto"` 标签
2. 守卫结构体不需要特殊的第一个字段
3. 第一层依赖（直接依赖）不需要 `fun:"auto"` 标签
4. 第二层及更深的依赖需要使用 `fun:"auto"` 标签
5. 需要依赖注入的字段必须是导出的（首字母大写）
6. 需要依赖注入的字段必须是指针类型
7. 依赖注入的结构体必须是具体的结构体类型，不能是指针
8. 结构体可以定义 `New` 方法进行初始化

## 最佳实践

1. 保持依赖关系简单，避免复杂的依赖关系图
2. 使用 `New` 方法进行依赖项的初始化
3. 避免创建循环依赖
4. 合理使用依赖注入，仅注入真正需要的依赖项

## 注意事项

1. 依赖注入发生在服务注册时，而不是每次请求时
2. 带有 `fun:"auto"` 标签的字段会被自动初始化并注入
3. 每个类型的实例在同一个服务中是单例的
4. `New` 方法是可选的，但如果存在则会在依赖注入完成后自动调用