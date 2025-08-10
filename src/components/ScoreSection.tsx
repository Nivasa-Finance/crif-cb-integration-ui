import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";

interface Score {
  NAME: string;
  VALUE: string;
  DESCRIPTION?: string;
  FACTORS: { TYPE: string; DESC: string }[];
}

interface ScoreSectionProps {
  scores: Score[];
}

export const ScoreSection = ({ scores }: ScoreSectionProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-success";
    if (score >= 650) return "text-warning";
    return "text-destructive";
  };

  return (
    <SectionCard title="Bureau Score">
      <div className="space-y-2">
        {scores.map((score, index) => (
          <div key={index} className="border border-border rounded-lg p-3 bg-accent/10">
            <div className="flex">
              {score.FACTORS.length > 0 && (
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-muted-foreground mb-2">Factors:</h5>
                  <div className="space-y-1">
                    {score.FACTORS.map((factor, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs font-semibold">{factor.TYPE}</Badge>
                        <span className="text-sm font-medium text-foreground">{factor.DESC}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex-1 flex flex-col items-center justify-start text-center">
                <h4 className="text-sm font-semibold text-foreground mb-1">CREDIT SCORE</h4>
                <div className={`text-4xl font-bold ${getScoreColor(parseInt(score.VALUE))}`}>
                  {score.VALUE}
                </div>
                {score.DESCRIPTION && (
                  <p className="text-sm text-muted-foreground font-medium mt-1">{score.DESCRIPTION}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};