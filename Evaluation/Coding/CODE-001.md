# Benchmark Specification: CODE-001 (JWT Authentication)

*   **Benchmark ID:** `CODE-001`
*   **Difficulty:** `Intermediate`
*   **Task:** `Implement JWT Authentication.`
*   **Repeatability Target:** `95%`
*   **Allowed Variance:** `<5%`

---

## 1. Execution Environment Constraints

*   **OS Baseline:** Cross-platform (Windows / Linux / macOS)
*   **Runtime:** Python 3.10+
*   **Database:** Relational Database (SQLite / PostgreSQL)
*   **Target Core Dependencies:**
    *   Web Framework: Django 5.x + Django REST Framework
    *   Auth Library: djangorestframework-simplejwt 5.x
    *   XSS Sanitizer: bleach 6.x
*   **Execution Command:** Test suite runner (e.g., `python manage.py test`)

---

## 2. Acceptance Criteria

### AC-01: User Registration Unique Constraints
*   **Given:** A registration payload with an email address that already exists in the database.
*   **When:** Registration endpoint is called.
*   **Then:** Registration must be rejected and prevent duplicate user creation.
*   **Verification:** Automated test asserting boundary rejections.
*   **Evidence:** HTTP 400 Bad Request with field-specific email validation error.

### AC-02: Password Policy Enforcement
*   **Given:** A registration payload with a weak password (violating configured security policies).
*   **When:** Registration endpoint is called.
*   **Then:** Registration must validate the password and reject it against password policy guidelines.
*   **Verification:** Automated test asserting validation rejections.
*   **Evidence:** HTTP 400 Bad Request with specific password validation messages.

### AC-03: Token Generation on Login
*   **Given:** Valid registered user credentials.
*   **When:** Login endpoint is called.
*   **Then:** Server must return both a valid Access Token and a Refresh Token.
*   **Verification:** Automated test inspecting payload dictionary keys.
*   **Evidence:** HTTP 200 OK containing JSON payload with `access` and `refresh` token fields.

### AC-04: API Token Authorization Guard
*   **Given:** A protected API endpoint.
*   **When:** A request is sent without a valid Bearer token in the `Authorization` header.
*   **Then:** Access to the resource must be blocked.
*   **Verification:** Automated test with cleared request credentials.
*   **Evidence:** HTTP 401 Unauthorized.

### AC-05: Refresh Token Rotation
*   **Given:** A valid refresh token.
*   **When:** Token refresh endpoint is called.
*   **Then:** Server must return a new access token and invalidate (blacklist) the old refresh token.
*   **Verification:** Automated test asserting rotation and subsequent invalidation.
*   **Evidence:** HTTP 200 OK on first request, followed by HTTP 401 Unauthorized on subsequent reuse of the rotated token.

### AC-06: JWT Token Invalidation (Logout Blacklist)
*   **Given:** A valid refresh token.
*   **When:** Logout endpoint is called.
*   **Then:** Refresh token must become invalid (blacklisted).
*   **Verification:** Automated test.
*   **Evidence:** HTTP 401 Unauthorized on subsequent attempts to use the blacklisted refresh token.

### AC-07: Public Health Check Exemption
*   **Given:** Public health check endpoint.
*   **When:** Endpoint is called without any authorization headers.
*   **Then:** The endpoint must return system database status.
*   **Verification:** Automated test.
*   **Evidence:** HTTP 200 OK with JSON response including database health status indicators.
