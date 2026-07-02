# KROA Studio MVP Gap Review and Filled Scope

Source reviewed: `KROA_Studio_Minimum_Viable_Product_(MVP).pdf`, Version 1.0, July 2026.

## Executive Gap Summary

The MVP document has a strong product direction: distribution, royalty clarity, split payments, and AI release support. The main gap is that it reads like a strategic spec, not yet like an executable product brief. The missing layer is operational definition: what the first build should do without live DSP, Stripe, Supabase, OpenAI, and aggregator contracts already in place.

This filled scope treats the first build as a clickable product foundation: validate the artist journey, capture waitlist demand, prove the release intake workflow, and encode business rules before connecting paid services.

## Critical Gaps Found

1. No launchable first increment
   The document says the MVP takes 16 weeks, but it does not define what should exist in week 1 or week 2 beyond a waitlist. Filled decision: ship a browser-based prototype with waitlist, onboarding cues, release intake, metadata validation, splits, finance snapshot, and AI release drafting.

2. No contract-ready aggregator abstraction
   The spec names FUGA, Sonosuite, or DistroScale, but does not define what KROA sends to them. Filled decision: create a normalized internal release object first: artist, release, tracks, territories, DSPs, dates, assets, validation result, and split ledger.

3. AI validation is underspecified
   The spec lists checks but not pass/fail thresholds. Filled decision: classify checks as error, warning, or pass. Errors block submission; warnings require acknowledgement later.

4. Release scheduling has no timezone or business-day rule
   The document says minimum 7 days in advance. Filled decision: enforce calendar days in the artist's local timezone for prototype; production should move to business-day and DSP-specific cutoffs.

5. Cover-art generation and validation are blended together
   The spec says generated art can be used directly, but production still needs dimension, format, moderation, and rights copy. Filled decision: the intake flow validates uploaded artwork separately from future generation.

6. Payout compliance is too light for real launch
   Stripe Connect helps, but the product still needs KYC states, payout holds, failed transfer handling, collaborator acceptance, dispute evidence, tax document logic, and currency conversion records. Filled decision: prototype shows confirmed balance, threshold, and split allocation; production ledger must be immutable and auditable.

7. Analytics data sources are optimistic
   Spotify for Artists and Apple Music reporting APIs are not generally open in the way the spec implies. Filled decision: treat analytics as imported distributor reports first, with DSP APIs as later enhancements.

8. Pricing logic conflicts with expected costs
   Unlimited AI Release Assistant usage on a $19.99/year plan risks gross-margin problems. Filled decision: define "unlimited" as fair-use capped in production; prototype exposes usage limits by tier.

9. The database schema needs legal and operational entities
   Missing: invitations, ledger entries, validation results, territories, DSP deliveries, payout accounts, tax profiles, usage quotas, audit events. Filled decision: document them as Phase 1 production extensions before backend build.

10. Success metrics lack instrumentation plan
   KPIs are listed but not mapped to events. Filled decision: start with events for waitlist signup, profile completion, release draft created, validation completed, split added, AI draft generated, and submit intent.

## Filled First Build Scope

### Build Now

- Waitlist capture with early-access positioning.
- Artist profile snapshot.
- Release intake for Single and EP.
- Metadata validator with errors and warnings.
- Artwork and audio file checks in the browser where possible.
- DSP selection and territory mode.
- Release date readiness rule.
- Royalty split calculator.
- Finance summary with payout threshold.
- Starter AI Release Assistant drafts generated from the user's release details.

### Stub for Later Integration

- Distributor submission.
- Stripe Connect onboarding and payouts.
- OpenAI text and image generation.
- Supabase Auth and database persistence.
- S3 or R2 asset storage.
- Email invitations and receipts.
- Real DSP analytics imports.

## Product Rules Added

- Release date must be at least 7 calendar days from today.
- Release type supports Single and EP only.
- Album is disabled until Phase 2.
- Release title cannot be blank, all caps, or include suspicious spacing.
- ISRC is optional, but if present must match `CCXXXYYNNNNN` style.
- Artwork should be JPG or PNG and at least 3000 by 3000 pixels.
- Audio should be WAV, FLAC, or MP3.
- MP3 files should be treated as warnings unless bitrate can be verified.
- Splits must total exactly 100% before a real payout can be configured.
- Confirmed royalty withdrawals require at least $25 available.

## Recommended Next Engineering Order

1. Keep validating the prototype with artists.
2. Add a real Next.js or comparable app shell once the interaction model feels right.
3. Implement auth, profile, release drafts, and validation persistence.
4. Add storage and distributor payload export before live aggregator integration.
5. Add Stripe Connect only after the ledger model is finalized.
6. Add OpenAI once quotas, caching, moderation, and cost controls are defined.

