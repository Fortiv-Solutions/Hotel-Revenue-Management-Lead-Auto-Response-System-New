# Project Memory: Fortiv Solutions Revenue Management

## Project Overview
A sophisticated hospitality revenue management system integrated with Supabase, featuring AI-driven lead tracking, pricing automation, and corporate account management.

## Current State
- **Supabase Integration**: Active and verified for all key tables (`bookings`, `leads`, `corporate_accounts`, `room_rates`).
- **Lead Inbox**: Fully functional with real-time database mapping and interactive details view.
- **Revenue Dashboard**: Premium visualizations implemented with live data fetching.

## Changelog

### 2026-03-30
- **Lead Inbox Enrichment**:
  - Ran SQL to add `channel`, `status`, `query_type`, `preview`, `ai_score`, and `location` to the `leads` table.
  - Implemented direct Supabase mapping in `LeadInbox.tsx`.
  - Added a functional "Details Panel" on the right side for depth of information.
  - Fixed a schema mismatch error where `raw_message_truncated` was a boolean instead of text.
- **Dashboard UI/UX Polishing**:
  - `DashboardHeader.tsx`: Implemented dynamic "Good morning/afternoon/evening" logic based on local time.
  - `DashboardHeader.tsx`: Removed the waving hand icon and wave emoji for a cleaner, business-centric look.
  - `RevenueSnapshot.tsx`: Replaced the static/thin BarChart with a premium `AreaChart` featuring a lush gradient.
  - **Schema Correction**: Fixed column mapping in `RevenueDashboard.tsx` and `RevenueSnapshot.tsx` (`total_amount_inr` and `check_in_date`).
- **Filter Optimization** (complete rewrite):
  - `DateRangePicker.tsx`: Clean preset hierarchy — **Today** → **This Week / Last Week** → **This Month / Last Month** → **Custom**.
  - Grouped presets with `DropdownMenuSeparator` dividers for visual clarity.
  - **Custom** opens a dual-month calendar supporting single-day and range selection.
  - Syncs initial range (This Week) on mount to prevent data mismatches.
- **Database Maintenance**:
  - Identified and documented the exact schema for `bookings` and `leads` to prevent future mapping errors.
  - Cleaned up diagnostic scripts from the root directory.

### 2026-03-29 (Summary from Previous Memory)
- **Pricing Engine**: Connected "Apply Increase" to Supabase with real-time toast feedback.
- **Corporate Accounts**: Implemented "Trigger Renewal Call" logic with database updates for `last_contacted`.
- **Infrastructure**: Verified Supabase project connection via `.env`.

## Ongoing Tasks
- [ ] Connect the "Notifications" button to a real `activity_log` table.
- [ ] Implement "Filter" logic for the Pricing Engine comparisons.
- [ ] Add "Export to Excel" functionality for the Revenue Dashboard.
