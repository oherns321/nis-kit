# Columbia Gas Header Class Name Mapping

This document provides a mapping between the original Columbia Gas website class names and the kebab-case equivalents used in our header block.

## Original vs. Kebab-case Mapping

| Original Columbia Gas Class | Kebab-case Equivalent | Description |
|----------------------------|----------------------|-------------|
| `SiteHeader` | `site-header` | Main header container |
| `SiteHeader--desktop` | `site-header--desktop` | Desktop header variant |
| `SiteHeader--mobile` | `site-header--mobile` | Mobile header variant |
| `SiteHeader__mobile-always-visible` | `site-header__mobile-always-visible` | Mobile header always visible section |
| `MainNav` | `main-nav` | Main navigation container |
| `MainNav--desktop` | `main-nav--desktop` | Desktop navigation variant |
| `MainNav__auxiliary` | `main-nav__auxiliary` | Auxiliary navigation section |
| `MainNav__main` | `main-nav__main` | Main navigation section |
| `MobileNav` | `mobile-nav` | Mobile navigation container |
| `MobileNav__main` | `mobile-nav__main` | Mobile navigation main section |
| `SearchModal` | `search-modal` | Search modal container |
| `SearchModalMobileTrigger` | `search-modal-mobile-trigger` | Mobile search trigger |
| `SearchModalDesktopTrigger` | `search-modal-desktop-trigger` | Desktop search trigger |

## BEM Convention Notes

- `--` indicates a modifier (variant of a block)
- `__` indicates an element (child of a block)
- All converted to kebab-case for consistency with project standards

## Original Structure Reference

The original Columbia Gas website uses this structure:
```html
<!-- Desktop -->
<div class="SiteHeader SiteHeader--desktop">
  <div class="MainNav MainNav--desktop">
    <div class="MainNav__auxiliary">...</div>
    <div class="MainNav__main">...</div>
  </div>
</div>

<!-- Mobile -->
<div class="SiteHeader SiteHeader--mobile">
  <div class="SiteHeader__mobile-always-visible">...</div>
  <div class="MobileNav">
    <div class="MobileNav__main">...</div>
  </div>
</div>
```

Our implementation maintains the same structural hierarchy but uses kebab-case naming.