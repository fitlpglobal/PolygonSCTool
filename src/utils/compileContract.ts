/**
 * Compile a Solidity source string by calling the server API.
 * Returns the first compiled contract's { abi, bytecode }.
 * Throws the first compiler error with a readable message.
 */
export type CompiledContract = {
	abi: unknown[];
	bytecode: `0x${string}`;
};

/**
 * Compiles a Solidity contract source using solc-js.
 *
 * Notes:
 * - Browser-only: call this on the client (e.g., in a click handler). It lazily loads solc.
 * - Import resolution is not implemented; pass a self-contained source string (no imports).
 * - Next.js/Turbopack: we prefer the WASM build and include a CDN fallback to avoid bundling issues.
 */
export async function compileContract(source: string): Promise<CompiledContract> {
	if (!source || typeof source !== "string") {
		throw new Error("compileContract: expected non-empty Solidity source string");
	}
	return await compileViaApi(source);
}

async function compileViaApi(source: string): Promise<CompiledContract> {
	const resp = await fetch("/api/compile", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ source }),
	});
	let data: any;
	try {
		data = await resp.json();
	} catch (e) {
		throw new Error(`Compile API returned non-JSON response (status ${resp.status})`);
	}
	if (!resp.ok || !data?.ok) {
		const msg = data?.error || `Compile API error (status ${resp.status})`;
		throw new Error(msg);
	}
	return { abi: data.abi ?? [], bytecode: data.bytecode as `0x${string}` };
}

