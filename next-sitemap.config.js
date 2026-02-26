/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://print-pro-pi.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin/*', '/login', '/api/*'],
  transform: async (config, path) => {
    // Custom priority for different pages
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    if (path.includes('/admin')) {
      return null // Exclude admin pages
    }
    
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }
  },
  additionalPaths: async () => {
    const result = []
    
    // Add any dynamic routes here
    // For example, if you have product pages:
    // result.push({
    //   loc: '/products/custom-t-shirt',
    //   changefreq: 'daily',
    //   priority: 0.8,
    //   lastmod: new Date().toISOString(),
    // })
    
    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/login', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/login', '/api/'],
        crawlDelay: 1,
      },
    ],
  },
}
