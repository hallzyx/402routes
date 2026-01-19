->BD: db.json [backend]


->Design:
## Design System & Visual Identity

### Design Inspiration
402way follows a **modern, developer-focused design language** inspired by Render.com's clean and minimalist aesthetic, optimized for technical users and AI agents.

### Icons
- Use React Icons.

### Color Palette

**Primary Colors:**
- **Purple/Violet**: `#7C3AED` (Primary brand color - headers, CTAs, accents)
- **Deep Purple**: `#6D28D9` (Hover states, active elements)
- **White**: `#FFFFFF` (Background, cards, clean spaces)
- **Black**: `#000000` (Primary text, buttons, strong contrast)

**Secondary Colors:**
- **Light Purple**: `#DDD6FE` (Backgrounds, subtle highlights)
- **Gray Scale**:
  - `#F9FAFB` (Light background)
  - `#6B7280` (Secondary text)
  - `#374151` (Tertiary text)
  - `#1F2937` (Dark elements)

**Accent Colors:**
- **Success Green**: `#10B981` (API active status, confirmations)
- **Warning Yellow**: `#F59E0B` (Pending states)
- **Error Red**: `#EF4444` (Errors, alerts)
- **Info Blue**: `#3B82F6` (Informational elements)

### Typography

**Font Family:**
- Primary: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Monospace (code): `'Fira Code', 'Courier New', monospace`

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Type Scale:**
- Hero Title: 3.5rem (56px) / Bold
- Section Title: 2rem (32px) / Bold
- Card Title: 1.25rem (20px) / Semibold
- Body: 1rem (16px) / Regular
- Small: 0.875rem (14px) / Regular
- Micro: 0.75rem (12px) / Medium

### UI Components Style

**Buttons:**
- **Primary (Purple)**: Purple background, white text, rounded corners (8px), hover darkens
- **Secondary (Black)**: Black background, white text, rounded corners (8px)
- **Outlined (White)**: White background, black border (2px), black text, rounded corners (8px)

**Cards:**
- White background
- Subtle shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Border radius: 12px
- Padding: 24px
- Hover: Slight lift with shadow increase

**Inputs:**
- Border: 2px solid `#E5E7EB`
- Rounded: 8px
- Focus: Purple border `#7C3AED`
- Padding: 12px 16px

**Badges/Tags:**
- Small rounded pills (16px radius)
- Purple background for categories
- Gray for metadata
- Green for active status

### Layout Principles

**Spacing System (8px base):**
- XXS: 4px
- XS: 8px
- S: 16px
- M: 24px
- L: 32px
- XL: 48px
- XXL: 64px

**Grid:**
- Max-width container: 1280px
- Responsive breakpoints:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+

**Whitespace:**
- Generous spacing between sections (64px+)
- Clean, uncluttered interfaces
- Focus on content hierarchy


**Form Style:**
- Clean, single-column forms
- Labels above inputs
- Inline validation messages
- Purple focus states
- Submit button full-width on mobile


**Navigation:**
- Minimal top nav (logo left, links center, CTAs right)
- White background with subtle bottom border
- Purple accent on hover/active
- Mobile: Hamburger menu


### Accessibility

- WCAG 2.1 AA compliant
- Minimum contrast ratio: 4.5:1 for text
- Focus indicators visible (purple outline)
- Keyboard navigation support
- Alt text for all images

### Animation & Interaction

**Micro-interactions:**
- Button hover: Scale(1.02) + shadow increase
- Card hover: Slight lift (4px translateY)
- Input focus: Border color transition (200ms)
- Page transitions: Fade in (300ms)

**Loading States:**
- Skeleton screens (gray pulse animation)
- Spinner: Purple circular loader
- Progress bars: Purple fill


### Wallet Connection UI

**Wallet Modal:**
- Centered modal with backdrop blur
- White card with shadow
- Purple accent for selected wallet
- Wallet icons in grayscale, color on hover

### x402 Payment Indicators

**Payment Status:**
- Show price in purple badge next to API name
- "0.001 USDC per call" in purple monospace font
- Transaction confirmation: Green checkmark + tx hash link

### Brand Voice

- **Professional** yet approachable
- **Technical** but not intimidating
- **Innovative** (blockchain, AI agents)
- **Trustworthy** (financial transactions)
- Copy should be concise, clear, and action-oriented

Notes:
This design system ensures 402way has a cohesive, modern, and professional appearance that appeals to developers while maintaining the simplicity needed for AI agents to interact seamlessly.