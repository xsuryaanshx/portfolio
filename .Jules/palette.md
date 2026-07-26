## 2026-03-24 - Custom Cursor and Keyboard Navigation Accessibility Conflict
**Learning:** Custom cursor designs (`cursor: none` on body) completely break usability for users who rely on keyboard navigation or touch screens if native focus indicators are hidden and touch device detection is absent.
**Action:** Always disable custom cursors on touch screens via media queries (`@media (pointer: coarse)`), support prefers-reduced-motion, and implement solid `:focus-visible` styles to ensure keyboard-only users can navigate with high visual clarity.
