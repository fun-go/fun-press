# 日志

## 概述

Fun 框架提供了内置的日志系统，支持终端输出和文件记录两种模式。日志系统具有多级别日志记录、自动轮转、过期日志清理等功能。

## 日志级别

Fun 框架支持以下日志级别，按严重程度从低到高排列：

1. **Trace** - 最详细的调试信息
2. **Debug** - 调试信息
3. **Info** - 一般信息
4. **Warn** - 警告信息
5. **Error** - 错误信息
6. **Panic** - 严重错误信息

## 日志配置

### Logger 结构体

通过配置 [Logger] 结构体来设置日志系统的行为：

```go
type Logger struct {
    Level          uint8  // 日志级别
    Mode           uint8  // 日志模式（终端或文件）
    MaxSizeFile    uint8  // 单个日志文件最大大小(MB)
    MaxNumberFiles uint8  // 最大日志文件数量
    ExpireLogsDays uint8  // 日志文件保留天数
}
```


### 配置示例

```go
// 配置终端日志
logger := &fun.Logger{
    Level: fun.InfoLevel,
    Mode:  fun.TerminalMode,
}

// 配置文件日志
fileLogger := &fun.Logger{
    Level:          fun.DebugLevel,
    Mode:           fun.FileMode,
    MaxSizeFile:    100,  // 100MB
    MaxNumberFiles: 10,   // 最多10个文件
    ExpireLogsDays: 7,    // 保留7天
}

fun.ConfigLogger(fileLogger)
```


## 日志记录方法

### 基本日志方法

Fun 框架提供了针对不同日志级别的记录方法：

```go
// Trace 级别日志
fun.TraceLogger("这是 trace 级别日志")

// Debug 级别日志
fun.DebugLogger("这是 debug 级别日志")

// Info 级别日志
fun.InfoLogger("这是 info 级别日志")

// Warn 级别日志
fun.WarnLogger("这是 warn 级别日志")

// Error 级别日志
fun.ErrorLogger("这是 error 级别日志")

// Panic 级别日志
fun.PanicLogger("这是 panic 级别日志")
```


### 多参数日志记录

日志方法支持多个参数：

```go
user := User{Name: "张三", Age: 25}
fun.InfoLogger("用户信息:", user, "登录成功")

// 记录错误信息和错误码
fun.ErrorLogger("数据库连接失败", "错误码:", 500)
```


## 文件日志特性

### 日志文件结构

当使用文件模式时，日志文件按日期组织：

```
log/
├── 2023-12-01/
│   ├── 2023-12-01.log.1
│   └── 2023-12-01.log.2
├── 2023-12-02/
│   └── 2023-12-02.log.1
└── 2023-12-03/
    └── 2023-12-03.log.1
```


### 自动轮转

日志系统支持自动轮转功能：

1. **按大小轮转**：当日志文件达到设定大小时自动创建新文件
2. **按日期轮转**：每天创建新的日志目录和文件

### 过期日志清理

系统会自动清理过期的日志文件：

```go
// 配置保留7天的日志
logger := &fun.Logger{
    ExpireLogsDays: 7,
    // 其他配置...
}
```


## 最佳实践

### 1. 合理设置日志级别

```go
// 开发环境使用 Debug 级别
if isDevelopment {
    logger.Level = fun.DebugLevel
} else {
    // 生产环境使用 Info 级别
    logger.Level = fun.InfoLevel
}
```


### 2. 结构化日志记录

```go
// 记录结构化信息
fun.InfoLogger("用户登录", map[string]interface{}{
    "userId":   12345,
    "username": "john_doe",
    "ip":       "192.168.1.100",
})

// 记录方法执行时间
startTime := time.Now()
// 执行业务逻辑
fun.InfoLogger("方法执行完成", "耗时:", time.Since(startTime))
```


### 3. 错误日志记录

```go
func processUserRequest(userId int) {
    user, err := getUserById(userId)
    if err != nil {
        fun.ErrorLogger("获取用户信息失败", "userId:", userId, "error:", err)
        return
    }
    
    // 处理用户信息
    fun.DebugLogger("成功获取用户信息", user)
}
```


### 4. 配置文件日志

```go
func init() {
    // 配置文件日志
    fileLogger := &fun.Logger{
        Level:          fun.DebugLevel,
        Mode:           fun.FileMode,
        MaxSizeFile:    50,   // 50MB
        MaxNumberFiles: 5,    // 最多5个文件
        ExpireLogsDays: 30,   // 保留30天
    }
    
    fun.ConfigLogger(fileLogger)
}
```


## 注意事项

1. **自动清理**：过期日志会自动清理，无需手动处理
2. **日志格式**：日志格式统一，包含时间戳、日志级别和调用方法信息

通过合理使用 Fun 框架的日志系统，可以有效监控应用运行状态，快速定位问题，提高系统可维护性。
