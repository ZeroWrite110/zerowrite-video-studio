// The six scene types of a ZeroWrite explainer. Visuals mirror zerowrite.ai
// (file cards, "held" badges, the intent-score panel, verdicts).
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ZW } from "./theme";
import { Card, EASE, FileBadge, Tag } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const STAGE: React.CSSProperties = {
  position: "absolute",
  left: 90,
  right: 90,
  top: 640,
  display: "flex",
  flexDirection: "column",
  gap: 22,
};

const useAppear = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
};

// 1. A normal-looking download.
export const DownloadScene: React.FC<{ file: string }> = ({ file }) => {
  const frame = useCurrentFrame();
  const a = useAppear(4);
  const pct = interpolate(frame, [10, 50], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <div style={STAGE}>
      <Card style={{ opacity: a, translate: `0px ${(1 - a) * 60}px` }}>
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <FileBadge ext="EXE" size={110} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: ZW.mono, fontSize: 46, color: ZW.text }}>
              {file}
            </div>
            <div
              style={{
                fontFamily: ZW.sans,
                fontSize: 32,
                color: ZW.muted,
                marginTop: 6,
              }}
            >
              2.1 MB · Downloads
            </div>
          </div>
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 6,
            backgroundColor: ZW.line,
            marginTop: 34,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              backgroundColor: ZW.cyan,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 30,
            display: "inline-block",
            fontFamily: ZW.sans,
            fontWeight: 700,
            fontSize: 38,
            color: ZW.ink,
            backgroundColor: ZW.text,
            borderRadius: 14,
            padding: "14px 36px",
            opacity: interpolate(frame, [50, 58], [0, 1], clamp),
            scale: interpolate(frame, [58, 66, 74], [1, 1.07, 1], clamp),
          }}
        >
          Open file
        </div>
      </Card>
    </div>
  );
};

// 2. What ransomware does: your files get renamed to *.locked.
const DOCS = [
  "Q3-sales.xlsx",
  "Payroll.pdf",
  "contract.docx",
  "photos.zip",
  "taxes.pdf",
  "notes.docx",
];
export const RansomwareScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...STAGE,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 22,
      }}
    >
      {DOCS.map((d, i) => {
        const lockAt = 18 + i * 9;
        const locked = frame >= lockAt;
        const flash = interpolate(frame, [lockAt, lockAt + 8], [1, 0], clamp);
        return (
          <Card
            key={d}
            style={{
              padding: 26,
              borderColor: locked ? `${ZW.red}aa` : ZW.line,
              backgroundColor: locked
                ? `rgba(240,62,77,${0.08 + flash * 0.25})`
                : ZW.panel,
            }}
          >
            <div
              style={{
                fontFamily: ZW.mono,
                fontSize: 30,
                color: locked ? ZW.red : ZW.text,
                overflowWrap: "anywhere",
                lineHeight: 1.3,
              }}
            >
              {d}
              {locked ? ".locked" : ""}
            </div>
            <div
              style={{
                fontFamily: ZW.sans,
                fontSize: 26,
                color: locked ? ZW.red : ZW.faint,
                marginTop: 8,
              }}
            >
              {locked ? "Encrypted" : "Document"}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// 3. ZeroWrite holds the new program before it runs.
const HELD = [
  { ext: "PS1", name: "update-drivers.ps1" },
  { ext: "ISO", name: "driver-pack.iso" },
  { ext: "LNK", name: "Payroll.pdf.lnk" },
];
export const HeldScene: React.FC<{ file: string }> = ({ file }) => {
  const frame = useCurrentFrame();
  const main = useAppear(2);
  const stamp = useAppear(16);
  return (
    <div style={STAGE}>
      <Card
        style={{
          borderColor: `${ZW.amber}aa`,
          opacity: main,
          translate: `0px ${(1 - main) * 50}px`,
        }}
      >
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <FileBadge ext="EXE" color={ZW.amber} size={100} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: ZW.mono, fontSize: 42, color: ZW.text }}>
              {file}
            </div>
            <div
              style={{
                fontFamily: ZW.sans,
                fontSize: 30,
                color: ZW.muted,
                marginTop: 6,
              }}
            >
              Waiting for a verdict
            </div>
          </div>
          <div
            style={{
              scale: interpolate(stamp, [0, 1], [1.8, 1]),
              opacity: stamp,
            }}
          >
            <Tag text="Held" color={ZW.amber} size={34} />
          </div>
        </div>
      </Card>
      {HELD.map((h, i) => {
        const a = interpolate(frame, [26 + i * 7, 36 + i * 7], [0, 1], {
          ...clamp,
          easing: EASE,
        });
        return (
          <Card
            key={h.name}
            style={{
              padding: 22,
              opacity: a * 0.85,
              translate: `${(1 - a) * 80}px 0px`,
            }}
          >
            <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
              <FileBadge ext={h.ext} color={ZW.faint} size={58} />
              <div
                style={{
                  flex: 1,
                  fontFamily: ZW.mono,
                  fontSize: 32,
                  color: ZW.muted,
                }}
              >
                {h.name}
              </div>
              <Tag text="Held" color={ZW.amber} size={24} />
            </div>
          </Card>
        );
      })}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <Img
          src={staticFile("brand/zerowrite-logo.svg")}
          style={{
            width: 150,
            height: 150,
            opacity: interpolate(frame, [40, 52], [0, 1], clamp),
            scale: interpolate(frame, [40, 60], [0.7, 1], {
              ...clamp,
              easing: EASE,
            }),
          }}
        />
      </div>
    </div>
  );
};

// 4. The intent-score panel from the website, building up to 94.
const SIGNALS: [number, string][] = [
  [14, "enumerates 1,204 documents"],
  [32, "deletes volume shadow copies"],
  [28, "renames files to *.locked"],
  [12, "writes a Run key"],
  [8, "contacts an unknown address"],
];
export const IntentScene: React.FC<{ file: string }> = ({ file }) => {
  const frame = useCurrentFrame();
  const step = 9;
  const shown = SIGNALS.filter((_, i) => frame >= 8 + i * step);
  const target = shown.reduce((s, [n]) => s + n, 0);
  // Count up smoothly, but never past the signals shown so far.
  const ramp = interpolate(
    frame,
    [8, 8 + SIGNALS.length * step + 6],
    [0, 94],
    clamp,
  );
  const score = Math.round(Math.min(ramp, target));
  const color = score >= 70 ? ZW.red : score >= 35 ? ZW.amber : ZW.jade;
  return (
    <div style={STAGE}>
      <Card>
        <div style={{ fontFamily: ZW.mono, fontSize: 36, color: ZW.text }}>
          {file}
        </div>
        <div
          style={{
            fontFamily: ZW.mono,
            fontSize: 26,
            color: ZW.faint,
            marginTop: 4,
          }}
        >
          unsigned · first seen now
        </div>
        <div
          style={{ height: 2, backgroundColor: ZW.line, margin: "26px 0" }}
        />
        {SIGNALS.map(([n, label], i) => {
          const a = interpolate(
            frame,
            [8 + i * step, 14 + i * step],
            [0, 1],
            clamp,
          );
          return (
            <div
              key={label}
              style={{
                display: "flex",
                gap: 22,
                alignItems: "baseline",
                fontFamily: ZW.mono,
                fontSize: 32,
                margin: "14px 0",
                opacity: a,
                translate: `${(1 - a) * 30}px 0px`,
              }}
            >
              <span style={{ color: ZW.red, width: 80 }}>+{n}</span>
              <span style={{ color: ZW.text }}>{label}</span>
            </div>
          );
        })}
        <div
          style={{ height: 2, backgroundColor: ZW.line, margin: "26px 0" }}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <span
            style={{
              fontFamily: ZW.sans,
              fontWeight: 800,
              fontSize: 120,
              color,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span style={{ fontFamily: ZW.mono, fontSize: 30, color: ZW.muted }}>
            risk score
          </span>
        </div>
      </Card>
    </div>
  );
};

// 5. Verdicts: malicious is quarantined, safe is allowed, both explained.
export const VerdictScene: React.FC<{ file: string }> = ({ file }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const row = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const r1 = row(4);
  const r2 = row(Math.round(1.9 * fps));
  const why = row(Math.round(3.6 * fps));
  return (
    <div style={STAGE}>
      <Card
        style={{
          borderColor: `${ZW.red}99`,
          opacity: r1,
          translate: `0px ${(1 - r1) * 40}px`,
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <FileBadge ext="EXE" color={ZW.red} size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: ZW.mono, fontSize: 34, color: ZW.text }}>
              {file}
            </div>
            <div style={{ marginTop: 12 }}>
              <Tag text="Malicious · Quarantined" color={ZW.red} size={26} />
            </div>
          </div>
          <div
            style={{
              fontFamily: ZW.sans,
              fontWeight: 800,
              fontSize: 64,
              color: ZW.red,
            }}
          >
            94
          </div>
        </div>
      </Card>
      <Card
        style={{
          borderColor: `${ZW.jade}99`,
          opacity: r2,
          translate: `0px ${(1 - r2) * 40}px`,
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <FileBadge ext="MSI" color={ZW.jade} size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: ZW.mono, fontSize: 34, color: ZW.text }}>
              zoom-setup.msi
            </div>
            <div style={{ marginTop: 12 }}>
              <Tag text="Safe · Allowed" color={ZW.jade} size={26} />
            </div>
          </div>
          <div
            style={{
              fontFamily: ZW.sans,
              fontWeight: 800,
              fontSize: 64,
              color: ZW.jade,
            }}
          >
            6
          </div>
        </div>
      </Card>
      <Card
        style={{
          opacity: why,
          translate: `0px ${(1 - why) * 40}px`,
          padding: 30,
        }}
      >
        <div
          style={{
            fontFamily: ZW.mono,
            fontSize: 26,
            color: ZW.cyan,
            letterSpacing: 1,
          }}
        >
          WHY IT WAS BLOCKED
        </div>
        <div
          style={{
            fontFamily: ZW.sans,
            fontSize: 38,
            color: ZW.text,
            marginTop: 10,
            lineHeight: 1.3,
          }}
        >
          It tried to delete your backups and rename your files.
        </div>
      </Card>
    </div>
  );
};

// 6. Logo, tagline and next step.
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useAppear(2);
  const line = (d: number) =>
    interpolate(frame, [d, d + 12], [0, 1], { ...clamp, easing: EASE });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
        padding: "0 90px 260px",
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile("brand/zerowrite-logo.svg")}
        style={{
          width: 260,
          height: 260,
          opacity: logo,
          scale: interpolate(logo, [0, 1], [0.7, 1]),
        }}
      />
      <div
        style={{
          fontFamily: ZW.sans,
          fontWeight: 600,
          fontSize: 64,
          color: ZW.text,
          opacity: line(8),
        }}
      >
        ZeroWrite<span style={{ color: ZW.muted }}>.ai</span>
      </div>
      <div
        style={{
          fontFamily: ZW.sans,
          fontWeight: 700,
          fontSize: 100,
          lineHeight: 1.05,
          letterSpacing: -1.5,
          color: ZW.text,
          opacity: line(16),
        }}
      >
        Stop threats <span style={{ color: ZW.cyan }}>before</span> they run.
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: line(30),
        }}
      >
        <Tag text="Free trial" color={ZW.cyan} size={30} />
        <Tag text="No card needed" color={ZW.cyan} size={30} />
        <Tag text="Windows 10 / 11" color={ZW.muted} size={30} />
      </div>
      <div
        style={{
          fontFamily: ZW.sans,
          fontWeight: 700,
          fontSize: 54,
          color: ZW.ink,
          backgroundColor: ZW.cyan,
          borderRadius: 18,
          padding: "20px 48px",
          opacity: line(40),
          scale: interpolate(frame, [52, 60, 68], [1, 1.05, 1], clamp),
        }}
      >
        zerowrite.ai
      </div>
    </div>
  );
};
