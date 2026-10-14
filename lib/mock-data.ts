// Mock data for development when database is unavailable
// This allows pages to render while database issues are being resolved

export const mockOrganizations = [
  {
    id: "mock-org-1",
    name: "Green Earth Foundation",
    description: "Working to combat climate change through tree plantation and environmental education programs.",
    type: "NGO",
    verificationStatus: "APPROVED",
    address: "123 Eco Street",
    city: "Mumbai",
    state: "Maharashtra",
    _count: { campaigns: 2 },
    campaigns: [
      {
        id: "mock-campaign-1",
        title: "Plant 10,000 Trees",
        currentAmount: 45000 as any,
        goalAmount: 100000 as any,
      },
      {
        id: "mock-campaign-2",
        title: "Clean Water Initiative",
        currentAmount: 30000 as any,
        goalAmount: 75000 as any,
      },
    ],
  },
  {
    id: "mock-org-2",
    name: "Education For All",
    description: "Providing quality education to underprivileged children across India.",
    type: "TRUST",
    verificationStatus: "APPROVED",
    address: "456 Learning Lane",
    city: "Delhi",
    state: "Delhi",
    _count: { campaigns: 1 },
    campaigns: [
      {
        id: "mock-campaign-3",
        title: "School Supplies Drive",
        currentAmount: 25000 as any,
        goalAmount: 50000 as any,
      },
    ],
  },
  {
    id: "mock-org-3",
    name: "Health First Initiative",
    description: "Providing healthcare services to rural communities.",
    type: "FOUNDATION",
    verificationStatus: "UNDER_REVIEW",
    address: "789 Medical Road",
    city: "Bangalore",
    state: "Karnataka",
    _count: { campaigns: 1 },
    campaigns: [],
  },
];

export const mockCampaigns = [
  {
    id: "mock-campaign-1",
    title: "Plant 10,000 Trees - Combat Climate Change",
    currentAmount: 85000 as any,
    goalAmount: 100000 as any,
    category: "ENVIRONMENT",
    organization: { name: "Green Earth Foundation" },
  },
  {
    id: "mock-campaign-2",
    title: "Clean Water for 1000 Families",
    currentAmount: 65000 as any,
    goalAmount: 80000 as any,
    category: "HEALTH",
    organization: { name: "Water For Life" },
  },
  {
    id: "mock-campaign-3",
    title: "Education for Underprivileged Children",
    currentAmount: 50000 as any,
    goalAmount: 100000 as any,
    category: "EDUCATION",
    organization: { name: "Education For All" },
  },
  {
    id: "mock-campaign-4",
    title: "Medical Equipment for Rural Hospitals",
    currentAmount: 40000 as any,
    goalAmount: 75000 as any,
    category: "HEALTH",
    organization: { name: "Health First Initiative" },
  },
  {
    id: "mock-campaign-5",
    title: "Food Security Program",
    currentAmount: 30000 as any,
    goalAmount: 60000 as any,
    category: "DISASTER_RELIEF",
    organization: { name: "Feed India Foundation" },
  },
];

export const mockFeaturedCampaign = {
  id: "mock-featured",
  title: "Emergency Flood Relief - Kerala 2026",
  description: "Urgent relief efforts for families affected by floods. Providing food, shelter, and medical assistance to displaced communities.",
  currentAmount: 250000 as any,
  goalAmount: 500000 as any,
  category: "DISASTER_RELIEF",
  organization: {
    name: "Disaster Relief India",
    description: "Rapid response organization providing emergency relief during natural disasters across India.",
    type: "NGO",
  },
  _count: {
    donations: 156,
  },
};

// Flag to enable/disable mock data
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true';
