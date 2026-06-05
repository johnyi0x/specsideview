"use client";

import type { Product } from "@/db/schema";
import type { LaptopSpecs } from "@/lib/spec-types";
import { cpuMultiScore, cpuSingleScore } from "@/lib/spec-types";
import { ChartDiffAside } from "@/components/compare/chart-diff-aside";
import { DiffHigherBlurb } from "@/components/compare/diff-rich";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { name: string; a: number; b: number };

type TooltipPayload = {
  name?: string;
  value?: number;
  dataKey?: string | number;
};

function buildRows(specsA: LaptopSpecs, specsB: LaptopSpecs): Row[] {
  const rows: Row[] = [];

  const singleA = cpuSingleScore(specsA);
  const singleB = cpuSingleScore(specsB);
  if (singleA != null && singleB != null) {
    rows.push({ name: "CPU (single)", a: singleA, b: singleB });
  }

  const multiA = cpuMultiScore(specsA);
  const multiB = cpuMultiScore(specsB);
  if (multiA != null && multiB != null) {
    rows.push({ name: "CPU (multi)", a: multiA, b: multiB });
  }

  const gpuA = specsA.gpu?.benchmarkScore;
  const gpuB = specsB.gpu?.benchmarkScore;
  if (gpuA != null && gpuB != null) {
    rows.push({ name: "GPU", a: gpuA, b: gpuB });
  }

  const aiA = specsA.ai?.benchmarkScore;
  const aiB = specsB.ai?.benchmarkScore;
  if (aiA != null && aiB != null) {
    rows.push({ name: "AI", a: aiA, b: aiB });
  }

  return rows;
}

function BenchmarkTooltip({
  active,
  payload,
  label,
  nameA,
  nameB,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  nameA: string;
  nameB: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-card-border)",
        color: "var(--color-foreground)",
      }}
    >
      <p className="mb-1.5 font-semibold" style={{ color: "var(--color-foreground)" }}>
        {label}
      </p>
      <ul className="space-y-1.5">
        {payload.map((item) => {
          const isA = item.dataKey === "a";
          const dot = isA ? "var(--chart-series-a)" : "var(--chart-series-b)";
          return (
            <li key={String(item.dataKey)} className="flex justify-between gap-6">
              <span className="flex min-w-0 items-center gap-2" style={{ color: "var(--color-muted)" }}>
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
                <span className="truncate">{item.name}</span>
              </span>
              <span
                className="tabular-nums font-semibold"
                style={{ color: isA ? "var(--chart-series-a)" : "var(--chart-series-b)" }}
              >
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] leading-tight" style={{ color: "var(--color-muted)" }}>
        First bar = <span style={{ color: "var(--chart-series-a)" }}>{nameA}</span> · Second bar ={" "}
        <span style={{ color: "var(--chart-series-b)" }}>{nameB}</span>
      </p>
    </div>
  );
}

function specSummaryLine(label: "A" | "B", product: Product, specs: LaptopSpecs, seriesVar: "a" | "b") {
  const color = seriesVar === "a" ? "var(--chart-series-a)" : "var(--chart-series-b)";
  const s = cpuSingleScore(specs);
  const m = cpuMultiScore(specs);
  const g = specs.gpu?.benchmarkScore;
  const ai = specs.ai?.benchmarkScore;
  const parts: string[] = [];
  if (s != null && m != null) parts.push(`GB6 CPU ${s} / ${m}`);
  else if (m != null) parts.push(`GB6 CPU multi ${m}`);
  if (g != null) parts.push(`GPU ${g}`);
  if (ai != null) parts.push(`AI ${ai}`);
  return (
    <span>
      <span className="font-semibold" style={{ color }}>
        {label}
      </span>{" "}
      {product.displayName}: {parts.length ? parts.join(" · ") : "—"}
    </span>
  );
}

export function BenchmarkBars({
  productA,
  productB,
  specsA,
  specsB,
}: {
  productA: Product;
  productB: Product;
  specsA: LaptopSpecs;
  specsB: LaptopSpecs;
}) {
  const rows = buildRows(specsA, specsB);
  if (rows.length === 0) return null;

  const fillA = "var(--chart-series-a)";
  const fillB = "var(--chart-series-b)";

  const singleA = cpuSingleScore(specsA);
  const singleB = cpuSingleScore(specsB);
  const multiA = cpuMultiScore(specsA);
  const multiB = cpuMultiScore(specsB);
  const gpuA = specsA.gpu?.benchmarkScore;
  const gpuB = specsB.gpu?.benchmarkScore;
  const aiA = specsA.ai?.benchmarkScore;
  const aiB = specsB.ai?.benchmarkScore;

  const yAxisWidth = Math.min(200, 32 + Math.max(...rows.map((r) => r.name.length), 8) * 7);
  const chartHeightPx = Math.min(640, 140 + rows.length * 56);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="card-surface rounded-2xl p-6 md:p-8"
    >
      <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">Compute benchmarks</h3>
      <p className="mt-1 max-w-prose text-sm text-[var(--color-muted)]">
        <span className="font-medium text-[var(--color-foreground)]">CPU scores are Geekbench 6</span> single-core and
        multi-core (or values you have normalized to that scale). GPU and AI bars use the numeric scores you store in{" "}
        <code className="text-[var(--color-accent)]">specs</code>—label each source in JSON when you mix benchmarks
        (e.g. Geekbench ML vs vendor NPU score).
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
        {specSummaryLine("A", productA, specsA, "a")}
        {specSummaryLine("B", productB, specsB, "b")}
      </div>
      <div className="mt-6 w-full" style={{ height: chartHeightPx }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 20, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" horizontal={false} />
            <XAxis type="number" stroke="var(--color-muted)" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              stroke="var(--color-muted)"
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "color-mix(in oklch, var(--chart-series-a) 10%, transparent)" }}
              content={(props) => (
                <BenchmarkTooltip
                  active={props.active}
                  payload={props.payload as TooltipPayload[] | undefined}
                  label={props.label as string | undefined}
                  nameA={productA.displayName}
                  nameB={productB.displayName}
                />
              )}
            />
            <Bar dataKey="a" name={productA.displayName} radius={[0, 6, 6, 0]} barSize={15}>
              {rows.map((_, i) => (
                <Cell key={`a-${i}`} fill={fillA} />
              ))}
            </Bar>
            <Bar dataKey="b" name={productB.displayName} radius={[0, 6, 6, 0]} barSize={15}>
              {rows.map((_, i) => (
                <Cell key={`b-${i}`} fill={fillB} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Legend: first bar ={" "}
        <span className="font-medium" style={{ color: "var(--chart-series-a)" }}>
          {productA.displayName}
        </span>
        , second bar ={" "}
        <span className="font-medium" style={{ color: "var(--chart-series-b)" }}>
          {productB.displayName}
        </span>
        .
      </p>

      <ChartDiffAside title="Relative gap">
        {singleA != null && singleB != null && (
          <DiffHigherBlurb
            label="CPU single"
            kind="performance"
            nameA={productA.displayName}
            valueA={singleA}
            nameB={productB.displayName}
            valueB={singleB}
          />
        )}
        {multiA != null && multiB != null && (
          <DiffHigherBlurb
            label="CPU multi"
            kind="performance"
            nameA={productA.displayName}
            valueA={multiA}
            nameB={productB.displayName}
            valueB={multiB}
          />
        )}
        {gpuA != null && gpuB != null && (
          <DiffHigherBlurb
            label="GPU"
            kind="performance"
            nameA={productA.displayName}
            valueA={gpuA}
            nameB={productB.displayName}
            valueB={gpuB}
          />
        )}
        {aiA != null && aiB != null && (
          <DiffHigherBlurb
            label="AI"
            kind="performance"
            nameA={productA.displayName}
            valueA={aiA}
            nameB={productB.displayName}
            valueB={aiB}
          />
        )}
      </ChartDiffAside>
    </motion.section>
  );
}
