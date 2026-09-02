import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EstatisticaCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  className?: string;
}

export default function EstatisticaCard({
  title,
  value,
  icon: Icon,
  className,
}: EstatisticaCardProps) {
  return (
    <Card className={`${className} border-none shadow-md shadow-zinc-400`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-sm">
          {title}
          <Icon className="text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}
