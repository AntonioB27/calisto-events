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
  videoCount: number;
};

export const DEMO_GUESTS: DemoGuest[] = [
  { id: "g1",  name: "Marco T.",     role: "organizer",    photoCount: 5,  videoCount: 0 },
  { id: "g2",  name: "Ana P.",       role: "organizer",    photoCount: 8,  videoCount: 0 },
  { id: "g3",  name: "Elena M.",     role: "co_organizer", photoCount: 3,  videoCount: 0 },
  { id: "g4",  name: "Sofia R.",     role: "guest",        photoCount: 12, videoCount: 0 },
  { id: "g5",  name: "Luca B.",      role: "guest",        photoCount: 7,  videoCount: 0 },
  { id: "g6",  name: "Bruno A.",     role: "guest",        photoCount: 4,  videoCount: 0 },
  { id: "g7",  name: "Chiara V.",    role: "guest",        photoCount: 6,  videoCount: 0 },
  { id: "g8",  name: "Diego F.",     role: "guest",        photoCount: 2,  videoCount: 0 },
  { id: "g9",  name: "Mia C.",       role: "guest",        photoCount: 9,  videoCount: 0 },
  { id: "g10", name: "Giulia S.",    role: "guest",        photoCount: 11, videoCount: 0 },
  { id: "g11", name: "Matteo R.",    role: "guest",        photoCount: 3,  videoCount: 0 },
  { id: "g12", name: "Valentina F.", role: "guest",        photoCount: 8,  videoCount: 0 },
  { id: "g13", name: "Lorenzo C.",   role: "guest",        photoCount: 5,  videoCount: 0 },
  { id: "g14", name: "Beatrice N.",  role: "guest",        photoCount: 14, videoCount: 0 },
  { id: "g15", name: "Riccardo D.",  role: "guest",        photoCount: 1,  videoCount: 0 },
  { id: "g16", name: "Sara L.",      role: "guest",        photoCount: 6,  videoCount: 0 },
  { id: "g17", name: "Tommaso G.",   role: "guest",        photoCount: 0,  videoCount: 0 },
];

export type DemoPhoto = {
  src: string;
  uploadedBy: string;
};

export const DEMO_PHOTOS: DemoPhoto[] = [
  { src: "/demo/photo-01.png", uploadedBy: "Sofia R."     },
  { src: "/demo/photo-02.png", uploadedBy: "Luca B."      },
  { src: "/demo/photo-03.png", uploadedBy: "Elena M."     },
  { src: "/demo/photo-04.png", uploadedBy: "Marco T."     },
  { src: "/demo/photo-05.png", uploadedBy: "Ana P."       },
  { src: "/demo/photo-06.png", uploadedBy: "Bruno A."     },
  { src: "/demo/photo-07.png", uploadedBy: "Chiara V."    },
  { src: "/demo/photo-08.png", uploadedBy: "Diego F."     },
  { src: "/demo/photo-09.png", uploadedBy: "Mia C."       },
  { src: "/demo/photo-10.png", uploadedBy: "Sofia R."     },
  { src: "/demo/photo-11.png", uploadedBy: "Luca B."      },
  { src: "/demo/photo-12.png", uploadedBy: "Ana P."       },
  { src: "/demo/photo-13.png", uploadedBy: "Chiara V."    },
  { src: "/demo/photo-14.png", uploadedBy: "Diego F."     },
  { src: "/demo/photo-15.png", uploadedBy: "Mia C."       },
  { src: "/demo/photo-16.png", uploadedBy: "Marco T."     },
  { src: "/demo/photo-17.png", uploadedBy: "Giulia S."    },
  { src: "/demo/photo-18.png", uploadedBy: "Giulia S."    },
  { src: "/demo/photo-19.png", uploadedBy: "Matteo R."    },
  { src: "/demo/photo-20.png", uploadedBy: "Matteo R."    },
  { src: "/demo/photo-21.png", uploadedBy: "Valentina F." },
  { src: "/demo/photo-22.png", uploadedBy: "Valentina F." },
  { src: "/demo/photo-23.png", uploadedBy: "Lorenzo C."   },
  { src: "/demo/photo-24.png", uploadedBy: "Lorenzo C."   },
  { src: "/demo/photo-25.png", uploadedBy: "Beatrice N."  },
  { src: "/demo/photo-26.png", uploadedBy: "Beatrice N."  },
  { src: "/demo/photo-27.png", uploadedBy: "Giulia S."    },
  { src: "/demo/photo-28.jpg", uploadedBy: "Marco T."     },
  { src: "/demo/photo-29.jpg", uploadedBy: "Ana P."       },
  { src: "/demo/photo-30.jpg", uploadedBy: "Chiara V."    },
  { src: "/demo/photo-31.jpg", uploadedBy: "Mia C."       },
  { src: "/demo/photo-32.jpg", uploadedBy: "Elena M."     },
  { src: "/demo/photo-33.jpg", uploadedBy: "Sofia R."     },
];
