import { Card, EmptyState } from '@/design-system';

// A clean, neutral placeholder for sections whose screens are not built yet. It keeps the navigation
// walkable without exposing any developer or scaffolding language to users.
export function PlaceholderScreen({ title, area }: { title: string; area: string }) {
  return (
    <Card title={title}>
      <EmptyState title={`${area} will appear here`} description="This section is coming soon." />
    </Card>
  );
}
