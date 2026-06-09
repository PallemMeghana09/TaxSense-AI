# Firebase Security Specification & TDD Payloads

This specification defines the access control limits, data integrity boundaries, and threat model payloads for the LexAI dynamic sandbox.

## 1. Data Invariants
1. **Document Ownership**: A legal document metadata entry cannot be created without a valid `ownerId` that matches the authenticated user ID (`request.auth.uid`).
2. **Read Bounds**: Any document list or get query must be strictly limited to records where `resource.data.ownerId == request.auth.uid`. No generalized query slicing is permitted.
3. **Privilege Integrity**: Role fields (e.g., `role` in `/users/{userId}`) can never be self-modified or escalated directly by standard users. Changes require explicit admin credentials.
4. **Temporal Consistency**: Timestamp values (e.g., `uploadedAt`, `createdAt`) must equal `request.time` exactly at document creation.

---

## 2. The "Dirty Dozen" Threat Payloads (Verification Cases)

### Threat 1: Identity Spoofing in Document Creation
* **Goal**: Write a document node with an arbitrary value for `ownerId` to inject logs into another client's view.
* **Payload**:
  ```json
  {
    "id": "malicious-doc-1",
    "title": "Corporate_Spy_SLA.pdf",
    "category": "Legal Contract",
    "uploadedAt": "2026-06-08T15:00:00Z",
    "uploadedBy": "Attacker",
    "ownerId": "victim-user-id-999",
    "pagesCount": 10,
    "status": "Analyzing"
  }
  ```
* **Expected**: `PERMISSION_DENIED` since `ownerId` must match the authenticated `request.auth.uid`.

### Threat 2: Privilege Escalation (Self-Assigned Admin Role)
* **Goal**: Register or update a user profile to claim `role: 'Admin'`.
* **Payload**:
  ```json
  {
    "id": "attacker-uid-123",
    "name": "Attacker Professional",
    "email": "attacker@corp.com",
    "role": "Admin",
    "organization": "SLA Hackers",
    "industry": "Threat Vectors"
  }
  ```
* **Expected**: `PERMISSION_DENIED` (only non-Admin profiles can be registered, or roles must not be altered post-creation).

### Threat 3: Shadow Ghost Field Insertion (Resource Poisoning)
* **Goal**: Inject a rogue attribute `isVerifiedAdmin: true` to bypass logical checks.
* **Payload**:
  ```json
  {
    "id": "doc-1",
    "title": "Clean_Doc.pdf",
    "category": "Legal Contract",
    "ownerId": "attacker-uid-123",
    "isVerifiedAdmin": true
  }
  ```
* **Expected**: `PERMISSION_DENIED` via strict key hasAll and size counts.

### Threat 4: Status Shortcutting (Premature Terminal State)
* **Goal**: Instantly mark an analyzing document as `status: 'Analyzed'` without running the verified background Gemini worker.
* **Payload**:
  ```json
  {
    "status": "Analyzed"
  }
  ```
* **Expected**: `PERMISSION_DENIED` because custom changes to document state fields are restricted to specific authorized helper keys other than pure client manual overrides.

### Threat 5: Large-Payload Denial of Wallet Attack
* **Goal**: Upload an excessively long title description (e.g., 2MB string) to overload storage limits.
* **Payload**:
  ```json
  {
    "id": "doc-large",
    "title": "A".repeat(100000) + ".pdf",
    "category": "Legal Contract",
    "ownerId": "attacker-uid-123",
    "status": "Analyzing"
  }
  ```
* **Expected**: `PERMISSION_DENIED` because the `.size() <= 128` string constraint is violated.

### Threat 6: Email Verification Spoofing
* **Goal**: Bypass authentication checks using a mock token claiming a corporate email but setting `email_verified: false`.
* **Expected**: `PERMISSION_DENIED` since standard rules mandate `request.auth.token.email_verified == true`.

### Threat 7: Unauthenticated List Harvesting
* **Goal**: Query all available checklists without signing in.
* **Expected**: `PERMISSION_DENIED` because `request.auth != null` acts as the Master Gate for all collections.

### Threat 8: Sibling Document Disconnection
* **Goal**: Create a ComplianceReport claiming a random orphaned document ID that does not exist in the database.
* **Expected**: `PERMISSION_DENIED` due to exact atomic validation verification via `exists()` check.

### Threat 9: Immutable Creation Dates Modification
* **Goal**: Alter the `uploadedAt` value of a historical document to manipulate auditing logs.
* **Expected**: `PERMISSION_DENIED` via immutable checks `incoming().uploadedAt == existing().uploadedAt`.

### Threat 10: Cross-Tenant Data Leakage
* **Goal**: Retrieve a specific compliance report belonging to a different user ID.
* **Expected**: `PERMISSION_DENIED` because list/get rules enforce `resource.data.ownerId == request.auth.uid`.

### Threat 11: Value Type Deserialization Break
* **Goal**: Write a boolean inside a standard string attribute (e.g., sending `title: true`).
* **Expected**: `PERMISSION_DENIED` as `.title is string` validator enforces correct types.

### Threat 12: Invalid Path Injection
* **Goal**: Inject special characters or slash parameters to breach nesting path limits.
* **Expected**: `PERMISSION_DENIED` since document IDs must match `isValidId()`.
