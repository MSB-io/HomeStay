# HomeStay – Booking Platform for Homestays in a Hill District (Uttarakhand)
## Software Engineering & Project Management (SEPM) — Case Study 103
**Institution:** ITM Skills University — School of Future Tech  
**Project Sponsor:** Uttarakhand District Tourism Department & District Tourism Association  
**Target Release Window:** 16 Calendar Weeks (Pre-Summer Season Launch)  

---

## 📌 Problem Statement & Context

A district tourism association represents **260 homestays** in the rugged hills of Uttarakhand. Currently, bookings are taken informally over phone calls and WhatsApp, leading to:
* Frequent **overbooking and double-booking** during peak tourist season.
* Tourists having **no transparent way to verify listing quality**, authentic photos, or amenities.
* Homestay owners suffering from **weak, intermittent internet connectivity** and **limited digital/smartphone experience**.
* The Tourism Department funding the platform with a strict statutory requirement: **go live before the summer tourist season in 16 weeks**, backed by rigorous justification and quantitative engineering artifacts.

---

## 📂 Project Repository Structure

```
📁 Case_Study_103_HomeStay_Booking_Platform/
│
├── 📄 README.md                            # Master Index, Project Overview & Case Summary
│
├── 📁 docs/                                # Formal SEPM Deliverable Documents
│   ├── 📄 01_SRS_Document.md               # IEEE 830 SRS Specification
│   ├── 📄 02_UML_Design_Package.md         # UML Diagrams (Mermaid) & Architectural Design
│   ├── 📄 03_Project_Plan.md               # WBS, CPM Network Diagram & 16-Week Gantt Chart
│   ├── 📄 04_Estimation_Sheet.md           # Durations, Math Derivations & Feasibility Analysis
│   ├── 📄 05_Test_Plan_and_Evidence.md     # BVA, ECP, Decision Table, Defect Log & DRE
│   └── 📄 06_Risk_Register_and_Status_Report.md # Week-8 EVM, 5x5 Risk Matrix & RMMM
│
└── 📁 assets/                              # Case Study Materials & Screenshots
    ├── 🖼️ Screenshot 2026-09-30 at 8.52.11 PM.png # Case Study Brief (Part 1)
    └── 🖼️ Screenshot 2026-09-30 at 8.52.27 PM.png # Case Study Brief (Part 2)
```

---

## 📂 Deliverables Directory

All required deliverables have been systematically developed as modular, standalone specifications adhering to IEEE standards, UML 2.5 modeling, Critical Path Method (CPM), Earned Value Management (EVM), and formal software quality engineering principles:

| File Name | Deliverable Title | Core Contents & Key Highlights |
| :--- | :--- | :--- |
| 📄 [`01_SRS_Document.md`](docs/01_SRS_Document.md) | **Software Requirements Specification (IEEE 830)** | Multi-stakeholder elicitation (Tourists, Owners, Association, Tourism Dept); **10 Functional Requirements**; **6 Measurable NFRs** (low-bandwidth $\le 450\text{KB}$ bundle, $\ge 99.5\%$ uptime, PCI-DSS payment security, offline resilience); MoSCoW prioritization; Requirements Traceability Matrix (RTM). |
| 📄 [`02_UML_Design_Package.md`](docs/02_UML_Design_Package.md) | **UML Architecture & Design Package** | Complete Mermaid diagrams: **Use Case Diagram**, **Domain Class Diagram**, **Sequence Diagram** (*Check availability and book a stay* with 15-minute lock), **Activity Diagram**, **Booking State Machine Diagram**; In-depth architectural justification for **loose coupling** (Calendar vs Payments via temporary hold tokens) and **high module cohesion**. |
| 📄 [`03_Project_Plan.md`](docs/03_Project_Plan.md) | **Project Plan & Schedule Management** | 4-level Work Breakdown Structure (WBS); **CPM Network Diagram** with Early/Late start/finish and Float calculations; **Critical Path Analysis** ($A \to B \to C \to D \to F \to I \to K \to M \to N = 78 \text{ days}$); **16-Week Master Mermaid Gantt Chart**; Resource loading across 3 Devs and 3 Field Staff. |
| 📄 [`04_Estimation_Sheet.md`](docs/04_Estimation_Sheet.md) | **Estimation Sheet & Feasibility Analysis** | Exact step-by-step mathematical derivations: Onboarding ($260 \times 2.5\text{h} / 15\text{h/day} = 43.33 \approx 44 \text{ days}$ / $8.7\text{ wks}$), Development ($1,150\text{h} / 18\text{h/day} = 63.89 \approx 64 \text{ days}$ / $12.8\text{ wks}$); Pipelined feasibility proof for the 16-week summer deadline; PERT 3-point estimation; Cone of Uncertainty; Formal rationale on **"Why an estimate is a probabilistic forecast, not a promise"**. |
| 📄 [`05_Test_Plan_and_Evidence.md`](docs/05_Test_Plan_and_Evidence.md) | **Test Plan & Quality Evidence** | **Boundary Value Analysis (BVA)** for `guest_count` [1–10] and `stay_length` [1–30]; Equivalence Class Partitioning (ECP); Comprehensive **Decision Table for Overbooking Prevention and Tiered Cancellation Rules** (>7 days 100%, 2–7 days 50%, <48h 0%, host penalties); Formal Defect Log; **Defect Density ($1.60\text{ defects/KLOC}$)** and **Defect Removal Efficiency ($\text{DRE} = 92.00\%$)** calculations. |
| 📄 [`06_Risk_Register_and_Status_Report.md`](docs/06_Risk_Register_and_Status_Report.md) | **Monitoring, Control & Risk Register** | **Week-8 Earned Value Analysis**: $PV = ₹6.0\text{L}$, $AC = ₹5.2\text{L}$, $EV = ₹5.04\text{L}$, $CV = -₹16,000$ (cost overrun), $SV = -₹96,000$ (16% schedule slippage), $CPI = 0.969$, $SPI = 0.840$; Plain-language executive status report for Tourism Department; Corrective action plan & approval hierarchy; 5×5 Risk Matrix; **RMMM Plans** for top 3 risks (weak connectivity, peak overbooking, low smartphone literacy); **Realized Issue Log**; Project Closure & Lessons Learned. |

---

## 🔢 Core Mathematical Summary

### 1. Onboarding Duration
$$\text{Total Effort} = 260 \text{ homestays} \times 2.5 \text{ hrs} = 650 \text{ person-hours}$$
$$\text{Daily Capacity} = 3 \text{ field staff} \times 5 \text{ hrs/day} = 15 \text{ person-hours/day}$$
$$\text{Duration} = \frac{650}{15} = \mathbf{43.33 \approx 44 \text{ working days}} \implies \mathbf{8.67 \text{ weeks (5-day)}} \text{ or } \mathbf{7.22 \text{ weeks (6-day)}}$$

### 2. Software Development Duration
$$\text{Total Effort} = 1,150 \text{ person-hours}$$
$$\text{Daily Capacity} = 3 \text{ developers} \times 6 \text{ hrs/day} = 18 \text{ person-hours/day}$$
$$\text{Duration} = \frac{1,150}{18} = \mathbf{63.89 \approx 64 \text{ working days}} \implies \mathbf{12.78 \text{ weeks (5-day)}} \text{ or } \mathbf{10.65 \text{ weeks (6-day)}}$$

### 3. Week-8 Earned Value Management (EVM)
* **Planned Value ($PV$)**: ₹6.00 Lakh ($50\%$ planned of ₹12.00 Lakh $BAC$)
* **Actual Cost ($AC$)**: ₹5.20 Lakh
* **Earned Value ($EV$)**: $₹12.00\text{L} \times 0.42 = \mathbf{₹5.04 \text{ Lakh}}$
* **Cost Variance ($CV$)**: $EV - AC = 5.04 - 5.20 = \mathbf{-₹0.16 \text{ Lakh}} \text{ (-₹16,000)}$
* **Schedule Variance ($SV$)**: $EV - PV = 5.04 - 6.00 = \mathbf{-₹0.96 \text{ Lakh}} \text{ (-₹96,000)}$ *(16% slippage)*
* **Cost Performance Index ($CPI$)**: $\frac{5.04}{5.20} = \mathbf{0.969}$ *(₹1.03 spent per ₹1.00 earned)*
* **Schedule Performance Index ($SPI$)**: $\frac{5.04}{6.00} = \mathbf{0.840}$ *(Operating at 84% speed)*

### 4. Software Quality Metrics
* **Defect Density**: $\frac{24 \text{ defects}}{15.0 \text{ KLOC}} = \mathbf{1.60 \text{ defects/KLOC}}$ *(Within standard benchmark of 1.0–3.0)*
* **Defect Removal Efficiency (DRE)**: $\frac{46}{46 + 4} \times 100\% = \mathbf{92.00\%}$ *(Surpasses 85% industry standard)*

---

## 🛠️ Viewing the Documents
All markdown files contain native **Mermaid diagrams** that render automatically in GitHub, VS Code / Antigravity IDE markdown preview, and standard Markdown rendering engines.
