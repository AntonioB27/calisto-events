import type { PlanId } from "@/lib/plan-limits";

export const DEMO_EVENT: {
  id: string;
  name: string;
  emoji: string;
  date: string;
  accessCode: string;
  plan: PlanId;
} = {
  id: "demo",
  name: "Ana & Marco's Wedding",
  emoji: "💍",
  date: "2025-06-14",
  accessCode: "DEMO00",
  plan: "premium",
};

export type DemoGuest = {
  id: string;
  name: string;
  role: "organizer" | "guest" | "co_organizer";
  photoCount: number;
};

export const DEMO_GUESTS: DemoGuest[] = [
  { id: "g1", name: "Marco T.",   role: "organizer",    photoCount: 5  },
  { id: "g2", name: "Ana P.",     role: "organizer",    photoCount: 8  },
  { id: "g3", name: "Elena M.",   role: "co_organizer", photoCount: 3  },
  { id: "g4", name: "Sofia R.",   role: "guest",        photoCount: 12 },
  { id: "g5", name: "Luca B.",    role: "guest",        photoCount: 7  },
  { id: "g6", name: "Bruno A.",   role: "guest",        photoCount: 4  },
  { id: "g7", name: "Chiara V.",  role: "guest",        photoCount: 6  },
  { id: "g8", name: "Diego F.",   role: "guest",        photoCount: 2  },
  { id: "g9", name: "Mia C.",     role: "guest",        photoCount: 9  },
];

export type DemoPhoto = {
  src: string;
  uploadedBy: string;
};

export const DEMO_PHOTOS: DemoPhoto[] = [
  { src: "/demo/photo-01.jpg", uploadedBy: "Sofia R."  },
  { src: "/demo/photo-02.jpg", uploadedBy: "Luca B."   },
  { src: "/demo/photo-03.jpg", uploadedBy: "Elena M."  },
  { src: "/demo/photo-04.jpg", uploadedBy: "Marco T."  },
  { src: "/demo/photo-05.jpg", uploadedBy: "Ana P."    },
  { src: "/demo/photo-06.jpg", uploadedBy: "Bruno A."  },
  { src: "/demo/photo-07.jpg", uploadedBy: "Chiara V." },
  { src: "/demo/photo-08.jpg", uploadedBy: "Diego F."  },
  { src: "/demo/photo-09.jpg", uploadedBy: "Mia C."    },
  { src: "/demo/photo-10.jpg", uploadedBy: "Sofia R."  },
  { src: "/demo/photo-11.jpg", uploadedBy: "Luca B."   },
  { src: "/demo/photo-12.jpg", uploadedBy: "Ana P."    },
];
