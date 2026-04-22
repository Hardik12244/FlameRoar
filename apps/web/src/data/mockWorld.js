/**
 * Mock world data — replace with API calls when backend exists.
 */

export const EVENT_CATEGORIES = ["All", "Tech", "Cultural", "Sports", "Career", "Workshop"];

export const COLLEGES = ["All colleges", "IIT Delhi", "BITS Pilani", "NIT Trichy", "IIIT Hyderabad"];

export const mockEvents = [
  {
    id: "ev-1",
    title: "Winter Hackathon 2026",
    org: "CodeSoc · IITD",
    college: "IIT Delhi",
    category: "Tech",
    date: "Jan 24–26",
    difficulty: "Intermediate",
    spots: 120,
    bookmarked: false,
    accent: "water",
    blurb: "36h build sprint with mentorship tracks in AI & systems.",
  },
  {
    id: "ev-2",
    title: "Inter-college Debate League",
    org: "Literary Guild",
    college: "BITS Pilani",
    category: "Cultural",
    date: "Feb 2",
    difficulty: "Open",
    spots: 40,
    bookmarked: true,
    accent: "sand",
    blurb: "Regional qualifiers — team of 3, impromptu rounds.",
  },
  {
    id: "ev-3",
    title: "Startup Pitch Arena",
    org: "E-Cell",
    college: "IIIT Hyderabad",
    category: "Career",
    date: "Feb 14",
    difficulty: "Advanced",
    spots: 25,
    bookmarked: false,
    accent: "brown",
    blurb: "VC office hours + ₹2L grant pool for top 5 teams.",
  },
  {
    id: "ev-4",
    title: "UX Design Jam",
    org: "Design Collective",
    college: "NIT Trichy",
    category: "Workshop",
    date: "Mar 1–2",
    difficulty: "Beginner",
    spots: 80,
    bookmarked: false,
    accent: "water",
    blurb: "Figma-first sprint with accessibility mentors on-site.",
  },
];

export const mockQuests = [
  {
    id: "q-1",
    title: "Google Summer of Code — prep sprint",
    type: "Internship pipeline",
    deadline: "Mar 15",
    reward: "Mentor match + checklist",
    tags: ["Open source", "Remote"],
    pinned: true,
  },
  {
    id: "q-2",
    title: "Smart India Hackathon 2026",
    type: "National competition",
    deadline: "Register by Apr 1",
    reward: "Certificates + incubation",
    tags: ["GovTech", "Team: 6"],
    pinned: true,
  },
  {
    id: "q-3",
    title: "Campus Ambassador — Fintech Co.",
    type: "Part-time",
    deadline: "Rolling",
    reward: "Stipend + swag",
    tags: ["Marketing", "Hybrid"],
    pinned: false,
  },
  {
    id: "q-4",
    title: "ML Research Residency (Summer)",
    type: "Research",
    deadline: "Feb 28",
    reward: "Publication support",
    tags: ["ML", "On-site"],
    pinned: false,
  },
];

export const mockCommunities = [
  { id: "c-1", name: "Robotics Guild", members: 420, tagline: "Build. Compete. Iterate.", accent: "sand" },
  { id: "c-2", name: "Open Source Circle", members: 890, tagline: "Patches welcome, always.", accent: "water" },
  { id: "c-3", name: "Film & Media", members: 210, tagline: "Fest reels & screenings.", accent: "brown" },
];

export const mockMentors = [
  {
    id: "m-1",
    name: "Ananya Rao",
    role: "Senior SWE · Payments",
    focus: "System design interviews",
    slots: "4 slots / week",
    calm: true,
  },
  {
    id: "m-2",
    name: "Rahul Verma",
    role: "Product @ Growth startup",
    focus: "PM case drills",
    slots: "2 slots / week",
    calm: true,
  },
  {
    id: "m-3",
    name: "Meera Shah",
    role: "Research · NLP",
    focus: "Paper reading + grad school",
    slots: "Waitlist",
    calm: true,
  },
];
