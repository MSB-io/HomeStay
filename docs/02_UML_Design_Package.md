# Software Design and UML Architecture Package
## Case Study 103: HomeStay - Booking Platform for Homestays in a Hill District (Uttarakhand)
**Deliverable Type:** Object-Oriented Analysis and Design (OOAD) Specification  
**Architecture Paradigm:** Modular Service Architecture with Loose Coupling and Event-Driven Decoupling  

---

## 1. Architectural Blueprint and Design Principles

The HomeStay platform is designed with two fundamental architectural imperatives:
1. **High Cohesion**: Every subsystem encompasses a singular, narrowly defined business responsibility (e.g., the `AvailabilityCalendar` manages date interval occupancies and holds; the `PaymentGateway` manages financial authorization, tokenization, and webhooks).
2. **Loose Coupling**: The `AvailabilityCalendar` and `PaymentProcessing` modules possess zero direct knowledge of each other's internal database schemas or APIs. Instead, they interact via an ephemeral mediator contract (the **Reservation Hold Token**) and asynchronous domain events (`HoldAcquired`, `PaymentSucceeded`, `HoldExpired`).

```mermaid
graph LR
    subgraph Client Layer
        T_UI["Tourist Web PWA"]
        O_UI["Owner Offline-First PWA"]
    end

    subgraph Core Domain Modules
        ListingMod["Listing and Profile Module"]
        CalMod["Availability Calendar Module<br/>(Cohesive Temporal State)"]
        BookingMod["Booking and Reservation Saga<br/>(Mediator / Coordinator)"]
        PayMod["Payment Processing Module<br/>(Cohesive Financial Ledger)"]
        ReviewMod["Verified Review Module"]
    end

    subgraph External Infrastructure
        PG["PCI-DSS Payment Gateway"]
        SMS_GW["Dual SMS / WhatsApp Gateway"]
        DB[("Distributed Database + Redis Lock")]
    end

    T_UI --> BookingMod
    O_UI --> CalMod
    BookingMod --> CalMod
    BookingMod --> PayMod
    PayMod --> PG
    BookingMod --> SMS_GW
    CalMod --> DB
```

---

## 2. Use Case Diagram

The use case model delineates the behavioral boundary between the system and its primary human/external actors:
* **Tourist**: Searches homestays, checks availability, pays, receives vouchers, and writes verified reviews.
* **Homestay Owner**: Manages room inventory, views offline bookings, and manually blocks direct walk-in dates.
* **Field Staff**: Conducts physical verification, captures geo-tagged photos, and configures baseline listings.
* **Association Admin**: Oversees district occupancy, monitors disputes, and tracks platform levies.
* **Payment Gateway**: Authorizes digital payments and dispatches signed webhooks.

```mermaid
flowchart LR
    subgraph Actors [Primary Actors]
        Tourist["Tourist / Guest"]
        Owner["Homestay Owner"]
        Staff["Field Onboarding Staff"]
        Admin["Tourism Association Admin"]
        PG["Payment Gateway"]
    end

    subgraph Platform ["HomeStay Booking Platform"]
        UC1(["UC-01: Search and Filter Homestays"])
        UC2(["UC-02: Check Availability and Hold Dates"])
        UC3(["UC-03: Make Online Payment"])
        UC4(["UC-04: Issue Dual Booking Voucher"])
        UC5(["UC-05: Offline Calendar Sync and View"])
        UC6(["UC-06: Block Dates for Direct Walk-ins"])
        UC7(["UC-07: Submit Post-Stay Verified Review"])
        UC8(["UC-08: Onboard Homestay and Verify Photos"])
        UC9(["UC-09: Request Cancellation and Refund"])
        UC10(["UC-10: View District Occupancy Dashboard"])
    end

    Tourist --> UC1
    Tourist --> UC2
    Tourist --> UC3
    Tourist --> UC7
    Tourist --> UC9

    UC2 -.->|include| UC3
    UC3 -.->|include| UC4
    UC3 --> PG

    Owner --> UC5
    Owner --> UC6
    Staff --> UC8
    Admin --> UC10
```

---

## 3. Domain Class Diagram

The class diagram captures the structural domain model, entity attributes, operations, and multiplicity constraints.

```mermaid
classDiagram
    class Homestay {
        +String homestayId
        +String propertyName
        +String villageName
        +String district
        +String tourismLicenseNo
        +Boolean isVerified
        +Float associationRating
        +addRoom(Room room)
        +updateListingDetails()
    }

    class Room {
        +String roomId
        +String homestayId
        +String roomType
        +int baseCapacity
        +int maxGuestCapacity
        +double pricePerNight
        +Boolean isActive
        +isAvailable(Date checkIn, Date checkOut) Boolean
    }

    class AvailabilityCalendar {
        +String calendarId
        +String roomId
        +Map dateStatusMap
        +acquireHold(DateRange dates, int ttlSeconds) HoldToken
        +releaseHold(HoldToken token) Boolean
        +confirmPermanentBlock(HoldToken token, String bookingId) Boolean
        +manualBlock(DateRange dates, String reason) Boolean
    }

    class HoldToken {
        +String tokenId
        +String roomId
        +DateRange dateRange
        +DateTime expiresAt
        +isExpired() Boolean
    }

    class Booking {
        +String bookingId
        +String touristId
        +String roomId
        +DateRange reservedDates
        +int guestCount
        +double totalAmount
        +BookingStatus status
        +DateTime createdAt
        +createHold(HoldToken token)
        +confirmBooking(String txId)
        +cancelBooking(String reason) RefundCalculation
    }

    class PaymentTransaction {
        +String transactionId
        +String bookingId
        +double amount
        +String paymentMethod
        +String gatewayReference
        +PaymentStatus status
        +DateTime timestamp
        +processPayment() Boolean
        +processRefund(double refundAmount) Boolean
    }

    class Tourist {
        +String touristId
        +String fullName
        +String mobileNumber
        +String email
        +searchHomestays(FilterCriteria criteria)
        +initiateBooking(String roomId, DateRange dates) Booking
    }

    class Review {
        +String reviewId
        +String bookingId
        +String touristId
        +int cleanlinessScore
        +int hospitalityScore
        +String comments
        +Boolean isStayVerified
        +submitReview()
    }

    Homestay "1" *-- "1..*" Room : owns
    Room "1" *-- "1" AvailabilityCalendar : tracks
    AvailabilityCalendar "1" ..> "0..*" HoldToken : issues
    Booking "1" o-- "1" HoldToken : references
    Booking "1" -- "1" PaymentTransaction : settles
    Tourist "1" -- "0..*" Booking : places
    Booking "1" -- "0..1" Review : generates
```

---

## 4. Sequence Diagram: Check Availability and Book a Stay

This diagram details the distributed flow between the client, calendar engine, distributed lock, booking orchestrator, and external payment gateway.

```mermaid
sequenceDiagram
    autonumber
    actor T as Tourist (Client Web PWA)
    participant UI as Browser / Local Cache
    participant BS as Booking Orchestration Service
    participant CS as Availability Calendar Service
    participant LK as Distributed Lock (Redis)
    participant PG as Payment Gateway
    participant NS as Notification Service (SMS/WhatsApp)
    actor HO as Homestay Owner (Offline PWA)

    T->>UI: Select Homestay, Room and Date Range
    UI->>BS: Request Check Availability (roomId, dateRange)
    BS->>CS: Query Inventory Availability (roomId, dateRange)
    CS->>CS: Check Date Overlaps in Database
    
    alt Dates Are Already Booked or Blocked
        CS-->>BS: Dates Unavailable
        BS-->>UI: Display Dates Occupied Message
    else Dates Are Available
        CS->>LK: Acquire Distributed Lock (key=roomId:dateRange, TTL=900s)
        LK-->>CS: Lock Granted (holdTokenId=HT-8921)
        CS-->>BS: Hold Secured (HoldToken, expiresAt=T+15m)
        BS-->>UI: Availability Confirmed (Start 15-min Countdown)
        
        UI->>T: Display Checkout Page with 15:00 Timer
        T->>UI: Enter Guest Count and Select UPI/Card Payment
        UI->>BS: Submit Booking and Initiate Payment (holdTokenId, guestDetails)
        
        BS->>PG: Create Payment Order (amount, orderId=ORD-5542)
        PG-->>UI: Launch Hosted Payment Modal
        T->>PG: Authorize UPI Payment on Bank App
        
        alt Payment Authorized Within 15 Minutes
            PG-->>BS: Webhook Callback payment_success (txId=TX-9901)
            BS->>BS: Verify HMAC-SHA256 Signature
            BS->>CS: Convert Hold to Permanent Block (holdTokenId, bookingId=BK-103)
            CS->>LK: Release Temporary Lock
            CS->>CS: Update Calendar State to CONFIRMED
            
            BS->>NS: Trigger Immediate Dual Confirmation
            par Dispatch SMS and WhatsApp
                NS-->>T: SMS and WhatsApp with Voucher and Location Pin
            and Notify Rural Owner
                NS-->>HO: SMS Booking Alert and Offline PWA Sync Event
            end
            BS-->>UI: Display Booking Confirmation Screen and PDF
        else Payment Timed Out or Abandoned
            LK-->>CS: TTL Expired - Automatic Lock Eviction
            CS->>CS: Restore Dates to VACANT
            PG-->>BS: Webhook payment_failed or expired
            BS-->>UI: Alert: Session Expired, Dates Released
        end
    end
```

---

## 5. Activity Diagram: Booking Workflow

The activity diagram models the complete operational decision path from search initiation through calendar lock, payment verification, and voucher generation.

```mermaid
flowchart TD
    Start([Tourist Starts Booking Flow]) --> Search["Search Homestays by District, Dates and Guests"]
    Search --> Select["Select Homestay and Room"]
    Select --> CheckDates{"Are Selected Dates Available?"}

    CheckDates -- No --> ShowUnavailable["Display Alternate Dates or Nearby Homestays"]
    ShowUnavailable --> Select

    CheckDates -- Yes --> AcquireLock["Acquire 15-Minute Temporary Hold on Dates"]
    AcquireLock --> TimerStart["Display 15:00 Checkout Countdown Timer"]
    TimerStart --> EnterDetails["Tourist Enters Guest Count and Contact Info"]
    EnterDetails --> PayAction["Proceed to Payment Gateway"]

    PayAction --> PaymentWait{"Payment Received within 15 Minutes?"}

    PaymentWait -- Timed Out or Failed --> ReleaseHold["Release Temporary Hold and Mark Dates Vacant"]
    ReleaseHold --> ShowTimeout["Alert Tourist: Hold Expired, Please Retry"]
    ShowTimeout --> EndFail([End Flow])

    PaymentWait -- Successful Authorization --> VerifySig["Verify Gateway Cryptographic Signature"]
    VerifySig --> CommitDB["Permanently Commit Booking and Block Calendar in DB"]
    CommitDB --> DispatchNotifications["Dispatch Low-Overhead SMS and WhatsApp Vouchers"]
    DispatchNotifications --> SyncOwner["Send Background Push Notification to Owner PWA"]
    SyncOwner --> EndSuccess([Booking Confirmed - End Flow])
```

---

## 6. State Machine Diagram: Booking Lifecycle

This state machine models all valid operational states and transitions across the lifespan of a booking entity.

```mermaid
stateDiagram-v2
    [*] --> INITIATED : Tourist selects room and dates
    
    INITIATED --> HOLD_PENDING_PAYMENT : Lock acquired (15 min TTL)
    
    HOLD_PENDING_PAYMENT --> EXPIRED : 15 min TTL expires without payment
    HOLD_PENDING_PAYMENT --> PAYMENT_FAILED : Gateway returns decline or auth error
    HOLD_PENDING_PAYMENT --> CONFIRMED : Gateway webhook verifies payment success
    
    EXPIRED --> [*] : Dates restored to Vacant
    PAYMENT_FAILED --> [*] : Hold released

    CONFIRMED --> CHECKED_IN : Guest arrives and OTP verified by Owner
    CONFIRMED --> CANCELLED_BY_GUEST : Guest requests cancellation
    CONFIRMED --> CANCELLED_BY_HOST : Emergency host cancellation

    CANCELLED_BY_GUEST --> REFUNDED_FULL : Cancelled over 7 days before check-in (100% refund)
    CANCELLED_BY_GUEST --> REFUNDED_PARTIAL : Cancelled 2 to 7 days before check-in (50% refund)
    CANCELLED_BY_GUEST --> NO_REFUND : Cancelled under 48 hours before check-in (0% refund)

    CANCELLED_BY_HOST --> HOST_PENALTY : 100% guest refund plus owner penalty levied
    
    CHECKED_IN --> COMPLETED : Guest checks out successfully
    
    COMPLETED --> REVIEWED : Verified guest submits rating and review (within 48 hrs)
    COMPLETED --> CLOSED : Review window passes without review
    
    REVIEWED --> [*]
    CLOSED --> [*]
    REFUNDED_FULL --> [*]
    REFUNDED_PARTIAL --> [*]
    NO_REFUND --> [*]
    HOST_PENALTY --> [*]
```

---

## 7. Architectural Justification: Coupling and Cohesion Analysis

### 7.1 Loose Coupling between Availability Calendar and Payments
In traditional, poorly architected booking platforms, the checkout module directly updates database tables for both financial transactions and room calendars inside one monolithic SQL transaction. This tight coupling creates catastrophic failures in hill districts:
* **The Failure Scenario**: If an owner's phone loses connectivity during payment, or if the external payment gateway takes 8 seconds to return a webhook, a tightly coupled calendar remains frozen or enters inconsistent states.
* **Our Decoupled Solution**:
  1. **Mediator / Token Pattern**: The `AvailabilityCalendar` knows nothing about currency, UPI IDs, credit cards, or gateway API keys. It merely issues an opaque, time-bounded cryptographic token (`HoldToken`) valid for 15 minutes.
  2. **Event-Driven Communication**: When the payment gateway authorizes funds, it communicates strictly via an asynchronous event (`PaymentSuccessEvent`). The `BookingCoordinator` receives this event, validates the signature, and asks the `AvailabilityCalendar` to execute `confirmPermanentBlock(holdTokenId)`.
  3. **Fault Isolation**: If the payment gateway suffers third-party downtime, the calendar continues to operate seamlessly for walk-in blocks and offline queries.

### 7.2 High Cohesion Within Subsystems
Each module exhibits strict functional cohesion (elements inside the module work together to fulfill a single well-defined task):

| Module | Cohesion Focus | Internalized Responsibilities | Excluded Responsibilities |
| :--- | :--- | :--- | :--- |
| **Availability Calendar** | Temporal Inventory Integrity | Date intervals, overlapping holds, conflict detection, offline calendar cache. | Payment processing, pricing rules, guest contact info. |
| **Payment Gateway Adapter**| Financial Settlement | Gateway API handshake, webhook signature validation, refund calculation, escrow holds. | Room numbers, seasonal availability, homestay photos. |
| **Listing Service** | Content and Certification | Homestay descriptions, compressed WebP photos, GPS coordinates, tourism licenses. | Real-time booking states, payment histories. |
| **Notification Engine** | Dual-Channel Dispatch | SMS templates, WhatsApp fallback webhooks, offline push sync tokens. | Booking validation, refund calculation. |
