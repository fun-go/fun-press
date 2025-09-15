import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Fun Framework",
  description: "Fun 是一个现代化的实时应用框架，专为构建基于 WebSocket 的后端服务而设计。它提供了一套简洁而强大的工具，帮助开发者快速构建具有实时通信功能的应用程序。" ,
  head: [
    ['link', { rel: 'icon', href: 'https://minio.cyi.cc/ssl/system/image/favicon.ico' }],
    ['meta', { name: 'keywords', content: 'Fun框架, Go语言WebSocket框架, WebSocket服务, 实时通信框架, Go后端框架, 微服务框架, WebSocket通信, Gorilla WebSocket, 依赖注入, 结构体验证, 服务治理, 实时推送, RPC框架, Go Web框架' }]
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
