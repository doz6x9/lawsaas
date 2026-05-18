# LandingPage Component

A premium, fully-animated landing page for "DocuFlow.legal" - a dual-purpose LegalTech company offering both SaaS platform and custom Microsoft M365 agency services.

## Component Structure

The `LandingPage.tsx` component consists of the following sections:

### 1. **Header / Navigation (Sticky, Frosted Glass)**
- Logo: "DocuFlow.legal" with Scale icon
- Navigation links: Who We Are, Our Platform, Custom Services
- Language toggle, Firm Login, Get Started button
- Responsive mobile menu

### 2. **Hero Section**
- Bold headline with gradient text effect
- Subheadline explaining the value proposition
- CTAs: "Create Secure Account" and "Continue as Guest"
- Security messaging about guest mode data handling
- Animated background orbs with blur effects

### 3. **Who We Are Section (Trust & Security)**
- Two-column layout with staggered animations
- Left: Copy about engineers building for lawyers
- Right: 4 feature cards (GDPR Compliant, Client-Centric, Enterprise Security, Audit-Ready)
- Hover animations on feature cards

### 4. **The Platform Section (SaaS Features)**
- 3-column grid of core software modules:
  - Automated Document Assembly
  - Zero-Touch Intake Form
  - Procedural Deadline Calculator
- Hover scale effects on icons
- Gradient overlay on hover

### 5. **Custom Services Section (Microsoft 365 Integration)**
- Explanation of direct M365 environment integration
- Button linking to Interactive Pricing Configurator
- 3-service grid:
  - SharePoint Conflict Database
  - Power Automate Workflows
  - Teams Bots
- Floating animations on service icons

### 6. **Footer**
- 4-column layout (Brand, Product, Legal, Connect)
- Social media links (GitHub, LinkedIn, Mail)
- Copyright and additional links
- Scroll-triggered animations

## Key Features

### Animation System
All animations use Framer Motion variants defined at the component top-level:
- `fadeUp` - Simple fade and slide up animation
- `fadeUpStagger` - Staggered fade up for scroll triggers
- `staggerContainer` - Container for staggered children
- `scaleInOnScroll` - Scale-in animation on scroll
- `slideInFromLeft` / `slideInFromRight` - Directional slide animations

All animations use `whileInView` for scroll-triggered effects with proper viewport configuration.

### Styling
- Deep slate/navy backgrounds (`slate-950`, `slate-900`)
- Frosted glass panels with `backdrop-blur-md`
- Glowing background orbs using `blur-[120px]` and color gradients
- Tailwind CSS for all styling
- Responsive design that stacks cleanly on mobile

### Icons
Uses `lucide-react` icons throughout:
- Scale, Globe, Lock, FileText, CheckCircle2
- Shield, Users, Workflow, MessageSquare, Calendar
- Database, ArrowRight, Github, Linkedin, Mail, Volume2

## Usage

### Basic Import
```typescript
import LandingPage from './components/LandingPage';

// Use in your app
<LandingPage />
```

### Integration Example
```typescript
import React from 'react';
import LandingPage from './components/LandingPage';

export const App: React.FC = () => {
  return <LandingPage />;
};
```

## Customization

### Colors
All colors use Tailwind classes. Common customizations:
- Gradient colors: `from-blue-400 to-indigo-500` (in hero section)
- Background colors: `bg-slate-950`, `bg-slate-900`
- Text colors: `text-blue-400`, `text-indigo-400`

### Content
All text is defined as complete strings within the component. To customize:
1. Search for specific text strings
2. Replace with your own copy
3. Rebuild the project

### Animations
To modify animation behavior:
1. Adjust the variant objects at the top of the file
2. Modify `transition: { duration: 0.6, ease: 'easeOut' as const }`
3. Adjust viewport margins in `viewport={{ once: true, margin: '0px 0px -100px 0px' }}`

## Dependencies

- `framer-motion: ^10.16.16` - Animation library
- `lucide-react: ^0.378.0` - Icon library
- `react: ^18.3.1` - React library
- `tailwindcss: ^3.4.3` - Utility CSS framework

## Browser Support

Works in all modern browsers supporting:
- CSS Backdrop Filter
- CSS Grid
- CSS Gradient Text (bg-clip-text)
- Framer Motion animations

## Performance

- Lazy-loaded animations using `whileInView`
- Optimized blur effects with `blur-[120px]`
- Responsive design prevents unnecessary rendering on mobile
- Build output: ~374KB JS, ~36.57KB CSS (gzipped: ~112KB JS, ~6.33KB CSS)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3, h4)
- Alt text not needed for decorative orbs (they're CSS)
- Links and buttons are properly interactive
- Mobile-responsive design ensures touch targets are appropriately sized

## Future Enhancements

- Add scroll progress indicator
- Add testimonials section
- Add pricing comparison table
- Add FAQ accordion
- Add contact form
- Add blog integration
- Add analytics tracking

