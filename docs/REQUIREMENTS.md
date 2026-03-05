# Complimentary Giveaway Tracking System — MVP Scope (POC)

## 1) MVP Goal

Build a small system to **track complimentary item distribution** (e.g., posters, keychains) to customers who purchase movie tickets, with two main parts:

1. **Back Office** for managing giveaway items and stock by cinema branch
2. **Front Office (Counter App)** for scanning movie tickets (QR code) and issuing giveaways

### MVP Objectives
The MVP should prove that the system can:

- Track giveaway issuance at the counter
- Deduct stock correctly by branch
- Prevent (or flag) duplicate claims
- Keep a basic audit trail (who issued what, when, for which ticket)

---

## 2) Product Scope Overview

### In Scope (MVP)
- Giveaway item master data
- Cinema branch master data
- Staff login (basic)
- Branch-level stock management
- Simple campaign/rule setup (movie → giveaway item)
- Ticket QR scan (or manual fallback input)
- Eligibility validation
- Giveaway issuance transaction
- Duplicate claim prevention
- Issuance log / audit trail

### Out of Scope (Later)
- Advanced role permissions (full RBAC matrix)
- Complex campaign mechanics (tier/member/spend/seat rules)
- Warehouse transfer workflows with approvals
- Offline mode and sync
- ERP/POS/ticketing deep integration (beyond simple validation)
- Advanced dashboards / analytics
- Customer profile / CRM integration

---

## 3) User Roles (MVP)

## 3.1 Admin / Back Office User
Can:
- Manage giveaway items
- Manage cinema branches
- Add/adjust stock per branch
- Configure giveaway campaigns/rules
- View issuance logs and stock balances

## 3.2 Counter Staff / Front Office User
Can:
- Login
- Scan ticket QR code (or input ticket number manually)
- View eligibility result
- Confirm giveaway issuance
- View recent issuance history (optional)

---

## 4) Core Modules (MVP)

## 4.1 Back Office — Master Data Management

### 4.1.1 Giveaway Item Management
Manage complimentary items such as posters, keychains, etc.

#### Fields (minimum)
- `item_code`
- `item_name`
- `item_type` (optional: poster, keychain, etc.)
- `is_active`

#### Features
- Create item
- Edit item
- Deactivate item
- List/search items

### 4.1.2 Cinema Branch Management
Manage branches that hold and distribute giveaway stock.

#### Fields (minimum)
- `branch_code`
- `branch_name`
- `is_active`

#### Features
- Create branch
- Edit branch
- Deactivate branch
- List/search branches

### 4.1.3 Staff User Management (Basic)
Manage back office and counter users.

#### Fields (minimum)
- `username`
- `password` (hashed)
- `display_name`
- `role` (`ADMIN`, `COUNTER`)
- `assigned_branch_id` (for counter staff)
- `is_active`

#### Features
- Create/edit/deactivate user
- Assign role
- Assign branch (for counter staff)

---

## 4.2 Back Office — Stock Management by Branch

Track stock of complimentary items in each cinema branch.

### Features (MVP)
- View stock balance by branch and item
- Add stock (stock-in)
- Manual adjustment (+/-)
- View stock transaction history (ledger)
- Auto-deduct stock when giveaway is issued in front office

### Minimum Validations
- Cannot issue giveaway if stock is insufficient
- Every stock movement must be logged with:
  - user
  - timestamp
  - branch
  - item
  - quantity change
  - reason / reference

### Stock Transaction Types (Suggested)
- `OPENING_BALANCE`
- `STOCK_IN`
- `ADJUSTMENT_PLUS`
- `ADJUSTMENT_MINUS`
- `ISSUE_GIVEAWAY`

---

## 4.3 Back Office — Giveaway Campaign / Rule Setup (Simple)

Define which giveaway item is eligible for which movie during a date range.

### MVP Rule Model (Simple)
**If ticket movie = X and current date/time is within campaign period, then eligible for item Y with qty N**

### Features (MVP)
- Create campaign
- Edit campaign
- Activate/deactivate campaign
- Assign applicable branches
- Assign movie(s)
- Assign giveaway item and qty per ticket
- Define claim policy (default: one claim per ticket per campaign)

### Campaign Fields (minimum)
- `campaign_name`
- `start_datetime`
- `end_datetime`
- `is_active`

### Campaign Rule Fields (minimum)
- `movie_code` or `movie_title`
- `giveaway_item_id`
- `qty_per_ticket` (default `1`)
- `claim_limit_type` (default `ONE_PER_TICKET_PER_CAMPAIGN`)

### Excluded from MVP
- Spend thresholds
- Member tier rules
- Seat type rules
- "Choose 1 of many gifts"
- Daily quotas / caps
- Multi-condition promotion engines

---

## 4.4 Front Office — Ticket Validation & Giveaway Issuance

This is the primary counter workflow.

### Features (MVP)
- Staff login
- Branch context (auto from assigned branch or selected)
- Scan ticket QR code
- Parse ticket data (or store raw QR payload and validate via integration/mock)
- Eligibility check
- Display eligible giveaway item(s)
- Show current branch stock availability
- Confirm issuance
- Save issuance transaction
- Deduct stock
- Prevent duplicate claim
- Show success/failure status clearly

### Ticket Input Modes (MVP)
1. **QR Scan** (preferred)
2. **Manual Ticket Number Input** (fallback; important for POC)

### Eligibility Checks (MVP)
System checks:
- Ticket payload is readable / valid format (or accepted raw format)
- Matching active campaign exists
- Ticket movie matches campaign rule
- Current datetime is within campaign period
- Ticket not already claimed (based on claim policy)
- Stock available at current branch

### Possible Validation Results
- `ELIGIBLE`
- `NO_ACTIVE_CAMPAIGN`
- `ALREADY_CLAIMED`
- `OUT_OF_STOCK`
- `INVALID_TICKET`
- `BRANCH_NOT_ELIGIBLE`
- `SYSTEM_ERROR`

### Issuance Confirmation Result (Success)
Should display at least:
- Ticket reference
- Movie
- Issued item and qty
- Branch
- Counter staff name
- Timestamp
- Transaction ID

---

## 4.5 Back Office — Issuance Log / Audit Trail

Provide operational visibility and traceability.

### Features (MVP)
- View issuance transactions
- Filter by:
  - date range
  - branch
  - item
  - movie
  - ticket reference
  - staff user
- View transaction details
- Optional CSV export (high value, small effort)

### Issuance Log Fields (minimum)
- `transaction_id`
- `issued_at`
- `branch`
- `staff_user`
- `ticket_ref`
- `movie`
- `campaign`
- `item`
- `qty`
- `status`
- `qr_payload_raw` (optional for debugging/audit)

---

## 5) Key User Flows (MVP)

## 5.1 Setup Campaign Before Distribution Starts
1. Admin creates giveaway item (e.g., `Poster A`)
2. Admin creates/ensures branch exists (e.g., `Cinema Branch A`)
3. Admin adds stock to branch (`+500 Poster A`)
4. Admin creates campaign:
   - Movie X
   - Date range
   - Branch A
   - Giveaway = Poster A
   - Qty = 1 per ticket

**Result:** Counter staff can start issuing giveaways

---

## 5.2 Counter Staff Issues Giveaway (Happy Path)
1. Counter staff logs in
2. Counter staff scans ticket QR
3. System validates ticket and checks campaign
4. System displays eligible giveaway and available stock
5. Counter staff confirms issuance
6. System records issuance transaction
7. System deducts stock
8. System marks ticket as claimed (per policy)
9. System shows success message

---

## 5.3 Duplicate Claim Attempt
1. Counter staff scans the same ticket again
2. System finds an existing claim record for the same campaign
3. System blocks issuance (or flags duplicate)
4. System shows reason: `ALREADY_CLAIMED`

---

## 5.4 Out of Stock
1. Counter staff scans eligible ticket
2. System finds campaign but stock balance is insufficient
3. System blocks issuance
4. System shows reason: `OUT_OF_STOCK`

---

## 6) MVP Functional Requirements (Structured)

## 6.1 Authentication (Basic)
- Staff must log in before using the system
- Sessions may be simple (JWT or server session)
- Password reset flow can be skipped for POC (admin can reset manually)

## 6.2 Branch Context
- Counter staff should operate within a branch context
- Branch may be:
  - fixed via assigned user branch, or
  - selected at login (if staff move between counters/branches)

## 6.3 Ticket QR Handling
- System accepts QR scan input from camera or scanner device
- System stores raw QR payload for audit/debugging
- System attempts to parse ticket reference and movie/showtime if format is known
- Manual fallback input must be supported for POC continuity

## 6.4 Giveaway Eligibility Engine (Simple)
- Given a ticket and current branch, system determines if any active campaign matches
- If matched, returns eligible item and quantity
- Enforces one-claim policy

## 6.5 Giveaway Issuance Transaction
Issuance operation must be **atomic**:
- Validate eligibility
- Check stock
- Insert issuance record
- Insert claim record
- Deduct stock (or insert stock ledger + update balance)
- Commit transaction

If any step fails, rollback all changes.

## 6.6 Duplicate Prevention
- Duplicate check key (suggested for MVP):
  - `ticket_ref + campaign_id`
- Unique constraint recommended to prevent race conditions

## 6.7 Stock Integrity
- Stock cannot go below zero (unless admin adjustment explicitly allows negative; not recommended for MVP)
- Issuance always creates corresponding stock movement

## 6.8 Auditability
Every critical action should record:
- user
- timestamp
- branch
- action type
- reference IDs

---

## 7) MVP Non-Functional Requirements (POC-Level)

## 7.1 Performance
- Ticket scan → eligibility result: target `< 2 seconds`
- Confirm issuance → success result: target `< 2 seconds` (normal network)

## 7.2 Usability
- Counter UI should have large buttons and clear status colors
- Minimal typing required
- Clear reason messages for failures (duplicate / no stock / invalid ticket)

## 7.3 Security (MVP Level)
- Staff login required
- HTTPS required
- Store passwords hashed
- Log user actions for audit
- Avoid storing unnecessary customer PII

## 7.4 Reliability
- Issuance and stock deduction must be transactional
- Prevent double-submit on confirm button (disable button during submit / idempotency key)

---

## 8) Suggested Data Model (High-Level Entities)

> This is a high-level schema list for MVP planning. Exact field names/types can be refined during implementation.

### 8.1 `users`
Stores admin and counter staff accounts.

### 8.2 `branches`
Stores cinema branches.

### 8.3 `giveaway_items`
Stores complimentary items (poster, keychain, etc.).

### 8.4 `branch_item_stocks`
Stores current stock balance per branch per item (fast lookup).

### 8.5 `stock_transactions`
Stores stock movement ledger (history / audit).

### 8.6 `campaigns`
Stores campaign header (name, period, status).

### 8.7 `campaign_branches`
Maps campaigns to eligible branches.

### 8.8 `campaign_rules`
Maps movie → giveaway item + qty + claim policy.

### 8.9 `ticket_claims`
Stores claim records used for duplicate prevention.

### 8.10 `giveaway_issuances`
Stores successful issuance transactions.

---

## 9) Suggested Key Constraints (MVP)

### Unique Constraints (Recommended)
- `giveaway_items.item_code` unique
- `branches.branch_code` unique
- `branch_item_stocks (branch_id, item_id)` unique
- `ticket_claims (ticket_ref, campaign_id)` unique (duplicate prevention)

### Integrity Constraints
- Stock quantities should be integer and non-negative
- `qty_per_ticket > 0`
- Campaign end datetime must be >= start datetime

---

## 10) Ticket QR Integration Strategy (for POC)

This is the biggest dependency/risk. Define this clearly in the POC scope.

## 10.1 Option A — QR Contains Sufficient Ticket Data (Fastest)
QR payload includes enough information such as:
- ticket reference
- movie code/title
- branch
- showtime

**MVP approach:** Parse locally and validate against campaign rules

## 10.2 Option B — QR Contains Token/Reference Only (Common in Real Systems)
QR payload contains a token or booking reference only.

**MVP approach:** Call ticketing API (or mock API) to fetch ticket details, then validate

## 10.3 Option C — Manual Ticket Entry Fallback (Recommended for POC Safety)
If QR parsing or integration is not ready:
- allow manual ticket number input
- optional mock ticket lookup API

**Recommendation for POC:** Build with **Option C fallback** from day 1 so demos are never blocked by integration issues.

---

## 11) MVP Reports (Minimal but Useful)

## 11.1 Current Stock by Branch
- Branch
- Item
- On-hand quantity

## 11.2 Daily Issuance Summary
- Date
- Branch
- Movie
- Item
- Qty issued

## 11.3 Issuance Transaction Log (Detailed)
- Transaction ID
- Timestamp
- Branch
- Staff
- Ticket Ref
- Item
- Qty
- Status

## 11.4 Exception/Failed Attempt Log (Optional, Useful)
- Invalid ticket scans
- Duplicate claim attempts
- Out-of-stock attempts

---

## 12) Explicit Exclusions from MVP (To Control Scope)

The following are **not included** in MVP/POC:

- Member/CRM integration
- Loyalty points integration
- Multi-tenant / franchise-level permissions
- Approval workflows for stock operations
- Warehouse transfer requests and approvals
- Batch/lot/expiry management
- Advanced anti-fraud rules
- Offline mode and later synchronization
- Customer notifications (SMS/email/push)
- Real-time dashboards with analytics
- Hardware integrations beyond basic QR scanner/camera input

---

## 13) MVP Success Criteria (POC Acceptance Criteria)

The MVP is considered successful if:

1. Counter staff can issue a giveaway in under **10 seconds end-to-end** (typical flow)
2. Duplicate claim attempts are blocked for the same ticket + campaign
3. Stock is deducted correctly after issuance
4. Admin can manage item stock by branch
5. Admin can configure a simple movie-to-giveaway campaign
6. Admin can review issuance logs by branch/date/item

---

## 14) Suggested POC Build Plan (Implementation Phases)

## Phase 1 — Core Proof of Value (Must Have)
- User login (basic)
- Branch/item master data
- Stock add/adjust + stock balance
- Front office ticket input (QR + manual fallback)
- Eligibility check (basic)
- Giveaway issuance transaction
- Duplicate prevention
- Issuance log

## Phase 2 — Operational MVP Readiness (Should Have)
- Campaign management UI (movie/date/branch → item)
- Better front office UX (scan status, clear messages)
- Filters/report screens
- CSV export for issuance logs

## Phase 3 — Real Integration / Hardening (Later)
- Real ticketing API integration
- Concurrency and race-condition hardening
- Improved permissions
- Monitoring and alerting
- Audit/reporting enhancements

---

## 15) Risks / Assumptions (Important for Proposal)

## Assumptions
- Ticket QR format is available or can be parsed / mapped
- Branch staff can log in and use a connected device (web/tablet/mobile)
- Initial stock quantities are maintained by back office

## Risks
- Ticketing API access or documentation may be delayed
- QR format may vary or contain insufficient data
- Poor network quality at counters may impact scan-to-issue time
- Lack of branch stock discipline may reduce stock accuracy

## Mitigation (Recommended in POC)
- Include manual ticket input fallback
- Allow mock ticket lookup API for testing
- Keep campaign rule logic simple
- Add clear error states and logs for operational troubleshooting

---

## 16) Optional Technical Notes for Codex / Vibe Coding Tool (POC-Friendly)

### Suggested Architecture (Simple)
- **Frontend**: Web app (Back Office + Counter UI, can be same app with role-based screens)
- **Backend API**: REST API
- **Database**: PostgreSQL / MySQL (either is fine)
- **Auth**: Simple username/password (JWT/session)
- **QR Scanning**: Browser camera scanner library or scanner input as text

### Important Backend Implementation Notes
- Use DB transactions for issuance flow
- Add unique constraint on `(ticket_ref, campaign_id)` to prevent duplicate claims
- Keep stock ledger (`stock_transactions`) + stock balance (`branch_item_stocks`)
- Return explicit validation result codes for the front office app

---

## 17) MVP Scope Summary (One-Paragraph Version)

This MVP will provide a back office for managing complimentary giveaway items, branch stock, and simple movie-based giveaway campaigns, plus a front office counter app that scans movie ticket QR codes (or accepts manual ticket input), validates eligibility, issues giveaways, deducts stock, and prevents duplicate claims. The system will also include a basic issuance log and stock ledger to support auditability and daily operations. Advanced campaign mechanics, offline support, and deep ticketing/POS integration are intentionally excluded from the MVP to keep the POC fast and focused.
