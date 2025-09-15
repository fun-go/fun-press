
# 错误处理

## 概述

Fun 框架提供了一套完整的错误处理机制，能够处理业务逻辑错误、参数验证错误、网络错误等各种异常情况。框架通过统一的错误响应格式，让客户端能够方便地识别和处理不同类型的错误。

## 错误码定义

Fun 框架定义了以下几种错误类型：

| 错误类型 | 常量名 | 值 | 说明 |
|---------|--------|---|------|
| 成功 | successCode | 0 | 请求处理成功 |
| 调用错误 | cellErrorCode | 1 | 框架内部错误或参数验证错误 |
| 业务错误 | errorCode | 2 | 业务逻辑错误 |
| 连接关闭错误 | closeErrorCode | 3 | 客户端主动关闭连接 |

## 错误响应格式

所有错误响应都遵循统一的格式：

```json
{
  "Id": "请求ID",
  "Code": 400,
  "Data": null,
  "Msg": "错误消息",
  "Status": 3
}
```


各字段说明：
- `Id`: 请求唯一标识符
- `Code`: 错误代码（仅在业务错误时存在）
- `Data`: 返回数据（错误时通常为null）
- `Msg`: 错误消息描述
- `Status`: 错误状态码（对应上面表格中的值）

## 服务端错误处理

### 返回业务错误

在服务方法中，必须通过 panic 抛出错误，不能使用 return：

```go
func (ctx UserService) GetUser(dto GetUserDto) *User {
    // 业务逻辑检查
    if dto.ID <= 0 {
        // 返回业务错误，对应 Status=2
        panic(fun.Error(400, "用户ID无效"))
    }
    
    user, err := findUserByID(dto.ID)
    if err != nil {
        // 返回数据库错误，对应 Status=2
        panic(fun.Error(500, "数据库查询失败"))
    }
    
    if user == nil {
        // 返回找不到用户错误，对应 Status=2
        panic(fun.Error(404, "用户不存在"))
    }
    
    return user
}
```


### 参数验证错误

框架会自动处理参数验证错误（对应 Status=1）：

```go
type CreateUserDto struct {
    Username string `validate:"min=3,max=20"`
    Email    string `validate:"email"`
    Age      int    `validate:"gte=0,lte=150"`
}

func (ctx UserService) CreateUser(dto CreateUserDto) *User {
    // 框架会自动验证 DTO 参数
    // 如果验证失败，会自动返回验证错误信息，对应 Status=1
    
    // 业务逻辑
    user := &User{
        Username: dto.Username,
        Email:    dto.Email,
        Age:      dto.Age,
    }
    
    // 保存用户
    err := saveUser(user)
    if err != nil {
        panic(fun.Error(500, "创建用户失败")) // 对应 Status=2
    }
    
    return user
}
```


## 客户端错误处理

### TypeScript 客户端错误处理

客户端通过检查 `result.status` 来判断请求结果：

```typescript
import { resultStatus, result } from "./service/fun";

const result = await client.userService.getUser({id: 123});

switch (result.status) {
    case resultStatus.success:
        // 处理成功响应 (Status=0)
        console.log("用户信息:", result.data);
        break;
        
    case resultStatus.callError:
        // 处理调用错误（如参数验证失败、服务内部错误等）(Status=1)
        console.error("调用错误:", result.msg);
        break;
        
    case resultStatus.error:
        // 处理业务错误 (Status=2)
        console.error("业务错误:", result.msg);
        // 可以根据错误代码进行不同处理
        if (result.code === 404) {
            console.log("用户未找到");
        } else if (result.code === 403) {
            console.log("权限不足");
        }
        break;
        
    case resultStatus.networkError:
        // 处理网络错误 (Status=3)
        console.error("网络连接错误");
        break;
}
```


## 最佳实践

### 1. 合理使用错误类型

```go
func (ctx OrderService) CreateOrder(dto CreateOrderDto) *Order {
    // 参数验证错误由框架自动处理 (Status=1)
    
    // 业务逻辑错误 (Status=2)
    if !ctx.hasSufficientBalance(dto.UserID, dto.Amount) {
        panic(fun.Error(400, "余额不足"))
    }
    
    // 权限错误 (Status=2)
    if !ctx.hasPermission(dto.UserID, "create_order") {
        panic(fun.Error(403, "权限不足"))
    }
    
    // 创建订单
    order, err := createOrder(dto)
    if err != nil {
        panic(fun.Error(500, "创建订单失败")) // Status=2
    }
    
    return order
}
```


通过合理的错误处理机制，Fun 框架能够帮助开发者构建更加健壮和用户友好的应用程序。需要注意的是，所有错误都必须通过 panic 抛出，不能使用 return 返回错误。
