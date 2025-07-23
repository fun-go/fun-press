# 代码生成

## 概述

Fun 框架提供自动代码生成功能，可以为前端生成 TypeScript 客户端代码。这些生成的代码包括服务接口、数据传输对象(DTO)和客户端库，使前端开发人员能够轻松地与后端服务进行交互。

## 启用代码生成

要启用代码生成，只需在应用程序启动前调用 [fun.Gen()](file://F:\fun\fun.go#L57-L59) 函数：

```go
func main() {
    // 生成 TypeScript 客户端代码
    fun.Gen()
    
    // 启动服务器
    fun.Start()
}
```


代码将默认生成到项目根目录下的 `dist/` 文件夹中。

## 生成的文件结构

代码生成后，将在 `dist/` 目录中创建以下文件：

```
dist/
├── fun.ts                 // 主客户端库文件
├── UserService.ts         // UserService 的客户端接口
├── OrderService.ts        // OrderService 的客户端接口
├── UserDto.ts             // UserDto 数据传输对象
└── OrderDto.ts            // OrderDto 数据传输对象
```


## 服务接口生成

对于每个注册的服务，Fun 框架会生成对应的 TypeScript 客户端接口。例如，给定以下 Go 服务：

```go
type UserService struct {
    Ctx fun.Ctx
}

type CreateUserDto struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

func (s *UserService) CreateUser(dto CreateUserDto) *User {
    // 实现逻辑
    return &User{Id: "1", Name: dto.Name, Email: dto.Email}
}

func (s *UserService) GetUser(id string) *User {
    // 实现逻辑
    return &User{Id: id, Name: "John Doe", Email: "john@example.com"}
}

func (s *UserService) WatchUserUpdates(close fun.ProxyClose) string {
    // 实现实时监听逻辑
    return "Started watching"
}
```


将生成对应的 TypeScript 服务接口：

```typescript
// UserService.ts
import {result,on} from "fun-client";
import {defaultApi} from "./fun"
export default class UserService {
  private client: defaultApi;
  constructor(client: defaultApi) {
    this.client = client;
  }
  
  async CreateUser(dto:CreateUserDto): Promise<result<User>> {
    return await this.client.request<User>("UserService", "CreateUser",dto,null)
  }
  
  async WatchUserUpdates(on:on<string>): Promise<() => void> {
    return await this.client.request<string>("UserService", "WatchUserUpdates",null,on)
  }
}
```


## DTO 生成

数据传输对象(DTO)也会自动生成。对于以下 Go DTO：

```go
type CreateUserDto struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}
```


将生成对应的 TypeScript 接口：

```typescript
// CreateUserDto.ts
export default interface CreateUserDto {
  name:string
  email:string
}
```


## 客户端使用

生成的客户端代码可以轻松集成到前端项目中：

```typescript
import fun from './dist/fun';

// 创建客户端实例
const client = fun.create('ws://localhost:3000');

// 使用 DTO
const newUser = await client.UserService.CreateUser({
    name: "John Doe",
    email: "john@example.com"
});

// 实时监听
const stopWatching = await client.UserService.WatchUserUpdates((update) => {
    console.log("Received update:", update);
});

// 停止监听
stopWatching();
```

## 生成规则

1. 每个服务生成一个独立的 TypeScript 类文件
2. 每个 DTO 生成一个独立的 TypeScript 接口文件
3. 方法参数会根据类型生成对应的 TypeScript 类型
4. 实时监听方法(带有 [ProxyClose] 参数)会生成带有 [on] 回调的特殊签名
5. 返回值类型会自动转换为对应的 TypeScript 类型

## 类型映射

Go 类型与 TypeScript 类型的映射关系：

| Go 类型 | TypeScript 类型 |
|---------|----------------|
| string  | string         |
| int/int8/int16/int32/int64 | number |
| uint/uint8/uint16/uint32/uint64 | number |
| bool    | boolean        |
| struct  | 同名接口        |
| slice   | 同类型数组      |
| pointer | 类型 \| null   |

## 最佳实践

1. 在开发过程中定期运行代码生成，以确保客户端代码与服务端保持同步
2. 将生成的代码提交到版本控制系统中，便于团队协作
3. 在构建流程中集成代码生成步骤，确保生成的代码是最新的
4. 避免手动修改生成的代码，因为重新生成时会被覆盖
5. 为 DTO 和服务方法使用清晰、描述性的命名，这将反映在生成的代码中

## 注意事项

1. 代码生成只会在调用 [fun.Gen()] 时执行
2. 生成的代码依赖于 `fun-client` npm 包
3. 确保服务和 DTO 的命名在 TypeScript 中是有效的标识符
4. 嵌套的结构体也会被递归生成
5. 生成的代码会自动处理导入路径和依赖关系