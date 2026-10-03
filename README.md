# HomeStay - Booking Platform for Homestays in a Hill District (Uttarakhand)
## Software Engineering and Project Management (SEPM) - Case Study 103
**Institution:** ITM Skills University - School of Future Tech  
**Project Sponsor:** Uttarakhand District Tourism Department and District Tourism Association  
**Target Release Window:** 16 Calendar Weeks (Pre-Summer Season Launch)  

---

## Problem Statement and Context

A district tourism association represents **260 homestays** in the rugged hills of Uttarakhand. Currently, bookings are taken informally over phone calls and WhatsApp, leading to:
* Frequent **overbooking and double-booking** during peak tourist season.
* Tourists having **no transparent way to verify listing quality**, authentic photos, or amenities.
* Homestay owners suffering from **weak, intermittent internet connectivity** and **limited digital/smartphone experience**.
* The Tourism Department funding the platform with a strict statutory requirement: **go live before the summer tourist season in 16 weeks**, backed by rigorous justification and quantitative engineering artifacts.

---

## Project Repository Structure

```
Case_Study_103_HomeStay_Booking_Platform/
|-- README.md                               # Project overview and executive mathematical summaries
|-- presentation.md                         # 15-20 min Master Presentation Deck (Layman SRS & Architecture)
|-- app/                                    # Interactive React 19 + TypeScript + Tailwind v4 Prototype
|   |-- README.md                           # Frontend architecture and run guide
|   |-- package.json                        # Dependencies (Tailwind v4, Lucide, Geist font, React Router)
|   |-- public/images/                      # High-res photography of homestays, verandas, and villages
|   \-- src/
|       |-- components/                     # Layout, UI primitives (rounded-md), cards, calendar
|       |-- data/mock.ts                    # Realistic mock DB mirroring the 260-homestay case study
|       |-- pages/                          # 7 views: Home, Listing, Checkout, Voucher, Trips, Owner, Association
|       \-- store/store.tsx                 # Centralized React state provider
|-- docs/                                   # SEPM Engineering and Management Specifications
|   |-- 01_SRS_Document.md                  # IEEE 830 Requirements Specification & RTM
|   |-- 02_UML_Design_Package.md            # UML 2.5 Architecture Diagrams & Loose Coupling
|   |-- 03_Project_Plan.md                  # WBS, CPM Network Analysis & 16-Week Gantt
|   |-- 04_Estimation_Sheet.md              # Mathematical Feasibility Proofs & PERT Analysis
|   |-- 05_Test_Plan_and_Evidence.md        # BVA/ECP Test Suites, Decision Table & DRE
|   \-- 06_Risk_Register_and_Status_Report.md # Week-8 EVM, 5x5 Risk Matrix & RMMM Plans
\-- assets/
    |-- case_study_brief_page_1.png         # Scanned original case study assignment sheet (Page 1)
    \-- case_study_brief_page_2.png         # Scanned original case study assignment sheet (Page 2)
```

---

## Deliverables Directory

All required deliverables have been systematically developed as modular, standalone specifications adhering to IEEE standards, UML 2.5 modeling, Critical Path Method (CPM), Earned Value Management (EVM), and formal software quality engineering principles:

| File / Folder | Deliverable Title | Core Contents and Key Highlights |
| :--- | :--- | :--- |
| [`presentation.md`](presentation.md) | **Master Presentation Document** | 15–20 minute non-technical executive walkthrough covering the problem statement, given data vs. objectives, in-depth SRS walkthrough, and rapid Q&A defense. |
| [`app/`](app/) | **Interactive Web Application** | Fully responsive React 19 + TypeScript + Tailwind v4 frontend prototype demonstrating search with BVA limits, 15-min hold countdown, checkout webhook simulation, QR voucher, offline owner mode, and association EVM dashboard. |
| [`01_SRS_Document.md`](docs/01_SRS_Document.md) | **Software Requirements Specification (IEEE 830)** | Multi-stakeholder elicitation (Tourists, Owners, Association, Tourism Dept); **10 Functional Requirements**; **6 Measurable NFRs** (low-bandwidth bundle <= 450 KB, uptime >= 99.5%, PCI-DSS payment security, offline resilience); MoSCoW prioritization; Requirements Traceability Matrix (RTM). |
| [`02_UML_Design_Package.md`](docs/02_UML_Design_Package.md) | **UML Architecture and Design Package** | Complete Mermaid diagrams: **Use Case Diagram**, **Domain Class Diagram**, **Sequence Diagram** (Check availability and book a stay with 15-minute lock), **Activity Diagram**, **Booking State Machine Diagram**; In-depth architectural justification for **loose coupling** (Calendar vs Payments via temporary hold tokens) and **high module cohesion**. |
| [`03_Project_Plan.md`](docs/03_Project_Plan.md) | **Project Plan and Schedule Management** | 4-level Work Breakdown Structure (WBS); **CPM Network Diagram** with Early/Late start/finish and Float calculations; **Critical Path Analysis** (A -> B -> C -> D -> F -> I -> K -> M -> N = 78 days); **16-Week Master Mermaid Gantt Chart**; Resource loading across 3 Devs and 3 Field Staff. |
| [`04_Estimation_Sheet.md`](docs/04_Estimation_Sheet.md) | **Estimation Sheet and Feasibility Analysis** | Exact step-by-step mathematical derivations: Onboarding (260 * 2.5h / 15h/day = 43.33 approx 44 days / 8.7 wks), Development (1,150h / 18h/day = 63.89 approx 64 days / 12.8 wks); Pipelined feasibility proof for the 16-week summer deadline; PERT 3-point estimation; Cone of Uncertainty; Formal rationale on **"Why an estimate is a probabilistic forecast, not a promise"**. |
| [`05_Test_Plan_and_Evidence.md`](docs/05_Test_Plan_and_Evidence.md) | **Test Plan and Quality Evidence** | **Boundary Value Analysis (BVA)** for `guest_count` [1 - 10] and `stay_length` [1 - 30]; Equivalence Class Partitioning (ECP); Comprehensive **Decision Table for Overbooking Prevention and Tiered Cancellation Rules** (>7 days 100%, 2 - 7 days 50%, <48h 0%, host penalties); Formal Defect Log; **Defect Density (1.60 defects/KLOC)** and **Defect Removal Efficiency (DRE = 92.00%)** calculations. |
| [`06_Risk_Register_and_Status_Report.md`](docs/06_Risk_Register_and_Status_Report.md) | **Monitoring, Control and Risk Register** | **Week-8 Earned Value Analysis**: PV = 6.0L, AC = 5.2L, EV = 5.04L, CV = -16,000 (cost overrun), SV = -96,000 (16% schedule slippage), CPI = 0.969, SPI = 0.840; Plain-language executive status report for Tourism Department; Corrective action plan and approval hierarchy; 5x5 Risk Matrix; **RMMM Plans** for top 3 risks (weak connectivity, peak overbooking, low smartphone literacy); **Realized Issue Log**; Project Closure and Lessons Learned. |

---

## Core Mathematical Summary

### 1. Onboarding Duration
* Total Effort = 260 homestays * 2.5 hrs = 650 person-hours
* Daily Capacity = 3 field staff * 5 hrs/day = 15 person-hours/day
* Duration = 650 / 15 = **43.33 approx 44 working days** -> **8.67 weeks (5-day)** or **7.22 weeks (6-day)**

### 2. Software Development Duration
* Total Effort = 1,150 person-hours
* Daily Capacity = 3 developers * 6 hrs/day = 18 person-hours/day
* Duration = 1,150 / 18 = **63.89 approx 64 working days** -> **12.78 weeks (5-day)** or **10.65 weeks (6-day)**

### 3. Week-8 Earned Value Management (EVM)
* **Planned Value (PV)**: Rs 6.00 Lakh (50% planned of Rs 12.00 Lakh BAC)
* **Actual Cost (AC)**: Rs 5.20 Lakh
* **Earned Value (EV)**: Rs 12.00L * 0.42 = **Rs 5.04 Lakh**
* **Cost Variance (CV)**: EV - AC = 5.04 - 5.20 = **-Rs 0.16 Lakh (-Rs 16,000)**
* **Schedule Variance (SV)**: EV - PV = 5.04 - 6.00 = **-Rs 0.96 Lakh (-Rs 96,000)** (16% slippage)
* **Cost Performance Index (CPI)**: 5.04 / 5.20 = **0.969** (Rs 1.03 spent per Rs 1.00 earned)
* **Schedule Performance Index (SPI)**: 5.04 / 6.00 = **0.840** (Operating at 84% speed)

### 4. Software Quality Metrics
* **Defect Density**: 24 defects / 15.0 KLOC = **1.60 defects/KLOC** (Within standard benchmark of 1.0 - 3.0)
* **Defect Removal Efficiency (DRE)**: [46 / (46 + 4)] * 100% = **92.00%** (Surpasses 85% industry standard)

---

## Running the Web App Prototype Locally

The project includes a complete, fully interactive React 19 + TypeScript + Tailwind CSS v4 prototype in the [`app/`](app/) directory:

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser to experience the platform with live mock data.

---

## Viewing the Documents
All markdown files contain native **Mermaid diagrams** that render automatically in GitHub, VS Code / Antigravity IDE markdown preview, and standard Markdown rendering engines.
