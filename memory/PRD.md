# Multi-Profile Founder Outreach Manager - PRD

## Original Problem Statement
I run founder outreach using 20 different Facebook profiles. I contact the same founder multiple times from different profiles, but at random times, not simultaneously. The main problems: I can't remember which founder was contacted, from which Facebook profile, message status tracking, and template reuse with personalization.

## Architecture & Tech Stack
- **Frontend**: React 19 with Shadcn UI, Tailwind CSS, React Router
- **Backend**: FastAPI (Python) with async SQLAlchemy
- **Database**: Supabase PostgreSQL (via Transaction Pooler)
- **State Management**: React hooks (useState, useEffect)

## User Personas
- **Primary**: Solo founder/marketer doing manual outreach campaigns across multiple FB profiles

## Core Requirements (Static)
1. Track which founder was contacted from which FB profile
2. Manage message status (Generated, Sent, Replied, Closed, Giveaway Running)
3. Generate personalized messages from templates with placeholders
4. CRUD operations for Tools, Founders, FB Profiles, Templates
5. Dashboard with stats and filtering

## What's Been Implemented (Jan 5, 2026)

### Backend
- [x] Supabase PostgreSQL database with Alembic migrations
- [x] 5 database tables: Tools, Founders, FacebookProfiles, Templates, OutreachRecords
- [x] Full CRUD API endpoints for all entities
- [x] Message generation with placeholder replacement ({founder_name}, {tool_name}, {tool_description})
- [x] Dashboard stats endpoint (total founders, messages sent, replies, reply rate)
- [x] Filtering support on outreach records

### Frontend
- [x] Responsive sidebar navigation
- [x] Dashboard with KPI cards and outreach records table
- [x] Tools management page (grid cards with CRUD)
- [x] Founders management page (table with tool linking)
- [x] FB Profiles management page (with template linking)
- [x] Templates management page (with placeholder insertion buttons)
- [x] Message Generator modal
- [x] Status management with color-coded badges
- [x] Filter dropdowns on dashboard
- [x] Toast notifications via Sonner

## Database Schema
```
Tools: id, tool_name, tool_description, website_url
Founders: id, founder_name, social_profile_url, tool_id (FK)
FacebookProfiles: id, profile_name, template_id (FK)
Templates: id, template_name, template_content
OutreachRecords: id, founder_id, tool_id, fb_profile_id, template_id, generated_message, status, timestamps
```

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Full CRUD for all entities
- [x] Message generation flow
- [x] Status tracking

### P1 (Important)
- [ ] Bulk import founders via CSV
- [ ] Search functionality across entities
- [ ] Outreach history per founder
- [ ] View generated message in records table

### P2 (Nice to Have)
- [ ] Export outreach records to CSV
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Duplicate template feature

## Next Tasks
1. Add CSV import for bulk founder creation
2. Implement search across all entities
3. Add view/copy message functionality in outreach records
4. Analytics dashboard with charts
