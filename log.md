# 日志系统



### 日志级别

框架定义了6个日志级别，按严重程度从低到高排列：

1. [TraceLevel] - 跟踪级别
2. [DebugLevel] - 调试级别
3. [InfoLevel]  - 信息级别
4. [WarnLevel]  - 警告级别
5. [ErrorLevel] - 错误级别
6. [PanicLevel] - 崩溃级别

### 日志配置

通过[Logger](file:///Volumes/未命名/代码/fun/logger.go#L27-L33)结构体可以配置日志系统的行为：

```go
type Logger struct {
    Level          uint8  // 日志级别
    Mode           uint8  // 输出模式（终端或文件）
    MaxSizeFile    uint8  // 单个日志文件最大大小(MB)
    MaxNumberFiles uint64 // 最大日志文件数量
    ExpireLogsDays uint8  // 日志文件保留天数
}
```


### 使用方法

#### 基本日志输出

框架提供了对应各个级别的日志输出函数：

```go
fun.TraceLogger("这是跟踪日志")
fun.DebugLogger("这是调试日志")
fun.InfoLogger("这是信息日志")
fun.WarnLogger("这是警告日志")
fun.ErrorLogger("这是错误日志")
fun.PanicLogger("这是崩溃日志")
```


#### 配置日志系统

通过`ConfigLogger`函数可以自定义日志配置：

```go
logger := &fun.Logger{
    Level:          fun.InfoLevel,
    Mode:           fun.FileMode,
    MaxSizeFile:    10,   // 10MB
    MaxNumberFiles: 100,  // 最多100个文件
    ExpireLogsDays: 30,   // 保留30天
}
fun.ConfigLogger(logger)
```


### 日志文件管理

当使用文件模式时，日志系统会自动管理日志文件：

1. 按日期分割日志文件（格式：`YYYY-MM-DD.log.N`）
2. 当日志文件超过设定大小时创建新文件
3. 自动清理过期日志文件
4. 限制日志文件总数量

### 日志格式

日志输出格式如下：
```
[时间] [级别] [调用函数] 消息内容
```


例如：
```
[2025-07-31 15:11:54] [INFO   ] [fun.Fun.handleMessage                   ] {"id":"TGmbI_fsDpt7x9qrJEJ94","methodName":"HalloWord","serviceName":"UserService","type":0,"state":{},"dto":{"Name":"World","User":"User"}}
```


### 特性

1. **异步处理**：日志通过goroutine异步处理，不会阻塞主业务逻辑
2. **自动轮转**：支持按大小和时间自动轮转日志文件
3. **自动清理**：定期清理过期日志文件
4. **多模式支持**：支持终端输出和文件输出两种模式
5. **详细定位**：日志中包含详细的函数调用位置信息

### 错误处理

框架在处理panic时会自动记录堆栈信息到日志中，例如：

```
[2025-07-31 15:44:17] [PANIC  ] [fun.BindService.func1                   ] Fun: HalloWord1 Parameter is not struct
goroutine 1 [running, locked to thread]:
fun.BindService.func1()
	/Volumes/未命名/代码/fun/fun.go:200 +0x6b
panic({0x4f4d760?, 0xc000106280?})
	/usr/local/opt/go/libexec/src/runtime/panic.go:785 +0x132
...
```


这套日志系统为开发者提供了全面的日志记录和管理能力，有助于问题排查和系统监控。
