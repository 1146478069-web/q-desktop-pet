import { useEffect, useMemo, useState } from "react";
import defaultPet from "../../assets/default-pet.svg";
import type { AppSettings, Avatar, AvatarUploadResult } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/validation";
import "./SettingsWindow.css";

interface PetState {
  settings: AppSettings;
  avatars: Avatar[];
}

type NoticeKind = "success" | "error";

interface Notice {
  kind: NoticeKind;
  text: string;
}

const INITIAL_STATE: PetState = {
  settings: DEFAULT_SETTINGS,
  avatars: [],
};

function toFileUrl(filePath: string): string {
  return `file://${filePath.replace(/\\/g, "/")}`;
}

function getAvatarSrc(avatar: Avatar | undefined): string {
  return avatar ? toFileUrl(avatar.assetPath) : defaultPet;
}

function uploadNotice(result: AvatarUploadResult): Notice {
  if (result.ok) {
    return {
      kind: "success",
      text: result.message ?? "Avatar uploaded.",
    };
  }

  return {
    kind: "error",
    text: result.message ?? "Could not upload avatar.",
  };
}

export function SettingsWindow() {
  const [petState, setPetState] = useState<PetState>(INITIAL_STATE);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    window.desktopPet
      .getState()
      .then((state) => {
        if (isMounted) {
          setPetState(state);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotice({ kind: "error", text: "Could not load settings." });
        }
      });

    const unsubscribe = window.desktopPet.onStateChanged((state) => {
      setPetState(state);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const { settings, avatars } = petState;
  const activeAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === settings.activeAvatarId),
    [avatars, settings.activeAvatarId],
  );
  const previewSrc = useMemo(() => getAvatarSrc(activeAvatar), [activeAvatar]);

  function updateSettings(patch: Partial<AppSettings>) {
    void window.desktopPet.updateSettings(patch).catch(() => {
      setNotice({ kind: "error", text: "Could not save settings." });
    });
  }

  function setActiveAvatar(id: string) {
    void window.desktopPet.setActiveAvatar(id).catch(() => {
      setNotice({ kind: "error", text: "Could not change avatar." });
    });
  }

  async function handleUpload() {
    setIsUploading(true);
    setNotice(null);

    try {
      const result = await window.desktopPet.chooseAvatarFile();
      setNotice(uploadNotice(result));
    } catch {
      setNotice({ kind: "error", text: "Could not upload avatar." });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="settings-window">
      <section className="settings-panel" aria-label="Settings">
        <header className="settings-header">
          <div>
            <p className="settings-kicker">Q Desktop Pet</p>
            <h1>Settings</h1>
          </div>
          <button className="settings-upload" type="button" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload avatar"}
          </button>
        </header>

        {notice ? <p className={`settings-notice settings-notice--${notice.kind}`}>{notice.text}</p> : null}

        <section className="settings-preview" aria-label="Active avatar">
          <img src={previewSrc} alt="" />
          <div>
            <span>Active avatar</span>
            <strong>{activeAvatar?.name ?? "Default pet"}</strong>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="avatar-list-heading">
          <h2 id="avatar-list-heading">Avatar library</h2>
          {avatars.length === 0 ? (
            <p className="settings-empty">No custom avatars yet.</p>
          ) : (
            <div className="avatar-list">
              {avatars.map((avatar) => {
                const isActive = avatar.id === settings.activeAvatarId;

                return (
                  <button
                    className={`avatar-option${isActive ? " avatar-option--active" : ""}`}
                    type="button"
                    key={avatar.id}
                    onClick={() => setActiveAvatar(avatar.id)}
                    aria-pressed={isActive}
                  >
                    <img src={getAvatarSrc(avatar)} alt="" />
                    <span>{avatar.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="settings-section" aria-labelledby="behavior-heading">
          <h2 id="behavior-heading">Behavior</h2>
          <label className="size-control">
            <span>
              Pet size
              <strong>{settings.petSize}px</strong>
            </span>
            <input
              type="range"
              min="96"
              max="320"
              value={settings.petSize}
              onChange={(event) => updateSettings({ petSize: Number(event.currentTarget.value) })}
            />
          </label>

          <label className="toggle-row">
            <span>Always on top</span>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(event) => updateSettings({ alwaysOnTop: event.currentTarget.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>Animations</span>
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(event) => updateSettings({ animationsEnabled: event.currentTarget.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>Speech bubbles</span>
            <input
              type="checkbox"
              checked={settings.bubblesEnabled}
              onChange={(event) => updateSettings({ bubblesEnabled: event.currentTarget.checked })}
            />
          </label>
        </section>
      </section>
    </main>
  );
}

export default SettingsWindow;
