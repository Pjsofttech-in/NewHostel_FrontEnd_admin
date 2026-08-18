# User Registration Form

A comprehensive multi-step user registration form for hostel admission with file upload capabilities.

## Features

- **Multi-step Form**: 5 sections organized in a stepper layout
  1. Personal Information (with photo upload)
  2. Address Information (current, permanent, guardian)
  3. Family & Guardian Information
  4. Academic Information
  5. Hostel & Payment Information (with signatures)

- **Smart Address Handling**: Option to copy current address to permanent address
- **File Upload with Preview**: 
  - Student photo with avatar preview
  - Address proofs (applicant & parent)
  - Digital signatures (applicant & parent)
- **Form Validation**: Required field validation before submission
- **Loading States**: Loading overlay during API calls
- **Alert Notifications**: Success/error alerts using SweetAlert2

## Components Structure

```
UserRegiForm/
├── UserRegistrationForm.jsx      # Main form component with state management
├── PersonalInfoSection.jsx       # Personal details + photo upload
├── AddressSection.jsx            # Current, permanent, guardian addresses
├── FamilyInfoSection.jsx         # Family & guardian contact details
├── AcademicInfoSection.jsx       # Academic information
├── HostelInfoSection.jsx         # Hostel allocation & payment details
├── index.js                      # Export barrel
└── README.md                     # Documentation
```

## Usage

```jsx
import { UserRegistrationForm } from './Components/UserRegiForm';

function App() {
  return <UserRegistrationForm />;
}
```

## API Integration

The form uses `UserRegistrationService` which sends data to:
- **Endpoint**: `/saveAllDetails`
- **Method**: POST
- **Content-Type**: multipart/form-data

### Request Structure:
- `data`: JSON string of form data
- `role`: User role (from session)
- `email`: Created by email (from session)
- `studentPhoto`: File (optional)
- `applicantAddressProof`: File (optional)
- `parentAddressProof`: File (optional)
- `applicantSignature`: File (optional)
- `parentSignature`: File (optional)

## Dependencies

- **Material-UI**: Form components, layout, stepper
- **Ant Design**: File upload components, icons
- **axios**: HTTP client (via axiosInstance)
- **SweetAlert2**: Alert notifications (via AlertService)

## Form Data Fields

### Personal Information
- name, birthDate, age, gender, email, password
- contactNo, martialStatus, bloodGroup, religon

### Address Information
- Current: fullAddress, state, city, pinCode
- Permanent: pfullAddress, pstate, pcity, ppinCode
- Guardian: gfullAddress, gstate, gcity, gpinCode

### Family Information
- Father: fatherName, mobNo
- Mother: motherName, motherMobNo
- Guardian: guardianName, gmobNo
- Doctor: familyDoctorName, doctorMobileNo
- Parent Address: parentFullAddress, parentState, parentCity, parentPinCode

### Academic Information
- studentIdNo, course, year, instituteName, vehicleNo

### Hostel Information
- Stay: stayFrom, stayTo
- Room: buildingName, floor, roomNo, bedType, bedNo
- Payment: amount, depositedStatus, paymentMode, chequeNo, gst, source

## Customization

### Styling
All components use Material-UI's `sx` prop for styling. Modify the theme or component styles as needed.

### Validation
Update the `validateForm()` function in `UserRegistrationForm.jsx` to add/modify validation rules.

### API Endpoint
Update the endpoint in `UserRegistrationService.js` to match your backend URL.

## Notes

- File size limits: 5MB for photos/documents, 2MB for signatures
- Supported file types: Images (jpg, png, etc.) and PDF for address proofs
- Role and email are retrieved from sessionStorage
- Form resets automatically after successful submission
