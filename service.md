# 服务

## 什么是服务？

在 Fun 框架中，服务是业务逻辑的载体。每个服务都是一个 Go 结构体，其中包含一组可以被客户端调用的方法。服务通过 WebSocket 连接与客户端进行通信，支持实时数据传输和推送功能。

## 定义服务

### 基本服务结构

要定义一个服务，需要创建一个 Go 结构体，并将 [fun.Ctx] 作为第一个字段嵌入：

```go
type UserService struct {
    fun.Ctx
    // 其他依赖字段
}
```


### 服务方法

服务方法是定义在服务结构体上的函数，可以被客户端调用。方法有两种类型：

1. **普通方法**：执行后立即返回结果给客户端
2. **代理方法**：支持服务器主动推送更新给客户端

#### 普通方法示例

```go
func (ctx UserService) GetUser(id int64) *User {
    // 业务逻辑
    user := &User{
        Id:   id,
        Name: "John Doe",
    }
    return user
}
```


#### 代理方法示例

```go
func (ctx UserService) WatchUser(proxy fun.ProxyClose) *User {
    // 当需要推送更新时调用 ctx.Push()
    go func() {
        time.Sleep(5 * time.Second)
        updatedUser := &User{
            Id:   ctx.Id,
            Name: "Updated John Doe",
        }
        ctx.Push(ctx.Id, ctx.RequestId, updatedUser)
    }()
    
    // 返回初始数据
    user := &User{
        Id:   ctx.Id,
        Name: "John Doe",
    }
    return user
}
```


### 数据传输对象(DTO)

服务方法可以接收参数，这些参数被称为数据传输对象(DTO)。DTO 必须是结构体类型：

```go
type CreateUserDto struct {
    Name  string `validate:"required,min=1,max=50"`
    Email string `validate:"required,email"`
}

func (ctx UserService) CreateUser(dto CreateUserDto) *User {
    // 业务逻辑
    user := &User{
        Name:  dto.Name,
        Email: dto.Email,
    }
    return user
}
```


## 服务生命周期

### 初始化服务

在服务包的 [init()] 函数中注册服务：

```go
func init() {
    fun.BindService(UserService{})
}
```


### 依赖注入

服务可以依赖其他组件，通过 `fun:"auto"` 标签实现自动注入：

```go
type UserService struct {
    fun.Ctx
    Database *Database `fun:"auto"`
    Config   *Config   `fun:"auto"`
}
```


### 拦截器(Guard)

可以为服务绑定拦截器，在方法执行前进行验证或预处理：

```go
type AuthGuard struct {
    Config *Config `fun:"auto"`
}

func (g AuthGuard) Guard(ctx fun.Ctx) {
    // 实现权限验证逻辑
    // 如果验证失败，可以 panic 或返回错误
}

func init() {
    fun.BindService(UserService{}, AuthGuard{})
}
```


## 使用服务

### 启动服务

在主程序中启动服务：

```go
func main() {
    fun.Gen()      // 生成客户端代码
    fun.Start(3000) // 启动服务在端口 3000
}
```


### 客户端调用

生成的 TypeScript 客户端可以这样使用：

```typescript
import fun from "./service/fun";

const api = fun.create("ws://localhost:3000");

// 调用普通方法
const user = await api.UserService.GetUser({id: 123});

// 调用需要 DTO 的方法
const newUser = await api.UserService.CreateUser({
    name: "Jane Doe",
    email: "jane@example.com"
});

// 调用代理方法
const proxy = new on<User>();
proxy.onMessage = (user: User) => {
    console.log("Received user update:", user);
};
proxy.onClose = () => {
    console.log("Connection closed");
};
await api.UserService.WatchUser(proxy);
```


## 错误处理

在服务方法中，可以通过返回 [fun.Error] 来向客户端发送错误信息：

```go
func (ctx UserService) GetUser(id int64) *User {
    if id <= 0 {
        return fun.Error(400, "Invalid user ID")
    }
    
    // 业务逻辑
    user, err := ctx.Database.FindUser(id)
    if err != nil {
        return fun.Error(500, "Failed to fetch user")
    }
    
    return user
}
```


## 最佳实践

1. **保持服务专注**：每个服务应该专注于特定的业务领域
2. **合理使用依赖注入**：只注入真正需要的依赖
3. **正确处理错误**：使用 [fun.Error] 返回有意义的错误信息
4. **验证输入数据**：使用验证标签确保数据合法性
5. **优雅关闭资源**：在代理方法中正确处理连接关闭

通过遵循这些指南，您可以充分利用 Fun 框架的功能，构建高效、可靠的实时应用。
