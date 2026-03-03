# Chef’s Special Order System

![HTML5](https://img.shields.io/badge/HTML5-Structure-orange)
![CSS3](https://img.shields.io/badge/CSS3-Styling-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5-purple)
![API](https://img.shields.io/badge/API-TheMealDB-green)

---

## Live Demo

🔗 **View Live Application:**  
[Live Demo Link Placeholder](https://your-live-site-link-here.com)

---

## Overview

The Chef’s Special Order System is a client-side web application that allows kitchen staff to generate daily specials based on available ingredients and manage active kitchen tickets in real time.

The application integrates with TheMealDB API to dynamically suggest meals and uses `sessionStorage` to maintain ticket state within a browser session.

This project demonstrates API integration, client-side state management, DOM manipulation, and defensive event handling using modern JavaScript (ES6).

---

## Application Preview

![Chef Order System Screenshot](./assets/screenshot.png)

---

## Features

- Generate chef specials using a selected ingredient  
- Fetch live meal data from TheMealDB API  
- Randomly select a meal suggestion  
- Create kitchen tickets with:
  - Unique ticket number  
  - Meal description  
  - Creation timestamp  
  - Live wait-time indicator  
  - Meal thumbnail image  
- Display only active (incomplete) tickets  
- Close tickets by ticket number  
- Persist ticket state using `sessionStorage`  
- Responsive layout using Bootstrap 5  

---

## Technologies Used

- HTML5  
- CSS3  
- Bootstrap 5  
- JavaScript (ES6+)  
- TheMealDB Public API  
- Web Storage API (`sessionStorage`)  

---

## How to Run Locally

1. Clone or download the repository.
2. Open `HTML/index.html` in your browser  
   **or**
3. Use Live Server in VS Code.

No backend setup or build tools are required.

---

## Storage Design

Ticket state is maintained using `sessionStorage`:

- `"orders"` → JSON array of ticket objects  
- `"lastOrderNumber"` → numeric ticket counter  

Data persists only while the browser tab remains open.

---

## Architectural Notes

- Defensive DOM checks prevent runtime errors.  
- State is separated from rendering logic.  
- Rendering is rebuilt from state rather than manually patched.  
- Periodic refresh updates wait-time indicators without reloading the page.  

In a production environment, persistent storage and backend services would replace `sessionStorage`.

---

## Development Notes

This project was developed as part of a personal portfolio.  
AI-assisted tools (GitHub Copilot and ChatGPT) were used for validation and refinement, with all architectural decisions and final implementation completed by the author.

---

## API Attribution

Meal data and images are provided by TheMealDB API.

---

## Image Credits

Hero background image by [Eugeniya Belova](https://unsplash.com/@evgeeeenchik) on Unsplash.