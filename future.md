# 线程

## 概述

`Future[T]` 和 `FutureVoid` 是框架提供的异步编程工具，用于简化并发任务处理。它们自动管理 goroutine 并提供线程安全保障，开发者可以安全地在多线程环境中使用。

## Future[T] 使用

### 创建 Future

```go
func NewFuture[T any](callback func() T) *Future[T]
```

创建一个异步任务，callback 函数将在独立 goroutine 中执行。

### 获取结果

```go
func (f *Future[T]) Join() (T, error)
```

阻塞等待异步任务完成并获取结果。线程安全，可多次调用。

### 链式处理

```go
func (f *Future[T]) Then(callback func(T, error))
```

任务完成后执行回调函数，回调在新 goroutine 中执行。

### 批量等待

```go
func AllFuture[T any](futures ...*Future[T]) []FutureAllType[T]
```

等待多个 Future 完成并获取所有结果。

## FutureVoid 使用

### 创建 FutureVoid

```go
func NewFutureVoid(callback func()) *FutureVoid
```

创建一个无返回值的异步任务，callback 函数将在独立 goroutine 中执行。

### 等待完成

```go
func (t *FutureVoid) Join() error
```

阻塞等待任务完成，返回执行过程中可能发生的错误。

### 链式处理

```go
func (t *FutureVoid) Then(callback func(error))
```

任务完成后执行回调函数，回调在新 goroutine 中执行。

### 批量等待

```go
func AllFutureVoid(tasks ...*FutureVoid) []error
```

等待多个无返回值任务完成，返回所有错误信息。

## 推荐使用示例

### Future 使用示例 - 并发 HTTP 请求

```go
// 并发获取多个网页内容
urls := []string{
    "http://example.com",
    "http://google.com",
    "http://github.com",
}

var futures []*Future[string]
for _, url := range urls {
    url := url // 闭包变量注意
    future := NewFuture(func() string {
        resp, err := http.Get(url)
        if err != nil {
            panic(err.Error()) // 框架会接管这个错误
        }
        defer resp.Body.Close()
        body, _ := io.ReadAll(resp.Body)
        return string(body)
    })
    futures = append(futures, future)
}

// 等待所有请求完成
results := AllFuture(futures...)
for i, result := range results {
    if result.Error != nil {
        fmt.Printf("请求 %s 失败: %v\n", urls[i], result.Error)
    } else {
        fmt.Printf("请求 %s 成功，内容长度: %d\n", urls[i], len(result.Result))
    }
}
```

### FutureVoid 使用示例 - 并发任务执行

```go
// 并发执行多个无返回值任务
tasks := []string{"task1", "task2", "task3"}

var futures []*FutureVoid
for _, taskName := range tasks {
    taskName := taskName // 闭包变量注意
    future := NewFutureVoid(func() {
        fmt.Printf("开始执行 %s\n", taskName)
        time.Sleep(time.Second) // 模拟任务执行
        fmt.Printf("完成执行 %s\n", taskName)
    })
    futures = append(futures, future)
}

// 等待所有任务完成
errors := AllFutureVoid(futures...)
for i, err := range errors {
    if err != nil {
        fmt.Printf("任务 %s 执行失败: %v\n", tasks[i], err)
    } else {
        fmt.Printf("任务 %s 执行成功\n", tasks[i])
    }
}
```

## 最佳实践

1. **使用 panic 简化错误处理**：在 `NewFuture` 和 `NewFutureVoid` 回调中可以直接使用 panic，框架会自动处理
2. **批量操作使用 AllFuture/AllFutureVoid**：当需要等待多个任务完成时，使用批量等待函数更高效
3. **及时处理结果**：创建的 Future/FutureVoid 应及时调用 `Join()` 或使用批量函数处理结果
4. **合理选择类型**：有返回值的任务使用 `Future[T]`，无返回值的任务使用 `FutureVoid`