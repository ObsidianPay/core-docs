import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Obsidian Pay API',
  tagline: 'REST API reference for the Obsidian Pay platform',
  favicon: 'img/favicon.svg',

  url: 'https://docs.obsidianpay.bz',
  baseUrl: '/',
  organizationName: 'ObsidianCore',
  projectName: 'core',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Cairo and JetBrains Mono are the brand families (see the design system tokens).
  headTags: [
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
    { tagName: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' } },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ObsidianCore/core/tree/main/docs/docusaurus/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Obsidian Pay API',
      logo: {
        alt: 'Obsidian Pay',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'apiSidebar', position: 'left', label: 'Documentation' },
        { to: '/reference/errors', label: 'Error codes', position: 'left' },
        {
          href: 'https://github.com/ObsidianCore/core',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Start here',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'Authentication', to: '/authentication' },
            { label: 'Step-up verification', to: '/step-up' },
          ],
        },
        {
          title: 'Endpoints',
          items: [
            { label: 'Transactions', to: '/transactions/overview' },
            { label: 'Cards', to: '/cards' },
            { label: 'Disputes', to: '/disputes' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Errors', to: '/reference/errors' },
            { label: 'Enums', to: '/reference/enums' },
            { label: 'Changelog', to: '/reference/changelog' },
          ],
        },
      ],
      copyright: `Obsidian Pay, Belize. Documentation built ${new Date().getFullYear()}.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'csharp'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
