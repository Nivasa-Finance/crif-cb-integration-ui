import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}
export const SectionCard = ({
  title,
  children,
  className = ""
}: SectionCardProps) => {
  return <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>;
};