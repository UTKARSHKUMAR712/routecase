import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'RouteCase',
  description: 'Modern In-Editor API Route & Endpoint Testing for Visual Studio Code',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['meta', { name: 'theme-color', content: '#0B0F19' }],
    ['meta', { name: 'author', content: 'Utkarsh Kumar' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'RouteCase — API Testing Made Simple for VS Code' }],
    ['meta', { property: 'og:description', content: 'Define endpoints once. Run multiple input cases with one click. Zero context switching.' }],
    ['meta', { property: 'og:image', content: '/logo-512.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap', rel: 'stylesheet' }]
  ],

  themeConfig: {
    logo: { src: '/logo.png', alt: 'RouteCase Logo' },
    siteTitle: 'RouteCase',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/introduction/' },
      { text: 'Tutorials', link: '/docs/tutorials/express-api' },
      { text: 'Schema Reference', link: '/docs/reference/schema-specification' },
      { text: 'Changelog', link: '/docs/reference/changelog' },
      {
        text: 'v0.2.0',
        items: [
          { text: 'VS Code Marketplace', link: 'https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase' },
          { text: 'GitHub Releases', link: 'https://github.com/UTKARSHKUMAR712/routecase/releases' }
        ]
      }
    ],

    sidebar: {
      '/docs/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'What is RouteCase?', link: '/docs/introduction/' },
            { text: 'Quickstart (3 Minutes)', link: '/docs/getting-started/quickstart' },
            { text: 'Installation Guide', link: '/docs/getting-started/installation' },
            { text: 'First Test Suite', link: '/docs/getting-started/first-test' }
          ]
        },
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'Architecture & Workflow', link: '/docs/core-concepts/architecture' },
            { text: 'Endpoints & Test Cases', link: '/docs/core-concepts/endpoints-and-cases' },
            { text: 'Execution & Lifecycle', link: '/docs/core-concepts/execution-lifecycle' },
            { text: 'Results & Debugging', link: '/docs/core-concepts/results-and-debugging' }
          ]
        },
        {
          text: 'Variables & Chaining',
          collapsed: false,
          items: [
            { text: 'Overview & Resolution Order', link: '/docs/variables/overview' },
            { text: 'Environment Variables (.env)', link: '/docs/variables/environments' },
            { text: 'Response Token Chaining', link: '/docs/variables/token-chaining' },
            { text: 'Dynamic Built-in Generators', link: '/docs/variables/dynamic-generators' },
            { text: 'URL Path & Query Placeholders', link: '/docs/variables/placeholders-and-encoding' }
          ]
        },
        {
          text: 'Reference Specification',
          collapsed: false,
          items: [
            { text: '.rcase Schema Reference', link: '/docs/reference/schema-specification' },
            { text: 'Assertions Engine', link: '/docs/reference/assertions' },
            { text: 'HTTP Methods & Bodies', link: '/docs/reference/http-methods' },
            { text: 'Commands & Shortcuts', link: '/docs/reference/commands' },
            { text: 'Settings Reference', link: '/docs/reference/settings' }
          ]
        },
        {
          text: 'Tutorials & Recipes',
          collapsed: false,
          items: [
            { text: 'Testing an Express REST API', link: '/docs/tutorials/express-api' },
            { text: 'JWT Auth & Token Chaining', link: '/docs/tutorials/auth-workflow' },
            { text: 'Pagination & Query Filtering', link: '/docs/tutorials/pagination-and-filtering' },
            { text: 'Live Public APIs (GitHub)', link: '/docs/tutorials/public-apis' },
            { text: 'OpenAPI / Swagger Import', link: '/docs/tutorials/openapi-import' }
          ]
        },
        {
          text: 'Troubleshooting & Community',
          collapsed: false,
          items: [
            { text: 'Troubleshooting Guide', link: '/docs/troubleshooting/common-issues' },
            { text: 'Frequently Asked Questions', link: '/docs/faq/' },
            { text: 'Developer & Contributing Guide', link: '/docs/contributing/development-guide' },
            { text: 'Changelog', link: '/docs/reference/changelog' },
            { text: 'License & Support', link: '/docs/reference/license' }
          ]
        }
      ]
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search docs...',
                buttonAriaLabel: 'Search documentation'
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Clear query',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close'
                }
              }
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/UTKARSHKUMAR712/routecase' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 RouteCase Contributors. Crafted by Utkarsh Kumar.'
    },

    editLink: {
      pattern: 'https://github.com/UTKARSHKUMAR712/routecase/edit/main/website/:path',
      text: 'Edit this page on GitHub'
    }
  }
});
