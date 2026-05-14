import { useEffect, useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  LogOut,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkshopHeader from '../components/WorkshopHeader.tsx';
import { signOut } from '../lib/authClient.ts';
import { mapStudentToProfileViewModel } from '../lib/unihubAdapters.ts';
import { fetchCurrentStudent } from '../lib/unihubApi.ts';

const imgProfilePicture =
  'https://www.figma.com/api/mcp/asset/8b5490f6-451d-4c0e-b17e-9b43a0619761';

const UserProfile = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [mssv, setMssv] = useState('STU-84920');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [avatar, setAvatar] = useState(imgProfilePicture);
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      const result = await fetchCurrentStudent();
      setIsLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const profile = mapStudentToProfileViewModel(result.data);

      setFullName(profile.fullName);
      setEmail(profile.email);
      setPhone(profile.phone);
      setBio(profile.bio);
      setMssv(profile.mssv);
      setMajor(profile.major);
      setYear(profile.year);
      setAvatar(profile.avatar);
      setVerified(profile.verified);
    };

    void loadProfile();
  }, []);

  const handleReset = () => {
    void (async () => {
      setIsLoading(true);
      setError(null);
      const result = await fetchCurrentStudent();
      setIsLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const profile = mapStudentToProfileViewModel(result.data);

      setFullName(profile.fullName);
      setEmail(profile.email);
      setPhone(profile.phone);
      setBio(profile.bio);
      setAvatar(profile.avatar);
      setMajor(profile.major);
      setYear(profile.year);
      setVerified(profile.verified);
    })();
  };

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);

    const result = await signOut();
    setIsSigningOut(false);

    if (result.error) {
      setError(result.error.message || 'An error occurred while signing out.');
      return;
    }

    void navigate('/sign-in');
  };

  return (
    <div className="profile-page">
      <WorkshopHeader
        profileImage={avatar}
        profileLink={error ? undefined : '/profile'}
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
              <button
                type="button"
                className="profile-avatar-button"
                disabled
                title="Profile updates are not supported by the current backend contract"
              >
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
                  <input type="email" value={email} readOnly />
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
            className="profile-logout"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
          >
            <LogOut className="icon icon-sm" aria-hidden="true" />
            {isSigningOut ? 'Signing out...' : 'Log out'}
          </button>
          <button
            type="button"
            className="profile-cancel"
            onClick={handleReset}
            disabled={isLoading || isSigningOut}
          >
            <X className="icon icon-sm" aria-hidden="true" />
            Cancel
          </button>
          <button
            type="button"
            className="profile-save"
            disabled
            title="Profile updates are not supported by the current backend contract"
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
