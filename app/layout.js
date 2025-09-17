export const metadata = {
  title: "Notes SaaS",
  description: "Multi-tenant notes application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
