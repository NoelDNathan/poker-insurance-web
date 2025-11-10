// Server component layout for dynamic route
// Required for static export with dynamic routes

export const dynamicParams = false;

export function generateStaticParams() {
  // Return known tournament IDs for static generation
  // These match the tournament IDs defined in TournamentDetails component
  return [
    { tournamentId: 'tournament-001' },
    { tournamentId: 'tournament-002' },
    { tournamentId: 'tournament-003' },
    { tournamentId: 'tournament-004' },
    { tournamentId: 'tournament-005' },
    { tournamentId: 'tournament-006' },
    { tournamentId: 'tournament-007' },
    { tournamentId: 'tournament-008' },
    { tournamentId: 'tournament-009' },
    { tournamentId: 'tournament-010' },
    { tournamentId: 'tournament-011' },
    { tournamentId: 'tournament-012' },
    { tournamentId: 'tournament-013' },
  ];
}

export default function TournamentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

