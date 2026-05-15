<!-- Design System -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Filipino Sign Language Translator</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
                "tertiary-fixed-dim": "#cdc5c0",
                "surface-dim": "#dbdad6",
                "on-primary-container": "#5f1900",
                "on-secondary-fixed": "#1c1c18",
                "secondary-fixed-dim": "#c9c6c0",
                "surface-container-high": "#eae8e4",
                "surface-container-low": "#f5f3ef",
                "outline": "#8d7168",
                "on-error-container": "#93000a",
                "surface-container-highest": "#e4e2de",
                "on-surface-variant": "#594139",
                "tertiary-container": "#9f9894",
                "inverse-on-surface": "#f2f0ed",
                "on-secondary-container": "#66645f",
                "tertiary-fixed": "#e9e1dc",
                "surface-bright": "#fbf9f5",
                "on-tertiary-fixed": "#1e1b18",
                "on-error": "#ffffff",
                "secondary": "#605e59",
                "surface-container": "#efeeea",
                "surface-tint": "#ab3500",
                "secondary-fixed": "#e6e2db",
                "on-primary-fixed-variant": "#832600",
                "on-tertiary-container": "#35312e",
                "primary": "#ab3500",
                "primary-fixed": "#ffdbd0",
                "on-background": "#1b1c1a",
                "on-secondary": "#ffffff",
                "background": "#fbf9f5",
                "primary-fixed-dim": "#ffb59d",
                "error": "#ba1a1a",
                "on-tertiary-fixed-variant": "#4b4642",
                "surface-container-lowest": "#ffffff",
                "on-secondary-fixed-variant": "#484742",
                "error-container": "#ffdad6",
                "outline-variant": "#e1bfb5",
                "secondary-container": "#e6e2db",
                "on-primary": "#ffffff",
                "inverse-primary": "#ffb59d",
                "inverse-surface": "#30312e",
                "on-primary-fixed": "#390c00",
                "surface-variant": "#e4e2de",
                "primary-container": "#ff6b35",
                "on-tertiary": "#ffffff",
                "surface": "#fbf9f5",
                "on-surface": "#1b1c1a",
                "tertiary": "#635d5a"
        },
        "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
        },
        "spacing": {
                "gutter": "24px",
                "container-max": "1280px",
                "unit": "8px",
                "margin-mobile": "20px",
                "margin-desktop": "64px",
                "container-padding": "24px",
                "margin-sm": "12px",
                "margin-md": "24px",
                "margin-lg": "48px"
        },
        "fontFamily": {
                "headline-xl": [
                        "Inter"
                ],
                "label-sm": [
                        "Inter"
                ],
                "headline-md": [
                        "Inter"
                ],
                "headline-lg": [
                        "Inter"
                ],
                "body-lg": [
                        "Inter"
                ],
                "body-md": [
                        "Inter"
                ],
                "label-md": [
                        "Inter"
                ],
                "headline-lg-mobile": [
                        "Inter"
                ],
                "title-lg": ["Inter"],
                "display-lg": ["Inter"]
        },
        "fontSize": {
                "headline-xl": [
                        "48px",
                        {
                                "lineHeight": "1.1",
                                "letterSpacing": "-0.02em",
                                "fontWeight": "600"
                        }
                ],
                "label-sm": [
                        "12px",
                        {
                                "lineHeight": "1",
                                "fontWeight": "500"
                        }
                ],
                "headline-md": [
                        "24px",
                        {
                                "lineHeight": "1.3",
                                "fontWeight": "500"
                        }
                ],
                "headline-lg": [
                        "32px",
                        {
                                "lineHeight": "1.2",
                                "letterSpacing": "-0.01em",
                                "fontWeight": "600"
                        }
                ],
                "body-lg": [
                        "18px",
                        {
                                "lineHeight": "1.6",
                                "fontWeight": "400"
                        }
                ],
                "body-md": [
                        "16px",
                        {
                                "lineHeight": "1.5",
                                "fontWeight": "400"
                        }
                ],
                "label-md": [
                        "14px",
                        {
                                "lineHeight": "1",
                                "letterSpacing": "0.02em",
                                "fontWeight": "600"
                        }
                ],
                "headline-lg-mobile": [
                        "28px",
                        {
                                "lineHeight": "1.2",
                                "fontWeight": "600"
                        }
                ],
                "title-lg": ["20px", { "lineHeight": "28px", "fontWeight": "500" }],
                "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
        }
},
    },
  }
</script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-[#FDFBF7] font-body-md text-body-md h-screen overflow-hidden flex flex-col antialiased">
<!-- Top Navigation Anchor Component -->
<nav class="flex justify-between items-center px-container-padding h-16 w-full fixed top-0 z-50 bg-[#FDFBF7] border-b border-surface-variant">
<div class="flex items-center gap-gutter">
<span class="text-headline-md font-headline-md font-bold text-on-surface">Filipino Sign Language Translator</span>
</div>
<div class="hidden md:flex gap-margin-md items-center h-full">
<a class="text-primary-container font-bold border-b-2 border-primary-container pb-2 flex items-center h-full" href="#">Dashboard</a>
<a class="text-on-surface-variant font-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80 flex items-center h-full" href="#">History</a>
<a class="text-on-surface-variant font-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80 flex items-center h-full" href="#">Dictionary</a>
<a class="text-on-surface-variant font-label-md hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80 flex items-center h-full" href="#">Settings</a>
</div>
<div class="flex items-center">
<button class="text-on-surface hover:text-primary transition-colors duration-200 cursor-pointer active:opacity-80">
<span class="material-symbols-outlined" data-icon="account_circle" data-weight="fill">account_circle</span>
</button>
</div>
</nav>
<!-- Side Navigation Anchor Component (Desktop Only) -->
<aside class="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col py-margin-md bg-surface-container-low border-r border-surface-variant shadow-sm hidden md:flex z-40">
<div class="px-container-padding mb-margin-lg">
<h2 class="text-title-lg font-title-lg font-black text-primary-container mb-1">FSL Translator</h2>
<p class="text-label-sm font-label-sm text-on-surface-variant">AI-Powered Translation</p>
</div>
<div class="px-gutter mb-margin-lg">
<button class="w-full bg-primary-container text-white font-label-md text-label-md py-2 rounded-DEFAULT flex items-center justify-center gap-2 hover:bg-primary transition-colors cursor-pointer active:scale-95 shadow-sm">
<span class="material-symbols-outlined text-[18px]">add</span>
                New Session
            </button>
</div>
<nav class="flex-1 flex flex-col gap-1 px-gutter">
<a class="flex items-center gap-3 px-3 py-2 rounded-DEFAULT text-primary-container font-bold border-r-4 border-primary-container bg-surface-container-highest cursor-pointer active:scale-95 transition-all duration-200" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="videocam">videocam</span>
<span class="font-label-md text-label-md">Live Translate</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-DEFAULT text-on-surface-variant hover:bg-surface-variant cursor-pointer active:scale-95 transition-all duration-200" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="bookmark">bookmark</span>
<span class="font-label-md text-label-md">Saved Phrases</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-DEFAULT text-on-surface-variant hover:bg-surface-variant cursor-pointer active:scale-95 transition-all duration-200" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="menu_book">menu_book</span>
<span class="font-label-md text-label-md">Glossary</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-DEFAULT text-on-surface-variant hover:bg-surface-variant cursor-pointer active:scale-95 transition-all duration-200" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="bar_chart">bar_chart</span>
<span class="font-label-md text-label-md">Analytics</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-DEFAULT text-on-surface-variant hover:bg-surface-variant cursor-pointer active:scale-95 transition-all duration-200" href="#">
<span class="material-symbols-outlined text-[20px]" data-icon="help">help</span>
<span class="font-label-md text-label-md">Help</span>
</a>
</nav>
</aside>
<!-- Main Content Area -->
<main class="pt-16 md:pl-64 flex-1 flex flex-col h-full overflow-hidden bg-[#FDFBF7]">
<!-- Header Section within Main -->
<header class="flex-none py-margin-md px-container-padding text-center border-b border-surface-variant bg-surface-container-lowest">
<h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Filipino Sign Language Translator</h1>
<div class="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
<p class="font-label-md text-label-md text-on-surface-variant inline-block">
                    Supported: Hello, Thank You, Goodbye, Help, Please, Sorry, Yes, No, I Love You, How Are You
                </p>
</div>
</header>
<!-- Two-column grid -->
<div class="flex-1 p-container-padding flex flex-col lg:flex-row gap-gutter overflow-hidden h-full">
<!-- Left Column (65%): Live Camera Feed -->
<div class="lg:w-[65%] h-full relative rounded-lg border border-surface-variant bg-surface-container-highest overflow-hidden flex flex-col shadow-sm">
<!-- Video Container placeholder -->
<div class="w-full h-full relative bg-surface-container-low flex items-center justify-center overflow-hidden">
<!-- Simulating the video feed with an image placeholder -->
<div class="absolute inset-0 w-full h-full opacity-60 mix-blend-luminosity bg-cover bg-center" data-alt="A person stands centered in a dimly lit, high-tech studio environment, performing sign language. The lighting is cinematic and moody, dominated by deep shadows and cool blue tones. A subtle glow illuminates their silhouette against a dark, minimalist background. The visual style is modern, technical, and precise, aligning with a sophisticated AI development interface." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAiuQHhfPeOKtbGXhEV2wZ24b4YFnFxomQM58i3VCmL5p6x858j4N45NhSod6z7Er5jWDyRsudkxkBnCFTdhC2SWmRnT5oDjZmZyHNtObRpIi3o3Bi-jGGaAkGkUO6ty2kFHq0gsfSR_DgLGkaETZS_VIsRZHe51UolI48bpx2wsyrdKQOeN1lVHJxSfL4FVeYHEWp41FapLV_RTV5X7PYZijPRPOoN9Mm8U0cMAGM8ucYQzggeob2JYqMlJRGLnxq4ue5aGZ0a2-iy');">
</div>
<!-- FSL Skeleton Overlay (Orange) -->
<div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
<!-- Abstract representation of the skeleton overlay -->
<svg class="w-full h-full max-w-[80%] max-h-[80%] opacity-80" fill="none" stroke="#FF6B35" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewbox="0 0 500 500">
<circle cx="250" cy="150" r="40" stroke-opacity="0.5"></circle> <!-- Head -->
<path d="M250 190 L250 350" stroke-opacity="0.5"></path> <!-- Spine -->
<path d="M180 200 L320 200" stroke-opacity="0.5"></path> <!-- Shoulders -->
<!-- Left Arm (Active) -->
<path class="drop-shadow-[0_0_8px_rgba(255,107,53,0.6)]" d="M180 200 L120 280 L140 360" stroke-width="4"></path>
<!-- Left Hand points -->
<circle cx="140" cy="360" fill="#FF6B35" r="5"></circle>
<circle cx="130" cy="380" fill="#FF6B35" r="3"></circle>
<circle cx="145" cy="390" fill="#FF6B35" r="3"></circle>
<circle cx="155" cy="380" fill="#FF6B35" r="3"></circle>
<!-- Right Arm (Active) -->
<path class="drop-shadow-[0_0_8px_rgba(255,107,53,0.6)]" d="M320 200 L380 260 L330 330" stroke-width="4"></path>
<!-- Right Hand points -->
<circle cx="330" cy="330" fill="#FF6B35" r="5"></circle>
<circle cx="310" cy="350" fill="#FF6B35" r="3"></circle>
<circle cx="320" cy="365" fill="#FF6B35" r="3"></circle>
<circle cx="340" cy="355" fill="#FF6B35" r="3"></circle>
</svg>
</div>
<!-- Overlay UI within video -->
<div class="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
<div class="bg-surface-container-lowest/80 backdrop-blur-sm border border-surface-variant rounded-DEFAULT p-3 flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
</span>
<span class="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Tracking Active</span>
</div>
<div class="bg-surface-container-lowest/80 backdrop-blur-sm border border-surface-variant rounded-DEFAULT p-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
<span class="font-label-sm text-label-sm text-on-surface-variant">FPS: <span class="text-primary-container">60</span></span>
</div>
</div>
</div>
</div>
<!-- Right Column (35%): Control Panel Stack -->
<div class="lg:w-[35%] h-full flex flex-col gap-gutter overflow-y-auto pr-2 custom-scrollbar">
<!-- 1. Status -->
<div class="flex flex-col gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</span>
<div class="flex items-center">
<div class="h-6 px-3 rounded-full flex items-center gap-2" style="background: linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(4,120,87,0.2) 100%); border: 1px solid rgba(16,185,129,0.2);">
<div class="w-2 h-2 rounded-full bg-emerald-500"></div>
<span class="font-label-sm text-label-sm text-emerald-700 uppercase tracking-wider">Active</span>
</div>
</div>
</div>
<!-- 2. Detected Signs Card -->
<div class="bg-[#F5F1EA] border border-surface-variant rounded-lg p-margin-sm shadow-sm flex flex-col gap-2">
<div class="flex items-center gap-2 text-on-surface-variant">
<span class="material-symbols-outlined text-[18px]" data-icon="sign_language">sign_language</span>
<h3 class="font-label-md text-label-md text-on-surface">Detected Signs</h3>
</div>
<div class="bg-surface-container-lowest rounded-DEFAULT p-3 border border-surface-variant">
<p class="font-mono text-sm text-on-surface-variant leading-relaxed">
                            YOURE WELCOME <span class="text-primary-container opacity-50">→</span> HOW ARE YOU <span class="text-primary-container opacity-50">→</span> YOURE WELCOME
                        </p>
</div>
</div>
<!-- 3. Translation Card -->
<div class="bg-[#F5F1EA] border border-surface-variant rounded-lg p-margin-md shadow-sm flex-1 min-h-[150px] flex flex-col">
<h3 class="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Current Translation</h3>
<div class="flex-1 flex items-center justify-center">
<p class="font-headline-lg text-headline-lg text-on-surface text-center">
                            You're welcome
                        </p>
</div>
</div>
<!-- 4. Action: Stop & Translate -->
<button class="w-full bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-label-md text-label-md py-3 rounded-DEFAULT flex items-center justify-center gap-2 transition-colors duration-200 shadow-md cursor-pointer active:scale-95 border border-[#e55a2b]">
<span class="material-symbols-outlined text-[20px]" data-icon="stop_circle" data-weight="fill">stop_circle</span>
                    Stop &amp; Translate
                </button>
<!-- 5. Toggle: Read aloud -->
<div class="bg-[#F5F1EA] border border-surface-variant rounded-lg p-margin-sm flex items-center justify-between shadow-sm">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[20px] text-on-surface-variant" data-icon="volume_up">volume_up</span>
<span class="font-label-md text-label-md text-on-surface">Read translation aloud</span>
</div>
<!-- Custom Toggle Switch -->
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<!-- 7. Sensitivity Slider -->
<div class="bg-[#F5F1EA] border border-surface-variant rounded-lg p-margin-sm flex flex-col gap-3 shadow-sm">
<div class="flex justify-between items-center">
<span class="font-label-md text-label-md text-on-surface">Detection Sensitivity</span>
<span class="font-label-md text-label-md text-primary-container font-bold">85%</span>
</div>
<div class="w-full relative py-2">
<div class="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
<div class="h-full bg-primary-container w-[85%] rounded-full shadow-[0_0_8px_rgba(255,107,53,0.8)]"></div>
</div>
<!-- Slider thumb fake -->
<div class="absolute top-1/2 -translate-y-1/2 left-[85%] -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-primary-container cursor-pointer"></div>
</div>
</div>
<!-- 6. Secondary Action: Clear All -->
<button class="w-full bg-transparent border border-outline-variant hover:bg-surface-variant text-on-surface font-label-md text-label-md py-3 rounded-DEFAULT transition-colors duration-200 mt-2 cursor-pointer active:scale-95">
                    Clear All
                </button>
</div>
</div>
</main>
<style>
        /* Custom scrollbar for webkit */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f5f3ef; /* surface-container-low */
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e1bfb5; /* outline-variant */
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #8d7168; /* outline */
        }
        
        /* Hide scrollbar utility */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</body></html>

<!-- FSL Translator - Warm Minimalist (Desktop) -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>FSL Translator</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
                "tertiary-fixed-dim": "#cdc5c0",
                "surface-dim": "#dbdad6",
                "on-primary-container": "#5f1900",
                "on-secondary-fixed": "#1c1c18",
                "secondary-fixed-dim": "#c9c6c0",
                "surface-container-high": "#eae8e4",
                "surface-container-low": "#f5f3ef",
                "outline": "#8d7168",
                "on-error-container": "#93000a",
                "surface-container-highest": "#e4e2de",
                "on-surface-variant": "#594139",
                "tertiary-container": "#9f9894",
                "inverse-on-surface": "#f2f0ed",
                "on-secondary-container": "#66645f",
                "tertiary-fixed": "#e9e1dc",
                "surface-bright": "#fbf9f5",
                "on-tertiary-fixed": "#1e1b18",
                "on-error": "#ffffff",
                "secondary": "#605e59",
                "surface-container": "#efeeea",
                "surface-tint": "#ab3500",
                "secondary-fixed": "#e6e2db",
                "on-primary-fixed-variant": "#832600",
                "on-tertiary-container": "#35312e",
                "primary": "#ab3500",
                "primary-fixed": "#ffdbd0",
                "on-background": "#1b1c1a",
                "on-secondary": "#ffffff",
                "background": "#fbf9f5",
                "primary-fixed-dim": "#ffb59d",
                "error": "#ba1a1a",
                "on-tertiary-fixed-variant": "#4b4642",
                "surface-container-lowest": "#ffffff",
                "on-secondary-fixed-variant": "#484742",
                "error-container": "#ffdad6",
                "outline-variant": "#e1bfb5",
                "secondary-container": "#e6e2db",
                "on-primary": "#ffffff",
                "inverse-primary": "#ffb59d",
                "inverse-surface": "#30312e",
                "on-primary-fixed": "#390c00",
                "surface-variant": "#e4e2de",
                "primary-container": "#ff6b35",
                "on-tertiary": "#ffffff",
                "surface": "#fbf9f5",
                "on-surface": "#1b1c1a",
                "tertiary": "#635d5a"
        },
        "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
        },
        "spacing": {
                "gutter": "24px",
                "container-max": "1280px",
                "unit": "8px",
                "margin-mobile": "20px",
                "margin-desktop": "64px"
        },
        "fontFamily": {
                "headline-xl": [
                        "Inter"
                ],
                "label-sm": [
                        "Inter"
                ],
                "headline-md": [
                        "Inter"
                ],
                "headline-lg": [
                        "Inter"
                ],
                "body-lg": [
                        "Inter"
                ],
                "body-md": [
                        "Inter"
                ],
                "label-md": [
                        "Inter"
                ],
                "headline-lg-mobile": [
                        "Inter"
                ]
        },
        "fontSize": {
                "headline-xl": [
                        "48px",
                        {
                                "lineHeight": "1.1",
                                "letterSpacing": "-0.02em",
                                "fontWeight": "600"
                        }
                ],
                "label-sm": [
                        "12px",
                        {
                                "lineHeight": "1",
                                "fontWeight": "500"
                        }
                ],
                "headline-md": [
                        "24px",
                        {
                                "lineHeight": "1.3",
                                "fontWeight": "500"
                        }
                ],
                "headline-lg": [
                        "32px",
                        {
                                "lineHeight": "1.2",
                                "letterSpacing": "-0.01em",
                                "fontWeight": "600"
                        }
                ],
                "body-lg": [
                        "18px",
                        {
                                "lineHeight": "1.6",
                                "fontWeight": "400"
                        }
                ],
                "body-md": [
                        "16px",
                        {
                                "lineHeight": "1.5",
                                "fontWeight": "400"
                        }
                ],
                "label-md": [
                        "14px",
                        {
                                "lineHeight": "1",
                                "letterSpacing": "0.02em",
                                "fontWeight": "600"
                        }
                ],
                "headline-lg-mobile": [
                        "28px",
                        {
                                "lineHeight": "1.2",
                                "fontWeight": "600"
                        }
                ]
        }
},
    },
  }
</script>
<style>
        body { background-color: #fbf9f5; color: #1b1c1a; }
        .bg-card { background-color: #efeeea; }
        .text-accent { color: #ff6b35; }
        .bg-accent { background-color: #ff6b35; }
        .border-accent { border-color: #ff6b35; }
        .skeleton-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: 
                radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.2) 0%, transparent 60%),
                linear-gradient(90deg, transparent 49%, rgba(255, 107, 53, 0.4) 50%, transparent 51%),
                linear-gradient(0deg, transparent 49%, rgba(255, 107, 53, 0.4) 50%, transparent 51%);
            background-size: 100% 100%, 40px 40px, 40px 40px;
            pointer-events: none;
            opacity: 0.7;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
</head>
<body class="antialiased pb-[100px]">
<!-- TopAppBar -->
<header class="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant">
<div class="flex justify-between items-center px-4 h-16 w-full max-w-full">
<button class="text-on-surface-variant hover:bg-surface-container active:opacity-80 transition-opacity p-2 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="menu">menu</span>
</button>
<h1 class="font-headline-md text-headline-md text-primary font-bold">FSL Translator</h1>
<button class="text-on-surface-variant hover:bg-surface-container active:opacity-80 transition-opacity p-2 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
</button>
</div>
</header>
<main class="mt-16 p-4 flex flex-col gap-4">
<!-- Hero Camera Feed -->
<div class="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-outline-variant shadow-[0px_4px_16px_rgba(0,0,0,0.05)]">
<img alt="Person communicating using sign language" class="w-full h-full object-cover" data-alt="A medium shot of a person indoors against a dark, minimalist technical background, performing sign language. The lighting is focused and slightly moody, emphasizing the hands and upper body. The scene feels like a live video feed for an advanced translation application, with a professional, clinical yet modern AI aesthetic. Deep shadows contrast with clear visibility of the signing action." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzxLdSgsq-nW0rAnH6VEJOkxbjk-yvWX8tqBJ4zINcFTJKkOXdkgnt_HKMLebxIAOmnvNlaUp1Oup6LBua7SbOzdyitTVSrHqbBFVVn5yOPXMLDtbsUuTZ6ejFXX_NHDxBCAYrxRDUhOu6juueXNfli1NdBT1WsVpyZeZZHNW5WdkQODFflncBysUbiKD-bdmy-bJ-cZYB_nMwVPO90E0gYINqXUvFo3vld_8YJO5cImH_-gy_ubG7tjMT-vX9YLzI3v60hznA4ya1"/>
<div class="skeleton-overlay"></div>
<!-- Status Badge overlaying camera -->
<div class="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant">
<div class="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse"></div>
<span class="font-label-md text-label-md text-on-surface">Active</span>
</div>
</div>
<!-- Detected Signs Card -->
<div class="bg-card rounded-lg p-4 border border-outline-variant shadow-[0px_4px_16px_rgba(0,0,0,0.05)]">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-on-surface-variant text-sm">history</span>
<h2 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Detected Sequence</h2>
</div>
<div class="font-mono text-sm text-on-surface-variant break-all">
                YOURE WELCOME -&gt; HOW ARE YOU...
            </div>
</div>
<!-- Translation Output -->
<div class="bg-card rounded-lg p-6 border border-outline-variant shadow-[0px_4px_16px_rgba(0,0,0,0.05)] flex flex-col justify-center min-h-[120px]">
<h2 class="font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">Current Translation</h2>
<div class="font-headline-xl text-headline-xl text-primary-container">
                You're welcome
            </div>
</div>
<!-- Controls Section -->
<div class="bg-surface-container rounded-lg p-4 border border-outline-variant shadow-[0px_4px_16px_rgba(0,0,0,0.05)] flex flex-col gap-6 mt-2">
<!-- Main Action -->
<button class="w-full bg-[#ff6b35] hover:bg-[#e85c2b] text-white font-headline-md text-headline-md py-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">stop_circle</span>
                Stop &amp; Translate
            </button>
<div class="flex flex-col gap-4 border-t border-outline-variant pt-4">
<!-- Toggle -->
<div class="flex items-center justify-between">
<label class="font-body-md text-body-md text-on-surface">Read translation aloud</label>
<button class="w-12 h-6 bg-accent rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface">
<span class="absolute right-1 top-1 bg-surface w-4 h-4 rounded-full transition-transform"></span>
</button>
</div>
<!-- Slider -->
<div class="flex flex-col gap-2">
<div class="flex items-center justify-between">
<label class="font-body-md text-body-md text-on-surface">Detection Sensitivity</label>
<span class="font-label-md text-label-md text-accent">85%</span>
</div>
<input class="w-full h-1 bg-outline-variant rounded-full appearance-none cursor-pointer accent-accent" max="100" min="0" type="range" value="85"/>
</div>
<!-- Secondary Action -->
<button class="w-full border border-outline-variant text-on-surface hover:bg-surface-container-high font-body-md text-body-md py-3 rounded-lg transition-colors mt-2 active:scale-[0.98]">
                    Clear All
                </button>
</div>
</div>
</main>
<!-- BottomNavBar -->
<nav class="bg-surface-container fixed bottom-0 w-full z-50 rounded-t-xl border-t border-outline-variant shadow-[0px_-4px_16px_rgba(0,0,0,0.05)]">
<div class="flex justify-around items-center h-20 w-full px-2 pb-safe">
<button class="flex flex-col items-center justify-center bg-primary-container text-white rounded-full px-5 py-1 hover:bg-[#e85c2b] active:scale-95 transition-all duration-150">
<span class="material-symbols-outlined" data-icon="videocam" style="font-variation-settings: 'FILL' 1;">videocam</span>
<span class="font-label-md text-label-md mt-1">Translate</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant px-5 py-1 hover:bg-surface-container-high active:scale-95 transition-transform duration-150">
<span class="material-symbols-outlined" data-icon="history">history</span>
<span class="font-label-md text-label-md mt-1">History</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant px-5 py-1 hover:bg-surface-container-high active:scale-95 transition-transform duration-150">
<span class="material-symbols-outlined" data-icon="school">school</span>
<span class="font-label-md text-label-md mt-1">Learn</span>
</button>
</div>
</nav>
</body></html>