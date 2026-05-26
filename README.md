# Omega Assessment Kernel 

The **Omega Assessment Kernel** is a high-fidelity, multi-tenant examination engine designed to host online assessments while strictly enforcing test environment integrity through client-side sandbox restrictions and backend telemetry verification.

## 👥 Core System Nodes

### 1. Administrative Node (Teacher Dashboard)
* **Google OAuth2 Integration:** Secure instructor onboarding and multi-tenant login restriction using official Google Identity services with optional organizational domain locks.
* **Automated Ingestion Pipeline:** Ingest standard Microsoft Word (`.docx`) test papers. The backend line-parsing framework (`mammoth`) automatically converts unstructured document text into structured JSON database arrays.
* **Telemetry Control Deck:** Real-time data aggregation engine compiling core testing metrics (class performance averages, ceiling/floor scores) and explicit security anomaly tracking logs.
* **Global Protocol Variable Maps:** Instructors can globally configure exam parameters, including total runtime duration boundaries and maximum allowed screen/focus focus mutations.

### 2. Student Node (Sandboxed Exam Environment)
* **Enforced Display Isolation:** Initiates a strict, mandatory browser fullscreen layout configuration on exam initialization to block secondary desktop application splits.
* **Focus Mutation Tracking Vectors:** Active runtime monitoring for window `blur` and document `visibilitychange` events to log when candidates attempt to switch tabs or minimize application contexts.
* **Peripheral & Navigation Controls Lock:** Intercepts and blocks standard right-click context menus, browser reload routines, and developer console execution mapping keys (`F12`, `Ctrl+Shift+I`).
* **Auto-Submission Fallbacks:** Triggers a forced server sync transaction packet to securely push current candidate inputs when the session duration hits zero or focus violation thresholds are exceeded.

## 🛠️ Technical Architecture & Stack

* **Frontend:** Minimalist dark-themed workspace layout styled entirely using **Tailwind CSS** components and managed through asynchronous JavaScript execution states.
* **Backend Framework:** **Node.js** and **Express** RESTful API micro-routing layer handling cryptographic identity token evaluation, data pipeline mapping, and binary stream parsing.
* **Database Layer:** **MongoDB Atlas** cloud cluster managed securely through the **Mongoose** object data modeling (ODM) driver framework for persistent asset schemas.

## 🚀 Local Deployment Setup

### 1. Clone & Install Dependencies
```bash
git clone [https://github.com/TamilSelvam616/Omega-Assess-Kernel.git](https://github.com/TamilSelvam616/Omega-Assess-Kernel.git)
cd Omega-Assess-Kernel
npm install
