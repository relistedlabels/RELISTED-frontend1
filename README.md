# RELISTED – Frontend

The **RELISTED Frontend** is the user-facing application for the Relisted platform.
It delivers a fast, responsive, and scalable user experience while communicating securely with the Relisted backend APIs.

The frontend is built using modern React and Next.js architecture, optimized for performance, SEO, and maintainability.

--- 

..............

## 📌 Project Overview

The RELISTED Frontend is responsible for:

- User interface and user experience
- Client-side authentication flow
- API communication with the backend
- Form handling and validation
- Media uploads and previews
- Responsive design across devices

The application follows a modular, component-driven architecture to support rapid feature development and scalability.

---

## 🛠 Tech Stack

### Core Technologies

- **Next.js** – React framework for server-side rendering, routing, and performance optimization
- **React** – Component-based UI library
- **TypeScript** – Static typing for reliability and maintainability
- **Tailwind CSS** – Utility-first styling framework

### Supporting Libraries & Tools

- **Cloudinary** – Client-side media uploads and image optimization
- **JWT** – Authentication token handling
- **Axios / Fetch** – API communication
- **Formik / React Hook Form** – Form state management
- **Zod / Yup** – Schema validation
- **Lucide / React Icons** – Iconography
- **date-fns** – Date formatting and manipulation

---

## 🔐 External Services & Accounts

Some integrations require external accounts and credentials:

- **Cloudinary**
- **Backend API access**
- **Authentication secrets**

All setup instructions, keys, and configuration details are documented in a **secure Google Docs file**.

👉 **Access will be granted to authorized contributors only**

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have:

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Git**

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-org/RELISTED-Frontend.git
cd RELISTED-Frontend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

---

### 3️⃣ Environment Variables

Create a `.env.local` file in the root directory.

Required variables (API URLs, Cloudinary keys, auth config, etc.) are listed in the **secure Google Docs** shared with the team.

> ⚠️ Do not commit `.env.local` files.

---

### 4️⃣ Run the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## 🔁 API Communication

- All API requests are routed through a centralized service layer
- Authenticated requests automatically attach JWT tokens
- Errors are handled consistently across the app

---

## ☁️ Media Uploads (Cloudinary)

- Client-side uploads with secure presets
- Real-time image previews
- Optimized image delivery using Cloudinary transformations

> Upload presets and keys are documented in the secure setup guide.

---

## 🎨 Styling & UI

- Tailwind CSS for fast and consistent styling
- Responsive-first design approach
- Reusable UI components for maintainability
- Dark mode support (if enabled)

---

## 🧪 Scripts

Common scripts:

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Lint codebase
```

---

## 🤝 Contributing Guide

### Branching Strategy

- `main` → production
- `develop` → active development
- Feature branches:

  ```bash
  feature/<feature-name>
  bugfix/<bug-name>
  ```

---

### Contribution Workflow

1. Create a branch from `develop`
2. Implement your feature or fix
3. Ensure the app builds and passes lint checks
4. Commit with clear, descriptive messages
5. Open a Pull Request to `develop`
6. Request at least one review

---

### Commit Message Convention

```text
feat: add checkout page layout
fix: resolve auth redirect issue
refactor: simplify api service logic
```

---

## 🛡 Best Practices

- Keep components small and reusable
- Avoid hard-coding API URLs or secrets
- Use shared types for API responses
- Follow existing folder and naming conventions

---

## 📄 License

This project is private and proprietary.
Unauthorized use or distribution is prohibited.

---
