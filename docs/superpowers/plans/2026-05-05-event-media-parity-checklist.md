# Event Media Web Parity Checklist

- [ ] Organizer can authenticate and access dashboard (`/auth/login`, `/dashboard`)
- [ ] Organizer can create event with plan selection (`/events/new?step=1..3`)
- [ ] Organizer can view event admin tabs (`/events/:id?tab=overview|guests|gallery|share`)
- [ ] Guest can join by access code (`/join/:accessCode`)
- [ ] Guest can upload media when eligible (upload window open)
- [ ] Upload is blocked when quota is reached (`POST /api/events/:id/guest-upload` => 403 `QUOTA_REACHED`)
- [ ] Upload is blocked when upload window is closed (`POST /api/events/:id/guest-upload` => 403 `UPLOADS_CLOSED`)

