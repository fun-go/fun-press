import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "fun",
  description: "fun框架",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/fun' }
    ],

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
          { text: '代码生成', link: '/gen' },
          { text: '错误处理', link: '/error.md' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
