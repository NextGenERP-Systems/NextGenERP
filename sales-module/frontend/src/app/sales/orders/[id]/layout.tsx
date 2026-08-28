export default function SalesOrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full-width, no padding — ERPNext-style document view
  // The sales/layout.tsx padding is overridden here since nested layouts replace parent content area
  return <>{children}</>;
}
