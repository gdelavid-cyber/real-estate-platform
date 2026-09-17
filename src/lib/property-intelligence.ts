export interface LiveListingComp {
  id: string;
  mlsNumber: string;
  source: 'Zillow' | 'Redfin' | 'HomeSpotter' | 'NWMLS' | 'Direct MLS';
  sourceUrl: string;
  address: string;
  cityStateZip: string;
  price: string;
  priceNumber: number;
  beds: number;
  baths: string;
  sqft: number;
  pricePerSqft: string;
  yearBuilt: number;
  lotSize: string;
  propertyType: string;
  daysOnMarket: number;
  zestimate: string;
  redfinEstimate: string;
  homeSpotterScore?: string;
  annualTaxes: string;
  hoaDues: string;
  walkScore: number;
  schoolRating: string;
  status: 'Active' | 'Pending' | 'New' | 'Price Drop';
  heroPhoto: string;
  photos: string[];
  keyHighlights: string[];
  brokerageListedBy: string;
  listingAgent: string;
  aiMarketAnalysis: string;
  tags?: string[];
}

/**
 * Intentionally empty: listing portals and MLS data may not be fabricated or
 * scraped without authorization. Populate results only through an approved
 * RESO/MLS integration in the server API.
 */
export function searchLiveProperties(_query: string): LiveListingComp[] {
  return [];
}

export function getProactiveSuggestions(
  query: string,
  currentComps: LiveListingComp[]
): string[] {
  if (currentComps.length) return [];
  return [
    `No licensed listing feed is connected for “${query}”.`,
    'Connect an approved NWMLS/RESO provider, or open the query directly on Zillow, Redfin, or your brokerage-approved mobile listing platform.',
  ];
}

export function listingPortalLinks(query: string) {
  const encoded = encodeURIComponent(query.trim());
  return {
    zillow: `https://www.zillow.com/homes/${encoded}_rb/`,
    redfin: `https://www.redfin.com/sting/search?q=${encoded}`,
    homeSpotter: 'https://homespotter.com/',
  };
}
