# Header Block - Columbia Gas Ohio Exact Match

This document describes the header implementation that **exactly matches** the Columbia Gas Ohio website at columbiagasohio.com.

## Class Names Used (EXACT MATCH)

### Main Structure
- `SiteHeader` - Base header container
- `SiteHeader--desktop` - Desktop header variant
- `SiteHeader--mobile` - Mobile header variant  
- `SiteHeader__mobile-always-visible` - Mobile header always visible section

### Navigation
- `MainNav` - Main navigation container
- `MainNav--desktop` - Desktop navigation variant
- `MainNav__auxiliary` - Auxiliary/secondary navigation (Our Company, Partner with Us, Emergency Contact, Search)
- `MainNav__main` - Primary navigation (My Account, Bills & Payments, Products & Services, Safety)

### Mobile Navigation
- `MobileNav` - Mobile navigation menu
- `MobileNav__main` - Mobile navigation main section

### Search Components
- `SearchModalDesktopTrigger` - Desktop search trigger button
- `SearchModalMobileTrigger` - Mobile search trigger button
- `SearchModal` - Search modal overlay

### Interactive Elements
- `toggle-navigation` - Mobile menu toggle button
- `is-open` - State class for open mobile menu

## Navigation Items (Exact Match)

### Auxiliary Navigation (Desktop Top)
1. Our Company → `/our-company`
2. Partner with Us → `/partner-with-us`
3. Emergency Contact → `tel:+18001234567` (with warning icon)
4. Search (glyphicon-search)

### Main Navigation
1. My Account → `https://myaccount.columbiagasohio.com/login`
2. Bills & Payments → `https://myaccount.columbiagasohio.com/bills`
3. Products & Services → `/products-and-services`
4. Safety → `/safety`

## Logo
Uses the exact Columbia Gas of Ohio logo:
`https://nieus2prodazstg01.blob.core.windows.net/cdr-prod/images/librariesprovider3/design-elements/logos/columbia-gas-of-ohio-logo.png`

## Icons
- Uses Bootstrap glyphicons for search (`glyphicon-search`)
- Uses SVG symbols for menu icons (`icon-open-menu`, `icon-close-menu`)
- Uses warning icon for Emergency Contact (`icon-warning-2`)

## Reference Site
Exact match for: https://www.columbiagasohio.com/home

## Implementation Notes
- Fixed positioning at `top: 46px` 
- Responsive breakpoint at 882px
- White background (`#fff`)
- Box shadow for scrolled state
- Matches exact CSS properties from Columbia Gas Ohio