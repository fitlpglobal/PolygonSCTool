import type { NextApiRequest, NextApiResponse } from "next";

type Resp =
  | { ok: true; abi: unknown[]; bytecode: `0x${string}` }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { source } = (req.body ?? {}) as { source?: string };
    if (!source || typeof source !== "string") {
      res.status(400).json({ ok: false, error: "Missing or invalid 'source'" });
      return;
    }

  // Load solc server-side
  // @ts-expect-error - no types for 'solc' in this project; runtime import is valid on server
  const solcMod = await import("solc");
    const solc: any = (solcMod as any).default ?? solcMod;

    const input = {
      language: "Solidity",
      sources: {
        "Contract.sol": { content: source },
      },
      settings: {
        optimizer: { enabled: false, runs: 200 },
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
      },
    } as const;

    const outputRaw: string = solc.compile(JSON.stringify(input));
    const output = JSON.parse(outputRaw);

    const messages: any[] = Array.isArray(output?.errors) ? output.errors : [];
    const firstError = messages.find((m) => m?.severity === "error") ?? null;
    if (firstError) {
      const readable =
        firstError.formattedMessage ||
        `${firstError.type || "Error"}: ${firstError.message || "Compilation error"}` +
          (firstError?.sourceLocation?.file
            ? `\n at ${firstError.sourceLocation.file}:${firstError.sourceLocation?.start?.line ?? "?"}`
            : "");
      res.status(400).json({ ok: false, error: readable });
      return;
    }

    const compiledFromFile: Record<string, any> | undefined = output?.contracts?.["Contract.sol"];
    if (!compiledFromFile || Object.keys(compiledFromFile).length === 0) {
      res.status(400).json({ ok: false, error: "Compilation succeeded but produced no contracts." });
      return;
    }

    const firstName = Object.keys(compiledFromFile)[0]!;
    const artifact = (compiledFromFile as Record<string, any>)[firstName];
    const abi = artifact?.abi ?? [];
    const bc: string | undefined = artifact?.evm?.bytecode?.object;
    if (!bc) {
      res.status(400).json({ ok: false, error: "Bytecode not found (contract may be abstract)." });
      return;
    }
    const bytecode = (bc.startsWith("0x") ? bc : ("0x" + bc)) as `0x${string}`;

    res.status(200).json({ ok: true, abi, bytecode });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
