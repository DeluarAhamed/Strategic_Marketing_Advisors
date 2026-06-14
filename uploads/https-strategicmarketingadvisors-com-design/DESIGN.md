---
name: "https://strategicmarketingadvisors.com/"
theme: "dark"

colors:
  neutral:
    shade-0: "#FFFFFF"
    shade-1: "#F2F2F2"
    shade-2: "#D8D9DA"
    shade-3: "#B2B3B5"
    shade-4: "#7F8184"
    shade-5: "#4C4E53"
    shade-6: "#191C22"
    shade-7: "#00030A"
    white: "#FFFFFF"
  sangria:
    shade-1: "#F4E5E5"
    shade-2: "#EACCCC"
    shade-3: "#B64C4D"
    shade-4: "#980001"
    shade-5: "#790000"
    shade-6: "#3C0000"
    shade-7: "#2D0000"
  midnight-blue:
    shade-1: "#E5EAEF"
    shade-2: "#CCD6E0"
    shade-3: "#4C6F93"
    shade-4: "#003265"
    shade-5: "#002850"
    shade-6: "#001428"
    shade-7: "#000F1E"
  science-blue:
    shade-1: "#E5EBFA"
    shade-2: "#CCD7F5"
    shade-3: "#4C75DD"
    shade-4: "#003BCF"
    shade-5: "#002FA5"
    shade-6: "#001752"
    shade-7: "#00113E"

typography:
  heading:
    fontFamily: "DM Serif Text"
    fontWeight: 400
  body:
    fontFamily: "Mulish"
    fontWeight: 400
  sizes:
    desktop:
      h1: 84px
      h2: 60px
      h3: 48px
      h4: 40px
      h5: 32px
      h6: 26px
      text-large: 26px
      text-medium: 20px
      text-regular: 18px
      text-small: 16px
      text-tiny: 12px
    mobile:
      h1: 48px
      h2: 44px
      h3: 32px
      h4: 24px
      h5: 20px
      h6: 18px
      text-large: 18px
      text-medium: 16px
      text-regular: 14px
      text-small: 12px
      text-tiny: 10px

ui:
  style: "brick"
  buttonRadius: 100px
  tagRadius: 100px
  inputRadius: 12px

cards:
  style: "outlined"
  borderWidth: 1px
  dividerWidth: 1px
  radiusLarge: 8px
  radiusMedium: 8px
  radiusSmall: 8px

schemes:
  - name: "Scheme 1"
    background: "neutral-shade-7"
    backgroundHex: "#00030a"
    foregroundHex: "#00030a"
    textHex: "#ffffff"
    accentHex: "#ffffff"
    borderValue: "#ffffff33"
    useLogoVariant: dark
    cssClass: "scheme-1"
  - name: "Scheme 2"
    background: "chromatic1-shade-1"
    backgroundHex: "#F4E5E5"
    foregroundHex: "#F4E5E5"
    textHex: "#00030a"
    accentHex: "#980001"
    borderValue: "#00030a26"
    useLogoVariant: light
    cssClass: "scheme-2"
  - name: "Scheme 3"
    background: "chromatic1-shade-2"
    backgroundHex: "#EACCCC"
    foregroundHex: "#EACCCC"
    textHex: "#00030a"
    accentHex: "#980001"
    borderValue: "#00030a26"
    useLogoVariant: light
    cssClass: "scheme-3"
  - name: "Scheme 4"
    background: "neutral-shade-5"
    backgroundHex: "#4C4E53"
    foregroundHex: "#4C4E53"
    textHex: "#ffffff"
    accentHex: "#ffffff"
    borderValue: "#ffffff33"
    useLogoVariant: dark
    cssClass: "scheme-4"
---

# https://strategicmarketingadvisors.com/ — Design Specification

This file contains machine-readable design tokens in the YAML frontmatter above, and human-readable guidance below.

## Colors

The design uses a **dark** theme with a neutral palette and 3 chromatic palettes.

- **Neutral shades** range from shade-0 (darkest) to shade-7 (lightest), plus white
- **Sangria** — primary shade: `#980001`
- **Midnight Blue** — primary shade: `#003265`
- **Science Blue** — primary shade: `#003BCF`

Use the CSS custom properties from `react/globals.css` for all colors (e.g. `--color-neutral-darkest`, `--color-blue-ribbon`).

## Typography

Headings use **DM Serif Text** at weight 400. Body text uses **Mulish** at weight 400.

The type scale has desktop and mobile sizes. Apply mobile sizes at smaller breakpoints. All values are in `react/globals.css`.

## UI Elements

UI style is **brick** with button radius 100px. Cards use the **outlined** style with border-width 1px.

## Color Schemes

Sections use color schemes to control their visual appearance. Each scheme is derived from a single background color — all other colors (text, foreground, accent, border) are automatically computed for optimal contrast.

| Scheme | Background | Text | Accent | Logo | CSS class |
|--------|-----------|------|--------|------|-----------|
| Scheme 1 | Neutral Darkest (#00030a) | #ffffff | #ffffff | dark | `.scheme-1` |
| Scheme 2 | Sangria Lightest (#F4E5E5) | #00030a | #980001 | light | `.scheme-2` |
| Scheme 3 | Sangria Lighter (#EACCCC) | #00030a | #980001 | light | `.scheme-3` |
| Scheme 4 | Neutral Dark (#4C4E53) | #ffffff | #ffffff | dark | `.scheme-4` |

Apply a scheme by adding its CSS class to the section element. See `sitemap.md` for which scheme each section uses.

### Tweaking Schemes

To create visual variation, you can change which scheme a section uses. When switching schemes:

- Swap the CSS class (e.g. change `.scheme-1` to `.scheme-2`)
- All child elements automatically inherit the correct text, accent, and border colors
- Use the matching logo variant (`logo-light.svg` or `logo-dark.svg`) based on the scheme's `useLogoVariant`
- Alternate between light and dark schemes to create visual rhythm
