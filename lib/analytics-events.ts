export const ANALYTICS_EVENTS = {
  CREATE_STEP1_VIEWED:    "create_event_step1_viewed",
  CREATE_STEP1_COMPLETED: "create_event_step1_completed",
  CREATE_STEP2_VIEWED:    "create_event_step2_viewed",
  CREATE_STEP2_COMPLETED: "create_event_step2_completed",
  CREATE_STEP3_VIEWED:    "create_event_step3_viewed",
  CREATE_STEP3_COMPLETED: "create_event_step3_completed",
  CREATE_COMPLETED:       "create_event_completed",

  USER_LOGGED_IN:         "user_logged_in",
  USER_REGISTERED:        "user_registered",
  USER_OAUTH_STARTED:     "user_oauth_started",

  GUEST_CODE_SUBMITTED:   "guest_code_submitted",
  GUEST_JOINED_EVENT:     "guest_joined_event",
  GUEST_MEDIA_UPLOADED:   "guest_media_uploaded",

  ORGANIZER_INVITE_SHARED: "organizer_invite_shared",
  ORGANIZER_CODE_COPIED:   "organizer_code_copied",
} as const;

export const ANALYTICS_SERVER_EVENTS = {
  SERVER_EVENT_CREATED: "server_event_created",
} as const;
