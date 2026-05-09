import {
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import WorkshopHeader from "../components/WorkshopHeader.tsx";

const imgStudentProfile =
  "https://www.figma.com/api/mcp/asset/3e16b081-8990-428b-bada-53ad0e6d75e8";
const imgProfilePicture =
  "https://www.figma.com/api/mcp/asset/8b5490f6-451d-4c0e-b17e-9b43a0619761";

const UserProfile = () => {
  return (
    <div className="profile-page">
      <WorkshopHeader
        profileImage={imgStudentProfile}
        profileLink="/profile"
      />

      <main className="profile-main">
        <h1>Personal Profile</h1>

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>Basic Information</h2>
          </div>
          <div className="profile-card-body">
            <div className="profile-avatar">
              <div className="profile-avatar-frame">
                <img src={imgProfilePicture} alt="Student profile" />
                <button type="button" className="profile-avatar-overlay">
                  <Camera className="icon icon-sm" aria-hidden="true" />
                </button>
              </div>
              <button type="button" className="profile-avatar-button">
                Change photo
              </button>
            </div>

            <div className="profile-form">
              <label className="profile-field full">
                <span>Full name</span>
                <input type="text" defaultValue="Michael Chen" />
              </label>
              <label className="profile-field">
                <span>Email</span>
                <div className="profile-input success">
                  <input
                    type="email"
                    defaultValue="m.chen@university.edu"
                    readOnly
                  />
                  <CheckCircle2 className="icon icon-sm" aria-hidden="true" />
                </div>
              </label>
              <label className="profile-field">
                <span>Phone number</span>
                <input type="tel" defaultValue="+84 912 345 678" />
              </label>
              <label className="profile-field full">
                <span>Short bio</span>
                <textarea
                  rows={4}
                  defaultValue={
                    "Third-year computer science student. Passionate about AI and software development."
                  }
                />
              </label>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-header profile-card-header-row">
            <h2>Student Information</h2>
            <span className="profile-verified">
              <CheckCircle2 className="icon icon-xs" aria-hidden="true" />
              Verified
            </span>
          </div>
          <div className="profile-student-grid">
            <label className="profile-field">
              <span>Student ID</span>
              <input type="text" defaultValue="STU-84920" readOnly />
            </label>
            <label className="profile-field">
              <span>Major</span>
              <div className="profile-select">
                <input type="text" defaultValue="Computer Science" readOnly />
                <ChevronDown className="icon icon-sm" aria-hidden="true" />
              </div>
            </label>
            <label className="profile-field">
              <span>Year</span>
              <div className="profile-select">
                <input type="text" defaultValue="Year 3" readOnly />
                <ChevronDown className="icon icon-sm" aria-hidden="true" />
              </div>
            </label>
          </div>
        </section>

        <div className="profile-actions">
          <button type="button" className="profile-cancel">
            <X className="icon icon-sm" aria-hidden="true" />
            Cancel
          </button>
          <button type="button" className="profile-save">
            <Check className="icon icon-sm" aria-hidden="true" />
            Save changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
