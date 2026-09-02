# ASP.NET Migration Audit

## Scope and status

This audit compares the 44 HTTP registrations mounted by `old_backend/app.ts` with the active ASP.NET API, its services, DTOs, models, common HTTP/authentication code, tests, and relevant frontend callers.

- **Active backend:** `backend/` is the application entry point; it builds and maps ASP.NET controllers in `backend/Program.cs:11-74`.
- **Reference backend:** `old_backend/` is retained as migration evidence. Its routers were mounted at `/projects`, `/users`, `/emojis`, and `/auth` in `old_backend/app.ts:104-120`.
- **Second reference checked:** `server/` was treated as reference-only as required, but it contains only `node_modules/` and no auditable application source. It contributes zero route registrations.
- **Behavior change:** none. This document is an audit only.

## Classifications

- **Migrated:** an active ASP.NET endpoint preserves the legacy operation closely enough that no material route, input, response, authorization, or side-effect question was found.
- **Intentional omission:** source evidence shows the legacy registration was deliberately superseded or is no longer needed, rather than accidentally missed.
- **Outstanding:** required behavior is demonstrably missing or incomplete because a current frontend caller or an explicit follow-up task establishes the requirement.
- **Needs decision:** an active operation may replace the legacy behavior, but route, request, response, identity, or intent changed enough that equivalence cannot be asserted safely.

Authorization is not considered migrated merely because authentication infrastructure exists. ASP.NET authentication is registered and executed (`backend/Common/Extensions/ServiceCollectionExtensions.cs:31-45`, `backend/Program.cs:70-73`), but only actions carrying `[Authorize]` are protected. Existing task **PROJ-29 intentionally excluded auth**, establishing authorization as follow-up work rather than proof that the currently public project/history surface is acceptable.

## Legacy endpoint matrix

Effective legacy paths combine the mounts in `old_backend/app.ts:104-120` with each router registration. Every `router.get/post/patch/delete` registration is represented once below.

### Auth

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `POST /auth/register` | `POST /api/Auth/register` | Both create an application user, but legacy accepted a password, created Firebase and Mongo users, sent verification, and set a cookie; ASP.NET accepts no password and returns a user while the frontend creates Firebase separately. | Outstanding | `old_backend/routes/authRoutes.ts:25`; `old_backend/controllers/authController.ts:22-89`; `backend/Controllers/AuthController.cs:17-28`; `backend/DTOs/Auth/RegisterDto.cs:5-15`; `frontend/src/integrations/firebase/firebase-auth-provider.tsx:185-213`; PROJ-192 |
| `POST /auth/login` | `POST /api/Auth/login` | The active frontend obtains a Firebase ID token, ASP.NET verifies it, and protected requests use that bearer token. However, legacy login created an HttpOnly cookie/session and the intended compatibility policy remains unresolved. | Needs decision | `old_backend/routes/authRoutes.ts:26`; `old_backend/controllers/authController.ts:95-146`; `backend/DTOs/Auth/LoginDto.cs:5-8`; `backend/Services/AuthService/AuthService.cs:33-68`; `frontend/src/integrations/firebase/firebase-auth-provider.tsx:103-139`; `frontend/src/integrations/api/client.ts:4-13` |
| `POST /auth/logout` | `POST /api/Auth/logout` | Legacy required `validateToken`, cleared token/session cookies, and signed out Passport/Firebase; ASP.NET is public and clears only `access_token`, while the active frontend performs Firebase sign-out. The intended server responsibility needs confirmation. | Needs decision | `old_backend/routes/authRoutes.ts:27`; `old_backend/controllers/authController.ts:148-175`; `backend/Controllers/AuthController.cs:59-68`; `frontend/src/integrations/firebase/firebase-auth-provider.tsx:226-242` |
| `POST /auth/reset-password` | None | Legacy sent a Firebase password-reset email. The current forgot-password screen still calls the legacy client function, but ASP.NET has no action. | Outstanding | `old_backend/routes/authRoutes.ts:28`; `old_backend/controllers/authController.ts:177-197`; `frontend/src/data/api/authApi.ts:71-82`; `frontend/src/pages/forgot-password/index.tsx:28-89`; PROJ-189 |
| `GET /auth/check-auth` | `GET /api/Auth/me` | Legacy returned the Mongo user; ASP.NET returns only `{ UserId }` and reads only the cookie in the action. The old and generated frontend contracts are therefore not interchangeable. | Outstanding | `old_backend/routes/authRoutes.ts:29`; `old_backend/controllers/authController.ts:199-228`; `backend/Controllers/AuthController.cs:70-102`; `frontend/src/data/api/authApi.ts:4-16`; PROJ-192 |
| `GET /auth/google/callback` | Superseded by `POST /api/Auth/google` | Server redirect callback was replaced by Firebase `signInWithPopup` followed by an ID-token POST. | Intentional omission | `old_backend/routes/authRoutes.ts:32`; `old_backend/controllers/authController.ts:230-234`; `backend/Controllers/AuthController.cs:43-57`; `frontend/src/integrations/firebase/firebase-auth-provider.tsx:141-183` |
| `GET /auth/google` | Superseded by `POST /api/Auth/google` | Server-initiated Passport OAuth was replaced by the Firebase client popup/token flow. | Intentional omission | `old_backend/routes/authRoutes.ts:33`; `old_backend/controllers/authController.ts:236-240`; `backend/Services/AuthService/AuthService.cs:147-230`; `frontend/src/integrations/firebase/firebase-auth-provider.tsx:145-168` |
| `GET /auth/google/callback/failed` | Superseded by client error handling | The redirect-only failure endpoint is unnecessary in the popup flow; the provider catches and exposes Firebase errors. | Intentional omission | `old_backend/routes/authRoutes.ts:34`; `old_backend/controllers/authController.ts:242-248`; `frontend/src/integrations/firebase/firebase-auth-provider.tsx:176-181` |

### Users and settings

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `POST /users/search` | None | Authenticated substring username search with exclusions/limit is absent; current sharing code still calls it. | Outstanding | `old_backend/routes/userRoutes.ts:30`; `old_backend/controllers/userController.ts:149-180`; `frontend/src/data/api/userApi.ts:19-33`; PROJ-190 |
| `GET /users/:id` | `GET /api/Users/{id}` | Both are authenticated ID lookups returning a user through the standard response envelope. | Migrated | `old_backend/routes/userRoutes.ts:33`; `old_backend/controllers/userController.ts:31-51`; `backend/Controllers/UsersController.cs:35-44`; `backend.Test/Controllers/ControllerContractTests.cs:61-68` |
| `GET /users/:id/projects` | `GET /api/Project/by-email` (possible) | Identity changed from user ID to email; output is paginated and includes shared membership rather than explicitly owned projects. Equivalence is unclear. | Needs decision | `old_backend/routes/userRoutes.ts:36-40`; `old_backend/controllers/userController.ts:53-87`; `backend/Controllers/ProjectController.cs:43-59`; `backend/Services/ProjectService/ProjectService.cs:125-157` |
| `POST /users` | `POST /api/Users` | Both create an application user and default settings, but the legacy route was public while ASP.NET requires authentication. Its role relative to `/api/Auth/register` is unclear. | Needs decision | `old_backend/routes/userRoutes.ts:43`; `old_backend/controllers/userController.ts:89-113`; `backend/Controllers/UsersController.cs:57-68`; `backend/Services/UserService/UserService.cs:76-104` |
| `PATCH /users/:id` | `PUT /api/Users/{id}` | Verb and body contract changed: legacy accepted arbitrary non-empty fields; ASP.NET requires email, ignores `Username` and `ProfilePicture`, and updates email/display name only. | Needs decision | `old_backend/routes/userRoutes.ts:46`; `old_backend/controllers/userController.ts:115-147`; `backend/Controllers/UsersController.cs:70-82`; `backend/DTOs/User/UpdateUserDto.cs:5-13`; `backend/Services/UserService/UserService.cs:106-132` |
| `DELETE /users/:id` | `DELETE /api/Users/{id}` | Endpoint exists and is authenticated, but legacy deletion cascaded owned projects and settings; ASP.NET deletes only user/settings. Required project/history invariants have an explicit follow-up. | Outstanding | `old_backend/routes/userRoutes.ts:49`; `old_backend/models/userModel.ts:62-99`; `backend/Controllers/UsersController.cs:84-94`; `backend/Services/UserService/UserService.cs:134-154`; PROJ-188 |
| `PATCH /users/:id/profile-picture` | None | Authenticated multipart image validation/compression/Firebase upload is absent; current legacy frontend caller remains. | Outstanding | `old_backend/routes/userRoutes.ts:52-61`; `old_backend/middleware/multer.ts:4-21`; `old_backend/middleware/compressImageMiddleware.ts:4-57`; `old_backend/controllers/userController.ts:231-310`; `frontend/src/data/api/userApi.ts:56-73`; PROJ-191 |
| `GET /users/:userId/settings` | `GET /api/Settings?Email=...` | Protected operation exists, but identity moved from path user ID to query email and the response contract is flattened. | Needs decision | `old_backend/routes/settingsRoutes.ts:13`; `old_backend/controllers/settingsControllers.ts:12-36`; `backend/Controllers/SettingsController.cs:22-33`; `frontend/src/hooks/useUserSettings.tsx:19-39` |
| `POST /users/:userId/settings` | `POST /api/Settings` | Protected operation exists, but identity moved to body email; legacy controller also appears to read `req.params.id` instead of `userId`, so intended compatibility is uncertain. | Needs decision | `old_backend/routes/settingsRoutes.ts:14-18`; `old_backend/controllers/settingsControllers.ts:39-61`; `backend/Controllers/SettingsController.cs:35-47`; `backend/DTOs/Settings/CreateSettingsDto.cs:6-12` |
| `PATCH /users/:userId/settings` | `PUT /api/Settings` | Protected operation and fields exist, but route, verb, identity input, and response shape changed. Current generated frontend uses the ASP.NET contract. | Needs decision | `old_backend/routes/settingsRoutes.ts:19-23`; `old_backend/controllers/settingsControllers.ts:66-95`; `backend/Controllers/SettingsController.cs:49-61`; `frontend/src/components/modals/SettingsModal.tsx:58-85` |

### Projects

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `GET /projects` | `GET /api/Project` and `GET /api/Project/by-email` | One legacy route conditionally returned all projects or a user's memberships by `userId`; ASP.NET split it into public paginated all/by-email routes. The intended public/listing and identity contract needs confirmation. | Needs decision | `old_backend/routes/projectRoutes.ts:39`; `old_backend/controllers/projectController.ts:18-80`; `backend/Controllers/ProjectController.cs:16-29,43-59`; `backend.Test/Controllers/ControllerContractTests.cs:125-148` |
| `GET /projects/:projectId` | `GET /api/Project/{id}` | Data lookup exists, but legacy required a token and project role while ASP.NET is public. Authorization is explicit follow-up work. | Outstanding | `old_backend/routes/projectRoutes.ts:48-53`; `old_backend/middleware/validators/memberRoleValidator.ts:21-60`; `backend/Controllers/ProjectController.cs:31-41`; `backend.Test/Controllers/ControllerContractTests.cs:133-140`; PROJ-185 |
| `PATCH /projects/:projectId` | `PATCH /api/Project/details` | Details update exists with ID moved into the body, but the active action is public and no role/ownership check replaces legacy token validation/restrictions. | Outstanding | `old_backend/routes/projectRoutes.ts:65-76`; `old_backend/middleware/validators/projectValidator.ts:43-115`; `backend/Controllers/ProjectController.cs:87-98`; `backend/Services/ProjectService/ProjectService.cs:184-221`; PROJ-185 |
| `PATCH /projects/:projectId/data` | `PATCH /api/Project` | Save exists with ID in the body, but it is public, stores plaintext, and no longer creates a changelog. Current legacy caller expects `{ project, changelog }`. | Outstanding | `old_backend/routes/projectRoutes.ts:88-99`; `old_backend/controllers/projectController.ts:188-241`; `old_backend/middleware/encryptDataMiddleware.ts:4-21`; `backend/Controllers/ProjectController.cs:74-85`; `backend/Services/ProjectService/ProjectService.cs:159-182`; `frontend/src/data/api/projectsApi.ts:61-74`; PROJ-28, PROJ-185, PROJ-186 |
| `POST /projects` | `POST /api/Project` | Creation exists, but active identity changed from user ID to email and the endpoint is public. | Outstanding | `old_backend/routes/projectRoutes.ts:109-113`; `old_backend/controllers/projectController.ts:143-186`; `backend/Controllers/ProjectController.cs:61-72`; `backend/DTOs/Project/CreateProjectDto.cs:5-8`; PROJ-185 |
| `DELETE /projects/:projectId` | `DELETE /api/Project/{id}` | Delete exists but is public and performs only `Projects.DeleteOne`; legacy model hooks removed user references, histories, versions, and changelogs. | Outstanding | `old_backend/routes/projectRoutes.ts:122-126`; `old_backend/models/projectModel.ts:57-91`; `backend/Controllers/ProjectController.cs:100-111`; `backend/Services/ProjectService/ProjectService.cs:85-102`; PROJ-185, PROJ-188 |

### Members

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `GET /projects/:projectId/members` | None | Role-protected member listing is absent and is called by the current frontend member repository. | Outstanding | `old_backend/routes/memberRoutes.ts:24-29`; `old_backend/controllers/memberControllers.ts:15-63`; `frontend/src/data/api/membersApi.ts:14-21`; PROJ-33, PROJ-185 |
| `POST /projects/:projectId/members` | None | Role-protected add-by-username behavior and shared-project backlink update are absent; frontend calls it. | Outstanding | `old_backend/routes/memberRoutes.ts:30-40`; `old_backend/controllers/memberControllers.ts:65-129`; `frontend/src/data/api/membersApi.ts:32-67`; PROJ-33, PROJ-185, PROJ-190 |
| `PATCH /projects/:projectId/members/:userId` | None | Admin/owner role mutation is absent; frontend calls it. | Outstanding | `old_backend/routes/memberRoutes.ts:41-52`; `old_backend/controllers/memberControllers.ts:168-219`; `frontend/src/data/api/membersApi.ts:69-99`; PROJ-33, PROJ-185 |
| `GET /projects/:projectId/members/:userId` | None | Role-protected member-role lookup is absent; a legacy frontend caller remains. | Outstanding | `old_backend/routes/memberRoutes.ts:53-63`; `old_backend/controllers/memberControllers.ts:131-166`; `frontend/src/data/api/membersApi.ts:23-30`; PROJ-33, PROJ-185 |
| `DELETE /projects/:projectId/members/:userId` | None | Admin/owner removal plus user backlink cleanup is absent; frontend calls it. | Outstanding | `old_backend/routes/memberRoutes.ts:64-69`; `old_backend/controllers/memberControllers.ts:260-308`; `frontend/src/data/api/membersApi.ts:101-112`; PROJ-33, PROJ-185 |
| `PATCH /projects/:projectId/access` | None | Admin/owner general-access mutation is absent; frontend calls it. | Outstanding | `old_backend/routes/memberRoutes.ts:70-81`; `old_backend/controllers/memberControllers.ts:221-258`; `frontend/src/data/api/membersApi.ts:115-131`; PROJ-33, PROJ-185 |

### Changelogs

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `GET /projects/:projectId/changelogs` | None | Authenticated changelog summary listing is absent and the version-history drawer still loads it. | Outstanding | `old_backend/routes/changelogRoutes.ts:15-19`; `old_backend/controllers/changelogControllers.ts:6-31`; `frontend/src/data/api/changelogsApi.ts:9-15`; `frontend/src/layouts/TopRightBar.tsx:251-305`; PROJ-28 |
| `GET /projects/:projectId/changelogs/:changelogId` | None | Authenticated snapshot lookup is absent and the drawer uses it to load historical editor data. | Outstanding | `old_backend/routes/changelogRoutes.ts:21-25`; `old_backend/controllers/changelogControllers.ts:33-58`; `frontend/src/data/api/changelogsApi.ts:17-28`; `frontend/src/data/repo/useChangelogRepo.ts:32-39`; PROJ-28 |

### History

All active history actions are public: none has `[Authorize]`, and the route contract test explicitly expects `authorized: false` (`backend.Test/Controllers/ControllerContractTests.cs:205-292`). Legacy routes except rollback required `validateToken`; PROJ-185 establishes authorization as outstanding for project and history APIs.

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `GET /projects/:projectId/versions` | `GET /api/history/projects/{projectId}/versions` | Paginated equivalent exists, but is public instead of token-protected. | Outstanding | `old_backend/routes/historyRoutes.ts:25-29`; `backend/Controllers/HistoryController.cs:16-23`; PROJ-185 |
| `POST /projects/:projectId/versions` | `POST /api/history/projects/{projectId}/versions` | Equivalent exists, but is public; legacy also ran encryption middleware even though this DTO has no `data` field. | Outstanding | `old_backend/routes/historyRoutes.ts:30-34`; `backend/Controllers/HistoryController.cs:25-33`; `backend/DTOs/History/CreateVersionDto.cs:5-10`; PROJ-185 |
| `GET /projects/:projectId/versions/:versionId` | `GET /api/history/versions/{versionId}?projectId=...` | Project ID moved from path to optional query and the action is public. | Outstanding | `old_backend/routes/historyRoutes.ts:35-39`; `old_backend/controllers/historyControllers.ts:75-99`; `backend/Controllers/HistoryController.cs:35-43`; PROJ-185 |
| `PATCH /projects/:projectId/versions/:versionId` | `PATCH /api/history/versions/{versionId}` | Update exists without project scoping and is public. | Outstanding | `old_backend/routes/historyRoutes.ts:40-44`; `backend/Controllers/HistoryController.cs:45-53`; `backend/Services/HistoryService/HistoryService.cs:114-151`; PROJ-185 |
| `DELETE /projects/:projectId/versions/:versionId` | `DELETE /api/history/versions/{versionId}` | Cascade deletion of histories is preserved, but project scoping and authorization are absent. | Outstanding | `old_backend/routes/historyRoutes.ts:45-49`; `old_backend/models/historyModel.ts:126-141`; `backend/Controllers/HistoryController.cs:55-60`; `backend/Services/HistoryService/HistoryService.cs:153-172`; PROJ-185 |
| `GET /projects/:projectId/versions/:versionId/history` | `GET /api/history/versions/{versionId}/histories` | Pluralized/paginated equivalent exists, but project scoping and authorization are absent. | Outstanding | `old_backend/routes/historyRoutes.ts:52-56`; `backend/Controllers/HistoryController.cs:62-69`; PROJ-185 |
| `POST /projects/:projectId/versions/:versionId/history` | `POST /api/history/versions/{versionId}/histories` | Equivalent exists, but is public, writes plaintext, and accepts ASP.NET `Member` objects rather than legacy user-ID references. | Outstanding | `old_backend/routes/historyRoutes.ts:57-61`; `old_backend/models/historyModel.ts:27-47`; `backend/Controllers/HistoryController.cs:71-79`; `backend/Models/History.cs:58-66`; `backend/DTOs/History/CreateHistoryDto.cs:6-11`; PROJ-185, PROJ-186, PROJ-187 |
| `GET /projects/:projectId/versions/:versionId/history/:historyId` | `GET /api/history/histories/{historyId}?versionId=...` | Parent IDs moved to an optional query check and the endpoint is public. Stored legacy member references may not deserialize to the active schema. | Outstanding | `old_backend/routes/historyRoutes.ts:62-66`; `backend/Controllers/HistoryController.cs:81-89`; `backend/Models/History.cs:62-63`; PROJ-185, PROJ-187 |
| `PATCH /projects/:projectId/versions/:versionId/history/:historyId` | `PATCH /api/history/histories/{historyId}` | Parent scoping and authorization are absent; data updates are no longer encrypted and member shape changed. | Outstanding | `old_backend/routes/historyRoutes.ts:67-71`; `old_backend/middleware/encryptDataMiddleware.ts:4-21`; `backend/Controllers/HistoryController.cs:91-99`; `backend/Services/HistoryService/HistoryService.cs:267-298`; PROJ-185, PROJ-186, PROJ-187 |
| `DELETE /projects/:projectId/versions/:versionId/history/:historyId` | `DELETE /api/history/histories/{historyId}` | Delete-after behavior and current-history repair exist, but parent scoping and authorization are absent. | Outstanding | `old_backend/routes/historyRoutes.ts:72-76`; `old_backend/controllers/historyControllers.ts:293-336`; `backend/Controllers/HistoryController.cs:101-106`; `backend/Services/HistoryService/HistoryService.cs:300-324`; PROJ-185 |
| `POST /projects/:projectId/versions/:versionId/history/:historyId/rollback` | `POST /api/history/versions/{versionId}/rollback/{historyId}` | Rollback behavior exists and now verifies history/version association. Both legacy and active registrations are public, so requiring authorization is security hardening that needs an explicit product decision rather than a lost migration contract. | Needs decision | `old_backend/routes/historyRoutes.ts:79-82`; `old_backend/controllers/historyControllers.ts:338-379`; `backend/Controllers/HistoryController.cs:108-116`; `backend/Services/HistoryService/HistoryService.cs:326-374` |

### Emojis

| Legacy endpoint | Active equivalent | Auth/contract result | Classification | Evidence |
|---|---|---|---|---|
| `GET /emojis` | `GET /api/Emojis` | Active listing is public, paginated, and ignores legacy `?group=` filtering. The current async picker requests groups, and PROJ-193 names the missing contract. | Outstanding | `old_backend/routes/emojiRoutes.ts:11`; `old_backend/controllers/emojiControllers.ts:7-62`; `backend/Controllers/EmojisController.cs:18-26`; `backend/Services/EmojiService/EmojiService.cs:18-36`; `frontend/src/data/api/emojiApi.ts:6-16`; PROJ-193 |

## ASP.NET-only endpoint context

These registrations have no legacy-router row and therefore are not included in the 44-row migration denominator:

| ASP.NET endpoint | Current access | Context and evidence |
|---|---|---|
| `GET /api/Users` | Authenticated | Paginated all-user listing. The legacy controller had `getAllUsers`, but no router registered it. `backend/Controllers/UsersController.cs:19-33`; `old_backend/controllers/userController.ts:9-29`. |
| `GET /api/Users/email/{email}` | **Authenticated, not public** | Exact email lookup used by the active profile UI. `[Authorize]` is present and the contract test expects authorization. `backend/Controllers/UsersController.cs:46-55`; `backend.Test/Controllers/ControllerContractTests.cs:69-76`; `frontend/src/layouts/TopRightBar.tsx:39-59`. |
| `GET /api/Emojis/{hexcode}` | **Public** | Database lookup used internally by project create/response mapping and exposed publicly. `backend/Controllers/EmojisController.cs:28-36`; `backend/Services/EmojiService/EmojiService.cs:38-57`; `backend/Services/ProjectService/ProjectService.cs:44-55,226-233`. |
| `DELETE /api/Emojis` | **Public** | Bulk deletion of the entire emoji collection has no authorization attribute. `backend/Controllers/EmojisController.cs:38-44`; `backend/Services/EmojiService/EmojiService.cs:59-70`; `backend.Test/Controllers/ControllerContractTests.cs:197-203`. This is high-risk administrative behavior and should not remain public. |

The requested characterization of `GET /api/Users/email/{email}` as public does not match the checked-in source. It is protected; the two emoji-only actions above are public. This distinction should be retained unless source behavior changes.

## Outstanding findings

### O1. Project and history authorization is absent

- **Evidence:** project and history actions have no `[Authorize]` (`backend/Controllers/ProjectController.cs:16-110`, `backend/Controllers/HistoryController.cs:16-115`); tests assert `authorized: false` (`backend.Test/Controllers/ControllerContractTests.cs:125-180,205-292`). Legacy project/member routes used token and role checks (`old_backend/routes/projectRoutes.ts:48-125`, `old_backend/routes/memberRoutes.ts:24-80`). PROJ-29 intentionally excluded auth, so this gap was deferred rather than implemented.
- **Behavior:** unauthenticated callers can list, read, create, mutate, save, delete, and roll back project/history data. Public all-project listing also exposes membership-bearing DTOs because `ProjectResponseDto` inherits `Project` (`backend/DTOs/Project/ProjectResponseDto.cs:3`, `backend/Models/Project.cs:72-79`).
- **Impact:** unauthorized disclosure, modification, and deletion.
- **Priority:** Critical.
- **Recommendation:** complete PROJ-185 for project/history operations that Express protected; derive caller identity from Firebase claims and enforce project membership/general-access role per operation. Resolve rollback separately under D7 because its legacy route was also public. Include the public emoji bulk-delete action in the same security review or a separate narrowly scoped fix.
- **Tasks:** PROJ-185.

### O2. Project and history snapshot encryption was lost

- **Evidence:** legacy data writes passed through `encryptDataMiddleware` (`old_backend/routes/projectRoutes.ts:88-99`, `old_backend/routes/historyRoutes.ts:57-71`, `old_backend/middleware/encryptDataMiddleware.ts:4-21`). Active services store DTO data directly (`backend/Services/ProjectService/ProjectService.cs:159-169`, `backend/Services/HistoryService/HistoryService.cs:217-225,274-284`).
- **Behavior:** new and updated project/history snapshots are persisted as plaintext.
- **Impact:** sensitive diagram data has weaker at-rest protection and mixed encrypted/plaintext records may be unreadable without a migration strategy.
- **Priority:** High.
- **Recommendation:** complete PROJ-186 with an explicit compatibility/migration plan and tests for old encrypted and new records.
- **Tasks:** PROJ-186.

### O3. Member API and username discovery are missing

- **Evidence:** `backend/Controllers/` has no member controller; the active model still contains members/general access (`backend/Models/Project.cs:9-55,75-79`). Current frontend repositories invoke all six legacy member routes and username search (`frontend/src/data/api/membersApi.ts:14-131`, `frontend/src/data/api/userApi.ts:19-33`).
- **Behavior:** project sharing, role lookup/change, member removal, and link/restricted access cannot complete against ASP.NET.
- **Impact:** core collaboration UI fails or remains coupled to an absent legacy server.
- **Priority:** High.
- **Recommendation:** implement PROJ-33 with PROJ-185 authorization and PROJ-190 search; preserve owner invariants and both project/user references transactionally or with compensating rollback.
- **Tasks:** PROJ-33, PROJ-185, PROJ-190.

### O4. Changelog API and save side effect are missing

- **Evidence:** active `Changelog` model exists (`backend/Models/Changelog.cs:8-40`), but no controller/service exposes it and `SaveProjectAsync` only updates the project (`backend/Services/ProjectService/ProjectService.cs:159-182`). Legacy save created a changelog (`old_backend/controllers/projectController.ts:188-237`), and the frontend drawer still reads both changelog endpoints (`frontend/src/data/repo/useChangelogRepo.ts:15-39`, `frontend/src/layouts/TopRightBar.tsx:261-305`).
- **Behavior:** saves do not create timeline snapshots and the timeline cannot list/load snapshots.
- **Impact:** user-visible version history is unavailable and new edits lose audit snapshots.
- **Priority:** High.
- **Recommendation:** complete PROJ-28, defining atomicity between project save and changelog creation and preserving the frontend summary/detail response contracts or updating callers together.
- **Tasks:** PROJ-28.

### O5. History member schema is incompatible with legacy data

- **Evidence:** legacy histories store `members` as user ObjectId references (`old_backend/models/historyModel.ts:27-47`); ASP.NET expects embedded `Member { UserId, Role }` objects (`backend/Models/History.cs:62-63`, `backend/Models/Project.cs:9-23`).
- **Behavior:** existing history records may fail deserialization or yield unusable member data; new requests require a different shape.
- **Impact:** history reads, updates, and rollback can fail for migrated records.
- **Priority:** High.
- **Recommendation:** complete PROJ-187 before relying on history in production; migrate records idempotently and retain a rollback/verification report.
- **Tasks:** PROJ-187.

### O6. Destructive deletion invariants were not preserved

- **Evidence:** legacy user deletion cascaded owned projects/settings (`old_backend/models/userModel.ts:62-99`), and project deletion removed user ownership references, versions, histories, and changelogs (`old_backend/models/projectModel.ts:57-91`). Active user deletion removes only user/settings (`backend/Services/UserService/UserService.cs:134-154`); active project deletion removes only the project (`backend/Services/ProjectService/ProjectService.cs:85-102`).
- **Behavior:** deletion leaves orphaned references and historical records, or deletes users without resolving ownership.
- **Impact:** corrupt navigation/membership state, retained orphan data, and inconsistent authorization decisions.
- **Priority:** High.
- **Recommendation:** complete PROJ-188 with explicit owner-transfer/delete policy and tested cleanup ordering.
- **Tasks:** PROJ-188.

### O7. Password reset remains wired to an absent endpoint

- **Evidence:** the page invokes `resetPassword` (`frontend/src/pages/forgot-password/index.tsx:28-89`), which reaches `POST /auth/reset-password` (`frontend/src/data/api/authApi.ts:71-82`); ASP.NET has no reset action while legacy used Firebase reset email (`old_backend/controllers/authController.ts:177-197`).
- **Behavior:** forgot-password submission cannot succeed against the active server.
- **Impact:** users cannot recover accounts through the application.
- **Priority:** High.
- **Recommendation:** complete PROJ-189 using the Firebase client or a narrowly scoped ASP.NET endpoint; avoid user-enumerating responses.
- **Tasks:** PROJ-189.

### O8. Profile picture upload is missing

- **Evidence:** current legacy client uploads multipart data (`frontend/src/data/api/userApi.ts:56-73`); old backend enforced 5 MB JPEG/PNG input, compressed to WebP, replaced storage content, and updated the user (`old_backend/middleware/multer.ts:4-21`, `old_backend/middleware/compressImageMiddleware.ts:4-57`, `old_backend/controllers/userController.ts:231-310`). No ASP.NET action accepts a file.
- **Behavior:** profile management cannot upload images.
- **Impact:** user-facing account management is incomplete.
- **Priority:** Medium.
- **Recommendation:** complete PROJ-191 with authenticated ownership checks, size/type validation, safe object naming, and old-object cleanup.
- **Tasks:** PROJ-191.

### O9. Authentication contracts are not fully aligned

- **Evidence:** the active login bearer-token flow is internally consistent (`backend/Services/AuthService/AuthService.cs:33-68`, `frontend/src/integrations/firebase/firebase-auth-provider.tsx:103-139`, `frontend/src/integrations/api/client.ts:4-13`). Registration inserts Mongo data without creating default settings or verifying caller identity (`backend/Services/AuthService/AuthService.cs:70-116`), the frontend creates Firebase first but sends no token on register (`frontend/src/integrations/firebase/firebase-auth-provider.tsx:185-213`), and `Auth/me` expects a cookie although the request interceptor uses `Authorization` (`backend/Controllers/AuthController.cs:70-102`).
- **Behavior:** registration can create a Mongo user independently of authenticated Firebase identity; `me` does not follow the working bearer flow; logout responsibility is split between public server cookie deletion and client Firebase sign-out; declared auth success codes are emitted as 200 by the common mapper.
- **Impact:** split identity records, unusable session checks, and misleading generated client contracts.
- **Priority:** High.
- **Recommendation:** complete PROJ-192 and PROJ-194 together: use one token transport/identity source, authenticate registration, provision default settings consistently, and emit declared status codes.
- **Tasks:** PROJ-192, PROJ-194.

### O10. Emoji group filtering is missing and destructive emoji administration is public

- **Evidence:** the legacy controller delegated `?group=` (`old_backend/controllers/emojiControllers.ts:7-62`); active listing queries all emojis and only paginates (`backend/Services/EmojiService/EmojiService.cs:18-36`). The picker still requests groups (`frontend/src/hooks/useEmojiData.tsx:6-25`, `frontend/src/data/api/emojiApi.ts:6-16`). ASP.NET also exposes unauthenticated bulk delete (`backend/Controllers/EmojisController.cs:38-44`).
- **Behavior:** group tabs receive unfiltered/paginated data, while any caller can empty the seeded emoji collection.
- **Impact:** broken picker behavior and trivial denial of service/data deletion.
- **Priority:** Critical for delete authorization; Medium for filtering.
- **Recommendation:** complete PROJ-193 and protect or remove bulk delete. Keep public hex lookup only if public project rendering is intentional.
- **Tasks:** PROJ-193, PROJ-185 (authorization pattern).

### O11. Declared success codes and baseline security headers are not honored

- **Evidence:** controllers declare 201/204 for create/delete operations (`backend/Controllers/AuthController.cs:17-20`, `backend/Controllers/UsersController.cs:57-60,84-88`), but `ToApiResponse` always emits 200 on success (`backend/Common/Extensions/ResultExtensions.cs:38-46`) and tests currently assert 200 for register (`backend.Test/Controllers/AuthControllerTests.cs:41-53`). Legacy applied Helmet security headers (`old_backend/app.ts:36-52`); active middleware has CORS, HTTPS redirection, auth, and controllers but no equivalent header middleware (`backend/Program.cs:51-73`).
- **Behavior:** OpenAPI/status semantics disagree with runtime; baseline anti-sniff/frame/HSTS policy is not explicitly restored.
- **Impact:** client ambiguity and reduced HTTP defense in depth.
- **Priority:** Medium.
- **Recommendation:** complete PROJ-194 with action-aware success mapping and contract tests; complete PROJ-195 with environment-appropriate HSTS and response headers.
- **Tasks:** PROJ-194, PROJ-195.

## Needs decision

### D1. Owned-project route versus membership-by-email route

- **Evidence:** legacy `GET /users/:id/projects` populated `ownedProjects` only (`old_backend/controllers/userController.ts:53-87`); active `GET /api/Project/by-email` finds every project containing the user as a member (`backend/Services/ProjectService/ProjectService.cs:125-150`).
- **Behavior question:** should the product expose owned-only projects, all memberships, or both?
- **Impact:** dashboards may show different project sets and email in the query exposes mutable identity input.
- **Priority:** Medium.
- **Recommendation:** choose the product semantics, then derive the user from authenticated claims where possible; do not add a compatibility route until a caller requires owned-only results.

### D2. User update contract

- **Evidence:** legacy PATCH accepted arbitrary non-empty fields (`old_backend/controllers/userController.ts:115-147`); active PUT requires email, exposes username/profile-picture DTO properties, but only updates email/display name (`backend/DTOs/User/UpdateUserDto.cs:5-13`, `backend/Services/UserService/UserService.cs:106-132`).
- **Behavior question:** is this a full replacement, partial update, or profile-only operation, and may users change email/username independently of Firebase?
- **Impact:** silent ignored fields and Firebase/Mongo identity drift.
- **Priority:** High.
- **Recommendation:** define mutable fields and ownership, use PATCH for partial semantics or require a complete PUT representation, and synchronize identity-provider fields explicitly.

### D3. Settings identity and route redesign

- **Evidence:** all legacy settings routes identify a user by path ID (`old_backend/routes/settingsRoutes.ts:13-23`); active routes use email in query/body (`backend/Controllers/SettingsController.cs:22-60`). The generated frontend already uses active email contracts (`frontend/src/hooks/useUserSettings.tsx:19-39`, `frontend/src/components/modals/SettingsModal.tsx:76-85`).
- **Behavior question:** is email-based targeting intentional, or should settings always resolve from the authenticated principal?
- **Impact:** callers can request another user's settings by supplying email unless service-level ownership is added; route migration cannot be called equivalent.
- **Priority:** High.
- **Recommendation:** prefer claim-derived user ID and a resource route such as `/api/settings/me`; retain email only for an explicitly authorized administrative use case.

### D4. Project listing split and public visibility

- **Evidence:** legacy `GET /projects` combined all/by-user behavior behind optional `userId` and required a token (`old_backend/routes/projectRoutes.ts:39`, `old_backend/controllers/projectController.ts:18-80`). ASP.NET exposes public paginated all and by-email endpoints (`backend/Controllers/ProjectController.cs:16-59`).
- **Behavior question:** is global project discovery a supported feature, and should listing include members/general access/data-bearing DTO fields?
- **Impact:** unintended metadata exposure and uncertain frontend migration path.
- **Priority:** Critical.
- **Recommendation:** resolve alongside PROJ-185; default to authenticated caller memberships and create a separately reviewed public discovery contract only if required.

### D5. Login/logout transport and token revocation

- **Evidence:** legacy login accepted credentials and issued an HttpOnly cookie/session, while the active login verifies a client Firebase ID token and the frontend sends bearer tokens (`old_backend/controllers/authController.ts:95-146`, `backend/Services/AuthService/AuthService.cs:33-68`, `frontend/src/integrations/api/client.ts:4-13`). Legacy logout required `validateToken`, cleared `access_token` and `connect.sid`, and invoked Passport/Firebase sign-out (`old_backend/routes/authRoutes.ts:27`, `old_backend/controllers/authController.ts:148-175`). ASP.NET logout is public and only deletes `access_token`, while the active frontend calls Firebase sign-out (`backend/Controllers/AuthController.cs:59-68`, `frontend/src/integrations/firebase/firebase-auth-provider.tsx:226-242`).
- **Behavior question:** is bearer-only authentication the intentional replacement for cookie/session login, and should logout be an authenticated server operation, a client-only Firebase operation, or both?
- **Impact:** inconsistent token transport can leave callers believing a bearer token was revoked when only a cookie was removed.
- **Priority:** Medium.
- **Recommendation:** resolve under PROJ-192 and test the chosen token lifecycle end to end.

### D6. Authenticated user creation versus registration

- **Evidence:** legacy `POST /users` was public (`old_backend/routes/userRoutes.ts:43`); active `POST /api/Users` requires `[Authorize]` (`backend/Controllers/UsersController.cs:57-68`), while `/api/Auth/register` separately creates users.
- **Behavior question:** is `POST /api/Users` an administrative provisioning endpoint, part of registration, or redundant?
- **Impact:** overlapping creation paths can apply different identity proof and default-settings behavior.
- **Priority:** High.
- **Recommendation:** define one public registration path and restrict or remove the second creation path.

### D7. Rollback authorization policy

- **Evidence:** rollback uniquely omitted `validateToken` in Express and remains public in ASP.NET (`old_backend/routes/historyRoutes.ts:79-82`, `backend/Controllers/HistoryController.cs:108-116`). ASP.NET improves integrity by requiring the history to belong to the version (`backend/Services/HistoryService/HistoryService.cs:326-345`).
- **Behavior question:** should a destructive rollback operation remain intentionally public despite all surrounding history operations requiring authentication?
- **Impact:** a caller with known version/history IDs can create rollback records and change the current version pointer.
- **Priority:** Critical.
- **Recommendation:** record the product/security decision; if authentication is required, add rollback explicitly to PROJ-185 rather than describing it as lost parity.

## Follow-up tasks

Links below are existing/new follow-up records supplied for this audit. Their presence is evidence of intended follow-up, **not evidence that any task is implemented**.

| Task | Title | Normalized URL | Findings |
|---|---|---|---|
| PROJ-28 | Migrate and Implement Changelog Model and Controller | https://www.notion.so/p/2bfee6df9a43807595ebf69dc96ba6e1 | O4; project save/changelog rows |
| PROJ-33 | Migrate and Implement Member Controller | https://www.notion.so/p/2bfee6df9a43807d85a3d3676352fa30 | O3; all member rows |
| PROJ-185 | Enforce authorization across project and history APIs | https://www.notion.so/p/3cfee6df9a4381a7a98ed4fffdf81be7 | O1, O3, O10; project/member/history rows |
| PROJ-186 | Restore encryption for project and history snapshot data | https://www.notion.so/p/3cfee6df9a4381f99b5bec4e5f1d049c | O2; project save/history write rows |
| PROJ-187 | Migrate legacy history member references to the ASP.NET schema | https://www.notion.so/p/3cfee6df9a43811399c7fc7a29fca5de | O5; history create/read/update rows |
| PROJ-188 | Preserve user and history invariants during project deletion | https://www.notion.so/p/3cfee6df9a438126ba45dc8d87dd0166 | O6; user/project delete rows |
| PROJ-189 | Add password reset support to the ASP.NET auth API | https://www.notion.so/p/3cfee6df9a4381079304eef567f8e4ab | O7; reset-password row |
| PROJ-190 | Restore authenticated username search for project sharing | https://www.notion.so/p/3cfee6df9a4381729433d9633e507783 | O3; user search/member add rows |
| PROJ-191 | Restore profile picture upload for ASP.NET users | https://www.notion.so/p/3cfee6df9a438152838fc3852838379b | O8; profile-picture row |
| PROJ-192 | Align frontend authentication with the ASP.NET Firebase token flow | https://www.notion.so/p/3cfee6df9a4381a2b3edf897c91b1320 | O9; register/login/check-auth rows |
| PROJ-193 | Restore emoji group filtering contract | https://www.notion.so/p/3cfee6df9a4381a7a2c8c5ce8681cac7 | O10; emoji list row |
| PROJ-194 | Honor declared HTTP success status codes | https://www.notion.so/p/3cfee6df9a4381c6ad57ee49ffcd7592 | O9, O11; create/delete response contracts |
| PROJ-195 | Restore baseline HTTP security headers | https://www.notion.so/p/3cfee6df9a4381549ac3e019e103accb | O11; baseline HTTP security headers |

PROJ-29 is intentionally not listed as an implementation follow-up because it intentionally excluded authentication/authorization. That exclusion is the evidence for treating authorization as follow-up, primarily under PROJ-185, rather than as migrated behavior.

## Verification and accounting

### Route registration accounting

| Router | Registrations | Migrated | Intentional omission | Outstanding | Needs decision |
|---|---:|---:|---:|---:|---:|
| Auth | 8 | 0 | 3 | 3 | 2 |
| Users | 7 | 1 | 0 | 3 | 3 |
| Settings | 3 | 0 | 0 | 0 | 3 |
| Projects | 6 | 0 | 0 | 5 | 1 |
| Members | 6 | 0 | 0 | 6 | 0 |
| Changelogs | 2 | 0 | 0 | 2 | 0 |
| History | 11 | 0 | 0 | 10 | 1 |
| Emojis | 1 | 0 | 0 | 1 | 0 |
| **Total** | **44** | **1** | **3** | **30** | **10** |

Accounting identity: `1 + 3 + 30 + 10 = 44`. ASP.NET-only endpoints are context rows and do not alter this denominator.

### Reproducible checks

Run from repository root:

```powershell
rg -n 'router\.(get|post|put|patch|delete)\s*\(' old_backend/routes -g '*.ts'
rg -c 'router\.(get|post|put|patch|delete)\s*\(' old_backend/routes -g '*.ts'
git diff --check
git status --short
```

The first command should produce 44 registration starts. Per-file counts should sum to 44: auth 8, users 7, settings 3, projects 6, members 6, changelogs 2, history 11, emojis 1.
