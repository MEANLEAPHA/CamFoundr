import React, { useState, useEffect, useMemo } from "react";
import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";
import  toast from "react-hot-toast";
import { Save, Check, RotateCw, Plus, ArrowLeft } from "lucide-react";
import "../style/Authentication/SetUpAccount.css";
import { Spin } from "antd";
import nahideaIcon from '../img/nahideaIcon.png';
const AVATAR_STYLES = [ "adventurer", "avataaars", "big-smile", "bottts", "croodles", "fun-emoji", "icons", "identicon", "initials",
                        "lorelei", "micah", "miniavs", "notionists", "open-peeps", "personas", "pixel-art", "rings", "shapes", "thumbs" ];
const COLORS = [
  "8B5CF6", // violet
  "EC4899", // pink
  "38BDF8", // sky
  "818CF8", // indigo
  "EAB308", // yellow
  "4ADE80", // green
  "F87171", // red
  "FB923C", // orange
  "22D3EE", // cyan
  "2DD4BF", // teal
  "F472B6", // rose
  "A78BFA", // purple
  "FCA5A5", // soft red
  "FACC15", // amber
  "60A5FA", // blue
  "34D399", // emerald
  "FB7185", // pink-red
  "6366F1", // indigo
  "A855F7", // medium purple
  "3B82F6", // medium blue
];

const PRESET_SEEDS = [
  "Alex",
  "Luna",
  "Milo",
  "Nova",
  "Leo",
  "Zara",
  "Kai",
  "Jade",
  "Ace",
  "Ruby",
  "Ghost",
  "Pixel",
  "Shadow",
  "Cosmo",
  "Rex",
  "Violet",
  "Coco",
  "Blaze",
  "Storm",
  "Echo",
];

/* ------------------ */
/* MAIN PAGE */
/* ------------------ */

const EditAccount = () => {
  const navigate = useNavigate();

  const { state } = useLocation();

  // if(!state) return navigate(-1);

  // if(!state?.Email || !state?.UserId) return navigate("/login");

  const [showAvatarStudio, setShowAvatarStudio] =
    useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [avatar, setAvatar] = useState(
    "https://img.nahidea.com/img/content/1784081044474-nahidea.webp"
  );
  const [avatarType, setAvatarType] = useState('url'); // 'url' or 'file'
  const [avatarFile, setAvatarFile] = useState(null);

  const [username, setUsername] = useState('');
  const [banner, setBanner] = useState(
    "https://img.nahidea.com/img/content/1784081044476-Cream-and-Brown-Aesthetic-Quotes-Desktop-Wallpaper.webp"
  );
  const [bannerFile, setBannerFile] = useState(
    "https://img.nahidea.com/img/content/1784081044476-Cream-and-Brown-Aesthetic-Quotes-Desktop-Wallpaper.webp"
  );

  const [profession, setProfession] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [userId, setUserId] =
    useState(null);

  const [location, setLocation] =
    useState("");

  const [nickname, setNickname] =
    useState("");

  const [bio, setBio] = useState("");

  useEffect(() => {
    if (state) {
      setProfession(state.profession);
      setLocation(state.workplace);
      setNickname(state.nickname);
      setBio(state.bio);
      setAvatar(state.avatar);
      setAvatarFile(state.avatar);
      setBanner(state.banner);
      setBannerFile(state.banner);
      setAvatarType(state.avatarType);
      setUsername(state.username);
      setEmail(state.email);
      setUserId(state.userId);
      console.log(state);
    }
  }, [state]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const formData = new FormData();

    formData.append('profession', profession);
    formData.append('location', location);
    formData.append('username', username);
    formData.append('nickname', nickname);
    formData.append('userId', Number(userId));
    formData.append('email', email);
    formData.append('bio', bio);
    formData.append('avatarType', avatarType);

    if (avatarType === 'file' && avatarFile) {
      formData.append('avatar', avatarFile);
    } else {
      formData.append('avatar', avatar);
    }

    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    const res = await api.put(`/api/update-user`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 409) {
      toast.error('Nickname already exists! Please try new one.');
    }

    if (res.status === 200) {
      toast.success('Edit Account Successful!');
      setTimeout(() => {
        navigate("/accounts", {
          state: { userId: userId },
        });
      }, 500);
    }
  } catch (err) {
    console.log(err);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="setup-page">

      {/* AVATAR STUDIO */}
      {showAvatarStudio && (
        <AvatarPlayground
          setAvatar={setAvatar}
          setShowAvatarStudio={
            setShowAvatarStudio
          }
        />
      )}

      {/* FORM */}
      {!showAvatarStudio && (
        <div className="setup-container">

          {/* LEFT */}
        <div className="setup-left">
  <div 
    id='acc-banner-setup' 
    style={{ 
      "--preview-url-banner-setup": `url(${banner || "https://img.nahidea.com/img/content/1784081044476-Cream-and-Brown-Aesthetic-Quotes-Desktop-Wallpaper.webp"} )` 
    }}
  >
    <img 
      src={banner || "https://img.nahidea.com/img/content/1784081044476-Cream-and-Brown-Aesthetic-Quotes-Desktop-Wallpaper.webp"} 
      id="img-banner-setup" 
      alt="banner"
    />
    <button 
      id='banner-setup-btn' 
      type="button"
      title="Select Banner"
      onClick={() => document.getElementById('banner-upload').click()}
    >
      Edit banner
    </button>
    
    {/* Hidden file input for banner */}
    <input
      id="banner-upload"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          // Clean up old object URL
          if (banner && banner.startsWith('blob:')) {
            URL.revokeObjectURL(banner);
          }
          // Create object URL for preview
          const previewUrl = URL.createObjectURL(file);
          setBanner(previewUrl);
          setBannerFile(file); // Store file for submission
        }
      }}
    />
  </div>
  
  <div className="profile-card">
    <div className="avatar-wrapper">
      <img
        src={avatar || 'https://img.nahidea.com/img/content/1784081044474-nahidea.webp'}
        alt="avatar"
        className="profile-avatar"
      />
      <button
        type="button"
        className="edit-avatar-btn"
        title="Select Avatar for you Profile"
        onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
      >
        <Plus size={20} />
      </button>
      
      {/* Dropdown */}
      {showAvatarDropdown && (
        <div className="avatar-dropdown">
          <button onClick={() => {
            document.getElementById('avatar-upload').click();
          }}>
             Upload Photo
          </button>
          <button onClick={() => {
            // Clean up object URL if exists
            if (avatar && avatar.startsWith('blob:')) {
              URL.revokeObjectURL(avatar);
            }
            setAvatarType('url');
            setAvatarFile(null);
            setShowAvatarDropdown(false);
            setShowAvatarStudio(true);
          }}>
            Cool Avatar
          </button>
        </div>
      )}
      
      {/* Hidden file input for avatar */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            // Clean up old object URL
            if (avatar && avatar.startsWith('blob:')) {
              URL.revokeObjectURL(avatar);
            }
            // Create object URL for preview
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl);
            setAvatarFile(file);
            setAvatarType('file');
            setShowAvatarDropdown(false);
          }
        }}
      />
    </div>

    <h2 id="create-label">Create Profile</h2>
    <p id="label-info">Build your public identity for Nahidea</p>
      </div>
    </div>

          {/* RIGHT */}
          <div className="setup-right">

            <form
              onSubmit={handleSubmit}
              className="setup-form"
            >
                            <div className="input-group">
                <label className='label-setup'>
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Your username"
                  required
                  title="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
             
                />
              </div>

              <div className="input-group">
                <label className='label-setup'>
                  Nickname
                </label>

                <input
                  type="text"
                  placeholder="NahideaLover"
                  required
                  title="Enter your nickname"
                  value={nickname}
                  onChange={(e) =>
                    setNickname(
                      e.target.value
                    )
                  }
             
                />
              </div>

              <div className="input-group">
                <label className='label-setup'>
                  Profession
                </label>

                <input
                  type="text"
                  placeholder="Software Engineer or Art Student"
                  title="Enter your profession"
                  value={profession}
                  required
                  onChange={(e) =>
                    setProfession(
                      e.target.value
                    )
                  }
             
                />
              </div>

              <div className="input-group">
                <label className='label-setup'>
                  Work Location
                </label>

                <input
                  type="text"
                  required
                  placeholder="ABC Company or DFG School"
                  value={location}
                  title="Enter your work location or school name"
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
              
                />
              </div>

              <div className="input-group">
                <label className='label-setup'>Bio</label>

                <textarea
                  placeholder="Tell people who you are..."
                  value={bio}
                  title="Enter your bio"
                  required
                  onChange={(e) =>
                    setBio(
                      e.target.value
                    )
                  }
                
                />
              </div>

              <button
                type="submit"
                className="submit-btns"
                title="Enter to complete setup"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spin style={{ marginRight: '6px', color: 'var(--primary-color)' }} />
                ) : (
                  <span>Finish Edit</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAccount;

function AvatarPlayground({
  setAvatar,
  setShowAvatarStudio,
}) {
  const [saved, setSaved] =
    useState(false);

  const [style, setStyle] =
    useState("adventurer");

  const [seed, setSeed] =
    useState("Alex");

  const [flip, setFlip] =
    useState(false);

  const [rotate, setRotate] =
    useState(0);

  const [backgroundColor,
    setBackgroundColor] =
    useState("c0aede");

  const avatarUrl = useMemo(() => {
    const params =
      new URLSearchParams();

    params.set("seed", seed);

    params.set(
      "backgroundColor",
      backgroundColor
    );

    params.set("flip", flip);

    params.set(
      "rotate",
      rotate
    );

    return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
  }, [
    style,
    seed,
    backgroundColor,
    flip,
    rotate,
  ]);

  const handleSelectAvatar = () => {
    setAvatar(avatarUrl);

    setSaved(true);

    setTimeout(() => {
      setShowAvatarStudio(
        false
      );
    }, 700);
  };

  return (
    <div className="avatar-studio">

      {/* TOP */}
      <div className="studio-topbar">

        <button
          className="back-btn"
          onClick={() =>
            setShowAvatarStudio(
              false
            )
          }
        >
          
          <LeftOutlined id='goback-btn'/>
        </button>
        <div className="studio-logo">
          <img src='https://avatars.githubusercontent.com/u/7983162?v=4' alt="Dicebear-logo" id="dicebear-logo"/>
          <span id="db-label">Dicebear</span>
        </div>

        <button
          className="save-avatar-btn"
          onClick={
            handleSelectAvatar
          }
        >
          {saved ? (
            <>
              <Check size={18} />
              Saved
            </>
          ) : (
            <>
              <Save size={18} />
              Save
            </>
          )}
        </button>
      </div>

      <div className="studio-layout">

        {/* LEFT */}
        <div className="studio-sidebar">

          <h3 className='avatar-label'>Avatar Types</h3>

          <div className="style-grid">

            {AVATAR_STYLES.map(
              (s) => (
                <div
                  key={s}
                  className={`style-card ${
                    style === s
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStyle(s)
                  }
                >
                  <img
                    src={`https://api.dicebear.com/9.x/${s}/svg?seed=preview`}
                    alt=""
                  />

                  <span>{s}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* CENTER */}
        <div className="studio-preview">

          <div className="preview-card">
            <div className="preset-sections">

              <h3 className='avatar-label'>
                Your Avatar
              </h3>
              <img
              src={avatarUrl}
              alt=""
              className="main-avatar"
            />
              </div>
            

            <div className="preset-section">

              <h3 className='avatar-label'>
                Avatar Characters
              </h3>

              <div className="preset-grid">

                {PRESET_SEEDS.map(
                  (preset) => (
                    <div
                      key={preset}
                      className={`preset-card ${
                        seed ===
                        preset
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSeed(
                          preset
                        )
                      }
                    >
                      <img
                        src={`https://api.dicebear.com/9.x/${style}/svg?seed=${preset}&backgroundColor=${backgroundColor}`}
                        alt=""
                      />

                      <span style={{color: 'var(--font-color)'}}>
                        {preset}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="studio-controls">

          <h3 className='avatar-label'>Customize </h3>

                  <div className="control-group">

           
            <div className="color-list">

              {COLORS.map(
                (color) => (
                  <button
                    key={color}
                    className={`color-btn ${
                      backgroundColor ===
                      color
                        ? "active"
                        : ""
                    }`}
                    style={{
                      background: `#${color}`,
                    }}
                    onClick={() =>
                      setBackgroundColor(
                        color
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
          <div className="control-group">

            <div className="switch-row">

              <span className='avatar-labels' style={{color: 'var(--font-color)'}}>
                Flip Avatar
              </span>

              <input
                type="checkbox"
                checked={flip}
                onChange={(e) =>
                  setFlip(
                    e.target
                      .checked
                  )
                }
              />
            </div>
          </div>

          <div className="control-group">
              
            <div className="rotate-header">

              <span className='avatar-labels' style={{color: 'var(--font-color)'}}>
                Rotate
              </span>

              <span>
                {rotate}°
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="360"
              value={rotate}
              onChange={(e) =>
                setRotate(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="rotate-slider"
            />

            <button
              className="rotate-btn"
              onClick={() =>
                setRotate(
                  (prev) =>
                    prev >= 360
                      ? 0
                      : prev +
                        45
                )
              }
            >
              <RotateCw size={16} />
              Rotate +45°
            </button>
          </div>

        
        </div>
      </div>
    </div>
  );
}
