

# Admin Panel Implementation Plan

## Overview
Build a comprehensive admin panel for GitaWisdom to manage all 701 shloks, problem tags, AI rules, and multi-language content with a secure, role-based authentication system.

---

## Database Schema Changes

### New Tables Required

#### 1. `languages` - Multi-language Support
```text
+------------------+-------------------+----------------------+
| Column           | Type              | Description          |
+------------------+-------------------+----------------------+
| id               | UUID (PK)         | Primary key          |
| code             | TEXT (unique)     | en, hi, es, fr, de   |
| name             | TEXT              | English, Hindi, etc  |
| native_name      | TEXT              | अंग्रेज़ी, हिंदी      |
| enabled          | BOOLEAN           | Active/inactive      |
| display_order    | INTEGER           | Sort order           |
| created_at       | TIMESTAMPTZ       | Created timestamp    |
+------------------+-------------------+----------------------+
```

#### 2. `ai_search_rules` - AI Keyword Mapping
```text
+------------------+-------------------+----------------------------------+
| Column           | Type              | Description                      |
+------------------+-------------------+----------------------------------+
| id               | UUID (PK)         | Primary key                      |
| keywords         | TEXT[]            | Array of trigger keywords        |
| problem_id       | UUID (FK)         | Links to problems table          |
| fallback_shloks  | UUID[]            | Default shloks for this rule     |
| priority         | INTEGER           | Rule priority (1-10)             |
| enabled          | BOOLEAN           | Active/inactive                  |
| created_at       | TIMESTAMPTZ       | Created timestamp                |
| updated_at       | TIMESTAMPTZ       | Updated timestamp                |
+------------------+-------------------+----------------------------------+
```

#### 3. `admin_activity_log` - Audit Trail
```text
+------------------+-------------------+----------------------------------+
| Column           | Type              | Description                      |
+------------------+-------------------+----------------------------------+
| id               | UUID (PK)         | Primary key                      |
| user_id          | UUID (FK)         | Admin who performed action       |
| action           | TEXT              | create/update/delete/publish     |
| entity_type      | TEXT              | shlok/problem/chapter/ai_rule    |
| entity_id        | UUID              | ID of affected record            |
| old_value        | JSONB             | Previous state                   |
| new_value        | JSONB             | New state                        |
| created_at       | TIMESTAMPTZ       | Timestamp of action              |
+------------------+-------------------+----------------------------------+
```

### Modify Existing Tables

#### `shloks` - Add New Fields
```text
New columns:
- status: TEXT ('draft' | 'published' | 'scheduled')
- story_type: TEXT ('corporate' | 'family' | 'youth' | 'global')
- sanskrit_audio_url: TEXT (optional audio file URL)
- scheduled_publish_at: TIMESTAMPTZ (for scheduled publishing)
- published_at: TIMESTAMPTZ (when content went live)
```

#### `problems` - Add Category Field
```text
New column:
- category: TEXT ('mental' | 'leadership' | 'ethics' | 'career' | 'relationships')
```

---

## Admin Routes Structure

```text
/admin                    → Dashboard (stats overview)
/admin/login              → Admin login page
/admin/shloks             → Shlok list with filters
/admin/shloks/create      → Create new shlok
/admin/shloks/edit/:id    → Edit existing shlok
/admin/problems           → Problem tag management
/admin/problems/create    → Create new problem
/admin/problems/edit/:id  → Edit existing problem
/admin/chapters           → Chapter overview
/admin/chapters/edit/:id  → Edit chapter details
/admin/languages          → Language management
/admin/ai-rules           → AI search rule management
/admin/activity           → Activity log viewer
```

---

## Frontend Components

### Layout Components

#### 1. `AdminLayout.tsx`
- Sidebar navigation with collapsible menu
- Top bar with admin profile, notifications
- Breadcrumb navigation
- Mobile-responsive with slide-out menu

#### 2. `AdminSidebar.tsx`
- Dashboard link
- Content Management (Shloks, Chapters, Problems)
- AI & Search (AI Rules)
- Settings (Languages, Activity Log)
- Sign out button

### Page Components

#### Dashboard (`AdminDashboard.tsx`)
Statistics cards showing:
- Total Chapters: 18
- Total Shloks: Count from DB
- Published Shloks: Where status = 'published'
- Draft Shloks: Where status = 'draft'
- Total Problem Tags: Count
- Active Languages: Count where enabled = true
- Quick actions: Add Shlok, Add Problem

#### Shlok Management

**`AdminShlokList.tsx`**
- Data table with columns: Chapter, Verse, Sanskrit (truncated), Status, Actions
- Filters: Chapter dropdown, Status dropdown, Problem multi-select
- Search: By verse content, chapter number
- Bulk actions: Publish/Unpublish selected
- Pagination with 25/50/100 per page

**`AdminShlokForm.tsx`** (Create/Edit)
Tabbed form with sections:

**Tab 1: Core Information**
- Chapter selector (dropdown)
- Verse number (input)
- Sanskrit text (textarea with Sanskrit font)
- Transliteration (input)
- Sanskrit audio URL (file upload placeholder)

**Tab 2: Meanings**
- Hindi meaning (rich text)
- English meaning (rich text)
- Toggle to show side-by-side editor

**Tab 3: Problem Mapping**
- Multi-select problem tags with checkboxes
- Relevance score slider (1-10) per problem
- Priority indicator (High/Medium/Low based on score)

**Tab 4: Solution Section**
- Problem context (textarea)
- Gita-based solution (textarea)
- Life application (textarea)
- Practical action (textarea)

**Tab 5: Story**
- Story title (input)
- Story content (rich textarea, 200-300 words)
- Story type selector (Corporate/Family/Youth/Global)

**Tab 6: Status**
- Status: Draft / Published / Scheduled
- Scheduled publish date (if scheduled)
- Save as Draft / Publish buttons

#### Problem Management

**`AdminProblemList.tsx`**
- Table: Name, Category, Slug, Linked Shloks count, Actions
- Quick edit inline
- Reorder via drag-and-drop

**`AdminProblemForm.tsx`**
- Name (English)
- Category dropdown (Mental/Leadership/Ethics/Career/Relationships)
- Description (English)
- Description (Hindi)
- SEO Slug (auto-generated, editable)
- Icon selector (Lucide icons)
- Color picker
- Display order

#### AI Rules Management

**`AdminAIRules.tsx`**
- Table of rules: Keywords, Problem Tag, Fallback Shloks, Enabled
- Add/Edit modal:
  - Keywords input (comma-separated, stored as array)
  - Problem tag selector
  - Fallback shloks multi-select
  - Priority slider
  - Enable/Disable toggle
- Test panel: Input text → shows which rule matches

#### Language Management

**`AdminLanguages.tsx`**
- Table: Language, Code, Status, Translation Progress
- Enable/Disable toggle
- Translation status per language (percentage complete)
- Add new language modal

#### Activity Log

**`AdminActivityLog.tsx`**
- Timeline view of recent admin actions
- Filters: By admin, by entity type, by date range
- Shows: Who, What, When, Before/After diff

### Shared Admin Components

```text
src/components/admin/
├── AdminLayout.tsx           # Main layout wrapper
├── AdminSidebar.tsx          # Navigation sidebar
├── AdminHeader.tsx           # Top header bar
├── AdminBreadcrumb.tsx       # Breadcrumb navigation
├── AdminStatsCard.tsx        # Dashboard stat card
├── AdminDataTable.tsx        # Reusable data table
├── AdminFormSection.tsx      # Form section wrapper
├── AdminStatusBadge.tsx      # Status indicators
├── AdminPagination.tsx       # Pagination controls
├── AdminSearchFilters.tsx    # Search and filter bar
├── AdminConfirmDialog.tsx    # Confirmation dialogs
└── AdminRichTextEditor.tsx   # Rich text input
```

---

## Authentication & Security

### Admin Login Flow

1. **Route Protection**
   - Create `useAdminAuth` hook that checks for 'admin' role
   - Redirect non-admins to home page
   - Redirect unauthenticated users to `/admin/login`

2. **Admin Login Page**
   - Standard email/password form
   - Uses existing Supabase auth
   - After login, verify user has admin role
   - Show error if not admin

3. **Session Management**
   - Supabase handles session automatically
   - Auto-refresh tokens
   - Logout clears session

### Role Verification

The existing `has_role()` function already provides server-side role checking. Admin operations are protected by RLS policies.

---

## API Functions

### New API Functions in `src/lib/adminApi.ts`

```typescript
// Shlok CRUD
getAdminShloks(filters): Promise<Shlok[]>
createShlok(data): Promise<Shlok>
updateShlok(id, data): Promise<Shlok>
deleteShlok(id): Promise<void>
bulkPublishShloks(ids): Promise<void>

// Problem CRUD
getAdminProblems(): Promise<Problem[]>
createProblem(data): Promise<Problem>
updateProblem(id, data): Promise<Problem>
deleteProblem(id): Promise<void>
reorderProblems(orders): Promise<void>

// Chapter management
updateChapter(id, data): Promise<Chapter>

// AI Rules
getAIRules(): Promise<AIRule[]>
createAIRule(data): Promise<AIRule>
updateAIRule(id, data): Promise<AIRule>
deleteAIRule(id): Promise<void>
testAIRule(text): Promise<MatchResult>

// Languages
getLanguages(): Promise<Language[]>
toggleLanguage(id, enabled): Promise<void>

// Activity Log
getActivityLog(filters): Promise<Activity[]>
logActivity(action, entityType, entityId, oldValue, newValue): Promise<void>

// Dashboard Stats
getAdminStats(): Promise<AdminStats>
```

---

## Implementation Phases

### Phase 1: Foundation (Core Setup)
1. Database migration for new tables and columns
2. Admin authentication hook (`useAdminAuth`)
3. Admin layout components (Layout, Sidebar, Header)
4. Admin login page
5. Protected route wrapper
6. Dashboard with stats

### Phase 2: Shlok Management (Critical)
7. Shlok list page with filters
8. Shlok create/edit form (all tabs)
9. Problem mapping interface
10. Status management (draft/publish)
11. Bulk actions

### Phase 3: Problem & Chapter Management
12. Problem list and CRUD
13. Chapter edit functionality
14. Problem category system

### Phase 4: AI & Advanced Features
15. AI rules management
16. Language management
17. Activity logging
18. Search rule testing

---

## File Structure

```text
src/
├── pages/admin/
│   ├── AdminLoginPage.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminShlokList.tsx
│   ├── AdminShlokForm.tsx
│   ├── AdminProblemList.tsx
│   ├── AdminProblemForm.tsx
│   ├── AdminChapterList.tsx
│   ├── AdminChapterForm.tsx
│   ├── AdminAIRules.tsx
│   ├── AdminLanguages.tsx
│   └── AdminActivityLog.tsx
├── components/admin/
│   ├── AdminLayout.tsx
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   ├── AdminBreadcrumb.tsx
│   ├── AdminStatsCard.tsx
│   ├── AdminDataTable.tsx
│   ├── AdminFormSection.tsx
│   ├── AdminStatusBadge.tsx
│   ├── AdminPagination.tsx
│   ├── AdminSearchFilters.tsx
│   ├── AdminConfirmDialog.tsx
│   └── AdminProtectedRoute.tsx
├── hooks/
│   └── useAdminAuth.tsx
├── lib/
│   └── adminApi.ts
└── types/
    └── admin.ts
```

---

## Routes Addition to App.tsx

```typescript
// Admin routes (protected)
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
<Route path="/admin/shloks" element={<AdminProtectedRoute><AdminShlokList /></AdminProtectedRoute>} />
<Route path="/admin/shloks/create" element={<AdminProtectedRoute><AdminShlokForm /></AdminProtectedRoute>} />
<Route path="/admin/shloks/edit/:id" element={<AdminProtectedRoute><AdminShlokForm /></AdminProtectedRoute>} />
<Route path="/admin/problems" element={<AdminProtectedRoute><AdminProblemList /></AdminProtectedRoute>} />
<Route path="/admin/problems/create" element={<AdminProtectedRoute><AdminProblemForm /></AdminProtectedRoute>} />
<Route path="/admin/problems/edit/:id" element={<AdminProtectedRoute><AdminProblemForm /></AdminProtectedRoute>} />
<Route path="/admin/chapters" element={<AdminProtectedRoute><AdminChapterList /></AdminProtectedRoute>} />
<Route path="/admin/chapters/edit/:id" element={<AdminProtectedRoute><AdminChapterForm /></AdminProtectedRoute>} />
<Route path="/admin/ai-rules" element={<AdminProtectedRoute><AdminAIRules /></AdminProtectedRoute>} />
<Route path="/admin/languages" element={<AdminProtectedRoute><AdminLanguages /></AdminProtectedRoute>} />
<Route path="/admin/activity" element={<AdminProtectedRoute><AdminActivityLog /></AdminProtectedRoute>} />
```

---

## Making an Admin User

After implementation, to make a user an admin:
1. User signs up normally via `/auth`
2. Run SQL to add admin role:
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin' FROM auth.users WHERE email = 'admin@example.com';
   ```
3. User can now access `/admin` routes

---

## Key Design Decisions

1. **Reuse existing auth**: No separate admin auth system - admins are regular users with 'admin' role
2. **RLS-based security**: All admin operations go through existing RLS policies that check `has_role()`
3. **Side-by-side editing**: Hindi/English content shown together for easy comparison
4. **Draft workflow**: Shloks can be drafted, reviewed, then published
5. **Activity audit**: All changes logged for accountability
6. **Modular components**: Reusable admin UI components for consistency

