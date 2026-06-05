export function BlogHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--hair)",
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--ink)",
      }}
    >
      <a
        href="/en"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 500,
          color: "var(--cream)",
          textDecoration: "none",
          letterSpacing: "0.01em",
        }}
      >
        Calisto<em style={{ fontStyle: "italic", color: "var(--cream-2)", fontWeight: 400 }}>.</em>
      </a>
      <a
        href="/blog"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10.5px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          textDecoration: "none",
        }}
      >
        Blog
      </a>
    </header>
  );
}
