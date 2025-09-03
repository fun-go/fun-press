# Fun 框架代码生成文档

## 概述

Fun 框架提供自动代码生成功能，可以为服务端 Go 代码生成对应的 TypeScript 客户端代码。通过 [fun.Gen()] 函数，框架会分析服务定义并生成类型安全的客户端 SDK。

## 代码生成机制

### 自动生成流程

1. 框架扫描所有通过 [fun.BindService()] 绑定的服务
2. 分析每个服务的方法签名和参数类型
3. 生成对应的 TypeScript 客户端代码
4. 输出到 `../gen/` 目录中

### 启动生成

```go
func main() {
    fun.Gen()      // 生成客户端代码
    fun.Start(3000) // 启动服务
}
```


## 生成的代码结构

### 目录结构

生成的 TypeScript 代码遵循以下目录结构：

```
gen/
└── ts  
    ├── fun.ts                 # 客户端主入口文件
    ├── service/               # 服务定义文件
    │   └── userService.ts     # 用户服务客户端
    └── dto/                   # 数据传输对象
        └── userDto.ts         # 用户相关 DTO
```


### 客户端使用示例

```typescript
import fun from "./service/fun";

// 创建客户端连接
const client = fun.create("ws://localhost:3000");

// 调用服务方法
const result = await client.userService.helloWord({user: "test"});
```


## 服务生成规则

### 方法签名映射

Fun 框架会根据 Go 服务方法的签名生成对应的 TypeScript 方法。需要注意的是，DTO 参数必须是结构体类型：

```go
// Go 服务定义 (正确示例)
func (ctx UserService) GetUser(dto GetUserDto) *User {
    // ...
}

type GetUserDto struct {
    ID int64 
}
```


生成的 TypeScript 代码：

```typescript
// TypeScript 客户端方法
getUser(dto: getUserDto): result<User | null>
```


### 错误示例

```go
// 错误：直接使用基本类型作为参数
func (ctx UserService) GetUser(id int64) *User {
    // 这种方式不会正确生成 TypeScript 代码
}
```

## 枚举（Enum）

Fun 框架支持生成 TypeScript 枚举类型。要使用此功能，需要定义 `uint8` 类型并实现 `enum` 或 `displayEnum` 接口：

#### 基础枚举

```go
// 实现 enum 接口
type Status uint8

func (s Status) Names() []string {
    return []string{
        "Active",
        "Inactive",
    }
}
```

#### 显示枚举

```go
// 实现 displayEnum 接口
type UserStatus uint8

func (s UserStatus) Names() []string {
    return []string{
        "Active",
        "Inactive",
        "Pending",
    }
}

func (s UserStatus) DisplayNames() []string {
    return []string{
        "已激活",
        "未激活",
        "待审核",
    }
}
```

生成的 TypeScript 代码：

```typescript
enum userStatus {
  Active,
  Inactive,
  Pending,
}

export function userStatusDisplayName(value:userStatus): string {
  switch (value) {
    case userStatus.Active:
      return '已激活';
    case userStatus.Inactive:
      return '未激活';
    case userStatus.Pending:
      return '待审核';
    default:
      return '未知';
  }
}

export default userStatus
```


### DTO 类型映射

框架会自动将 Go 结构体映射为 TypeScript 接口：

```go
// Go DTO 定义
type CreateUserDto struct {
    Username string  `validate:"min=3,max=20"`
    Age      int     `validate:"gte=0,lte=150"`
    Nickname *string `validate:"max=50"`
}
```


生成的 TypeScript 代码：

```typescript
// TypeScript DTO 接口
interface createUserDto {
    username: string;
    age: number;
    nickname?: string | null;
}
```


## 特殊类型处理

### 指针类型映射

Go 中的指针类型会映射为 TypeScript 中的可选属性：

```go
// Go 结构体
type User struct {
    Name     string  // 必填字段
    Nickname *string // 可选字段
}
```


生成的 TypeScript 代码：

```typescript
// TypeScript 接口
interface user {
    name: string;
    nickname?: string | null;
}
```


### 代理方法处理

对于支持推送更新的代理方法，会生成特殊的回调处理：

```go
// Go 代理方法
func (ctx UserService) WatchUser(dto WatchUserDto, proxy fun.ProxyClose) *User {
    // ...
}

type WatchUserDto struct {
    ID int64 
}
```


生成的 TypeScript 代码：

```typescript
// TypeScript 代理方法
watchUser(dto: watchUserDto, on: on<User | null>): Promise<() => void>
```


## 使用示例

### 基本服务调用

```typescript
import fun from "./service/fun";

const client = fun.create("ws://localhost:3000");

// 调用普通方法
const result = await client.userService.getUser({id: 123});
if (result.status === resultStatus.success) {
    console.log(result.data);
}
```


### 代理方法调用

```typescript
import { on } from "./service/fun";

// 创建代理对象
const proxy = new on<User | null>();

proxy.onMessage = (data) => {
    console.log("收到推送数据:", data);
};

proxy.onClose = () => {
    console.log("连接已关闭");
};

// 调用代理方法 请求返回值可关闭监听
let close = await client.userService.watchUser({id: 123}, proxy);

//关闭监听
close();
```


### 错误处理

```typescript
import { resultStatus } from "./service/fun";

const result = await client.userService.createUser({
    username: "testuser",
    age: 25
});

switch (result.status) {
    case resultStatus.success:
        console.log("创建成功:", result.data);
        break;
    case resultStatus.error:
        console.error("业务错误:", result.msg);
        break;
    case resultStatus.callError:
        console.error("调用错误:", result.msg);
        break;
    case resultStatus.networkError:
        console.error("网络错误");
        break;
}
```

### 添加拦截器

可以在客户端添加请求和响应拦截器：

```typescript
import fun,{ result, resultStatus } from "./service/fun";

const client = fun.create("ws://localhost:3000");

// 请求前拦截器
client.onFormer((serviceName, methodName, state) => {
    state.set("token", localStorage.getItem("token") || "");
});

// 响应后拦截器
client.onAfter((serviceName, methodName, result) => {
    if (result.status == resultStatus.networkError) {
        console.error('网络异常');
    } else if (result.status == resultStatus.callError) {
        console.error('调用错误:' + result.msg);
    }
    return result;
});
```


## 最佳实践

### 1. 保持服务结构清晰

```go
// 推荐：每个服务专注于特定领域
type UserService struct {
    fun.Ctx
}

type OrderService struct {
    fun.Ctx
}
```


### 2. 合理设计 DTO

```go
// 推荐：为不同场景创建不同的 DTO
type CreateUserRequest struct {
    Username string 
    Email    string `validate:"email"`
}

type UpdateUserRequest struct {
    ID       int64  
    Username *string 
    Email    *string `validate:"email"`
}
```


### 3. 使用代理方法处理实时更新

```go
// 适用于需要实时推送的场景
func (ctx NotificationService) WatchNotifications(dto WatchNotificationsDto, proxy fun.ProxyClose) []*Notification {
    // 实现实时推送逻辑
    go func() {
        for {
            // 模拟推送新通知
            notification := getNewNotification(dto.UserId)
            if notification != nil {
                ctx.Push(ctx.Id, ctx.RequestId, notification)
            }
            time.Sleep(5 * time.Second)
        }
    }()
    
    // 返回初始数据
    return getUserNotifications(dto.UserId)
}

type WatchNotificationsDto struct {
    UserId int64 
}
```


通过 Fun 框架的代码生成功能，开发者可以自动生成类型安全的客户端 SDK，大大提高前后端协作效率，减少手动编写客户端代码的工作量。注意所有 DTO 参数都必须是结构体类型，这是框架的要求。
