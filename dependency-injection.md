# 依赖注入

## 什么是依赖注入？

依赖注入（Dependency Injection, DI）是 Fun 框架的核心特性之一。它允许框架自动管理和注入服务、拦截器和其他组件所需的依赖项，从而简化组件之间的耦合，提高代码的可测试性和可维护性。

## 依赖注入工作原理

Fun 框架使用反射机制来实现依赖注入。当服务或拦截器被注册时，框架会分析其结构体字段，并自动注入所需的依赖项。依赖项可以是其他服务、配置对象、数据库连接等。

## 定义可注入组件

### 基本组件结构

要创建一个可注入的组件，需要定义一个结构体：

```go
type Database struct {
    Host string
    Port int
}

type Config struct {
    Database *Database
}
```


### 初始化方法

组件可以定义一个 [New] 方法来进行初始化：

```go
type Config struct {
    Page int8
}

func (config *Config) New() {
    config.Page = 5
}
```


当组件被注入时，框架会自动调用 [New] 方法（如果存在）。

## 依赖注入标签

### `fun:"auto"` 标签

通过 `fun:"auto"` 标签，可以指定需要自动注入的字段：

```go
type Config struct {
    Page int8
}

type X struct {
    Name   string
    Config *Config `fun:"auto"`
}

func (config *Config) New() {
    config.Page = 5
}
```


在上面的例子中，`X` 结构体的 [Config] 字段会被自动注入一个 [Config] 实例。

## 服务中的依赖注入

### 服务结构体

服务的第一层字段会自动注入，无需使用 `fun:"auto"` 标签：

```go
type UserService struct {
    fun.Ctx
    Database *Database  // 自动注入
    Config   *Config    // 自动注入
}
```


### 嵌套依赖注入

对于嵌套结构中的字段，需要使用 `fun:"auto"` 标签：

```go
type UserService struct {
    fun.Ctx
    Database *Database
    Config   *Config
    Logger   *Logger `fun:"auto"`  // 嵌套依赖需要标签
}
```


## 拦截器中的依赖注入

### 拦截器结构体

与服务类似，拦截器的第一层字段也会自动注入：

```go
type AuthGuard struct {
    Config *Config  // 自动注入
    Redis  *Redis   // 自动注入
}
```


### 嵌套依赖注入

拦截器中的嵌套依赖同样需要使用 `fun:"auto"` 标签：

```go
type AuthGuard struct {
    Config *Config
    Redis  *Redis
    Logger *Logger `fun:"auto"`  // 嵌套依赖需要标签
}
```


## 全局依赖注入

### Wired 函数

可以使用 [fun.Wired] 函数手动获取已注入的组件实例：

```go
// 获取单例实例
config := fun.Wired[Config]()

// 使用组件
fmt.Println(config.Page)
```


## 实际示例

### 数据库连接示例

```go
type DatabaseConfig struct {
    Host     string
    Port     int
    Username string
    Password string
}

type Database struct {
    Config *DatabaseConfig `fun:"auto"`
    Client *sql.DB
}

func (db *Database) New() {
    // 初始化数据库连接
    connectionString := fmt.Sprintf("%s:%s@tcp(%s:%d)/mydb", 
        db.Config.Username, db.Config.Password, 
        db.Config.Host, db.Config.Port)
    client, err := sql.Open("mysql", connectionString)
    if err != nil {
        panic(err)
    }
    db.Client = client
}

type UserService struct {
    fun.Ctx
    Database *Database  // 自动注入
}

func (s UserService) GetUser(id int) *User {
    // 使用注入的数据库连接
    user := &User{}
    err := s.Database.Client.QueryRow("SELECT * FROM users WHERE id = ?", id).Scan(&user.Id, &user.Name)
    if err != nil {
        panic(fun.Error(500, "Failed to fetch user"))
    }
    return user
}
```


### 配置管理示例

```go
type AppConfig struct {
    DebugMode bool
    PageSize  int
}

func (config *AppConfig) New() {
    config.DebugMode = true
    config.PageSize = 20
}

type Logger struct {
    Config *AppConfig `fun:"auto"`
}

func (logger *Logger) New() {
    if logger.Config.DebugMode {
        fmt.Println("Logger initialized in debug mode")
    }
}

type UserService struct {
    fun.Ctx
    Logger *Logger  // 自动注入
}

func (s UserService) GetUser(id int) *User {
    s.Logger.Info("Fetching user with id:", id)
    // 实现获取用户的逻辑
    return &User{Id: id, Name: "John Doe"}
}
```


## 最佳实践

1. **合理使用自动注入**：服务和拦截器的第一层字段会自动注入，无需添加 `fun:"auto"` 标签
2. **嵌套依赖使用标签**：只有在嵌套结构中才需要使用 `fun:"auto"` 标签
3. **初始化逻辑放在 New 方法中**：组件的初始化逻辑应该放在 [New]方法中
4. **避免循环依赖**：设计组件时要注意避免循环依赖问题
6. **单例模式**：通过依赖注入实现的组件默认是单例的

## 注意事项

1. **结构体必须是导出的**：只有导出的结构体才能被正确注入
2. **字段必须是导出的**：只有导出的字段才能被注入
3. **New 方法必须无参数**：[New]方法不能有参数，且不能有返回值

通过合理使用依赖注入，可以构建松耦合、易测试和易维护的应用程序。
