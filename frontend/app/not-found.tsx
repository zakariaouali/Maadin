import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#faf8f4", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
          <p style={{ fontSize: 96, fontWeight: 700, color: "#c9a22740", margin: "0 0 16px" }}>404</p>
          <h1 style={{ fontSize: 24, color: "#1a1610", margin: "0 0 8px" }}>Page not found</h1>
          <p style={{ color: "#8c7b6b", marginBottom: 32 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/en" style={{ background: "#c9a227", color: "#1a1610", padding: "10px 24px", borderRadius: 2, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
