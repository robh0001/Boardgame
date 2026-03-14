export default function HubLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          background:
            "radial-gradient(circle at top, #17203d 0%, #0a1020 45%, #050816 100%)",
          color: "white",
        }}
      >
        {children}
      </div>
    );
  }