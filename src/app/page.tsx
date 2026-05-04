"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface FormData {
  age: string;
  height: string;
  weight: string;
  matches_played: string;
  goals: string;
  assists: string;
  minutes_played: string;
  injury_count: string;
  position: string;
}

interface DerivedStats {
  goal_per_match: number;
  assist_per_match: number;
  minutes_per_match: number;
  goal_involvement: number;
  involvement_per_match: number;
}

interface Report {
  player_tier: string;
  tier_color: string;
  age_category: string;
  injury_risk: string;
  derived_stats: DerivedStats;
  input_summary: Record<string, string | number>;
}

interface PredictionResult {
  prediction: number;
  status: string;
  report: Report;
}

interface FieldConfig {
  key: keyof FormData;
  label: string;
  placeholder: string;
  type: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  icon: React.ReactNode;
  options?: string[];
}

/* ------------------------------------------------------------------ */
/* Field configuration (9 fields — no market_value)                    */
/* ------------------------------------------------------------------ */
const IconAge = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconHeight = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>;
const IconWeight = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.46A2 2 0 0 0 17.5 8Z"/></svg>;
const IconMatches = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconGoals = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconAssists = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/><polyline points="13 2 17 6 13 10"/><polyline points="9 22 5 18 9 14"/></svg>;
const IconMinutes = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconInjuries = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const IconPosition = () => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

const FIELDS: FieldConfig[] = [
  { key: "age", label: "Age", placeholder: "e.g. 25", type: "number", min: 15, max: 50, icon: <IconAge /> },
  { key: "height", label: "Height (cm)", placeholder: "e.g. 180", type: "number", min: 140, max: 220, icon: <IconHeight /> },
  { key: "weight", label: "Weight (kg)", placeholder: "e.g. 75", type: "number", min: 45, max: 120, icon: <IconWeight /> },
  { key: "matches_played", label: "Matches Played", placeholder: "e.g. 30", type: "number", min: 0, max: 100, icon: <IconMatches /> },
  { key: "goals", label: "Goals", placeholder: "e.g. 12", type: "number", min: 0, max: 100, icon: <IconGoals /> },
  { key: "assists", label: "Assists", placeholder: "e.g. 8", type: "number", min: 0, max: 100, icon: <IconAssists /> },
  { key: "minutes_played", label: "Minutes Played", placeholder: "e.g. 2500", type: "number", min: 0, max: 10000, icon: <IconMinutes /> },
  { key: "injury_count", label: "Injury Count", placeholder: "e.g. 2", type: "number", min: 0, max: 30, icon: <IconInjuries /> },
  {
    key: "position",
    label: "Position",
    placeholder: "Select position",
    type: "select",
    icon: <IconPosition />,
    options: ["Forward", "Midfielder", "Defender", "Goalkeeper"],
  },
];

const INITIAL_FORM: FormData = {
  age: "",
  height: "",
  weight: "",
  matches_played: "",
  goals: "",
  assists: "",
  minutes_played: "",
  injury_count: "",
  position: "",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`;
  return `€${value.toFixed(0)}`;
}

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  gold:   { bg: "#fef3c7", text: "#d97706", border: "#fde68a", glow: "transparent" },
  purple: { bg: "#f3e8ff", text: "#7e22ce", border: "#e9d5ff", glow: "transparent" },
  blue:   { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd", glow: "transparent" },
  green:  { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0", glow: "transparent" },
  gray:   { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0", glow: "transparent" },
};

const RISK_COLORS: Record<string, string> = {
  Low: "#34d399",
  Moderate: "#facc15",
  High: "#fb923c",
  "Very High": "#f87171",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ── handlers ──────────────────────────────────────────── */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
    if (result) setResult(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const payload = {
      age: parseInt(form.age),
      height: parseFloat(form.height),
      weight: parseFloat(form.weight),
      matches_played: parseInt(form.matches_played),
      goals: parseInt(form.goals),
      assists: parseInt(form.assists),
      minutes_played: parseInt(form.minutes_played),
      injury_count: parseInt(form.injury_count),
      position: form.position,
    };

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Server error (${res.status})`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
  }

  const isValid = FIELDS.every((f) => form[f.key].trim() !== "");

  /* ── render ────────────────────────────────────────────── */
  return (
    <main className="relative flex-1 flex flex-col items-center justify-start bg-pitch-pattern overflow-auto">
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Header ── */}
        <header className="text-center mb-8 sm:mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] text-xs tracking-wider uppercase text-[var(--color-accent)]">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-success)]" />
            AI-Powered Prediction
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-foreground)] via-[#334155] to-[var(--color-success)] bg-clip-text text-transparent">
            Football Player Analytics
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--color-label)] max-w-xl mx-auto leading-relaxed">
            Enter player statistics and let our Gradient Boosting model predict market value and generate a full analytics report.
          </p>
        </header>

        {/* ── Form Card ── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <form onSubmit={handleSubmit} id="predict-form" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {FIELDS.map((f, i) => (
                <div
                  key={f.key}
                  className={`flex flex-col gap-1.5 animate-fade-in-up ${
                    f.key === "position" ? "sm:col-span-2 sm:max-w-[calc(50%-0.75rem)]" : ""
                  }`}
                  style={{ animationDelay: `${0.05 * i}s` }}
                >
                  <label htmlFor={f.key} className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-label)] uppercase tracking-wider">
                    <span>{f.icon}</span>
                    {f.label}
                  </label>

                  {f.type === "select" ? (
                    <select
                      id={f.key}
                      name={f.key}
                      value={form[f.key]}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-label)] outline-none transition-all duration-200 input-glow focus:border-[var(--color-accent)] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        {f.placeholder}
                      </option>
                      {f.options!.map((opt) => (
                        <option key={opt} value={opt} className="bg-[var(--color-input-bg)] text-[var(--color-foreground)]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={f.key}
                      name={f.key}
                      type="number"
                      value={form[f.key]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      required
                      min={f.min}
                      max={f.max}
                      step={f.step ?? "any"}
                      className="w-full rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder-[var(--color-label)] outline-none transition-all duration-200 input-glow focus:border-[var(--color-accent)]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
              <button
                id="submit-btn"
                type="submit"
                disabled={loading || !isValid}
                className="relative w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                  bg-[var(--color-foreground)] text-white
                  shadow-md
                  hover:bg-[var(--color-foreground)]/90 hover:shadow-lg hover:scale-[1.02]
                  active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner !w-4 !h-4 !border-2 !border-white/20 !border-t-white" />
                    Analyzing…
                  </span>
                ) : (
                  "Generate Player Report"
                )}
              </button>

              <button
                id="reset-btn"
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm text-[var(--color-label)]
                  border border-[var(--color-input-border)]
                  hover:border-[var(--color-accent)]/40 hover:text-[var(--color-foreground)]
                  transition-all duration-200"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="mt-6 flex items-center justify-center gap-3 text-[var(--color-accent)] animate-fade-in-up">
            <div className="spinner" />
            <span className="text-sm">Running ML model on player data…</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div id="error-msg" className="mt-6 glass-card rounded-xl border-[var(--color-error)]/30 p-5 animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="text-[var(--color-error)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-error)] text-sm">Prediction Failed</h3>
                <p className="mt-1 text-xs text-[var(--color-label)]">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Result / Report ── */}
        {result && (
          <div id="result-card" className="mt-8 space-y-5 animate-scale-in">

            {/* ═══════ Market Value Hero ═══════ */}
            <div
              className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden"
              style={{ borderColor: TIER_STYLES[result.report.tier_color]?.border }}
            >
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none"
                style={{ background: TIER_STYLES[result.report.tier_color]?.glow }}
              />
              <div className="relative text-center">
                {/* Tier badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{
                    background: TIER_STYLES[result.report.tier_color]?.bg,
                    color: TIER_STYLES[result.report.tier_color]?.text,
                    border: `1px solid ${TIER_STYLES[result.report.tier_color]?.border}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: TIER_STYLES[result.report.tier_color]?.text }} />
                  {result.report.player_tier}
                </div>

                <p className="text-sm text-[var(--color-label)] mb-1">Predicted Market Value</p>
                <p
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
                  style={{ color: TIER_STYLES[result.report.tier_color]?.text }}
                >
                  {formatCurrency(result.prediction)}
                </p>
                <p className="mt-1.5 text-xs text-[var(--color-label)]">
                  €{result.prediction.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* ═══════ Report Grid ═══════ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Player Profile */}
              <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3 flex items-center gap-2">
                  <span className="text-lg opacity-80"><IconPosition /></span> Player Profile
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Position</span>
                    <span className="font-medium">{result.report.input_summary.position}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Age</span>
                    <span className="font-medium">{result.report.input_summary.age}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Category</span>
                    <span className="font-medium text-[var(--color-accent)]">{result.report.age_category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Height / Weight</span>
                    <span className="font-medium">{result.report.input_summary.height}cm / {result.report.input_summary.weight}kg</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3 flex items-center gap-2">
                  <span className="text-lg opacity-80"><IconGoals /></span> Performance
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Goals/Match</span>
                    <span className="font-semibold text-[var(--color-success)]">{result.report.derived_stats.goal_per_match}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Assists/Match</span>
                    <span className="font-semibold text-[var(--color-accent)]">{result.report.derived_stats.assist_per_match}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Mins/Match</span>
                    <span className="font-medium">{result.report.derived_stats.minutes_per_match}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">G+A Involvement</span>
                    <span className="font-semibold" style={{ color: TIER_STYLES[result.report.tier_color]?.text }}>
                      {result.report.derived_stats.goal_involvement} ({result.report.derived_stats.involvement_per_match}/m)
                    </span>
                  </div>
                </div>
              </div>

              {/* Health & Model */}
              <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3 flex items-center gap-2">
                  <span className="text-lg opacity-80"><IconInjuries /></span> Health & Model
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Injuries</span>
                    <span className="font-medium">{result.report.input_summary.injury_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Injury Risk</span>
                    <span className="font-semibold" style={{ color: RISK_COLORS[result.report.injury_risk] }}>
                      {result.report.injury_risk}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">Model</span>
                    <span className="font-medium text-[var(--color-accent)]">GB Regressor</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-label)]">R² Score</span>
                    <span className="font-semibold text-[var(--color-success)]">0.9966</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════ Raw Stats Bar ═══════ */}
            <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-4 flex items-center gap-2">
                <span className="text-lg opacity-80"><IconMatches /></span> Input Summary
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[
                  { label: "Matches", value: result.report.input_summary.matches_played, icon: <IconMatches /> },
                  { label: "Goals", value: result.report.input_summary.goals, icon: <IconGoals /> },
                  { label: "Assists", value: result.report.input_summary.assists, icon: <IconAssists /> },
                  { label: "Minutes", value: result.report.input_summary.minutes_played, icon: <IconMinutes /> },
                  { label: "Injuries", value: result.report.input_summary.injury_count, icon: <IconInjuries /> },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] p-3 text-center">
                    <div className="text-lg flex justify-center text-[var(--color-label)]">{s.icon}</div>
                    <p className="text-lg font-bold mt-1 text-[var(--color-foreground)]">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-label)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-10 text-center text-xs text-[var(--color-label)]/60 pb-4">
          Football Player Analytics &bull; Gradient Boosting Model &bull; 80,000 training samples
        </footer>
      </div>
    </main>
  );
}
