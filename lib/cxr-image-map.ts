/**
 * CXR Image Map — Maps pathology states to chest X-ray image paths
 *
 * Sources:
 *   - Wikimedia Commons (James Heilman, MD) | CC-BY-SA 4.0 / CC-BY-SA 3.0
 *   - PMC Open Access articles
 *
 * See public/assets/cxr/ATTRIBUTION.md for full attribution details.
 */

export interface CXRImageEntry {
  path: string;
  description: string;
  findings: string[];
  source: string;
  license: string;
}

type CXRPhase = "initial" | "deterioration" | "improving";

const cxrImages: Record<string, Partial<Record<CXRPhase, CXRImageEntry>>> = {
  cardiogenic_shock: {
    initial: {
      path: "/assets/cxr/cardiogenic-shock/pulmonary-edema.png",
      description:
        "CXR PA view showing cardiomegaly with pulmonary edema",
      findings: [
        "Cardiomegaly (CTR > 0.5)",
        "Bilateral interstitial and alveolar pulmonary edema",
        "Small bilateral pleural effusions",
        "Cephalization of pulmonary vessels",
      ],
      source:
        "Wikimedia Commons — James Heilman, MD (File:PulmEdema.PNG)",
      license: "CC-BY-SA 3.0",
    },
    deterioration: {
      path: "/assets/cxr/cardiogenic-shock/pulmonary-edema.png",
      description:
        "CXR showing worsening pulmonary edema after fluid overload",
      findings: [
        "Worsening bilateral alveolar opacities",
        "Increased bilateral pleural effusions",
        "Persistent cardiomegaly",
        "Air bronchograms visible",
      ],
      source:
        "Wikimedia Commons — James Heilman, MD (File:PulmEdema.PNG)",
      license: "CC-BY-SA 3.0",
    },
    // No separate improving image — text-only finding used
  },
  cardiac_tamponade: {
    initial: {
      path: "/assets/cxr/cardiac-tamponade/water-bottle-sign.png",
      description:
        "CXR showing massive pericardial effusion — 'water bottle' sign",
      findings: [
        "Globular cardiac silhouette ('water bottle' configuration)",
        "Smooth bilateral cardiac contours",
        "Widened mediastinum",
        "Absent left heart border concavity",
      ],
      source:
        "Wikimedia Commons — James Heilman, MD (File:Massivepericarialeffusion.png)",
      license: "CC-BY-SA 4.0",
    },
    deterioration: {
      path: "/assets/cxr/cardiac-tamponade/water-bottle-sign.png",
      description:
        "CXR showing progressive pericardial effusion with tamponade physiology",
      findings: [
        "Enlarging globular cardiac silhouette",
        "Increasingly widened mediastinum",
        "Bilateral pleural effusions may develop",
        "Clear lung fields (if pure tamponade without LV failure)",
      ],
      source:
        "Wikimedia Commons — James Heilman, MD (File:Massivepericarialeffusion.png)",
      license: "CC-BY-SA 4.0",
    },
    // Improving state: post-pericardiocentesis — would show smaller silhouette
  },
};

/**
 * Get the CXR image for a given pathology and clinical phase.
 * Returns null if no image is available for this combination.
 */
export function getCXRImage(
  pathology: string,
  phase: CXRPhase = "initial"
): CXRImageEntry | null {
  const map = cxrImages[pathology];
  if (!map) return null;
  return map[phase] ?? map["initial"] ?? null;
}

/**
 * Get all available CXR phases for a pathology.
 */
export function getAvailableCXRPhases(
  pathology: string
): { phase: CXRPhase; entry: CXRImageEntry }[] {
  const map = cxrImages[pathology];
  if (!map) return [];
  return Object.entries(map).map(([phase, entry]) => ({
    phase: phase as CXRPhase,
    entry: entry as CXRImageEntry,
  }));
}

/**
 * Get text-only CXR findings for a phase without an image.
 * Useful for "improving" states where we describe changes.
 */
export function getCXRTextFindings(
  pathology: string,
  phase: CXRPhase
): string[] | null {
  if (pathology === "cardiogenic_shock" && phase === "improving") {
    return [
      "Improving bilateral pulmonary edema",
      "Decreased pleural effusions",
      "Persistent but stable cardiomegaly",
      "Improved pulmonary vascular congestion",
    ];
  }
  if (pathology === "cardiac_tamponade" && phase === "improving") {
    return [
      "Smaller cardiac silhouette post-pericardiocentesis",
      "Improved mediastinal width",
      "Normal left heart border contour returning",
      "Clear lung fields",
    ];
  }
  return null;
}

export const CXR_ATTRIBUTION = {
  source: "Wikimedia Commons",
  author: "James Heilman, MD",
  licenses: ["CC-BY-SA 3.0", "CC-BY-SA 4.0"],
  urls: [
    "https://commons.wikimedia.org/wiki/File:PulmEdema.PNG",
    "https://commons.wikimedia.org/wiki/File:Massivepericarialeffusion.png",
  ],
};
