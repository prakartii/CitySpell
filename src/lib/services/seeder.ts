import { createIssue } from './issueService';
import {
  COLLECTIONS,
  createDocument,
  getDocuments,
  Timestamp,
  limit,
} from '../firebase/firestore';

export async function seedDemoData(userId: string) {
  try {
    const existing = await getDocuments(COLLECTIONS.ISSUES, [limit(3)]);
    if (existing.length > 2) {
      console.log('Database already seeded. Skipping.');
      return;
    }

    console.log('Seeding database with realistic civic data...');

    // 1. Seed Wards
    const wards = [
      { id: 'ward_14', name: 'Indiranagar', wardNumber: 14, city: 'Bengaluru', state: 'Karnataka', population: 45000, areaKm2: 4.2, healthScore: 82, healthTrend: 'stable', stats: { totalIssues: 24, openIssues: 3, resolvedIssues: 21, avgResolutionTimeDays: 1.8, citizenSatisfaction: 85 }, categoryBreakdown: { pothole: 12, streetlight: 6, garbage: 4, sewage: 2 }, councilor: { name: 'Srinivas Murthy', phone: '+91 98450 12345', email: 's.murthy@bbmp.gov.in' } },
      { id: 'ward_35', name: 'Whitefield', wardNumber: 35, city: 'Bengaluru', state: 'Karnataka', population: 85000, areaKm2: 8.5, healthScore: 38, healthTrend: 'declining', stats: { totalIssues: 89, openIssues: 42, resolvedIssues: 47, avgResolutionTimeDays: 7.2, citizenSatisfaction: 44 }, categoryBreakdown: { pothole: 45, streetlight: 12, garbage: 20, sewage: 12 }, councilor: { name: 'Mamatha Reddy', phone: '+91 98860 54321', email: 'm.reddy@bbmp.gov.in' } },
      { id: 'ward_22', name: 'Koramangala', wardNumber: 22, city: 'Bengaluru', state: 'Karnataka', population: 60000, areaKm2: 5.1, healthScore: 71, healthTrend: 'improving', stats: { totalIssues: 54, openIssues: 8, resolvedIssues: 46, avgResolutionTimeDays: 3.2, citizenSatisfaction: 76 }, categoryBreakdown: { pothole: 18, streetlight: 15, garbage: 14, sewage: 7 }, councilor: { name: 'Ramesh Rao', phone: '+91 94480 67890', email: 'r.rao@bbmp.gov.in' } },
    ];

    for (const w of wards) {
      const { id, ...rest } = w;
      await createDocument(COLLECTIONS.WARDS, rest as Record<string, unknown>, id);
    }

    // 2. Seed Departments
    const departments = [
      { id: 'PWD', name: 'Public Works Department', code: 'PWD', city: 'Bengaluru', handledCategories: ['pothole', 'road'], staffCount: 120, activeIssues: 28, resolvedThisMonth: 82, avgResolutionTimeDays: 4.5, performanceScore: 81, budget: { allocatedINR: 50000000, spentINR: 32000000 } },
      { id: 'BWSSB', name: 'Water Supply & Sewerage Board', code: 'BWSSB', city: 'Bengaluru', handledCategories: ['water', 'sewage'], staffCount: 95, activeIssues: 18, resolvedThisMonth: 44, avgResolutionTimeDays: 3.1, performanceScore: 78, budget: { allocatedINR: 40000000, spentINR: 28000000 } },
      { id: 'BESCOM', name: 'Electricity Supply Company', code: 'BESCOM', city: 'Bengaluru', handledCategories: ['streetlight'], staffCount: 70, activeIssues: 12, resolvedThisMonth: 65, avgResolutionTimeDays: 1.5, performanceScore: 88, budget: { allocatedINR: 25000000, spentINR: 18000000 } },
      { id: 'BBMP', name: 'Bruhat Bengaluru Mahanagara Palike', code: 'BBMP', city: 'Bengaluru', handledCategories: ['garbage', 'park', 'other'], staffCount: 250, activeIssues: 45, resolvedThisMonth: 140, avgResolutionTimeDays: 5.2, performanceScore: 70, budget: { allocatedINR: 80000000, spentINR: 58000000 } },
    ];

    for (const d of departments) {
      const { id, ...rest } = d;
      await createDocument(COLLECTIONS.DEPARTMENTS, rest as Record<string, unknown>, id);
    }

    // 3. Seed Issues
    const demoIssues = [
      {
        title: 'Major Pothole on Inner Ring Road',
        description: 'Large pothole causing vehicle damage and traffic flow disruption. Located near the main commercial intersection.',
        category: 'pothole', severity: 'high', status: 'open', ward: 'Indiranagar',
        createdBy: userId || 'anonymous', reportedBy: userId || 'anonymous',
        imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800'],
        location: { lat: 12.9716, lng: 77.5946, address: 'Inner Ring Road, Indiranagar, Bengaluru', wardId: 'ward_14', wardName: 'Indiranagar' },
        locationAddress: 'Inner Ring Road, Indiranagar, Bengaluru', department: 'PWD', votes: 14,
        comments: [{ id: 'c1', userId: 'auth_official', userName: 'PWD Supervisor', text: 'Work order #9284 dispatched to maintenance crew.', createdAt: new Date(Date.now() - 7200000) }],
        timeline: [{ status: 'Reported', note: 'Issue logged via AI vision pipeline.', updatedBy: 'system', timestamp: Timestamp.now() }],
        aiAnalysis: { confidence: 0.94, detectedCategory: 'pothole', severity: 'high', estimatedCost: 18000, priority: 8, boundingBoxes: [], processedAt: Timestamp.now() },
        economicImpact: { estimatedLossINR: 18000, affectedResidents: 1200 }, tags: ['pothole', 'road-damage', 'PWD'],
      },
      {
        title: 'Broken Streetlight Grid',
        description: 'A block of 4 streetlights are completely dark, causing safety hazards for pedestrians at night.',
        category: 'streetlight', severity: 'medium', status: 'assigned', ward: 'Koramangala',
        createdBy: userId || 'anonymous', reportedBy: userId || 'anonymous',
        imageUrl: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=800'],
        location: { lat: 12.9352, lng: 77.6244, address: '80 Feet Road, Koramangala, Bengaluru', wardId: 'ward_22', wardName: 'Koramangala' },
        locationAddress: '80 Feet Road, Koramangala, Bengaluru', department: 'BESCOM', votes: 8, comments: [],
        timeline: [
          { status: 'Reported', note: 'Issue logged via citizen report.', updatedBy: 'system', timestamp: Timestamp.now() },
          { status: 'Assigned', note: 'Dispatched automatically to BESCOM maintenance crew.', updatedBy: 'Router AI', timestamp: Timestamp.now() },
        ],
        aiAnalysis: { confidence: 0.95, detectedCategory: 'streetlight', severity: 'medium', estimatedCost: 5000, priority: 6, boundingBoxes: [], processedAt: Timestamp.now() },
        economicImpact: { estimatedLossINR: 5000, affectedResidents: 450 }, tags: ['streetlight', 'dark-spot', 'BESCOM'],
      },
      {
        title: 'Illegal Garbage Dump Accumulation',
        description: 'Massive pile of solid municipal waste dumped illegally on the pavement, generating bad smell and blocking the walkway.',
        category: 'garbage', severity: 'medium', status: 'in_progress', ward: 'Whitefield',
        createdBy: userId || 'anonymous', reportedBy: userId || 'anonymous',
        imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800'],
        location: { lat: 12.9698, lng: 77.7499, address: 'Whitefield Main Road, Bengaluru', wardId: 'ward_35', wardName: 'Whitefield' },
        locationAddress: 'Whitefield Main Road, Bengaluru', department: 'BBMP', votes: 22, comments: [],
        timeline: [
          { status: 'Reported', note: 'Waste accumulation flagged.', updatedBy: 'system', timestamp: Timestamp.now() },
          { status: 'Assigned', note: 'Dispatched to BBMP sanitation team.', updatedBy: 'Router AI', timestamp: Timestamp.now() },
          { status: 'In Progress', note: 'Sanitation vehicle deployed to clean up waste.', updatedBy: 'BBMP Dispatcher', timestamp: Timestamp.now() },
        ],
        aiAnalysis: { confidence: 0.92, detectedCategory: 'garbage', severity: 'medium', estimatedCost: 12000, priority: 7, boundingBoxes: [], processedAt: Timestamp.now() },
        economicImpact: { estimatedLossINR: 12000, affectedResidents: 2000 }, tags: ['garbage', 'pavement-block', 'BBMP'],
      },
      {
        title: 'Broken Drainage Sewage Leak',
        description: 'Toxic waste sewage leaking onto the main road from a fractured underground sanitation pipeline.',
        category: 'sewage', severity: 'critical', status: 'open', ward: 'Whitefield',
        createdBy: 'another_user_uid', reportedBy: 'another_user_uid',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800'],
        location: { lat: 12.9784, lng: 77.6408, address: 'Koramangala 4th Block, Bengaluru', wardId: 'ward_35', wardName: 'Whitefield' },
        locationAddress: 'Koramangala 4th Block, Bengaluru', department: 'BWSSB', votes: 35,
        comments: [{ id: 'c2', userId: 'officer_bwssb', userName: 'BWSSB Engineer', text: 'Emergency water isolation team dispatched to segment.', createdAt: new Date() }],
        timeline: [{ status: 'Reported', note: 'Sewage overflow detected. AI classified as Critical.', updatedBy: 'system', timestamp: Timestamp.now() }],
        aiAnalysis: { confidence: 0.96, detectedCategory: 'sewage', severity: 'critical', estimatedCost: 45000, priority: 9, boundingBoxes: [], processedAt: Timestamp.now() },
        economicImpact: { estimatedLossINR: 45000, affectedResidents: 3500 }, tags: ['sewage-leak', 'sanitation', 'BWSSB'],
      },
      {
        title: 'Large Paved Road Crack',
        description: 'Severe road structure cracks developing near the heavy vehicle flyover pass.',
        category: 'road', severity: 'critical', status: 'resolved', ward: 'Indiranagar',
        createdBy: userId || 'anonymous', reportedBy: userId || 'anonymous',
        imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800'],
        location: { lat: 12.9238, lng: 77.6833, address: 'Jayanagar 3rd Block, Bengaluru', wardId: 'ward_14', wardName: 'Indiranagar' },
        locationAddress: 'Jayanagar 3rd Block, Bengaluru', department: 'PWD', votes: 19, comments: [],
        timeline: [
          { status: 'Reported', note: 'Issue logged.', updatedBy: 'system', timestamp: Timestamp.now() },
          { status: 'Assigned', note: 'Dispatched to PWD concrete crew.', updatedBy: 'Router AI', timestamp: Timestamp.now() },
          { status: 'Resolved', note: 'Creep fractures filled with bitumastic sealant. Resolved successfully.', updatedBy: 'PWD Supervisor', timestamp: Timestamp.now() },
        ],
        aiAnalysis: { confidence: 0.91, detectedCategory: 'road', severity: 'critical', estimatedCost: 35000, priority: 9, boundingBoxes: [], processedAt: Timestamp.now() },
        economicImpact: { estimatedLossINR: 35000, affectedResidents: 1500 }, tags: ['road-crack', 'sealant', 'PWD'],
      },
    ];

    for (const issue of demoIssues) {
      await createIssue(issue);
    }

    // 4. Seed Notifications for the logged-in user
    if (userId && userId !== 'anonymous') {
      const sampleNotifications = [
        { userId, issueId: 'mock_issue_id_1', title: 'Work Commenced', message: 'Crew deployed on site to resolve your report: "Major Pothole on Inner Ring Road".', read: false },
        { userId, issueId: 'mock_issue_id_2', title: 'Issue Assigned to Dept', message: 'Your report "Broken Streetlight Grid" has been dispatched to BESCOM.', read: false },
        { userId, issueId: 'mock_issue_id_3', title: 'Issue Resolved!', message: 'Your report "Large Paved Road Crack" has been marked as Resolved. Thank you for making our city safer!', read: false },
      ];

      for (const n of sampleNotifications) {
        await createDocument(COLLECTIONS.NOTIFICATIONS, n as Record<string, unknown>);
      }
    }

    console.log('Demo seeding completed successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
