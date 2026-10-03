# CRM frontend API contract inventory

Reviewed against CRM controllers/DTOs, 3 October 2026. All paths below are
relative to `/api/v1/crm`. The frontend normalizes SQL snake-case field names at
the response boundary. JSON/JSONB driver wrappers are decoded before display.
Request field names remain those declared by the backend DTOs, in camel case.

| API | Methods used | Response/list semantics |
| --- | --- | --- |
| `/lookups` | GET | Object with `leadSources`, `marketSegments`, ordered `salesStages`, `opportunityTypes`, `lostReasons`; existing CRM master data only |
| `/leads`, `/prospects`, `/opportunities` and `/{id}` | GET, POST, PUT, DELETE | Entity objects; unpaged list arrays. PUT replaces writable fields; history/reference guards may reject DELETE with 409 |
| `/leads/{id}/qualify` | POST | Linked prospect; qualification is idempotent. Optional `touchpointId` query parameter carries explicit attribution |
| `/leads/{id}/history`, `/opportunities/{id}/history` | GET | Page envelope with `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`; max page size 100 |
| `/activities`, `/notes`, `/appointments` and `/{id}` | GET, POST, PUT, DELETE | Page envelopes; `targetType`/`targetId` filters. Write bodies use `target: {targetType,targetId}` |
| `/contacts` and `/{id}` | GET, POST, PUT, DELETE | Page envelope; `leadId`, `prospectId`, `opportunityId`, `customerId` filters; exactly one owner in write bodies |
| `/competitors` and `/{id}` | GET, POST, PUT, DELETE | Unpaged array and competitor objects |
| `/opportunities/{id}/competitors` and `/{competitorId}` | GET, POST, PUT, DELETE | Comparison array; update/delete uses competitor UUID, not comparison UUID |
| `/customers/{id}/360`, `/prospects/{id}/360` | GET | Object with CRM sections, `salesStatus`, optional `salesDashboard`; sections bounded to recent records |
| `/campaigns` and `/{id}` | GET, POST, PUT, DELETE | Bounded array pages; filter `status`. PUT requires current `version`, `status` and complete campaign terms |
| `/campaigns/{id}/status` | POST | Validated lifecycle action; returns updated campaign |
| `/campaigns/{id}/members`, `/{memberId}`, `/{memberId}/events` | GET, POST; PUT status | Membership array pages without totals; member events max 100 |
| `/campaigns/{id}/costs`, `/touchpoints` | GET, POST | Bounded history arrays; costs retain currency; touchpoints require target UUID/type and deduplicating `eventKey` |
| `/leads/{id}/attribution`, `/prospects/{id}/attribution`, `/opportunities/{id}/attribution` | GET, POST | Read arrays max 100; explicit association bodies contain `touchpointId` and `linkType` |
| `/message-templates` and `/{id}` | GET, POST, PUT | Unpaged array; PUT creates a new immutable revision with a new UUID, and UI navigates to it |
| `/message-templates/{id}/active` | POST | Body `{active:boolean}`; changes eligibility of this revision |
| `/contacts/{id}/communication-preferences`, `/{channel}`, `/{channel}/events` | GET; PUT preference | EMAIL/SMS destination-specific consent; events max 100. Write body contains `consentState`, `source` |
| `/messages`, `/{id}`, `/{id}/attempts`, `/{id}/cancel` | GET, POST enqueue/cancel | Array pages without totals; actual lifecycle field is `status`. Enqueue requires `contactId`, `templateId`, stable `idempotencyKey`, optional campaign/variables/schedule |
| `/contracts` and `/{id}` | GET, POST, PUT | Array pages; status/customer filters. PUT requires `version` and draft status; external customer/opportunity reference required |
| `/contracts/{id}/items`, `/events`, `/status` | GET, POST | Items max 500, events max 100; draft-only item additions and explicit lifecycle changes |
| `/fulfilments`, `/{id}`, `/{id}/status` | GET, POST | Array pages; contract/status filters; planned/completed quantities and timestamp snapshots |
| `/warranty-claims`, `/{id}`, `/{id}/events`, `/{id}/status` | GET, POST | Array pages; status/customer filters; complete item warranty required, inclusive date validation, status events max 100 |
| `/maintenance-schedules`, `/{id}`, `/{id}/status`, `/{id}/visits` | GET, POST | Array pages; customer/status filters; visits max 500, one visit per exact schedule/due instant |
| `/maintenance-visits/{id}/status` | POST | Explicit visit outcome; completion advances next due date without moving it backwards; paused/terminal schedules reject completion |
| `/analytics/overview`, `/funnel`, `/pipeline` | GET | Definition/filter/semantics object; UTC `from`/`to`, optional `ownerId` |
| `/analytics/campaigns` | GET | Same date filters, no owner filter; up to 500 campaign summaries |
| `/analytics/service` | GET | UTC date filters, optional `customerId`; service counts and currency-separated contract snapshots |

Phase 5/6 paged array lists accept `page` and `size` (maximum 100) without a
total count. UI requests 20 rows, keeps Next enabled on a full page and does
not label the loaded page as a global total. Known nested caps are disclosed.

## Mutation rules

The opportunity UI always includes `expectedUpdatedAt` on PUT, copied verbatim
from the loaded detail response. The service checks it after acquiring the row
lock and returns 409 when it differs. It remains optional for pre-existing API
clients. A stage-only UI gesture still sends the complete writable opportunity
payload, preserving prospect/customer/master references, amount, probability,
close date, assignee and status. Stored attribution links are append-only;
omitting `attributionTouchpointId` preserves them.

Forms follow backend enums/transitions. Stage changes do not set WON/LOST.
Outcome edits require confirmation. Contract terms/items are editable only while
draft. A resolved claim requires a resolution. Appointment end must follow its
start. A contact requires exactly one owner; communication preference and
enqueueing require destination-specific eligibility.

Status changes and PUT/POST operations are not retried automatically. Message
forms retain their idempotency key after failed attempts. On error, form values
remain visible; a stale conflict requires reload/review.

## Errors and reports

Handle business/validation errors as 400, missing resources as 404, and lifecycle,
reference or stale-update conflicts as 409. CRM field validation now returns
`{message,fields}`. Spring errors without that body are normalized to a general
message. Network/timeout errors keep the page usable and offer retry.

Date-only strings remain dates; datetime inputs are local times converted to UTC
instants. The UI displays timestamps with a timezone label. Backend analytics
definitions and filters remain authoritative, with a maximum 3,650-day inclusive
window and no future end date. Current pipeline does not exclude open records
created after a historical report end date; ordinary edits do not reset its
recorded stage-entry time.

No API in this inventory creates Sales customers/orders, moves ERP inventory,
recognizes revenue or dispatches real provider messages. Provider callbacks and
administrative worker controls are not exposed in the frontend.
