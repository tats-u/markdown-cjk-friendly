// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";

/**
 * @import { Options as PresetOptions } from "@docusaurus/preset-classic"
 * @typedef {Exclude<PresetOptions["blog"], boolean | undefined>} BlogOptions
 * @typedef {Exclude<PresetOptions["docs"], boolean | undefined>} DocsOptions
 * @typedef {Exclude<PresetOptions["pages"], boolean | undefined>} PagesOptions
 * @typedef {BlogOptions & DocsOptions & PagesOptions} CommonOptions
 * @type {Exclude<CommonOptions["remarkPlugins"], undefined>}
 */
// You may need to add this to multiple `remarkPlugins` fields. (e.g. when you use both docs and blog)
// This is why this variable is defined here in advance.
const remarkPlugins = [remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough];

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Docusaurus demo",
  tagline: "Docusaurus + remark-cjk-friendly demo",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://tats-u.github.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "tats-u", // Usually your GitHub org/user name.
  projectName: "markdown-cjk-friendly", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "ja",
    locales: ["ja"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          remarkPlugins, // Add this field to every content type (docs / blog / pages).
          sidebarPath: "./sidebars.js",
        },
        blog: {
          remarkPlugins, // Don't forget to add this here too.
          showReadingTime: false,
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "ignore", // because this is just a demo
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        pages: {
          remarkPlugins, // Don't forget to add this here too.
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "Docusaurus demo",
        logo: {
          alt: "My Site Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            docId: "index",
            sidebarId: "docSidebar",
            position: "left",
            label: "Docs",
          },
          { to: "blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/tats-u/markdown-cjk-friendly",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Plugins",
            items: [
              {
                label: "remark-cjk-friendly",
                href: "https://www.npmjs.com/package/remark-cjk-friendly",
              },
              {
                label: "remark-cjk-friendly-gfm-strikethrough",
                href: "https://www.npmjs.com/package/remark-cjk-friendly-gfm-strikethrough",
              },
            ],
          },
          {
            title: "Links",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/tats-u/markdown-cjk-friendly",
              },
            ],
          },
        ],
        copyright: "Copyright © 2025 Tatsunori Uchino. Built with Docusaurus.",
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      colorMode: {
        respectPrefersColorScheme: true,
      },
    }),
  future: {
    experimental_faster: true,
  },
};

export default config;
