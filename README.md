# Product Requirements Document

## Product: CampusGuessr  
**Team:** Collaborative Coding Club @ CWRU  

---

# Phase 1: MVP (Single-Player)

### Objective
Deliver a single-player, anonymous-playable campus guessing game with 360° images. Focus on the core game loop with minimum dependencies.

### Features

#### Game Flow
- 5 rounds per game (configurable later).  
- Each round: show a 360° campus image → player drops a pin on the campus map → time-limited guess (default 30s–60s).  
- After guess: reveal actual location, draw line, show distance + per-round score.  
- After 5 rounds: total score summary.  

#### Scoring
- Distance-based scoring (GeoGuessr-style curve).  
- Tightened scale for campus (max distance ≈ 1–2 km).  
- Score range per round: 0–5000 points.  

#### Content
- Seed with ~50 campus 360° images (from existing resources).  
- Store image URLs in Supabase Storage; metadata (lat, lng, image id) in Postgres.  

#### Platform
- Web only (Next.js, React, Tailwind).  
- Anonymous play (no login).  

#### Deployment
- Hosting on Vercel + Supabase free tier.  

---

# Phase 2: Competitive & Social

### Objective
Introduce social play and personalization. Let students compete, track scores, and create custom games.

### Features

#### Authentication
- Supabase Auth with nicknames or email-based login.  
- Upgrade path to Case SSO if possible.  

#### Leaderboards
- Global leaderboard (top scores).  
- Time-based leaderboards (daily/weekly).  

#### Multiplayer
- Party leader sets rounds/time limit.  
- Players join via link.  
- Synchronous rounds: all players guess the same image per round.  
- Lobby chat (optional).  
- Session leaderboard after the game ends.  

#### Custom Games (Basic)
- Upload static photos with location tagging.  
- Private links for sharing with friends (no moderation).  

#### Game Customization
- Party leader can adjust:  
  - Number of rounds.  
  - Round timer.  

#### Engagement
- Share game invites and results via link.  

---

# Phase 3: Community Expansion

### Objective
Enable community-driven content and larger-scale events. Build features that let the game grow beyond the club.

### Features

#### Custom Game Builder
- Full UI for uploading images, tagging on map, setting difficulty.  
- Game code/link generation.  

#### Content Moderation
- Admin dashboard for reviewing and approving community uploads.  
- Flag/report functionality.  

#### Analytics
- Track active players, most-played locations, average score per round.  
- Export or dashboard for club organizers.  

#### Mobile-First Polish
- Optimize gestures for touch (drag pin, zoom).  
- Add PWA (installable app feel).  

#### Visual Polish
- Better transitions/animations.  
- Support for multiple map styles.  

---

# Phase 4: Future / Stretch Goals

### Objective
Go beyond campus, make the platform adaptable to other contexts.

### Features
- Multi-campus support (Case + other universities).  
- Public publishing of custom games.  
- Advanced moderation (AI face/license plate blurring).  
- 360° photo uploads via phone/cheap 360 cameras.  
- Gamification (achievements, ranks, streaks).  
- Monetization/hosting sponsorships if needed.  
- Create iOS/Android app.  

---

# Roadmap Timeline (Suggested)

- **Phase 1 (MVP, ~5 weeks):** Single-player, 5 rounds, campus dataset.  
- **Phase 2 (Weeks 6–12):** Leaderboards, multiplayer, basic custom uploads.  
- **Phase 3 (Following Semester):** Community builder, tournaments, moderation, analytics.  
- **Phase 4 (Future):** Multi-campus expansion + polish.  
