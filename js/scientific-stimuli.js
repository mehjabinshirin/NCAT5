// Scientific stimulus definitions with CIELCh and CIELAB values
// Task 1 uses controlled CIELCh targets converted to provisional sRGB/HEX for browser display.
// Final displayed colours require monitor calibration and physical measurement.
const SCIENTIFIC_STIMULI = {
    LIGHTNESS: 70,      // L* = 70 for participant-facing scientific block
    CHROMA: 38,         // C* = 38 selected to keep the 12-hue set within common sRGB gamut
    HUE_ANGLES: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],

    conditions: [
        { id: 'SC01', name: 'Controlled Red', L: 70, C: 38, h: 0, category: 'controlled-hue' },
        { id: 'SC02', name: 'Controlled Red-Orange', L: 70, C: 38, h: 30, category: 'controlled-hue' },
        { id: 'SC03', name: 'Controlled Orange-Yellow', L: 70, C: 38, h: 60, category: 'controlled-hue' },
        { id: 'SC04', name: 'Controlled Yellow-Ochre', L: 70, C: 38, h: 90, category: 'controlled-hue' },
        { id: 'SC05', name: 'Controlled Yellow-Green', L: 70, C: 38, h: 120, category: 'controlled-hue' },
        { id: 'SC06', name: 'Controlled Green', L: 70, C: 38, h: 150, category: 'controlled-hue' },
        { id: 'SC07', name: 'Controlled Green-Cyan', L: 70, C: 38, h: 180, category: 'controlled-hue' },
        { id: 'SC08', name: 'Controlled Cyan', L: 70, C: 38, h: 210, category: 'controlled-hue' },
        { id: 'SC09', name: 'Controlled Cyan-Blue', L: 70, C: 38, h: 240, category: 'controlled-hue' },
        { id: 'SC10', name: 'Controlled Blue', L: 70, C: 38, h: 270, category: 'controlled-hue' },
        { id: 'SC11', name: 'Controlled Violet-Purple', L: 70, C: 38, h: 300, category: 'controlled-hue' },
        { id: 'SC12', name: 'Controlled Magenta', L: 70, C: 38, h: 330, category: 'controlled-hue' },
        { id: 'SC13', name: 'Neutral Grey', L: 70, C: 0, h: 0, category: 'neutral' }
    ],

    getStimulusById(id) {
        return this.conditions.find(s => s.id === id);
    },

    lchToLab(L, C, h) {
        const hRad = (h * Math.PI) / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);
        return { L, a, b };
    },

    labToXyz(L, a, b) {
        const fy = (L + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;
        const xr = fx * fx * fx > 0.008856 ? fx * fx * fx : (fx - 16 / 116) / 7.787;
        const yr = L > 8 ? fy * fy * fy : L / 903.3;
        const zr = fz * fz * fz > 0.008856 ? fz * fz * fz : (fz - 16 / 116) / 7.787;
        return { x: xr * 0.95047, y: yr, z: zr * 1.08883 }; // D65, 2° observer
    },

    xyzToLinearRgb(x, y, z) {
        return {
            r: (x * 3.2406 + y * -1.5372 + z * -0.4986),
            g: (x * -0.9689 + y * 1.8758 + z * 0.0415),
            b: (x * 0.0557 + y * -0.204 + z * 1.057)
        };
    },

    applyGamma(value) {
        if (value <= 0.0031308) return 12.92 * value;
        return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    },

    linearToSrgb(r, g, b) {
        return {
            r: Math.max(0, Math.min(255, Math.round(this.applyGamma(r) * 255))),
            g: Math.max(0, Math.min(255, Math.round(this.applyGamma(g) * 255))),
            b: Math.max(0, Math.min(255, Math.round(this.applyGamma(b) * 255)))
        };
    },

    isInGamut(r, g, b) {
        return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16).toUpperCase();
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    convertToRgb(stimulus) {
        const lab = this.lchToLab(stimulus.L, stimulus.C, stimulus.h);
        const xyz = this.labToXyz(lab.L, lab.a, lab.b);
        const linearRgb = this.xyzToLinearRgb(xyz.x, xyz.y, xyz.z);
        const srgb = this.linearToSrgb(linearRgb.r, linearRgb.g, linearRgb.b);
        const hex = this.rgbToHex(srgb.r, srgb.g, srgb.b);
        const inGamut = this.isInGamut(linearRgb.r, linearRgb.g, linearRgb.b);
        return {
            rgb: srgb,
            hex,
            gamutStatus: inGamut ? 'in-gamut' : 'out-of-gamut',
            cielab: lab,
            cielch: { L: stimulus.L, C: stimulus.C, h: stimulus.h }
        };
    },

    enrichStimulus(stimulus) {
        const converted = this.convertToRgb(stimulus);
        return {
            ...stimulus,
            ...converted,
            cssColor: `rgb(${converted.rgb.r}, ${converted.rgb.g}, ${converted.rgb.b})`
        };
    },

    getAllEnriched() {
        return this.conditions.map(s => this.enrichStimulus(s));
    }
};

const TRIAL_SEQUENCES = {
    generateFullVersion() {
        const base = SCIENTIFIC_STIMULI.conditions.map(s => s.id);
        const repeats = ['SC01', 'SC10', 'SC13']; // red, blue, neutral anchors
        return [...base, ...repeats];
    },

    SHORT_VERSION: [
        'SC01', // Controlled Red
        'SC04', // Controlled Yellow-Ochre
        'SC06', // Controlled Green
        'SC08', // Controlled Cyan
        'SC10', // Controlled Blue
        'SC12', // Controlled Magenta
        'SC13', // Neutral Grey
        'SC03'  // Controlled Orange-Yellow
    ],

    randomizeTrials(trialIds) {
        let shuffled = [...trialIds].sort(() => Math.random() - 0.5);
        let iterations = 0;
        const maxIterations = 100;
        while (this.hasConsecutiveDuplicates(shuffled) && iterations < maxIterations) {
            shuffled = [...trialIds].sort(() => Math.random() - 0.5);
            iterations++;
        }
        return shuffled;
    },

    hasConsecutiveDuplicates(trialIds) {
        for (let i = 0; i < trialIds.length - 1; i++) {
            if (trialIds[i] === trialIds[i + 1]) return true;
        }
        return false;
    },

    getSequence(version) {
        const base = version === 'full' ? this.generateFullVersion() : this.SHORT_VERSION;
        return this.randomizeTrials(base);
    }
};
