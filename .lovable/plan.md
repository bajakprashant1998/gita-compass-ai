

# GitaWisdom - AI-Powered Human Problem-Solving Platform

## Vision
A modern, calm, and accessible platform that transforms ancient Bhagavad Gita wisdom into practical guidance for everyday life challenges. Non-religious, globally accessible, and powered by AI.

---

## 🏗️ Database Structure

### Content Tables
- **chapters** - 18 chapters with themes, descriptions, and problem categories
- **shloks** - All verses with Sanskrit text, Hindi/English meanings, life applications, and problem tags
- **problems** - Problem categories (Leadership, Anxiety, Fear, Confusion, Ethics, Relationships)
- **shlok_problems** - Many-to-many relationship linking shloks to problems

### User Tables
- **profiles** - Basic user info (name, avatar, preferred language)
- **user_preferences** - Language preference, notification settings, theme
- **favorites** - Saved shloks and wisdom cards
- **chat_history** - Conversation logs with AI Gita Coach
- **progress** - Chapters explored, shloks read, daily streaks
- **user_roles** - Role-based access (admin, user)

---

## 📱 Pages & Features

### 1. Homepage
- Hero section with problem input: "What are you struggling with today?"
- Tagline: "Ancient wisdom. Modern problems. AI-powered guidance."
- Daily AI Wisdom card (rotating featured shlok)
- Problem category cards: Leadership | Anxiety | Fear | Confusion | Ethics | Relationships
- Quick stats: chapters, shloks, users helped

### 2. AI Guidance Page
- Natural language problem input
- AI-powered matching: understands emotion → matches problem tags → fetches relevant shlok
- Beautiful result display:
  - Shlok reference (Chapter X, Verse Y)
  - Simple meaning (no heavy Sanskrit)
  - One practical action for today
- Option to save, share, or explore related shloks

### 3. Chapters Library
- Grid of 18 chapters with:
  - Chapter number and title
  - Theme overview
  - Problems covered (tags)
  - Shlok count
- Filter by problem category

### 4. Chapter Detail Page
- AI-generated chapter summary
- Key themes and life lessons
- Shlok list with:
  - Verse number
  - Core problem it addresses
  - Quick preview
- Progress indicator (for logged-in users)

### 5. Shlok Detail Page
- Sanskrit verse (with transliteration option)
- Hindi and English meanings
- Problem → Solution explanation
- Modern story/example (AI-generated)
- Life application (one-liner)
- Shareable wisdom card (downloadable image)
- Related shloks (AI-suggested)
- Save to favorites button

### 6. Problem-Based Navigation
- Browse by life problems instead of chapters
- Each problem page shows:
  - AI-generated summary of Gita's approach
  - Curated shlok list
  - Practical guidance steps
- Problems: Leadership, Anxiety, Fear, Moral Confusion, Decision Making, Relationships, Self-Doubt, Anger

### 7. AI Gita Coach (Chat)
- Conversational interface
- Calm, supportive AI guide
- Uses shlok database for responses
- Remembers conversation context
- No religious preaching - focuses on practical wisdom
- Chat history saved for logged-in users

### 8. User Dashboard
- Reading progress and streaks
- Saved favorites
- Chat history
- Personalized recommendations
- Language and theme preferences

### 9. Authentication
- Sign up / Sign in (email + social options)
- Guest mode for basic browsing
- Account settings and profile management

---

## 🎨 Design System

- **Style**: Clean, modern, calm, card-based
- **Colors**: Neutral palette with warm accents (no religious colors)
- **Typography**: Clear, readable, welcoming
- **Layout**: Mobile-first responsive design
- **Animations**: Subtle, calming transitions
- **Dark mode**: Optional for comfortable reading

---

## 🤖 AI Features

1. **Problem → Shlok Matching** - Semantic search to find relevant verses
2. **Emotional Tone Detection** - Acknowledge feelings before guidance
3. **Daily Wisdom Generator** - Featured shlok with modern interpretation
4. **Story Generation** - Modern examples from ancient verses
5. **Personalized Guidance** - Based on user history and preferences
6. **Wisdom Card Generator** - Beautiful shareable images

---

## 🌐 Language Support

- English (default)
- Hindi
- Language switcher in header
- Future-ready structure for Spanish, French, German, Arabic

---

## 🔐 Security & Backend

- Supabase authentication with secure session management
- Row-level security for user data
- Edge functions for AI processing (using Lovable AI)
- Secure API key management

---

## 📦 Initial Content

The database will be seeded with:
- All 18 chapters with themes
- Sample shloks (key verses from each chapter)
- Problem categories with descriptions
- Ready for you to expand the content

---

## User Flow

1. **New Visitor** → Homepage → Enters problem → Gets guidance → Creates account to save
2. **Returning User** → Dashboard → Continues reading or chats with AI Coach
3. **Explorer** → Browses chapters/problems → Reads shloks → Saves favorites

This platform transforms the Bhagavad Gita into an accessible, modern guidance system that feels like "a calm mentor that understands modern life, powered by timeless wisdom."

