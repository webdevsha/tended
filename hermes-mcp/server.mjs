#!/usr/bin/env node
/**
 * Tended.Today MCP Server — Hermes bridge
 * ----------------------------------------
 * Exposes the Company of One database to Hermes/Hannachan as MCP tools.
 *
 * TRUST LADDER (encoded, not just documented):
 *   - Hermes may READ everything.
 *   - Hermes may CREATE: transactions, DRAFT invoices, time blocks,
 *     journal drafts (approved=false).
 *   - Hermes may NEVER set an invoice to "sent". Sending is Sha's act,
 *     done in the webapp. The tool schema physically excludes it.
 *
 * Env vars required:
 *   SUPABASE_URL          e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY  service_role key (server-side only, never in the webapp)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}
const sb = createClient(url, key);

const server = new McpServer({ name: "tended-today", version: "0.1.0" });

const ok = (data) => ({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
const fail = (error) => ({ content: [{ type: "text", text: `Error: ${error.message}` }], isError: true });

/* ---------------- MODULE 1 · MONEY ---------------- */

server.tool(
  "add_transaction",
  "Record an income or expense transaction (MYR). Use when Sha reports money in or out.",
  {
    amount: z.number().positive(),
    kind: z.enum(["income", "expense"]),
    source: z.string().describe("Irori | CetaLabs | Sinar | Tutoring | Other"),
    category: z.string().optional(),
    notes: z.string().optional(),
    tx_date: z.string().optional().describe("YYYY-MM-DD, defaults to today"),
  },
  async (args) => {
    const { data, error } = await sb.from("transactions")
      .insert({ ...args, created_by: "hermes" }).select().single();
    return error ? fail(error) : ok(data);
  }
);

server.tool(
  "create_draft_invoice",
  "Create a DRAFT invoice. Hermes can draft; only Sha can mark it sent, in the webapp.",
  {
    client: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
    due_date: z.string().optional().describe("YYYY-MM-DD"),
  },
  async (args) => {
    const { data, error } = await sb.from("invoices")
      .insert({ ...args, status: "draft", created_by: "hermes" }).select().single();
    return error ? fail(error) : ok(data);
  }
);

server.tool(
  "get_financial_summary",
  "P&L snapshot: income, expenses, net for a given month plus invoice pipeline.",
  { month: z.string().optional().describe("YYYY-MM, defaults to current month") },
  async ({ month }) => {
    const m = month || new Date().toISOString().slice(0, 7);
    const [tx, inv] = await Promise.all([
      sb.from("transactions").select("*").gte("tx_date", `${m}-01`).lte("tx_date", `${m}-31`),
      sb.from("invoices").select("*"),
    ]);
    if (tx.error) return fail(tx.error);
    if (inv.error) return fail(inv.error);
    const income = tx.data.filter(t => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = tx.data.filter(t => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const pipeline = inv.data.filter(i => ["draft", "sent", "overdue"].includes(i.status));
    return ok({
      month: m, income, expense, net: income - expense,
      invoices_pending: pipeline.length,
      invoices_pending_total: pipeline.reduce((s, i) => s + Number(i.amount), 0),
      invoices_overdue: inv.data.filter(i => i.status === "overdue").length,
    });
  }
);

server.tool(
  "list_invoices",
  "List invoices, optionally filtered by status.",
  { status: z.enum(["draft", "sent", "paid", "overdue", "void"]).optional() },
  async ({ status }) => {
    let q = sb.from("invoices").select("*").order("issue_date", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    return error ? fail(error) : ok(data);
  }
);

/* ---------------- MODULE 2 · TIME ---------------- */

server.tool(
  "log_time_block",
  "Log a block of time against a life/work domain.",
  {
    title: z.string(),
    domain: z.string().describe("Irori | AIS | Family | Spiritual | Admin | Website | Other"),
    minutes: z.number().int().positive(),
    is_work: z.boolean().default(true),
    block_date: z.string().optional().describe("YYYY-MM-DD"),
  },
  async (args) => {
    const { data, error } = await sb.from("time_blocks")
      .insert({ ...args, source: "hermes" }).select().single();
    return error ? fail(error) : ok(data);
  }
);

server.tool(
  "get_pareto_guard",
  "Weekly Pareto check: (Irori + AIS minutes) / all work minutes. Target ≥ 70%.",
  { week_start: z.string().optional().describe("YYYY-MM-DD Monday, defaults to this week") },
  async ({ week_start }) => {
    const start = week_start ? new Date(week_start) : (() => {
      const d = new Date(); const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day); return d;
    })();
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const iso = (d) => d.toISOString().slice(0, 10);
    const { data, error } = await sb.from("time_blocks").select("*")
      .gte("block_date", iso(start)).lte("block_date", iso(end)).eq("is_work", true);
    if (error) return fail(error);
    const total = data.reduce((s, b) => s + b.minutes, 0);
    const core = data.filter(b => ["Irori", "AIS"].includes(b.domain)).reduce((s, b) => s + b.minutes, 0);
    const pct = total ? Math.round((core / total) * 100) : 0;
    return ok({ week_start: iso(start), core_minutes: core, work_minutes: total, pareto_pct: pct, on_target: pct >= 70 });
  }
);

server.tool(
  "add_journal_draft",
  "Add a journal entry as a DRAFT (approved=false). Sha approves in the webapp. Use for Yayday extracts from Apple Notes.",
  {
    content: z.string(),
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
    entry_date: z.string().optional().describe("YYYY-MM-DD"),
  },
  async (args) => {
    const { data, error } = await sb.from("journal_entries")
      .insert({ ...args, source: "hermes", approved: false }).select().single();
    return error ? fail(error) : ok(data);
  }
);

server.tool(
  "log_plc",
  "Log a Personal Learning Curriculum item: Quran log, highlight, or other.",
  {
    kind: z.enum(["quran", "highlight", "other"]),
    detail: z.string(),
    log_date: z.string().optional(),
  },
  async (args) => {
    const { data, error } = await sb.from("plc_log").insert(args).select().single();
    return error ? fail(error) : ok(data);
  }
);

/* ---------------- HEART · CONNECTION ---------------- */

server.tool(
  "log_heart",
  "Log a moment of connection / relationship tending (Heart module). Gentle, not scored.",
  {
    kind: z.enum(["mama", "partner", "family", "self", "other"])
      .describe("mama = Mama practice · partner = check-in with R · family · self = self-compassion · other"),
    detail: z.string().optional(),
    log_date: z.string().optional().describe("YYYY-MM-DD, defaults to today"),
  },
  async (args) => {
    const { data, error } = await sb.from("heart_logs")
      .insert({ ...args, created_by: "hermes" }).select().single();
    return error ? fail(error) : ok(data);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
