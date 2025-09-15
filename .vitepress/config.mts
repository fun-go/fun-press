import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "fun",
  description: "fun是一个现代化Web实时应用框架，专为构建高并发低延迟的后端服务而设计。提供简洁强大的工具集，支持快速开发聊天应用、实时游戏等场景，内置依赖注入和代码自动生成功能，提升开发效率，简化复杂业务逻辑实现。适用于需要实时通信的各种应用场景，包括在线教育、远程办公、社交娱乐等，帮助开快速构建稳定可靠的后端应用。" ,
  head: [
    ['link', { rel: 'icon', href: 'https://minio.cyi.cc/ssl/system/image/favicon.ico' }],
    ['meta', { name: 'keywords', content: 'fun,fun框架, Go语言WebSocket框架, WebSocket服务, 实时通信框架, Go后端框架, 微服务框架, WebSocket通信, Gorilla WebSocket, 依赖注入, 结构体验证, 服务治理, 实时推送, RPC框架, Go Web框架' }]
  ],
  sitemap: {
    hostname: 'https://fungo.ink'
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/fun' },
      { text: 'QQ群' ,link:"https://qm.qq.com/q/UqAiwtrisW"}
    ],
    logo: 'https://minio.cyi.cc/fun/image/icon.png',
    sidebar: [
      {
        text: '',
        items: [
          { text: '什么是fun?', link: '/fun' },
          { text: '快速入门', link: '/quick-start' },
          { text: '服务', link: '/service' },
          { text: '拦截器', link: '/guard' },
          { text: '依赖注入', link: '/dependency-injection' },
          { text: '单元测试' , link: '/test' },
          { text: '日志系统', link: '/log'},
          { text: '参数验证' , link: '/check'},
          { text: '线程' , link: '/future'},
          { text: '代码生成', link: '/gen' },
          { text: '错误处理', link: '/error' },
        ]
      }
    ],
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/fun-go/fun' }
    ]
  }
})
