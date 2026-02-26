# SEO Setup Guide for Print Pro

This project includes comprehensive SEO optimization to improve search engine visibility and ranking.

## 🚀 What's Included

### 1. **Metadata Configuration**
- **Location**: `app/layout.tsx`
- **Features**:
  - Dynamic title templates
  - Comprehensive descriptions
  - Open Graph tags for social media
  - Twitter Card optimization
  - Robot directives for search engines
  - Canonical URLs

### 2. **Automatic Sitemap Generation**
- **Location**: `next-sitemap.config.js`
- **Features**:
  - Automatic sitemap generation on build
  - Custom priorities for different pages
  - Excludes admin and API routes
  - Generates `sitemap.xml` and `robots.txt`

### 3. **Robots.txt**
- **Location**: `public/robots.txt`
- **Features**:
  - Allows crawling of public pages
  - Blocks admin and API routes
  - Includes sitemap reference

### 4. **Structured Data (JSON-LD)**
- **Location**: `components/StructuredData.tsx`
- **Features**:
  - Website schema for search results
  - Organization schema for business info
  - Product schema for product pages
  - Rich snippets support

### 5. **Page-Specific SEO**
- **Admin Dashboard**: `app/admin/layout.tsx` - No-index for admin pages
- **Login Page**: `app/login/layout.tsx` - No-index for authentication pages

## 📋 Usage Instructions

### Build and Generate Sitemap
```bash
npm run build
```
This will automatically generate:
- `public/sitemap.xml`
- `public/robots.txt` (if not present)

### Manual Sitemap Generation
```bash
npm run postbuild
```

### Environment Variables
Update these in your deployment:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🔧 Configuration

### Update Site Information
Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: {
    default: "Your Site Name",
    template: "%s | Your Site Name"
  },
  metadataBase: new URL("https://yourdomain.com"),
  // ... other metadata
};
```

### Update Sitemap Config
Edit `next-sitemap.config.js`:
```javascript
module.exports = {
  siteUrl: 'https://yourdomain.com',
  // ... other config
};
```

### Add Structured Data to Pages
```tsx
import StructuredData from "@/components/StructuredData";

export default function ProductPage({ product }) {
  return (
    <>
      <StructuredData type="product" data={product} />
      {/* Your page content */}
    </>
  );
}
```

## 🎯 SEO Best Practices Implemented

1. **Semantic HTML5 Structure**
2. **Meta Tags Optimization**
3. **Open Graph & Twitter Cards**
4. **XML Sitemaps**
5. **Robots.txt Optimization**
6. **Structured Data Markup**
7. **Canonical URLs**
8. **Mobile-Friendly Design**
9. **Fast Loading (Next.js Optimization)**

## 📊 Monitoring & Testing

### Test Your SEO
- Google Search Console: https://search.google.com/search-console/
- Rich Results Test: https://search.google.com/test/rich-results
- PageSpeed Insights: https://pagespeed.web.dev/
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

### Sitemap Access
After deployment, access:
- `https://yourdomain.com/sitemap.xml`
- `https://yourdomain.com/robots.txt`

## 🚨 Important Notes

1. **Update URLs**: Replace `https://printpro.example.com` with your actual domain
2. **Verification Codes**: Add Google Search Console verification codes in metadata
3. **Dynamic Routes**: Add product pages to sitemap config when implemented
4. **Images**: Add `og-image.jpg` to public folder for social media previews

## 🔄 Next Steps

1. Submit sitemap to Google Search Console
2. Set up Google Analytics
3. Monitor search performance
4. Add more structured data as needed
5. Implement blog/content marketing strategy
