# iOS Design System Implementation

This document explains how to use the new iOS-inspired design system that has been implemented throughout the application.

## Overview

The iOS design system provides a native iOS-like experience while maintaining compatibility with the Windows desktop environment. It includes:

1. Custom iOS-styled components
2. iOS-inspired color palette and typography
3. iOS-style animations and transitions
4. Utility classes for consistent styling

## Core Components

### IOSNavbar

An iOS-style navigation bar with back button, title, and action button support.

```tsx
import { IOSNavbar } from "@/components/ui/ios-navbar";

<IOSNavbar
  title="Page Title"
  onBack={() => window.history.back()}
  largeTitle={true}
/>;
```

### IOSTabBar

An iOS-style tab bar with icons and labels, fixed at the bottom of the screen.

```tsx
import { IOSTabBar } from "@/components/ui/ios-tabbar";

const [activeTab, setActiveTab] = useState("home");

<IOSTabBar activeTab={activeTab} onTabChange={setActiveTab} />;
```

### IOSSwitch

An iOS-style toggle switch with smooth animations.

```tsx
import { IOSSwitch } from "@/components/ui/ios-switch";

const [switchValue, setSwitchValue] = useState(false);

<IOSSwitch checked={switchValue} onCheckedChange={setSwitchValue} />;
```

### IOSSlider

An iOS-style slider control.

```tsx
import { IOSSlider } from "@/components/ui/ios-slider";

const [sliderValue, setSliderValue] = useState(50);

<IOSSlider
  value={sliderValue}
  onChange={(e) => setSliderValue(Number(e.target.value))}
  min="0"
  max="100"
/>;
```

### SegmentedControl

An iOS-style segmented control for selecting between multiple options.

```tsx
import { SegmentedControl } from "@/components/ui/segmented-control";

const [segmentValue, setSegmentValue] = useState("first");

<SegmentedControl
  options={[
    { value: "first", label: "First" },
    { value: "second", label: "Second" },
    { value: "third", label: "Third" },
  ]}
  value={segmentValue}
  onValueChange={setSegmentValue}
/>;
```

### IOSList Components

iOS-style list components for creating native-looking lists.

```tsx
import { IOSList, IOSListItem, IOSListHeader } from "@/components/ui/ios-list";

<IOSList>
  <IOSListHeader>Settings</IOSListHeader>
  <IOSListItem icon={<Bell className="h-5 w-5" />} chevron>
    Notifications
  </IOSListItem>
  <IOSListItem icon={<Mail className="h-5 w-5" />} chevron>
    Messages
  </IOSListItem>
</IOSList>;
```

## Design Tokens

The iOS design system uses the following design tokens:

### Colors

- `--primary`: iOS blue (#007AFF)
- `--secondary`: iOS orange (#FF9500)
- `--accent`: iOS purple (#AF52DE)
- `--destructive`: iOS red (#FF3B30)
- `--background`: Pure white (#FFFFFF)
- `--foreground`: Pure black (#000000)
- `--muted`: Light gray (#F2F2F7)
- `--border`: Light border (#E5E5EA)

### Typography

- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Headings use bold weights with tight tracking
- Body text uses regular weight with comfortable line height

### Spacing & Radius

- `--radius`: 1.1rem (17.6px) for consistent rounded corners
- Padding and margins follow iOS Human Interface Guidelines

## Utility Classes

The system includes several utility classes for consistent styling:

### Shadows

- `.shadow-ios`: Subtle iOS-style shadow
- `.shadow-ios-lg`: Larger iOS-style shadow
- `.shadow-ios-xl`: Extra large iOS-style shadow

### Rounded Corners

- `.rounded-ios`: 1.1rem rounded corners
- `.rounded-ios-sm`: 0.8rem rounded corners
- `.rounded-ios-lg`: 1.5rem rounded corners
- `.rounded-ios-xl`: 2rem rounded corners
- `.rounded-ios-2xl`: 2.5rem rounded corners
- `.rounded-ios-3xl`: 3rem rounded corners
- `.rounded-ios-full`: Circular elements

### Transitions

- `.transition-ios`: Standard iOS-style transition
- `.transition-ios-fast`: Fast iOS-style transition
- `.transition-ios-spring`: Spring-based iOS-style transition

### Interactive Elements

- `.scale-ios-hover`: Slight scale on hover
- `.scale-ios-active`: Scale down on active state

## Implementation Guidelines

### Page Structure

All pages should follow this structure:

```tsx
<div className="min-h-screen bg-background">
  <IOSNavbar title="Page Title" largeTitle={true} />

  <div className="p-4 pb-24">{/* Page content */}</div>

  <IOSTabBar activeTab={activeTab} onTabChange={setActiveTab} />
</div>
```

### Cards & Containers

Use the new iOS-styled cards:

```tsx
<Card className="rounded-3xl border-0 shadow-ios">
  <CardHeader className="p-4">
    <CardTitle className="text-lg">Card Title</CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

### Forms

Use the updated form components with iOS styling:

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="rounded-2xl"
  />
</div>
```

## Migration Guide

To migrate existing components to the iOS design system:

1. Replace standard tabs with SegmentedControl
2. Add IOSNavbar to page headers
3. Add IOSTabBar to page footers
4. Update cards to use rounded-3xl and shadow-ios
5. Replace standard lists with IOSList components
6. Update buttons to use the new iOS styling
7. Replace standard inputs with iOS-styled inputs

## Best Practices

1. **Consistency**: Use the same components and styling patterns throughout the application
2. **Accessibility**: Ensure all interactive elements are properly labeled and keyboard accessible
3. **Performance**: Use the built-in transitions and animations for smooth user experience
4. **Responsiveness**: The design system is optimized for desktop but should work on various screen sizes
5. **Safe Areas**: Use the provided safe area utilities for proper spacing on different devices

## Customization

The design system can be customized by modifying the CSS variables in `src/index.css`. All colors, spacing, and typography can be adjusted to match specific branding requirements.
