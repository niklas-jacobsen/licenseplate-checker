import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'Licenseplate Checker',
    description: 'Automatic personal license plate reservation system',
    themeConfig: {
      nav: [{ text: 'API Reference', link: 'https://api.lp-checker.com/docs' }],
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Creating a Workflow', link: '/guide/creating-a-workflow' },
            { text: 'Dictionary', link: '/guide/dictionary' },
          ],
        },
        {
          text: 'Backend',
          items: [
            { text: 'Overview', link: '/backend/overview' },
            { text: 'Authentication', link: '/backend/authentication' },
          ],
        },
        {
          text: 'Frontend',
          items: [
            { text: 'Overview', link: '/frontend/overview' },
            { text: 'Workflow Builder', link: '/frontend/builder' },
            { text: 'Node Types', link: '/frontend/node-types' },
          ],
        },
        {
          text: 'DevSecOps',
          items: [
            { text: 'Architecture', link: '/devsecops/architecture' },
            { text: 'Deployment', link: '/devsecops/deployment' },
            { text: 'Security', link: '/devsecops/security' },
            { text: 'Clean Code', link: '/devsecops/clean-code' },
          ],
        },
        {
          text: 'Appendix',
          items: [
            { text: 'Capstone Changes', link: '/appendix/capstone-changes' },
            { text: 'Supported Cities', link: '/appendix/supported-cities' },
          ],
        },
      ],
      socialLinks: [
        {
          icon: 'github',
          link: 'https://github.com/niklas-jacobsen/licenseplate-checker',
        },
      ],
    },
  })
)
