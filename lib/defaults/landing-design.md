# Dark SaaS Landing Page — Design Reference

Use these exact values. Deviation produces generic AI output.

---

## Typography

| Element        | Size  | Weight | Line-height | Letter-spacing |
|----------------|-------|--------|-------------|----------------|
| H1 hero        | 60px  | 700    | 70px        | -1px           |
| H2 section     | 40px  | 700    | 48px        | -0.5px         |
| Body           | 18px  | 400    | 28px        | normal         |
| Subheadline    | 22px  | 500    | 28px        | 0.25px         |
| Button label   | 16px  | 600    | 22px        | -0.04px        |
| Section label  | 12px  | 400    | —           | 0.12em         |

---

## Color Palette (dark)

```
Page background:    #0a0a0a
Surface / card bg:  #111111
Alt section bg:     #161616
Heading text:       #fafafa
Body text:          #71717a
Secondary text:     #52525b
Accent (one place): #3b5bdb
Border default:     rgba(255,255,255,0.06)
Border card:        rgba(255,255,255,0.07)
Border hover:       rgba(255,255,255,0.20)
```

---

## Buttons

### Primary (filled pill)
```css
background: #ffffff;
color: #000000;
border: none;
border-radius: 9999px;
padding: 14px 24px;
font-size: 16px;
font-weight: 600;
letter-spacing: -0.04px;
cursor: pointer;
transition: background 0.15s;
```
Hover: `background: #e4e4e7`

### Secondary (outlined pill)
```css
background: transparent;
color: #fafafa;
border: 1px solid rgba(255,255,255,0.12);
border-radius: 9999px;
padding: 12px 20px;
font-size: 15px;
font-weight: 500;
cursor: pointer;
transition: border-color 0.15s;
```
Hover: `border-color: rgba(255,255,255,0.30)`

**Rule: always `border-radius: 9999px`. Never `border-radius: 8px` or `12px` on buttons.**

---

## Nav

```css
position: sticky;
top: 0;
z-index: 50;
background: rgba(10,10,10,0.85);
backdrop-filter: blur(12px);
border-bottom: 1px solid rgba(255,255,255,0.06);
height: 64px;
display: flex;
align-items: center;
```

Logo: brand name in `font-weight: 600; font-size: 15px; color: #fafafa`.  
Nav links: `color: #71717a; font-size: 14px; font-weight: 400`. No underlines.  
Right side: outlined pill CTA only.

---

## Cards

```css
border: 1px solid rgba(255,255,255,0.07);
border-radius: 16px;
padding: 24px;
background: #111111;
```
Hover: `border-color: rgba(255,255,255,0.20)` — **no box-shadow**.

---

## Section Layout

| Section         | Background | Vertical padding |
|-----------------|------------|-----------------|
| Nav             | #0a0a0a/85 blur | 0 (h-64px) |
| Hero            | #0a0a0a    | 96px top, 48px bottom |
| Product screenshot | #0a0a0a | 0 top, 80px bottom |
| Features grid   | #0a0a0a    | 96px top/bottom |
| How it works    | #111111    | 96px top/bottom |
| Bottom CTA      | #0a0a0a    | 112px top/bottom |
| Footer          | #0a0a0a    | 32px top/bottom |

Max widths: `1152px` nav, `768px` hero text, `960px` features.  
Always `padding: 0 24px` on the container.

---

## Grid Patterns

```
Features:   grid-template-columns: repeat(3, 1fr); gap: 24px
Steps:      grid-template-columns: repeat(3, 1fr); gap: 32px
Stats:      grid-template-columns: repeat(3, 1fr); gap: 32px; text-align: center
```

Stats pattern: large number (`font-size: 48px; font-weight: 700; color: #fafafa; letter-spacing: -1px`) with small caps label below (`font-size: 12px; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em`).

---

## Waitlist Form

```css
/* Container */
display: flex;
gap: 8px;
max-width: 400px;
margin: 0 auto;

/* Input */
flex: 1;
background: #111111;
border: 1px solid rgba(255,255,255,0.10);
border-radius: 9999px;
padding: 14px 20px;
color: #fafafa;
font-size: 15px;
outline: none;

/* Submit button: use Primary pill style above */
```

---

## Anti-Patterns — Never Do These

| Bad                                      | Good                                         |
|------------------------------------------|----------------------------------------------|
| `border-radius: 8px` on buttons         | `border-radius: 9999px` pill                 |
| `background: linear-gradient(135deg, #6366f1, #8b5cf6)` hero | Flat `#0a0a0a` bg        |
| Glow blob: `box-shadow: 0 0 120px rgba(99,102,241,0.4)` | No glows. Clean dark bg     |
| Multiple accent colors                   | ONE accent color (`#3b5bdb`), one place only |
| Gradient text `background-clip: text`   | Plain `#fafafa` heading, one `#3b5bdb` word  |
| `border-radius: 12px` cards              | `border-radius: 16px`                        |
| `box-shadow: 0 25px 50px rgba(0,0,0,0.5)` on cards | Border only, no shadow          |
| `text-transform: uppercase` on H1/H2    | Normal case, letter-spacing only             |
| Hero padding under 80px                  | Min `padding-top: 96px`                      |
| Fixed pixel widths without `max-width`  | `max-width` + `width: 100%`                  |

---

## Responsive Rules

```css
/* Always include */
*, *::before, *::after { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100%; }

/* Mobile (<640px) */
@media (max-width: 640px) {
  h1 { font-size: 36px; line-height: 44px; }
  .features-grid { grid-template-columns: 1fr; }
  .hero-cta { flex-direction: column; align-items: stretch; }
  .nav-links { display: none; }
}

/* Tablet (641–1024px) */
@media (max-width: 1024px) {
  h1 { font-size: 48px; line-height: 58px; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}
```
