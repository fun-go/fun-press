# 错误处理

## 概述

Fun 框架提供了多种错误处理机制，允许开发者在服务方法中处理和返回错误。框架会自动捕获错误并将其转换为标准的响应格式发送给客户端。

## 错误类型

Fun 框架定义了以下几种错误状态：

1. **successCode (0)** - 成功状态
2. **cellErrorCode (1)** - 服务内部错误
3. **errorCode (2)** - 业务逻辑错误
4. **closeErrorCode (3)** - 连接关闭错误

## 错误处理方法

### 1. 使用 panic 抛出错误

最简单的错误处理方式是在服务方法中使用 panic：

```go
type UserService struct {
    Ctx fun.Ctx
}

func (s *UserService) GetUser(dto UserDto) *User {
    if id == "" {
        panic("用户ID不能为空")
    }
    
    user := findUserById(id)
    if user == nil {
        panic("用户不存在")
    }
    
    return user
}
```





### 2. 使用 Error 函数

使用 [fun.Error] 函数返回带有错误码的错误：

```go
func (s *UserService) UpdateUser(dto UpdateUserDto) *User {
    if dto.Id == "" {
        panic(fun.Error(1001, "用户ID不能为空"))
    }
    
    user := findUserById(dto.Id)
    if user == nil {
        panic(fun.Error(1002, "用户不存在"))
    }
    
    // 更新用户逻辑
    user.Name = dto.Name
    updateUser(user)
    
    return user
}
```

## 守卫中的错误处理

在守卫中，可以通过返回 [Result] 对象来阻止请求：

```go
type AuthGuard struct{}

func (g *AuthGuard) Guard(serviceName string, methodName string, state map[string]string) *fun.Result[any] {
    token := state["token"]
    if token == "" {
        msg := "未提供访问令牌"
        return &fun.Result[any]{
            Msg:    &msg,
            Status: fun.ErrorCode,
        }
    }
    
    if !isValidToken(token) {
        msg := "无效的访问令牌"
        return &fun.Result[any]{
            Msg:    &msg,
            Status: fun.ErrorCode,
        }
    }
    
    // 验证通过，返回 nil
    return nil
}
```


## 客户端错误处理

在 TypeScript 客户端中，错误会被封装在 [Result] 对象中：

```typescript
    const result = await client.UserService.GetUser({Id:"123"});

if (result.status === 0) {
    // 成功处理
    console.log("用户信息:", result.data);
} else if (result.status === 1 || result.status === 2) {
    // 错误处理
    console.error("错误:", result.msg);
    if (result.code) {
        console.error("错误码:", result.code);
    }
}
```



## 错误处理最佳实践

### 1. 明确错误类型

```go
func (s *UserService) ProcessUser(dto UserDto) *User {
    // 参数验证错误 - 使用 callError
    if dto.Name == "" {
        panic(fun.Error(2000,"用户名不能为空"))
    }
    
    // 业务逻辑错误 - 使用 Error 并指定错误码
    if !isValidEmail(dto.Email) {
        panic(fun.Error(2001, "邮箱格式不正确"))
    }
    
    // 系统错误 - 直接 panic 字符串
    user, err := database.CreateUser(dto)
    if err != nil {
        panic(fmt.Sprintf("创建用户失败: %v", err))
    }
    
    return user
}
```

### 3. 错误日志记录

```go
import (
    "log"
)

func (s *UserService) CreateUser(dto CreateUserDto) *User {
    user := &User{Name: dto.Name, Email: dto.Email}
    
    if err := saveUser(user); err != nil {
        // 记录错误日志
        log.Printf("创建用户失败: %v, 用户数据: %+v", err, dto)
        panic(fun.CallError("创建用户失败"))
    }
    
    log.Printf("用户创建成功: %s", user.Id)
    return user
}
```


## 错误响应格式

Fun 框架返回的错误响应具有以下格式：

```json
{
    "id": "请求ID",
    "code": 1001,
    "msg": "错误信息",
    "status": 2
}
```


字段说明：
- `id`: 请求ID，用于追踪请求
- `code`: 错误码（仅在使用 [fun.Error] 时存在）
- `msg`: 错误信息
- `status`: 错误状态码（0=成功, 1=内部错误, 2=业务错误, 3=连接关闭）

## 注意事项

1. panic 会导致当前请求处理中断，但不会影响服务器运行
2. 守卫中返回非 nil 的 [Result] 对象会阻止请求继续执行
3. 客户端应始终检查响应状态码以正确处理错误
4. 建议为不同类型的错误定义明确的错误码
5. 敏感信息不应包含在错误消息中