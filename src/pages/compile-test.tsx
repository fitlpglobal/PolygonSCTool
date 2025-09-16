import React from "react";
// Imports moved into the click handler to avoid bundler analyzing solc during page build.

export default function CompileTestPage() {
  const [status, setStatus] = React.useState<string>("Idle");
  const [error, setError] = React.useState<string | null>(null);

  const handleCompile = async () => {
    setStatus("Compiling...");
    setError(null);
    try {
      const [{ loyaltyCardSource }, { compileContract }] = await Promise.all([
        import("~/modules/contracts/LoyaltyCardSource"),
        import("~/utils/compileContract"),
      ]);
      const { abi, bytecode } = await compileContract(loyaltyCardSource);
      // eslint-disable-next-line no-console
      console.log("ABI:", abi);
      // eslint-disable-next-line no-console
      console.log("Bytecode length:", bytecode.length);
      setStatus(`Done. Bytecode length: ${bytecode.length}`);
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(msg);
      setStatus("Failed");
      // eslint-disable-next-line no-console
      console.error("Compilation error:", e);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Compile Test</h1>
      <p>Quick in-browser solc test for LoyaltyCard.</p>
      <button
        onClick={handleCompile}
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: 6,
          cursor: "pointer",
          background: "#f6f6f6",
        }}
      >
        Compile LoyaltyCard
      </button>
      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <pre
          style={{
            marginTop: 12,
            color: "#b00020",
            whiteSpace: "pre-wrap",
            background: "#fff0f0",
            padding: 12,
            borderRadius: 6,
          }}
        >
          {error}
        </pre>
      )}
      <p style={{ marginTop: 16 }}>
        Open the browser console to see the ABI and bytecode length logs.
      </p>
    </div>
  );
}
