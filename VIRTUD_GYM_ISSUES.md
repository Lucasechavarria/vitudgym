# VIRTUD GYM - Issues & Areas for Repair

This document summarizes the identified issues, potential bugs, and areas for improvement in the VIRTUD GYM application.

## 1. Critical Issues

### 1.1. Potential Security Vulnerability in RLS Policies

- **Issue:** The Row Level Security (RLS) policy for coaches to view member profiles is overly permissive. The current policy allows coaches to view *all* member profiles, not just the profiles of members assigned to them.
- **Location:** `supabase/schema.sql`
- **Impact:** This could be a significant privacy violation, as coaches can access the personal and medical information of members they do not train.
- **Recommendation:** The policy should be updated to restrict access to only the profiles of members who have the coach's ID in their `assigned_coach_id` field.

## 2. Major Issues

### 2.1. Widespread Use of `any` Type

- **Issue:** The codebase is littered with the `any` type, which effectively disables TypeScript's static type checking. This is the cause of the 300+ linter warnings.
- **Location:** Throughout the `src` directory, especially in the `services` folder.
- **Impact:** This increases the risk of runtime errors, makes the code harder to understand and refactor, and reduces the benefits of using TypeScript.
- **Recommendation:** Gradually replace `any` with more specific types. This can be done by defining interfaces or types for the data structures used in the application.

### 2.2. Error in AI Service JSON Parsing

- **Issue:** The `generateRoutineFromPrompt` method in the `AIService` class has an error in its error handling logic. The test logs show the error "Invalid JSON" when the AI service returns a non-JSON response. The code attempts to parse the response text as JSON without properly checking if it's a valid JSON string.
- **Location:** `src/services/ai.service.ts`
- **Impact:** If the AI service returns an error message or any other non-JSON response, the application will crash when trying to parse the response.
- **Recommendation:** Implement a more robust error handling mechanism. Before parsing the response, the code should check if the response is a valid JSON string. A `try-catch` block around the `JSON.parse` call would be a good starting point.

## 3. Minor Issues & Code Smells

### 3.1. Unused Variables and Imports

- **Issue:** The linter reported numerous unused variables and imports.
- **Location:** Throughout the `src` directory.
- **Impact:** This makes the code harder to read and maintain.
- **Recommendation:** Remove all unused variables and imports.

### 3.2. Deprecated Dependencies

- **Issue:** The `npm install` command showed warnings for several deprecated packages, including `@supabase/auth-helpers-nextjs`.
- **Impact:** Using deprecated packages can lead to security vulnerabilities and compatibility issues in the future.
- **Recommendation:** Update all deprecated dependencies to their latest stable versions.

### 3.3. Missing Dependencies

- **Issue:** The linter failed to run initially due to a missing `@eslint/js` dependency.
- **Impact:** This indicates that the project's dependencies are not correctly defined in `package.json`.
- **Recommendation:** Ensure that all required dependencies are listed in `package.json`.

## 4. General Recommendations

- **Improve Test Coverage:** While the project has a decent number of tests, there are still many parts of the application that are not covered. Increasing test coverage would help to catch bugs and prevent regressions.
- **Implement a Stricter ESLint Configuration:** The current ESLint configuration is quite permissive. A stricter configuration would help to enforce a consistent code style and prevent common errors.
- **Add Input Validation:** The application should validate all user input to prevent common security vulnerabilities like XSS and SQL injection.
