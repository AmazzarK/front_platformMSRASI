# MSRASI Portal & Admin Console Security Specification

## 1. Data Invariants
1. **Default Deny**: All unspecified Firestore paths must reject reads and writes.
2. **Admin Privilege Integrity**: Only verified users (`email_verified == true`) whose email is the bootstrapped admin (`amazzar.consult@gmail.com`) or who exist in `/admins/{uid}` have administrative permissions. Clients can never self-assign admin status.
3. **Public vs Draft Isolation**: Public visitors may only `get` or `list` `/events` with `status in ['publie', 'cloture']` and `/articles` with `status == 'publie'`. Drafts, pending, and archived items are restricted to verified admins.
4. **PII Isolation**: `/registrations` and `/newsletter_subscribers` contain PII (`email`, `phone`). Unauthenticated users and non-admin users cannot `get` or `list` other users' registrations or subscriber lists.
5. **Orphan Prevention**: Every `/registrations` create must verify via `exists()` that the target `eventId` exists in `/events/{eventId}` and that `consentCNDP == true`.
6. **Immutable Ownership & Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on updates; `updatedAt` must equal `request.time` on updates.
7. **Strict Key Allowlists & Size Bounds**: Every create enforces `keys().hasAll(...)` and `keys().hasOnly(...)`, every string enforces `.size()` bounds, and every array enforces `.size() <= 10`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Event Create**: Adding `isSuperFeatured: true` to `/events/{id}` -> Rejected by `hasOnly(...)`.
2. **ID Poisoning**: Creating `/events/invalid$id_with_1500_chars...` -> Rejected by `isValidId(eventId)`.
3. **Unverified Email Admin Spoof**: Calling `create` on `/events` with `email: "amazzar.consult@gmail.com"` and `email_verified: false` -> Rejected by `isVerifiedUser()`.
4. **Draft Leak via List Query**: Non-admin listing `/events` without filtering `status in ['publie', 'cloture']` -> Rejected by `allow list` evaluating `resource.data.status`.
5. **PII Scraping on Registrations**: Non-admin calling `get` or `list` on `/registrations` -> Rejected.
6. **Self-Admin Escalation**: Authenticated non-admin writing `/admins/{uid}` -> Rejected.
7. **Orphan Registration**: Creating a registration with nonexistent `eventId: "fake-event-999"` -> Rejected by `exists(/databases/$(database)/documents/events/$(incoming().eventId))`.
8. **Missing CNDP Consent**: Creating a registration with `consentCNDP: false` -> Rejected by `isValidRegistration()`.
9. **Client Timestamp Forgery**: Creating an event with backdated `createdAt` (`!= request.time`) -> Rejected.
10. **Immutable Field Mutation**: Updating an event to change `createdBy` or `createdAt` -> Rejected.
11. **Oversized Array Injection**: Creating an event with `tags` array containing 25 items -> Rejected by `tags.size() <= 10`.
12. **Activity Log Tampering**: Attempting to `update` or `delete` `/activity_logs/{logId}` -> Rejected (`allow update, delete: if false`).
