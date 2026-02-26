import { Product, Organization, WebSite } from "schema-dts";

interface StructuredDataProps {
  type?: "website" | "product" | "organization";
  data?: {
    name?: string;
    description?: string;
    image?: string;
    price?: string;
  };
}

export default function StructuredData({ type = "website", data }: StructuredDataProps) {
  const getStructuredData = (): Product | Organization | WebSite => {
    switch (type) {
      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Print Pro",
          url: "https://print-pro-pi.vercel.app",
          logo: "https://print-pro-pi.vercel.app/logo.png",
          description: "Custom product design and printing service",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-555-0123",
            contactType: "customer service",
            availableLanguage: "English",
          },
          sameAs: [
            "https://twitter.com/printpro",
            "https://facebook.com/printpro",
            "https://instagram.com/printpro",
          ],
        } as Organization;

      case "product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          name: data?.name || "Custom Product",
          description: data?.description || "Design your own custom product",
          brand: {
            "@type": "Brand",
            name: "Print Pro",
          },
          image: data?.image || "https://print-pro-pi.vercel.app/placeholder-product.jpg",
          offers: {
            "@type": "Offer",
            price: data?.price || "19.99",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        } as Product;

      default:
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Print Pro",
          url: "https://print-pro-pi.vercel.app",
          description: "Design custom products with our easy-to-use online designer. Create personalized t-shirts, mugs, and more with professional printing quality.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://print-pro-pi.vercel.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        } as WebSite;
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
