import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Apache Ignite 3 문서 (한국어 비공식 번역)',
  tagline: '고성능 컴퓨팅을 위한 분산 데이터베이스',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://thkwag.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // Can be overridden with BASE_URL environment variable for staging builds
  baseUrl: process.env.BASE_URL || '/ignite3-docs-ko/',

  // Enforce consistent trailing slash
  trailingSlash: false,

  // GitHub Pages deployment config.
  organizationName: 'thkwag', // GitHub org/user name.
  projectName: 'ignite3-docs-ko', // Repo name.

  // Matches the tolerance level of the upstream repository this content is
  // translated from (apache/ignite-3, docs/docs) — two links are already
  // broken there.
  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/thkwag/ignite3-docs-ko/edit/main/',
          routeBasePath: '/', // Serve docs at the site root
        },
        blog: false, // Disable blog functionality
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // Indexing options
        hashed: true, // Hash the search index file for better caching
        indexDocs: true, // Index documentation pages
        indexBlog: false, // Don't index blog (disabled)
        indexPages: false, // Don't index static pages (docs-only site)
        docsRouteBasePath: '/', // Docs are served at root

        // Search UI options
        searchResultLimits: 10, // Maximum number of search results
        searchResultContextMaxLength: 100, // Maximum length of search result context
        highlightSearchTermsOnTargetPage: true, // Highlight search terms on result pages
        searchBarPosition: 'right', // Position in navbar

        // Language support
        language: ['ko'], // Korean tokenizer/stemmer

        // Performance options
        searchBarShortcut: true, // Enable keyboard shortcut (Ctrl+K / Cmd+K)
        searchBarShortcutHint: true, // Show keyboard shortcut hint
      },
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    announcementBar: {
      id: 'unofficial-translation-notice',
      content:
        '이 사이트는 Apache Software Foundation과 무관하게 개인이 운영하는 ' +
        '<b>Apache Ignite 3 공식 문서의 비공식 한국어 번역</b>입니다. ' +
        '<a target="_blank" rel="noopener noreferrer" href="https://ignite.apache.org/docs/ignite3/latest/index">공식 영문 문서</a>를 함께 참고하세요.',
      backgroundColor: '#fff5db',
      textColor: '#4a3800',
      isCloseable: true,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'Apache Ignite Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
        href: '/',
        target: '_self',
      },
      items: [
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://ignite.apache.org/docs/ignite3/latest/index',
          label: '공식 영문 문서',
          position: 'right',
        },
        {
          href: 'https://github.com/thkwag/ignite3-docs-ko',
          label: 'GitHub',
          position: 'right',
        },
      ],
      style: 'primary',
      hideOnScroll: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '문서',
          items: [
            {
              label: 'Apache Ignite 3 (한국어)',
              to: '/',
            },
            {
              label: 'Apache Ignite 3 (공식 영문)',
              href: 'https://ignite.apache.org/docs/ignite3/latest/index',
            },
          ],
        },
        {
          title: '커뮤니티',
          items: [
            {
              label: 'Apache Ignite',
              href: 'https://ignite.apache.org',
            },
            {
              label: 'User Mailing List',
              href: 'https://ignite.apache.org/community.html',
            },
          ],
        },
        {
          title: '프로젝트',
          items: [
            {
              label: '번역 저장소 (GitHub)',
              href: 'https://github.com/thkwag/ignite3-docs-ko',
            },
            {
              label: '원본 저장소 (apache/ignite-3)',
              href: 'https://github.com/apache/ignite-3',
            },
            {
              label: 'License',
              href: 'https://www.apache.org/licenses/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Apache Software Foundation. 원문은 Apache License, Version 2.0에 따라 배포됩니다. 이 번역본은 비공식 파생 저작물입니다.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: [
        'java',
        'csharp',
        'cpp',
        'python',
        'sql',
        'bash',
        'json',
        'yaml',
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
