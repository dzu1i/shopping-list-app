import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";

// helper: read CSS variable (works in browser)
function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return (v || "").trim() || fallback;
}

export function DonePieChart({
  done,
  active,
  labels,
}: {
  done: number;
  active: number;
  labels: { done: string; active: string };
}) {
  const data = [
    { name: labels.done, value: done },
    { name: labels.active, value: active },
  ];

  const theme =
    typeof window !== "undefined"
      ? document.documentElement.getAttribute("data-theme")
      : "light";

  // theme-aware colors
  const accent = cssVar("--accent", "#ff6b6b");
  const border = cssVar("--border", "rgba(0,0,0,0.12)");
  const text = cssVar("--text", "#241b18");

  const neutral =
    theme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)";

  const COLORS = [accent, neutral];

  return (
    <div className="chart-body" style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={74}
            paddingAngle={2}
            stroke={border}
            strokeWidth={1}
            // keep animations (also when theme toggles)
            isAnimationActive={true}
            animationDuration={350}
            animationBegin={0}
          >
            <LabelList
              dataKey="value"
              position="inside"
              formatter={(v: any) => (v ? String(v) : "")}
              style={{
                fontFamily: `"Quicksand", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
                fontWeight: 500,
                fontSize: 13,
                fill: text,
              }}
            />

            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: any, name: any) => [value, name]}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${border}`,
              background:
                theme === "dark"
                  ? "rgba(26,18,20,0.92)"
                  : "rgba(255,255,255,0.92)",
              color: text,
              boxShadow: cssVar("--cardGlow", "0 18px 44px rgba(0,0,0,0.12)"),
              fontFamily: `"Quicksand", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
              fontSize: 13,
              fontWeight: 500,
            }}
            itemStyle={{
              color: text,
              fontFamily: `"Quicksand", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
              fontSize: 13,
              fontWeight: 500,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}