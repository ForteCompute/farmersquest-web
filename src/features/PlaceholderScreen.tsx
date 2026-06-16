import { Card, EmptyState } from '@/design-system';

// A neutral placeholder for sections whose real screens arrive with feature tickets. It exists so
// the role-gated navigation is fully walkable today without pretending a feature is built.
export function PlaceholderScreen({ title, area }: { title: string; area: string }) {
  return (
    <Card title={title}>
      <EmptyState
        icon="🚧"
        title={`${area} is on the way`}
        description="This section is part of the foundation shell. Its screen lands with a future feature ticket."
      />
    </Card>
  );
}
