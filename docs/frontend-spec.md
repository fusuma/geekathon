# **UI/UX Specification: SmartLabel AI**

**Version:** 1.0
**Date:** September 17, 2025
**Author:** Sally, UX Expert 🎨

### **1. Overall UX Goals & Principles**

This design charter is the foundation for all user-facing aspects of the SmartLabel AI project, tailored to impress the Geekathon judges.

#### **Target User Personas**

* **Ricardo, the Technical Judge (from BRAINR/xgeeks):** Values a well-architected, technically impressive, and innovative use of GenAI. He seeks transparency and is frustrated by "black box" demos.
* **Pedro, the Business Judge (from Lusiaves):** Values a practical solution that solves a real, costly problem for the food industry and shows a clear ROI. He is frustrated by tech that doesn't fit a real industrial workflow.

#### **Usability Goals**

* **Clarity at a Glance:** A judge must understand the core value proposition within 15 seconds of seeing the results without verbal explanation.
* **Effortless Interaction:** The demo flow must be so intuitive that a judge could complete the "Input -> Generate -> Iterate" loop with zero guidance.
* **High-Impact Demo:** The presentation of results must be compelling enough to elicit at least one "wow" moment, likely from the "Side-by-Side Comparison" or "Crisis Response" features.

#### **Design Principles**

* **Show, Don't Just Tell:** The UI's primary job is to make the backend's power visible through strong visual cues.
* **Clarity Over Clutter:** Prioritize a clean layout and clear information hierarchy to prevent cognitive overload.
* **Demo-First Interactivity:** Every element will be designed to be quick, visually satisfying, and reinforce the narrative of speed and power.
* **Build Trust Through Transparency:** The UI, through features like the "AI Trace" animation and "Compliance Scorecard," must build trust by giving insight into how the AI reached its conclusions.

### **2. Information Architecture (IA)**

The application uses a simple, two-view structure to clearly separate the core functionalities.

* **Site Map:** The application consists of a primary "App Shell" that houses two switchable views:
    1.  Label Generator & Preview View
    2.  Crisis Simulator View
* **Navigation Structure:** Primary navigation is handled by a simple `Tabs` component at the top of the App Shell.

### **3. User Flows**

The following flows map the step-by-step user journey for the two critical tasks.

* **Label Generation & Iteration Flow:**
    1.  User fills in product data in the Input Form.
    2.  User clicks "Generate Label".
    3.  The UI displays the "AI Trace" animation loading state.
    4.  On success, the UI displays the results and briefly **highlights/animates the specific sections that are different** from any previous version, making the AI's intelligence instantly visible.
    5.  The user can then modify an input on the form and click "Generate" again to see the updated results.
* **Crisis Simulation Flow:**
    1.  User navigates to the "Crisis Simulator" tab.
    2.  User fills in the crisis data or loads a sample scenario.
    3.  User clicks "Generate Crisis Response".
    4.  The UI displays the formatted, multi-part crisis response package in an Accordion component.

### **4. Wireframes & Conceptual Layouts**

These layouts provide the blueprint for the application's interface.

* **Layout: Label Generator & Preview View:**
    * **Desktop:** A two-column workspace (35% Input, 65% Results) for optimal side-by-side iteration.
    * **Tablet/Mobile:** A single-column layout where the Input panel intelligently collapses after submission to bring the results into view without excessive scrolling. The collapsed bar will show key context like **`Inputs: Portuguese Chicken Sausage | Target: Angola`** to mitigate context loss.
* **Layout: Crisis Simulator View:** A single-column layout for a focused task, presenting the generated response in a structured `Accordion` component for easy navigation.

### **5. Component Library**

The UI will be built from a project-specific library using `shadcn/ui` as a foundation.

* **Guiding Principles:**
    1.  **Container/Presentational Pattern:** To separate logic from visuals.
    2.  **Favor Composition over Configuration:** To keep components simple and focused.
    3.  **Use a Centralized State Store:** For global data to avoid "prop drilling".
* **Component Layers:**
    1.  **Shared/Atomic:** `StyledButton`, `FormField`, `ResultsCard`, `LoadingIndicator`, `ErrorMessage`.
    2.  **Content:** `SectionHeading`, `LegalTextBlock`, `MarketingTextBlock`, `AllergenList`, `CrisisNotice`.
    3.  **High-Level/Container:** `AppShell`, `InputForm`, `ResultsDisplay`, `ComplianceScorecard`, `SideBySideComparison`.

### **6. Branding & Style Guide**

The "Agri-Tech" visual identity is designed to feel both innovative and grounded in the food industry.

* **Color Palette:**
    * **Primary:** `#166534` (Deep Green)
    * **Secondary:** `#f59e0b` (Amber)
    * **Error:** `#ef4444` (Red)
* **Typography:**
    * **Primary Font:** Inter (a clean, modern sans-serif).
* **Interaction States:** Buttons and Form Fields will have clearly defined `default`, `hover`, `focus`, `active`, and `disabled` states for a responsive feel.
* **System States:** The UI will have defined `Empty`, `Loading`, and feedback (Toast) states to guide the user.

### **7. Accessibility Requirements**

* **Compliance Target:** WCAG 2.1 Level AA conformance.
* **Key Requirements:** The application will be fully keyboard navigable, provide proper screen reader support with ARIA roles, ensure all text has sufficient color contrast, and have minimum touch target sizes of 44x44 pixels for industrial usability.
* **Reduced Motion:** All non-essential animations will respect the user's `prefers-reduced-motion` OS setting, providing a static alternative.

### **8. Responsiveness Strategy**

* **Breakpoints:** A four-point system will be used (Mobile, Tablet, Laptop, Desktop) to ensure the layout is polished on all common screen sizes.
* **Adaptation:** The application will use adaptive patterns, most notably the collapsible input panel on smaller screens, to provide an optimal experience without creating separate mobile-only components.

### **9. Animation & Micro-interactions**

Motion will be used purposefully to enhance the demo and provide clear feedback.

* **Key Animations:** The "AI Generation Trace" animation will visualize the AI's process, and "Visual Change Highlighting" will draw attention to the results of user iterations.
* **Micro-interactions:** Button clicks and other interactive elements will have immediate visual feedback to make the UI feel tactile and responsive.

### **10. Handoff & Next Steps**

This UI/UX Specification is now complete and provides the full blueprint for the frontend design and development. The project is ready for the next phase.
