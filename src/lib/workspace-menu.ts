export function workspaceMenuDescription(id: string) {
  const descriptions: Record<string, string> = {
    today: 'Priorities and next best actions',
    listings: 'Upload and manage listings',
    command: 'Offers, equity and LOIs',
    video: 'Cinema films and reels',
    marketing: 'Campaigns and promotion',
    swarm: 'Buyer scraping and outreach',
    'call-bridge': 'Warm transfers and dossiers',
    'meta-dialer': 'Meta CAPI & AI Voice Dialer',
    documents: 'Contracts and mobile signing',
    nurture: 'CRM, market and inbox',
    hub: 'Private records and notes',
  };
  return descriptions[id] || 'Workspace tool';
}
