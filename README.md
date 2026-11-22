# exsys_tickting

Standalone React front end for the EXSYS Ticketing System (schema `ETKT`).
Independent project: it does not touch `cure-plus-fe` and shares no code with it,
but it follows the same conventions so the team reads it without a handover.

## Same as cure-plus-fe

| Item | Value |
|---|---|
| React | 16.13 |
| TypeScript | 3.7 |
| UI kit | Ant Design **v3** (3.19.3) |
| Styling | styled-components 5 + the `app-theme` color tokens (light / dark) |
| Router | react-router-dom 5 |
| Build | CRA 3.4.1 customized with `react-app-rewired` (`config-overrides.js`) |
| Data | `useBasicQuery` / `useBasicMutation` over an `apiId` - screens never write a URL |
| Errors | one field, `error_message`, in the caller's `planguageid` |

Difference: this is a single app, not a Lerna monorepo. The folder layout inside
`src/pages/*` is the package anatomy of cure-plus-fe (`index.tsx`,
`index.interface.ts`, `constants.ts`, `partials/`).

## Run

Use **yarn (v1)**, not npm: the `@types` versions are pinned in `resolutions`
(newer ones do not parse under TypeScript 3.7) and npm ignores that block.
Use the same Node version as cure-plus-fe (same CRA 3.4.1 tooling).

```
yarn install
yarn start      # http://localhost:3000
yarn build
```

`.env` (create it by hand, it is not in the repo) points at ORDS:

```
REACT_APP_BASE_API_URL=http://<server>:<port>/ords/etkt
REACT_APP_DEFAULT_LANGUAGE_ID=2
```

In production the app is served by the same host as ORDS, so the value is just
`/ords/etkt` (`.env.production`).

Step by step, with the usual errors: `ETKT_FE_Setup_Guide_20261121.html`.

## Services

Every service is `/ords/etkt/<package>/<procedure>` and all of them are listed
in ONE file, `src/api/apiIds.ts`:

| Package | What |
|---|---|
| `etk_security_pkg` | sign in / out, change password, current user |
| `etk_lookup_pkg` | every list the screens need, clients |
| `etk_ticket_pkg` | tickets, one ticket, actions, messages |
| `etk_escalation_pkg` | escalation, notifications |
| `etk_admin_pkg`, `etk_admin2_pkg` | the setup screens (management only) |
| `etk_stats_pkg` | the dashboard |
| `etk_contract_pkg` | maintenance contract state (client banner) |
| `etk_user_request_pkg` | client user requests |

## Screens

Internal portal: sign in, forced password change, dashboard (my numbers / my
team), ticket list (saved views + filters), ticket details (actions,
conversation, internal notes, history, collision alert, EXSYS context),
escalation, notifications, clients.

Setup (management only): clients, users, teams, SLA and escalation, workflow,
general settings, user requests (approve / refuse + who is the client manager).

Client portal: new ticket (with EXSYS context from the URL), my tickets, the
ticket itself (the same screen; the server hides the internal parts), the
maintenance contract banner, user requests (the client manager only).

## The grid

Every list goes through `src/components/exsys-table`. When the Exsys Grid
project is ready it replaces the body of that one file and no screen changes -
the decision in the handover, section 6.7.

## Not here yet (the database side comes first)

Knowledge base and its approval, the AI reply, e-mail in and out, repeated
problems, the management and client dashboards, the client portal home page,
attachments upload, entering from EXSYS by link without a password.
