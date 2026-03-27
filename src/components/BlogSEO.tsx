import { Helmet } from 'react-helmet-async';

interface BlogSEOProps {
  title: string;
  description: string;
  pathname: string;
  publishDate: string;
  modifiedDate?: string;
  author?: string;
  tags?: string[];
  readingTime?: string;
}

// Alias for convenience
export { BlogSEO as BlogPageSEO };

const siteUrl = 'https://los-que-madrugan.vercel.app';

export function BlogSEO({ 
  title, 
  description,
  pathname,
  publishDate,
  modifiedDate,
  author = "Los que Madrugan",
  tags = [],
  readingTime
}: BlogSEOProps) {
  const url = `${siteUrl}${pathname}`;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": publishDate,
    "dateModified": modifiedDate || publishDate,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Los que Madrugan",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": tags.join(", ")
  };

  return (
    <Helmet>
      <title>{title} | Blog - Los que Madrugan</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={tags.join(", ")} />
      {readingTime && <meta name="reading-time" content={readingTime} />}
      <link rel="canonical" href={url} />
      
      {/* Article Meta */}
      <meta property="article:published_time" content={publishDate} />
      <meta property="article:modified_time" content={modifiedDate || publishDate} />
      <meta property="article:author" content={author} />
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />
      
      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
