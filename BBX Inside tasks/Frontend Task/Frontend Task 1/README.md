# Adithyan V — Accessible Personal Portfolio

## Project Overview

This project is a personal portfolio website built using semantic HTML and minimal CSS. It presents my background, technical skills, projects, education, experience, and contact information.

The project focuses on accessible page structure, keyboard navigation, meaningful alternative text, and readable content.

## Technologies Used

- HTML5
- Minimal CSS
- Browser developer tools
- Lighthouse
- axe DevTools
- Keyboard and screen-reader testing

No JavaScript or CSS frameworks are used.

## Project Structure

```text
accessibility-portfolio/
├── index.html
├── README.md
├── images/
│   ├── profile.jpg
│   ├── web-development.jpg
│   ├── python.jpg
│   ├── web-scraping.jpg
│   └── decorative.jpg
└── evidence/
    ├── heading-outline.txt
    ├── console-output.txt
    ├── lighthouse-audit.txt
    ├── axe-audit.txt
    ├── keyboard-test.txt
    └── screen-reader-review.txt
```

## Accessibility Features

1. A valid HTML5 document structure.
2. Language, character encoding, viewport, title, and description metadata.
3. Semantic elements such as `header`, `nav`, `main`, `article`, `section`, `aside`, `figure`, `figcaption`, `time`, and `footer`.
4. One main heading with a logical heading hierarchy.
5. A skip-to-main-content link.
6. Meaningful alternative text for informative images.
7. An empty alternative attribute for a decorative image.
8. A data table with a caption, `thead`, `tbody`, and correctly scoped row and column headers.
9. Visible keyboard focus indicators.
10. Descriptive navigation and contact links.

## Testing Instructions

### Heading Outline

Use a heading-outline browser extension to inspect all headings. Save the actual output in `evidence/heading-outline.txt`.

### Lighthouse

1. Open the portfolio in Chrome.
2. Open Developer Tools.
3. Select Lighthouse.
4. Run an accessibility audit.
5. Save the actual score and reported issues.
6. Fix the issues and run the audit again.

### axe DevTools

Run axe DevTools on the portfolio. Record the violations, fixes, and results of the second scan.

### Keyboard Testing

Navigate the complete page using Tab, Shift+Tab, and Enter. Confirm that the skip link works and focus remains visible.

### Screen Reader Testing

Use NVDA on Windows or another available screen reader. Record confusing announcements, navigation issues, and the changes made after testing.

## Why Does Semantic HTML Matter?

Semantic HTML matters for three main reasons.

**1. Accessibility:** Semantic elements describe the purpose of webpage regions. Screen readers can use this structure to help users navigate headings, landmarks, and content. Meaningful alternative text also makes informative images understandable to users who cannot see them.

**2. Maintainability:** Semantic HTML makes source code easier to read and maintain. Developers can identify the purpose of each section without interpreting many generic containers. This improves debugging and future updates.

**3. Document structure and discoverability:** Semantic elements and logical headings communicate relationships between content sections. This helps browsers and search engines interpret the page more effectively. Semantic HTML alone does not guarantee higher search rankings, but it provides a well-organised document structure.

Overall, semantic HTML supports accessible navigation, readable code, and meaningful content organisation.

## Important Notes

- Audit scores must be recorded from actual tests.
- The heading outline must come from the installed browser extension.
- This HTML-only version does not include the assignment's three JavaScript execution examples or their console timestamps.
- Passing an automated audit does not guarantee that every accessibility issue has been resolved.
