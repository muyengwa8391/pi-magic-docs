import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs";

const MAGIC_HEADER = /^# MAGIC DOC:/m;

interface TrackedDoc {
	path: string;
	title: string;
	instruction?: string;
}

function parseHeader(content: string): { title: string; instruction?: string } | null {
	const lines = content.split("\n");
	const idx = lines.findIndex((l) => MAGIC_HEADER.test(l));
	if (idx === -1) return null;

	const title = lines[idx].replace(/^# MAGIC DOC:\s*/, "").trim();
	if (!title) return null;

	const next = lines[idx + 1]?.trim();
	const instruction =
		next?.startsWith("*") && next.endsWith("*") ? next.slice(1, -1).trim() : undefined;

	return { title, instruction };
}

export default function (pi: ExtensionAPI) {
	const tracked = new Map<string, TrackedDoc>();
	let turnsSinceUpdate = 0;

	function detect(filePath: string, content: string) {
		const parsed = parseHeader(content);
		if (parsed) tracked.set(filePath, { path: filePath, ...parsed });
	}

	function textFrom(content: any[]): string | null {
		const first = content?.[0];
		return first && typeof first === "object" && first.type === "text" ? first.text : null;
	}

	// Detect magic docs when agent reads files
	pi.on("tool_result", async (event) => {
		if (event.toolName !== "read") return;
		const path = (event as any).input?.path;
		const text = textFrom(event.content);
		if (path && text) detect(path, text);
	});

	pi.on("turn_end", async () => {
		turnsSinceUpdate++;
	});

	pi.on("agent_end", async () => {
		if (tracked.size === 0) return;
		if (turnsSinceUpdate < 2) return;

		// Prune deleted or no-longer-magic files
		for (const [path] of tracked) {
			try {
				if (!MAGIC_HEADER.test(fs.readFileSync(path, "utf-8"))) tracked.delete(path);
			} catch {
				tracked.delete(path);
			}
		}
		if (tracked.size === 0) return;

		const docs = Array.from(tracked.values());
		const list = docs
			.map((d) => {
				let s = `- \`${d.path}\` — "${d.title}"`;
				if (d.instruction) s += ` (focus: ${d.instruction})`;
				return s;
			})
			.join("\n");

		pi.sendUserMessage(
			`Update ${docs.length} magic doc(s):\n\n${list}\n\n` +
				`Re-read each, edit in-place with anything new from our conversation. ` +
				`Be terse, high signal only. Document architecture and WHY things exist. ` +
				`Never duplicate what's obvious from code. Delete outdated sections. ` +
				`Never append "Previously..." or "Updated to..." notes. ` +
				`Fix typos and broken formatting. If nothing meaningful changed, skip silently.`,
			{ deliverAs: "followUp" },
		);

		turnsSinceUpdate = 0;
	});

	// Restore tracking from session history
	pi.on("session_start", async (_event, ctx) => {
		tracked.clear();
		turnsSinceUpdate = 0;

		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type !== "message") continue;
			const msg = entry.message;
			if (msg.role === "toolResult" && msg.toolName === "read") {
				const path = msg.input?.path;
				const text = textFrom(msg.content);
				if (path && text) detect(path, text);
			}
		}

		if (tracked.size > 0) {
			ctx.ui.notify(`Tracking ${tracked.size} magic doc(s)`, "info");
		}
	});

	pi.on("before_agent_start", async (event) => {
		if (tracked.size === 0) return;

		const list = Array.from(tracked.values())
			.map((d) => `  - ${d.path} ("${d.title}")`)
			.join("\n");

		return {
			systemPrompt:
				event.systemPrompt +
				`\n\n## Magic Docs\n\nYou are tracking living documents (files starting with \`# MAGIC DOC:\`). ` +
				`They update themselves from the conversation. Currently tracking:\n${list}\n\n` +
				`When asked to update them: re-read, edit in-place, be terse, delete stale sections. Never narrate changes.`,
		};
	});
}
