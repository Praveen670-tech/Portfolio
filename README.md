# PRAVEEN N - Portfolio Website

A modern, responsive personal portfolio website built with HTML, CSS, and JavaScript. It highlights my background, projects, skills, certifications, and contact information in a polished, professional layout.

## ✨ Features

- Responsive glassmorphism-inspired UI for desktop, tablet, and mobile
- Smooth scrolling navigation and animated section reveals
- Typing animation in the hero section
- Dynamic Certifications section that automatically discovers certificate files from the project
- Preview and download actions for each certificate
- Contact form integrated with Formspree
- Resume download button

## 📁 Project Structure

- index.html — Main portfolio structure
- styles.css — Visual design, layout, and animations
- script.js — Navigation, reveal animations, typing effect, and certificate carousel
- form.js — Contact form handling and Formspree submission logic
- assets/ — Images, resume, and certificate files
- scripts/generate-certificates-manifest.js — Generates the certificate data used by the portfolio

## 🧾 Certificate Automation

The Certifications section is powered by certificate files already present in the project.

Supported formats:
- PDF
- PNG
- JPG
- JPEG
- WEBP

To refresh the certificate gallery after adding new files:

```bash
node scripts/generate-certificates-manifest.js
```

This generates:
- assets/certificates/certificates.json
- assets/certificates/certificates-data.js

## ▶️ How to Run Locally

You can open the site directly in a browser, or serve it locally:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

## 🔧 Notes

- The portfolio uses only HTML, CSS, and JavaScript.
- The contact form requires a valid Formspree endpoint in form.js.
- New certificates can be added to the certificate folders and will appear automatically after regeneration.

