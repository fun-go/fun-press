---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "fun"
  tagline: fun 是一个现代化的实时应用框架，专为构建基于Web的后端服务而设计。它提供了一套简洁而强大的工具，帮助开发者快速构建具有实时通信功能的应用程序。
  actions:
    - theme: brand
      text: 什么是fun?
      link: /fun
    - theme: alt
      text: 快速开始
      link: /quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/fun-go/fun



features:
- title: 实时通信
  details: 基于 WebSocket 协议实现全双工通信，支持服务器主动推送数据到客户端，实现真正的实时交互体验
- title: 依赖注入
  details: 内置自动化依赖注入系统，通过 fun:"auto" 标签自动处理组件依赖关系，降低耦合度提高可测试性
- title: 类型安全
  details: 利用 Go 语言强类型特性和反射机制，在编译时捕获类型错误，确保前后端数据传输一致性
- title: 代码生成
  details: 一键生成 TypeScript 客户端 SDK，自动处理数据序列化和接口调用，提升开发效率
- title: 拦截器机制
  details: 提供 Guard 拦截器功能，支持在方法执行前后插入通用逻辑，如权限验证、日志记录等
- title: 自动验证
  details: 集成 validator/v10 验证库，支持丰富的字段验证规则，自动处理参数校验
---
