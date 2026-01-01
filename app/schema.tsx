// app/components/OrganizationSchema.tsx
export default function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Kemas Prasasati",
          url: "https://kemasprasasti.com",
          logo: "https://kemasprasasti.com/logo.svg",
        }),
      }}
    />
  );
}
