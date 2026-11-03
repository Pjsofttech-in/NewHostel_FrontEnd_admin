# Hostel Admin — Module Federation Remote

## Port
Runs on **port 5014** (`http://localhost:5014`).

## Build & Serve
```bash
npm install
npm run build
npm run preview       # serves built assets at :5014
# OR
npm run dev           # standalone dev mode at :5014
```

## How it plugs into superadmin
The superadmin host's `vite.config.js` already has:
```js
hostelAdmin: `http://localhost:5014/layringhosteladmin/assets/remoteEntry.js?v=${buildVersion}`,
```
And `HostelRoutes.jsx` already imports all the components.
No changes needed in the superadmin host once this remote is running.

## Session / Auth
This remote does **NOT** have its own login.
It reads the JWT and user info from the superadmin host's storage:
- **Token**: `sessionStorage.getItem("token")`
- **Role/Email**: `JSON.parse(localStorage.getItem("user"))` → `{ role, email }`

These are set automatically when a branch/department/staff logs into superadmin.

## Exposed components
| Import path                          | Component                         |
|--------------------------------------|-----------------------------------|
| `hostelAdmin/HostelInquieySetting`   | Inquiry tab layout shell          |
| `hostelAdmin/InquiryReportDashboard` | Inquiry analytics dashboard       |
| `hostelAdmin/HostelEnquiry`          | Add/Edit inquiry form             |
| `hostelAdmin/InquiryReport`          | Inquiry list                      |
| `hostelAdmin/AdmissionsTabs`         | Admission tab layout shell        |
| `hostelAdmin/AdmissionFormDashboard` | Admission analytics dashboard     |
| `hostelAdmin/AdmissionForm`          | Add/Edit admission form           |
| `hostelAdmin/AdmissionReport`        | Admission list                    |
| `hostelAdmin/RegistrationForm`       | 5-step registration form          |
| `hostelAdmin/UsersList`              | Registered students list          |
| `hostelAdmin/DisplayAdmissionFormDetails` | Student detail view          |
| `hostelAdmin/AdmissionSettings`      | Floor/Room/Bed/Source settings    |
| `hostelAdmin/DynamicWebsite`         | Website section layout shell      |
| `hostelAdmin/WebsiteUrl`             | Website URL page                  |
| `hostelAdmin/Slidebar`               | Slider management                 |
| `hostelAdmin/Footer`                 | Footer management                 |
| `hostelAdmin/WebsiteSettings`        | Website settings                  |

## Standalone mode
Run `npm run dev` — the app shows its own Login page and Dashboard.
Useful for developing/debugging the hostel module in isolation.
