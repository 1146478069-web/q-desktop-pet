import { type CSSProperties, type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import defaultPet from "../../assets/default-pet.svg";
import type { AppSettings, Avatar } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/validation";
import "./PetWindow.css";

interface PetState {
  settings: AppSettings;
  avatars: Avatar[];
}

const BUBBLE_LINES = [
  "\u4eca\u5929\u4e5f\u8981\u5f00\u5fc3\u5440",
  "\u6478\u6478\u5934",
  "\u6211\u5728\u8fd9\u91cc\u966a\u4f60",
  "\u4f11\u606f\u4e00\u4e0b\u5427",
  "\u52a0\u6cb9\u52a0\u6cb9",
  "\u559d\u70b9\u6c34\u5427",
];

const BUBBLE_DURATION_MS = 2200;
const BOUNCE_DURATION_MS = 620;

function toFileUrl(filePath: string): string {
  return `file://${filePath.replace(/\\/g, "/")}`;
}

function chooseBubbleLine(): string {
  return BUBBLE_LINES[Math.floor(Math.random() * BUBBLE_LINES.length)];
}

export function PetWindow() {
  const [petState, setPetState] = useState<PetState>({
    settings: DEFAULT_SETTINGS,
    avatars: [],
  });
  const [isBouncing, setIsBouncing] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const bounceFrame = useRef<number | null>(null);
  const bounceTimer = useRef<number | null>(null);
  const bubbleTimer = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    window.desktopPet.getState().then((state) => {
      if (isMounted) {
        setPetState(state);
      }
    });

    const unsubscribe = window.desktopPet.onStateChanged((state) => {
      setPetState(state);
    });

    return () => {
      isMounted = false;
      unsubscribe();

      if (bounceTimer.current !== null) {
        window.clearTimeout(bounceTimer.current);
      }

      if (bounceFrame.current !== null) {
        window.cancelAnimationFrame(bounceFrame.current);
      }

      if (bubbleTimer.current !== null) {
        window.clearTimeout(bubbleTimer.current);
      }
    };
  }, []);

  const { settings, avatars } = petState;

  const avatarSrc = useMemo(() => {
    const activeAvatar = avatars.find((avatar) => avatar.id === settings.activeAvatarId);
    return activeAvatar ? toFileUrl(activeAvatar.assetPath) : defaultPet;
  }, [avatars, settings.activeAvatarId]);

  function handlePetClick() {
    if (settings.animationsEnabled) {
      setIsBouncing(false);
      if (bounceFrame.current !== null) {
        window.cancelAnimationFrame(bounceFrame.current);
      }

      bounceFrame.current = window.requestAnimationFrame(() => {
        setIsBouncing(true);
        bounceFrame.current = null;
      });

      if (bounceTimer.current !== null) {
        window.clearTimeout(bounceTimer.current);
      }

      bounceTimer.current = window.setTimeout(() => {
        setIsBouncing(false);
        bounceTimer.current = null;
      }, BOUNCE_DURATION_MS);
    }

    if (settings.bubblesEnabled) {
      setBubbleText(chooseBubbleLine());

      if (bubbleTimer.current !== null) {
        window.clearTimeout(bubbleTimer.current);
      }

      bubbleTimer.current = window.setTimeout(() => {
        setBubbleText(null);
        bubbleTimer.current = null;
      }, BUBBLE_DURATION_MS);
    }
  }

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    void window.desktopPet.showContextMenu();
  }

  const petSize = settings.petSize;
  const isPaper3d = settings.visualMode === "paper3d";
  const visualModeClass = isPaper3d ? "pet-button--paper3d pet-action--idle" : "pet-button--classic";
  const intensityClass = settings.motionIntensity === "soft" ? "pet-motion--soft" : "pet-motion--lively";
  const shellStyle = { "--pet-size": `${petSize}px` } as CSSProperties;

  return (
    <main className="pet-window" onContextMenu={handleContextMenu} style={shellStyle}>
      {settings.bubblesEnabled && bubbleText ? <div className="pet-bubble">{bubbleText}</div> : null}
      <button
        className={[
          "pet-button",
          visualModeClass,
          intensityClass,
          settings.animationsEnabled && !isPaper3d ? "pet-button--idle" : "",
          isBouncing && !isPaper3d ? "pet-button--bounce" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        aria-label="Q desktop pet"
        onClick={handlePetClick}
        style={{ width: petSize, height: petSize }}
      >
        {isPaper3d ? (
          <>
            <span className="pet-shadow" />
            <span className="pet-paper">
              <img className="pet-depth" src={avatarSrc} alt="" draggable={false} />
              <img className="pet-avatar" src={avatarSrc} alt="" draggable={false} />
            </span>
          </>
        ) : (
          <img className="pet-avatar" src={avatarSrc} alt="" draggable={false} />
        )}
      </button>
    </main>
  );
}

export default PetWindow;
