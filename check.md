# Fun 框架参数验证文档

## 概述

Fun 框架使用 [github.com/go-playground/validator/v10](https://github.com/go-playground/validator) 作为底层验证库，提供强大的结构体和字段验证功能。通过在 DTO 结构体字段上添加验证标签，可以自动对客户端传入的参数进行验证。

## 验证库基础

Fun 框架集成了 `validator/v10` 库，该库提供了丰富的验证标签和自定义验证功能。所有验证规则都通过结构体标签定义，框架会在处理请求时自动执行验证。

## 字段非空规则

### 基本原则

Fun 框架有一个重要的设计原则：**结构体中的非指针类型字段在请求中必须提供有效值，不能为空**。

这意味着：

1. 如果您定义了一个字符串类型的字段（如 `User string`），客户端在请求中必须提供该字段的值
2. 如果您定义了一个整数类型的字段（如 `Age int`），客户端也必须提供该字段的值
3. 只有指针类型的字段（如 `Name *string`）才允许为空或不提供

### 示例说明

```go
type UserDto struct {
    // 必须提供，不能为空（框架自动验证）
    Username string
    Age      int
    
    // 可选字段，可以为空或不提供
    Nickname *string
    Height   *int
}
```


## 内置验证标签

### 常用验证标签

| 标签 | 描述 | 示例 |
|------|------|------|
| `min` | 最小值/长度 | `validate:"min=1"` |
| `max` | 最大值/长度 | `validate:"max=100"` |
| `len` | 固定长度 | `validate:"len=10"` |
| `email` | 邮箱格式 | `validate:"email"` |
| `url` | URL 格式 | `validate:"url"` |
| `uuid` | UUID 格式 | `validate:"uuid"` |
| `alphanum` | 字母数字 | `validate:"alphanum"` |
| `oneof` | 枚举值 | `validate:"oneof=admin user guest"` |

### 数值验证标签

| 标签 | 描述 | 示例 |
|------|------|------|
| `gt` | 大于 | `validate:"gt=0"` |
| `gte` | 大于等于 | `validate:"gte=0"` |
| `lt` | 小于 | `validate:"lt=100"` |
| `lte` | 小于等于 | `validate:"lte=100"` |

### 字符串验证标签

| 标签 | 描述 | 示例 |
|------|------|------|
| `startswith` | 以指定字符串开头 | `validate:"startswith=abc"` |
| `endswith` | 以指定字符串结尾 | `validate:"endswith=xyz"` |
| `contains` | 包含指定字符串 | `validate:"contains=test"` |
| `excludes` | 不包含指定字符串 | `validate:"excludes=admin"` |

## 使用示例

### 定义 DTO 结构体

```go
type CreateUserDto struct {
    // 必填字段（非指针类型）
    Username string `validate:"min=3,max=20,alphanum"`
    Password string `validate:"min=8,max=50"`
    Email    string `validate:"email"`
    Age      int    `validate:"gte=0,lte=150"`
    
    // 可选字段（指针类型）
    Nickname *string `validate:"max=50"`
    Website  *string `validate:"url"`
}

type UpdateUserDto struct {
    ID       int64   `validate:"gt=0"`
    Username *string `validate:"min=3,max=20,alphanum"`
    Age      *int    `validate:"gte=0,lte=150"`
}
```


### 在服务方法中使用

```go
type UserService struct {
    fun.Ctx
}

func (ctx UserService) CreateUser(dto CreateUserDto) *User {
    // 框架会自动验证 DTO 参数
    // 非指针字段必须提供，指针字段可选
    
    user := &User{
        Username: dto.Username,
        Password: dto.Password,
        Email:    dto.Email,
        Age:      dto.Age,
    }
    
    if dto.Nickname != nil {
        user.Nickname = *dto.Nickname
    }
    
    if dto.Website != nil {
        user.Website = *dto.Website
    }
    
    // 保存用户逻辑
    // ...
    
    return user
}

func (ctx UserService) UpdateUser(dto UpdateUserDto) *Result {
    // 更新用户逻辑
    // ...
    
    return &Result{Success: true}
}
```


## 条件验证标签

### 字段间关系验证

```go
type PasswordChangeDto struct {
    OldPassword string `validate:"min=8"`
    NewPassword string `validate:"min=8"`
    // 确认密码必须与新密码相同
    ConfirmPassword string `validate:"eqfield=NewPassword"`
}
```


### 条件验证

```go
type UserDto struct {
    Type     string `validate:"oneof=admin user guest"`
    Username string `validate:"required"`
    // 当 Type 为 admin 时，Department 为必填
    Department *string `validate:"required_if=Type admin"`
}
```


## 自定义验证规则

### 注册自定义验证器

```go
// 自定义验证函数
func validateUsername(fl validator.FieldLevel) bool {
    username := fl.Field().String()
    // 用户名只能包含字母、数字和下划线，且长度为3-20个字符
    matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]{3,20}$`, username)
    return matched
}

func init() {
    // 注册自定义验证标签
    fun.BindValidate("username", validateUsername)
}
```


### 使用自定义验证器

```go
type RegisterDto struct {
    Username string `validate:"username"`
    Password string `validate:"min=8,max=50"`
    Email    string `validate:"email"`
}
```


## 验证错误处理

### 验证错误响应

当参数验证失败时，Fun 框架会自动返回格式化的错误信息：

```json
{
  "status": 3,
  "code": 400,
  "msg": "Key: 'CreateUserDto.Username' Error:Field validation for 'Username' failed on the 'min' tag",
  "data": null,
  "id": "request-id"
}
```

## 最佳实践

### 1. 合理使用指针类型

```go
type ProductDto struct {
    // 必填字段使用非指针类型
    Name        string  `validate:"min=1,max=100"`
    Price       float64 `validate:"gt=0"`
    CategoryID  int64   `validate:"gt=0"`
    
    // 可选字段使用指针类型
    Description *string  `validate:"max=1000"`
    Tags        *[]string `validate:"max=10"`
}
```


### 2. 组合验证

```go
type Address struct {
    Street  string `validate:"min=1"`
    City    string `validate:"min=1"`
    ZipCode string `validate:"len=5"`
}

type UserDto struct {
    Name    string  `validate:"min=1"`
    Email   string  `validate:"email"`
    Address Address `validate:"required"`
}
```


### 3. 复杂验证场景

```go
type RegisterDto struct {
    Username string `validate:"min=5,max=20,alphanum"`
    Password string `validate:"min=8,max=50"`
    Email    string `validate:"email"`
    // 验证码，可选但在某些情况下必填
    Code *string `validate:"len=6"`
}
```


通过合理使用 Fun 框架基于 `validator/v10` 的参数验证功能，可以有效保证接口数据的安全性和有效性，减少业务逻辑中的数据校验代码，提高开发效率。框架通过指针类型自动判断字段是否必填，同时支持丰富的内置验证标签和自定义验证规则。
