import { useEffect, useState } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import WorkshopHeader from "../components/WorkshopHeader.tsx";
import {
  formatMockRequestAlert,
  getMockStudentProfile,
  updateMockStudentProfile,
} from "../lib/mockApi.ts";

const imgStudentProfile =
  "https://www.figma.com/api/mcp/asset/3e16b081-8990-428b-bada-53ad0e6d75e8";
const imgProfilePicture =
  "https://www.figma.com/api/mcp/asset/8b5490f6-451d-4c0e-b17e-9b43a0619761";

const UserProfile = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [mssv, setMssv] = useState("STU-84920");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [avatar, setAvatar] = useState(imgProfilePicture);
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getMockStudentProfile("STU-84920");
      setIsLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setFullName(result.data.fullName);
      setEmail(result.data.email);
      setPhone(result.data.phone);
      setBio(result.data.bio);
      setMssv(result.data.mssv);
      setMajor(result.data.major);
      setYear(result.data.year);
      setAvatar(result.data.avatar);
      setVerified(result.data.verified);
    };

    void loadProfile();
  }, []);

  const handleReset = () => {
    void (async () => {
      setIsLoading(true);
      const result = await getMockStudentProfile(mssv);
      setIsLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setFullName(result.data.fullName);
      setEmail(result.data.email);
      setPhone(result.data.phone);
      setBio(result.data.bio);
      setAvatar(result.data.avatar);
      setMajor(result.data.major);
      setYear(result.data.year);
      setVerified(result.data.verified);
    })();
  };

  const handleSave = async () => {
    setError(null);
    const result = await updateMockStudentProfile(mssv, {
      fullName,
      phone,
      bio,
      avatar,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    window.alert(formatMockRequestAlert(result.request));
  };

  return (
    <div className="profile-page">
      <WorkshopHeader
        profileImage={imgStudentProfile}
        profileLink="/profile"
      />

      <main className="profile-main">
        <h1>Personal Profile</h1>
        {error ? <p className="helper-text">{error}</p> : null}
        {isLoading ? <p className="helper-text">Loading profile...</p> : null}

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>Basic Information</h2>
          </div>
          <div className="profile-card-body">
            <div className="profile-avatar">
              <div className="profile-avatar-frame">
                <img src={avatar} alt="Student profile" />
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
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
              <label className="profile-field">
                <span>Email</span>
                <div className="profile-input success">
                  <input
                    type="email"
                    value={email}
                    readOnly
                  />
                  <CheckCircle2 className="icon icon-sm" aria-hidden="true" />
                </div>
              </label>
              <label className="profile-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <label className="profile-field full">
                <span>Short bio</span>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-header profile-card-header-row">
            <h2>Student Information</h2>
            {verified ? (
              <span className="profile-verified">
                <CheckCircle2 className="icon icon-xs" aria-hidden="true" />
                Verified
              </span>
            ) : null}
          </div>
          <div className="profile-student-grid">
            <label className="profile-field">
              <span>Student ID</span>
              <input type="text" value={mssv} readOnly />
            </label>
            <label className="profile-field">
              <span>Major</span>
              <div className="profile-select">
                <input type="text" value={major} readOnly />
                <ChevronDown className="icon icon-sm" aria-hidden="true" />
              </div>
            </label>
            <label className="profile-field">
              <span>Year</span>
              <div className="profile-select">
                <input type="text" value={year} readOnly />
                <ChevronDown className="icon icon-sm" aria-hidden="true" />
              </div>
            </label>
          </div>
        </section>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-cancel"
            onClick={handleReset}
            disabled={isLoading}
          >
            <X className="icon icon-sm" aria-hidden="true" />
            Cancel
          </button>
          <button
            type="button"
            className="profile-save"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            <Check className="icon icon-sm" aria-hidden="true" />
            Save changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
