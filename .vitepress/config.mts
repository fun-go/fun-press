import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Fun Framework",
  description: "Fun 是一个现代化的实时应用框架，专为构建基于 WebSocket 的后端服务而设计。它提供了一套简洁而强大的工具，帮助开发者快速构建具有实时通信功能的应用程序。" ,
  head: [
    ['link', { rel: 'icon', href: 'https://fun.assets.cyi.cc/logo.png' }]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/fun' },
      { text: 'QQ群' ,link:"https://qm.qq.com/q/UqAiwtrisW"}
    ],
    logo: 'https://fun.assets.cyi.cc/logo.png',
    sidebar: [
      {
        text: '',
        items: [
          { text: '什么是fun?', link: '/fun' },
          { text: '快速入门', link: '/quick-start' },
          { text: '服务(service)', link: '/service' },
          { text: '守卫(guard)', link: '/guard' },
          { text: '依赖注入', link: '/dependency-injection' },
          { text: 'mock(待开发)' },
          { text: '单元测试(待开发)' },
          { text: '微服务(待开发)' },
          { text: '日志系统', link: '/log'},
          { text: '参数验证' , link: '/check'},
          { text: '文件上传(待开发)' },
          { text: '代码生成', link: '/gen' },
          { text: '错误处理', link: '/error.md' },
        ]
      }
    ],
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chiyikj/fun' }
    ]
  }
})
