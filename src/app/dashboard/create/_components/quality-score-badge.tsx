"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Lightbulb } from "lucide-react";

interface QualityScore {
  overall: number;
  hookStrength: number;
  captionQuality: number;
  hashtagRelevance: number;
  estimatedReach: "low" | "medium" | "high";
  suggestions: string[];
}

interface QualityScoreBadgeProps {
  score: QualityScore;
}

function getScoreColor(value: number): string {
  if (value >= 75) return "text-green-400";
  if (value >= 50) return "text-yellow-400";
  return "text-red-400";
}

function getProgressColor(value: number): string {
  if (value >= 75) return "[&>div]:bg-green-500";
  if (value >= 50) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-red-500";
}

const reachLabels = {
  low: { text: "Bajo", color: "bg-red-500/20 text-red-400" },
  medium: { text: "Medio", color: "bg-yellow-500/20 text-yellow-400" },
  high: { text: "Alto", color: "bg-green-500/20 text-green-400" },
};

export function QualityScoreBadge({ score }: QualityScoreBadgeProps) {
  const metrics = [
    { label: "Hook", value: score.hookStrength },
    { label: "Caption", value: score.captionQuality },
    { label: "Hashtags", value: score.hashtagRelevance },
  ];

  const reach = reachLabels[score.estimatedReach];

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-300">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            Quality Score
          </span>
          <span className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{m.label}</span>
              <span className={getScoreColor(m.value)}>{m.value}/100</span>
            </div>
            <Progress
              value={m.value}
              className={`h-1.5 ${getProgressColor(m.value)}`}
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">Alcance estimado</span>
          <Badge variant="secondary" className={reach.color}>
            {reach.text}
          </Badge>
        </div>

        {score.suggestions.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <p className="flex items-center gap-1 text-xs font-medium text-slate-300">
              <Lightbulb className="h-3 w-3 text-yellow-400" />
              Sugerencias
            </p>
            <ul className="space-y-1">
              {score.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-slate-400">
                  - {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
