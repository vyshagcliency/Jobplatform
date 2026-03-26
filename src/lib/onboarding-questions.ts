export interface OnboardingSection {
  id: number;
  field: string;
  message: string;
  options: { label: string; value: string }[];
  selectMode: "single" | "multi";
  maxSelections?: number;
}

export const candidateSections: OnboardingSection[] = [
  {
    id: 0,
    field: "work_vibe",
    message:
      "Hey! Welcome aboard 🎉 Let's figure out your work vibe. What kinda place do you see yourself thriving in?",
    options: [
      { label: "Structured corporate", value: "structured_corporate" },
      { label: "Startup chaos", value: "startup_chaos" },
      { label: "Creative + flexible", value: "creative_flexible" },
      { label: "I'm open to anything", value: "open" },
    ],
    selectMode: "single",
  },
  {
    id: 1,
    field: "role_intent",
    message:
      "Cool! So what brings you here — what are you actually looking for right now?",
    options: [
      { label: "Internship", value: "internship" },
      { label: "Full-time role", value: "full_time" },
      { label: "Freelance gig", value: "freelance" },
      { label: "Just exploring", value: "exploring" },
    ],
    selectMode: "single",
  },
  {
    id: 2,
    field: "skill_identity",
    message:
      "If someone handed you a laptop and said 'do your thing for 7 days' — what would you build or do?",
    options: [
      { label: "Write code", value: "code" },
      { label: "Design stuff", value: "design" },
      { label: "Sell something", value: "sell" },
      { label: "Analyze data", value: "analyze" },
      { label: "Manage a project", value: "manage" },
      { label: "Still figuring it out", value: "figuring_out" },
    ],
    selectMode: "single",
  },
  {
    id: 3,
    field: "job_preference",
    message: "How do you wanna work? Pick your style.",
    options: [
      { label: "Remote", value: "remote" },
      { label: "In-office", value: "in_office" },
      { label: "Hybrid", value: "hybrid" },
      { label: "Doesn't matter", value: "any" },
    ],
    selectMode: "single",
  },
  {
    id: 4,
    field: "strengths",
    message:
      "Pick 2 things you'd genuinely say you're good at. Be honest, no wrong answers!",
    options: [
      { label: "Fast learner", value: "fast_learner" },
      { label: "Strong communicator", value: "strong_comms" },
      { label: "Technical skills", value: "technical" },
      { label: "Leadership", value: "leadership" },
      { label: "Creative thinking", value: "creative" },
      { label: "Hardworking", value: "hardworking" },
    ],
    selectMode: "multi",
    maxSelections: 2,
  },
  {
    id: 5,
    field: "dealbreakers",
    message:
      "What should we NOT show you? Pick the stuff that's a dealbreaker.",
    options: [
      { label: "Unpaid internships", value: "unpaid" },
      { label: "Sales roles", value: "sales" },
      { label: "Too corporate", value: "corporate" },
      { label: "Too competitive", value: "competitive" },
      { label: "Unrelated roles", value: "unrelated" },
    ],
    selectMode: "multi",
  },
  {
    id: 6,
    field: "availability",
    message: "When can you actually start working?",
    options: [
      { label: "Immediately", value: "immediately" },
      { label: "In 1 month", value: "1_month" },
      { label: "In 3 months", value: "3_months" },
      { label: "Just browsing", value: "browsing" },
    ],
    selectMode: "single",
  },
];

export const employerSections: OnboardingSection[] = [
  {
    id: 0,
    field: "fresher_type",
    message:
      "Hey there! Let's figure out what kind of fresher would be perfect for you. What type are you looking for?",
    options: [
      { label: "Hungry learner", value: "hungry_learner" },
      { label: "Job-ready pro", value: "job_ready" },
      { label: "Creative builder", value: "creative_builder" },
      { label: "Dependable executor", value: "dependable" },
      { label: "Just someone solid", value: "someone_solid" },
    ],
    selectMode: "single",
  },
  {
    id: 1,
    field: "hiring_intent",
    message: "What are you hiring for right now?",
    options: [
      { label: "Internship", value: "internship" },
      { label: "Full-time", value: "full_time" },
      { label: "Freelance", value: "freelance" },
      { label: "Bulk hiring", value: "bulk" },
      { label: "Just exploring", value: "exploring" },
    ],
    selectMode: "single",
  },
  {
    id: 2,
    field: "company_context",
    message: "Tell us about your company. What stage are you at?",
    options: [
      { label: "Early-stage startup", value: "early_startup" },
      { label: "Growing business", value: "growing" },
      { label: "Corporate", value: "corporate" },
      { label: "Agency", value: "agency" },
      { label: "Non-profit", value: "nonprofit" },
    ],
    selectMode: "single",
  },
  {
    id: 3,
    field: "role_category",
    message: "What kind of role are you hiring for?",
    options: [
      { label: "Tech", value: "tech" },
      { label: "Marketing", value: "marketing" },
      { label: "Sales", value: "sales" },
      { label: "Design", value: "design" },
      { label: "Data", value: "data" },
      { label: "Operations", value: "operations" },
      { label: "Product", value: "product" },
      { label: "Other", value: "other" },
    ],
    selectMode: "single",
  },
  {
    id: 4,
    field: "top_skills",
    message: "Pick the top 3 skills you're looking for in candidates.",
    options: [
      { label: "Python", value: "python" },
      { label: "Java", value: "java" },
      { label: "Web Dev", value: "web_dev" },
      { label: "UI/UX Design", value: "ui_ux" },
      { label: "Content Writing", value: "content" },
      { label: "Marketing", value: "marketing" },
      { label: "Sales", value: "sales" },
      { label: "Data Analysis", value: "data" },
      { label: "Operations", value: "operations" },
      { label: "Product Thinking", value: "product" },
      { label: "Communication", value: "communication" },
    ],
    selectMode: "multi",
    maxSelections: 3,
  },
  {
    id: 5,
    field: "hiring_philosophy",
    message:
      "What matters most to you when hiring? Pick the one that resonates.",
    options: [
      { label: "Skills > College name", value: "skills_over_college" },
      { label: "Attitude > Experience", value: "attitude_over_exp" },
      { label: "Communication first", value: "communication" },
      { label: "Speed of execution", value: "speed" },
      { label: "Loyalty & commitment", value: "loyalty" },
    ],
    selectMode: "single",
  },
  {
    id: 6,
    field: "candidate_type_pref",
    message: "What kind of candidate would thrive in your team?",
    options: [
      { label: "Needs mentorship", value: "needs_mentorship" },
      { label: "Independent worker", value: "independent" },
      { label: "Fast learner", value: "fast_learner" },
      { label: "Structured thinker", value: "structured" },
      { label: "Creative mind", value: "creative" },
    ],
    selectMode: "single",
  },
  {
    id: 7,
    field: "work_style",
    message: "How does your team work?",
    options: [
      { label: "Remote", value: "remote" },
      { label: "In-office", value: "in_office" },
      { label: "Hybrid", value: "hybrid" },
      { label: "Flexible", value: "flexible" },
    ],
    selectMode: "single",
  },
  {
    id: 8,
    field: "compensation_type",
    message:
      "How do you compensate? (Quick note: unpaid roles aren't allowed on Culture Hires!)",
    options: [
      { label: "Monthly stipend", value: "stipend" },
      { label: "CTC package", value: "ctc" },
      { label: "Freelance payout", value: "freelance" },
      { label: "Performance + base", value: "performance_base" },
    ],
    selectMode: "single",
  },
];
