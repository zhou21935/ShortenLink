## ADDED Requirements

### Requirement: Warm pink and yellow visual theme
The frontend SHALL use #F7EDF0, #F4CBC6, #F4AFAB, #F4EEA9, and #F4F482 as its visual theme palette while retaining dark foreground colors where required for readable text and state communication.

#### Scenario: Primary page presentation
- **WHEN** a visitor opens the primary page
- **THEN** the page background, cards, primary actions, focus indicators, and result highlights use the specified palette with visually distinct surface and interactive states

#### Scenario: Keyboard focus remains visible
- **WHEN** a visitor focuses an interactive control using the keyboard
- **THEN** a clearly visible focus indicator is rendered against the control and its surrounding surface
