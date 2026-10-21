/**
 * Theme & Animal World Manager
 * Geometry Diagram Visualiser - Created by LWL
 *
 * Provides themed environments with matched animated animals:
 * 1. Underwater Ocean (Dolphins, Sea Turtles, Clownfish, Octopus, Jellyfish, Whales)
 * 2. Sky & Clouds (Eagles, Bluebirds, Owls, Parrots, Swans, Butterflies)
 * 3. City Streets with Cats & Dogs (Tabby Cats, Black Cats, Golden Retrievers, Corgis, Shiba Inus, Poodles)
 * 4. Woodland Forest (Foxes, Deer, Rabbits, Pandas, Squirrels)
 * 5. Classic Classroom (Owl Mascot & Clean Geometry Grid)
 */

const ANIMAL_THEMES = {
    city: {
        id: "city",
        name: "City Streets (Cats & Dogs)",
        icon: "🏙️",
        badgeText: "🐾 Cats & Dogs City",
        description: "Bustling city rooftops and parks filled with friendly cats and playful dogs!",
        bgClass: "theme-city",
        paperBg: "#fffdf9",
        gridColor: "rgba(217, 119, 6, 0.12)",
        mascotTitle: "City Pets Crew (Cats & Dogs)",
        animals: [
            {
                id: "corgi",
                name: "Biscuit the Corgi",
                species: "Dog",
                emoji: "🐶",
                role: "Shape Detective",
                quote: "Woof! Click lines in Step 4 to highlight them in bright colors!",
                svgType: "dog_corgi",
                zone: "ground",
                speed: 0.55
            },
            {
                id: "tabby_cat",
                name: "Mochi the Tabby Cat",
                species: "Cat",
                emoji: "🐱",
                role: "Angle Inspector",
                quote: "Purr... Once your colored lines form a closed loop, fill it in Step 5!",
                svgType: "cat_tabby",
                zone: "rooftop",
                speed: 0.35
            },
            {
                id: "golden_dog",
                name: "Sunny the Golden Retriever",
                species: "Dog",
                emoji: "🐕",
                role: "Line Fetcher",
                quote: "Bark! Click any focused line again if you want to remove it from focus!",
                svgType: "dog_golden",
                zone: "ground",
                speed: 0.65
            },
            {
                id: "black_cat",
                name: "Luna the Rooftop Cat",
                species: "Cat",
                emoji: "🐈‍⬛",
                role: "Arc Watcher",
                quote: "Meow! Circular arcs and straight segments can team up to close a shape!",
                svgType: "cat_black",
                zone: "rooftop",
                speed: 0.4
            },
            {
                id: "shiba_dog",
                name: "Kobe the Shiba Inu",
                species: "Dog",
                emoji: "🐕‍🦺",
                role: "Zoom Navigator",
                quote: "Use the Zoom In / Out controls or scroll wheel to inspect every vertex!",
                svgType: "dog_shiba",
                zone: "ground",
                speed: 0.5
            },
            {
                id: "calico_cat",
                name: "Patches the Calico Cat",
                species: "Cat",
                emoji: "🐈",
                role: "Color Artist",
                quote: "Try mixing different line colors and shading styles on your diagram!",
                svgType: "cat_calico",
                zone: "ground",
                speed: 0.45
            }
        ]
    },
    underwater: {
        id: "underwater",
        name: "Underwater Ocean Reef",
        icon: "🌊",
        badgeText: "🐬 Underwater Reef",
        description: "Deep azure ocean coral reef with swimming dolphins, sea turtles, clownfish, and octopuses.",
        bgClass: "theme-underwater",
        paperBg: "#f4fbff",
        gridColor: "rgba(14, 165, 233, 0.14)",
        mascotTitle: "Ocean Reef Explorers",
        animals: [
            {
                id: "dolphin",
                name: "Echo the Dolphin",
                species: "Dolphin",
                emoji: "🐬",
                role: "Sonar Geometer",
                quote: "Splash! Insert a geometry diagram in Step 1 to begin our dive!",
                svgType: "dolphin",
                zone: "midwater",
                speed: 0.75
            },
            {
                id: "turtle",
                name: "Shelly the Sea Turtle",
                species: "Sea Turtle",
                emoji: "🐢",
                role: "Shell Polygon Guide",
                quote: "Slow and steady! Trace or load the diagram points and values in Step 3.",
                svgType: "turtle",
                zone: "midwater",
                speed: 0.35
            },
            {
                id: "clownfish",
                name: "Coral the Clownfish",
                species: "Tropical Fish",
                emoji: "🐠",
                role: "Color Highlighter",
                quote: "Blub! Pick vibrant coral colors to highlight your geometry lines!",
                svgType: "clownfish",
                zone: "midwater",
                speed: 0.65
            },
            {
                id: "octopus",
                name: "Ollie the Octopus",
                species: "Octopus",
                emoji: "🐙",
                role: "8-Arm Arc Master",
                quote: "With 8 arms, I love coloring closed sectors and triangles in Step 5!",
                svgType: "octopus",
                zone: "seabed",
                speed: 0.3
            },
            {
                id: "jellyfish",
                name: "Luma the Jellyfish",
                species: "Jellyfish",
                emoji: "🪼",
                role: "Glow Tracer",
                quote: "Watch your focused lines glow brightly against the diagram!",
                svgType: "jellyfish",
                zone: "upperwater",
                speed: 0.28
            },
            {
                id: "whale",
                name: "Blue the Humpback Whale",
                species: "Whale",
                emoji: "🐋",
                role: "Deep Zoom Guardian",
                quote: "Zoom out for the big picture or zoom in close to inspect tiny angles!",
                svgType: "whale",
                zone: "upperwater",
                speed: 0.25
            }
        ]
    },
    sky: {
        id: "sky",
        name: "Sky & Fluffy Clouds",
        icon: "☁️",
        badgeText: "🦅 Sky Kingdom",
        description: "High altitude sunlit sky with soaring eagles, bluebirds, owls, parrots, and butterflies.",
        bgClass: "theme-sky",
        paperBg: "#f8fcff",
        gridColor: "rgba(56, 189, 248, 0.15)",
        mascotTitle: "Sky Aviary Squadron",
        animals: [
            {
                id: "eagle",
                name: "Zephyr the Golden Eagle",
                species: "Eagle",
                emoji: "🦅",
                role: "Bird's-Eye Spotter",
                quote: "From high in the sky, we ignore the question text in Step 2 and lock onto the diagram!",
                svgType: "eagle",
                zone: "highsky",
                speed: 0.7
            },
            {
                id: "bluebird",
                name: "Skye the Bluebird",
                species: "Songbird",
                emoji: "🐦",
                role: "Line Singer",
                quote: "Tweet! Click any line segment or arc in Step 4 to paint it in your chosen color!",
                svgType: "bluebird",
                zone: "midsky",
                speed: 0.8
            },
            {
                id: "owl",
                name: "Archimedes the Sky Owl",
                species: "Owl",
                emoji: "🦉",
                role: "Radius & Radian Sage",
                quote: "Hoot! Every radian and length stated in the diagram is preserved in Step 3.",
                svgType: "owl",
                zone: "highsky",
                speed: 0.45
            },
            {
                id: "parrot",
                name: "Rio the Macaw Parrot",
                species: "Parrot",
                emoji: "🦜",
                role: "Rainbow Shade Artist",
                quote: "Squawk! Use red, blue, emerald, or purple to color closed shapes in Step 5!",
                svgType: "parrot",
                zone: "midsky",
                speed: 0.65
            },
            {
                id: "butterfly",
                name: "Aurora the Monarch",
                species: "Butterfly",
                emoji: "🦋",
                role: "Symmetry Flutter",
                quote: "Notice how tangents PA and PB form symmetric triangles inside the circle!",
                svgType: "butterfly",
                zone: "lowsky",
                speed: 0.5
            },
            {
                id: "swan",
                name: "Celeste the Cloud Swan",
                species: "Swan",
                emoji: "🦢",
                role: "Graceful Arc Glider",
                quote: "Smooth circular arcs and straight lines combine to bound shaded sectors!",
                svgType: "swan",
                zone: "lowsky",
                speed: 0.4
            }
        ]
    },
    forest: {
        id: "forest",
        name: "Woodland Forest Glade",
        icon: "🌿",
        badgeText: "🦊 Forest Friends",
        description: "Enchanted emerald forest glade with clever foxes, deer, rabbits, and pandas.",
        bgClass: "theme-forest",
        paperBg: "#fcfdf9",
        gridColor: "rgba(16, 185, 129, 0.14)",
        mascotTitle: "Woodland Geometry Rangers",
        animals: [
            {
                id: "fox",
                name: "Rusty the Red Fox",
                species: "Fox",
                emoji: "🦊",
                role: "Triangle Tracker",
                quote: "Clever foxes always highlight all sides of a shape before coloring it!",
                svgType: "fox",
                zone: "ground",
                speed: 0.55
            },
            {
                id: "panda",
                name: "Bamboo the Giant Panda",
                species: "Panda",
                emoji: "🐼",
                role: "Circle Guardian",
                quote: "Start from a blank slate, pick a diagram, and watch the lines come alive!",
                svgType: "panda",
                zone: "ground",
                speed: 0.3
            },
            {
                id: "rabbit",
                name: "Clover the Bunny",
                species: "Rabbit",
                emoji: "🐰",
                role: "Vertex Hopper",
                quote: "Hop from point P to Q, R, and O along the straight line!",
                svgType: "rabbit",
                zone: "ground",
                speed: 0.7
            },
            {
                id: "deer",
                name: "Bambi the Forest Deer",
                species: "Deer",
                emoji: "🦌",
                role: "Angle Scout",
                quote: "Look at how clearly the 1 rad and 0.8 rad angles stand out in Step 3!",
                svgType: "deer",
                zone: "ground",
                speed: 0.45
            }
        ]
    }
};

/**
 * Custom SVG artwork generator for themed animals (Cats, Dogs, Underwater, Sky, Forest)
 */
function getAnimalSVG(svgType) {
    switch (svgType) {
        case "dog_corgi":
            return `<svg viewBox="0 0 80 60" width="58" height="44">
                <!-- Corgi Body -->
                <rect x="18" y="26" width="38" height="20" rx="10" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
                <ellipse cx="36" cy="38" rx="14" ry="8" fill="#fef3c7"/>
                <!-- Short Corgi Legs -->
                <rect x="22" y="42" width="6" height="11" rx="3" fill="#fef3c7" stroke="#78350f" stroke-width="1.8"/>
                <rect x="31" y="43" width="6" height="10" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
                <rect x="43" y="42" width="6" height="11" rx="3" fill="#fef3c7" stroke="#78350f" stroke-width="1.8"/>
                <rect x="50" y="43" width="6" height="10" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
                <!-- Fluffy Butt & Nub Tail -->
                <circle cx="17" cy="33" r="7" fill="#fef3c7" stroke="#78350f" stroke-width="1.8"/>
                <!-- Head & Big Ears -->
                <polygon points="48,18 44,5 54,14" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
                <polygon points="60,14 67,4 66,20" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
                <circle cx="56" cy="24" r="12" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
                <ellipse cx="60" cy="27" rx="7" ry="5" fill="#fef3c7"/>
                <circle cx="55" cy="21" r="2" fill="#1e293b"/>
                <circle cx="63" cy="21" r="2" fill="#1e293b"/>
                <circle cx="65" cy="25" r="2.3" fill="#1e293b"/>
                <!-- Red Collar -->
                <path d="M46,30 Q54,36 62,31" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
            </svg>`;

        case "dog_golden":
            return `<svg viewBox="0 0 80 60" width="58" height="44">
                <!-- Tail -->
                <path d="M18,30 Q7,22 10,16" fill="none" stroke="#eab308" stroke-width="5" stroke-linecap="round"/>
                <!-- Body -->
                <ellipse cx="36" cy="34" rx="20" ry="12" fill="#facc15" stroke="#854d0e" stroke-width="2"/>
                <!-- Legs -->
                <rect x="21" y="41" width="6" height="14" rx="3" fill="#eab308" stroke="#854d0e" stroke-width="1.8"/>
                <rect x="30" y="42" width="6" height="13" rx="3" fill="#facc15" stroke="#854d0e" stroke-width="1.8"/>
                <rect x="42" y="41" width="6" height="14" rx="3" fill="#eab308" stroke="#854d0e" stroke-width="1.8"/>
                <rect x="50" y="42" width="6" height="13" rx="3" fill="#facc15" stroke="#854d0e" stroke-width="1.8"/>
                <!-- Head & Floppy Ears -->
                <circle cx="56" cy="22" r="11" fill="#facc15" stroke="#854d0e" stroke-width="2"/>
                <ellipse cx="49" cy="24" rx="4" ry="8" fill="#ca8a04" stroke="#854d0e" stroke-width="1.6"/>
                <rect x="58" y="21" width="11" height="8" rx="4" fill="#fef08a" stroke="#854d0e" stroke-width="1.6"/>
                <circle cx="58" cy="19" r="2" fill="#1e293b"/>
                <circle cx="67" cy="23" r="2.4" fill="#1e293b"/>
                <!-- Pink Tongue -->
                <path d="M62,29 Q64,34 67,30" fill="#f43f5e" stroke="#881337" stroke-width="1"/>
                <!-- Blue Collar -->
                <path d="M47,29 Q55,34 61,28" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
            </svg>`;

        case "dog_shiba":
            return `<svg viewBox="0 0 80 60" width="58" height="44">
                <!-- Curly Shiba Tail -->
                <path d="M20,28 C10,16 22,12 24,22" fill="none" stroke="#ea580c" stroke-width="5" stroke-linecap="round"/>
                <!-- Body -->
                <ellipse cx="36" cy="34" rx="18" ry="11" fill="#ea580c" stroke="#7c2d12" stroke-width="2"/>
                <path d="M24,38 Q36,44 50,36" fill="#ffedd5"/>
                <!-- Legs -->
                <rect x="23" y="41" width="5.5" height="13" rx="2.5" fill="#ffedd5" stroke="#7c2d12" stroke-width="1.8"/>
                <rect x="45" y="41" width="5.5" height="13" rx="2.5" fill="#ffedd5" stroke="#7c2d12" stroke-width="1.8"/>
                <!-- Head -->
                <polygon points="48,16 45,5 54,12" fill="#ea580c" stroke="#7c2d12" stroke-width="1.8"/>
                <polygon points="58,12 65,5 64,17" fill="#ea580c" stroke="#7c2d12" stroke-width="1.8"/>
                <circle cx="56" cy="22" r="11" fill="#ea580c" stroke="#7c2d12" stroke-width="2"/>
                <ellipse cx="59" cy="26" rx="7" ry="5" fill="#ffedd5"/>
                <circle cx="54" cy="20" r="1.9" fill="#1e293b"/>
                <circle cx="62" cy="20" r="1.9" fill="#1e293b"/>
                <circle cx="64" cy="24" r="2.2" fill="#1e293b"/>
                <path d="M47,29 Q54,34 61,29" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
            </svg>`;

        case "cat_tabby":
            return `<svg viewBox="0 0 80 60" width="58" height="44">
                <!-- Tail -->
                <path d="M18,36 Q8,22 15,12" fill="none" stroke="#f97316" stroke-width="4.5" stroke-linecap="round"/>
                <!-- Body -->
                <ellipse cx="36" cy="36" rx="17" ry="11" fill="#fb923c" stroke="#7c2d12" stroke-width="2"/>
                <!-- Tabby Stripes -->
                <path d="M30,26 L29,33 M36,25 L36,33 M42,26 L43,33" stroke="#9a3412" stroke-width="2.2" stroke-linecap="round"/>
                <!-- Paws -->
                <rect x="23" y="43" width="5.5" height="11" rx="2.5" fill="#ffedd5" stroke="#7c2d12" stroke-width="1.8"/>
                <rect x="44" y="43" width="5.5" height="11" rx="2.5" fill="#ffedd5" stroke="#7c2d12" stroke-width="1.8"/>
                <!-- Cat Head & Pointy Ears -->
                <polygon points="46,18 44,6 54,13" fill="#fb923c" stroke="#7c2d12" stroke-width="1.8"/>
                <polygon points="58,13 67,6 65,18" fill="#fb923c" stroke="#7c2d12" stroke-width="1.8"/>
                <circle cx="55" cy="23" r="11" fill="#fb923c" stroke="#7c2d12" stroke-width="2"/>
                <circle cx="51" cy="22" r="2" fill="#065f46"/>
                <circle cx="59" cy="22" r="2" fill="#065f46"/>
                <polygon points="55,25 53,23 57,23" fill="#f43f5e"/>
                <!-- Whiskers -->
                <path d="M44,24 L37,22 M44,26 L37,27 M64,24 L71,22 M64,26 L71,27" stroke="#7c2d12" stroke-width="1.3"/>
            </svg>`;

        case "cat_black":
            return `<svg viewBox="0 0 80 60" width="58" height="44">
                <!-- Tail -->
                <path d="M19,38 Q7,24 14,10" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
                <!-- Sleek Body -->
                <ellipse cx="36" cy="36" rx="16" ry="11" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
                <!-- Legs -->
                <rect x="24" y="43" width="5" height="11" rx="2.5" fill="#1e293b"/>
                <rect x="44" y="43" width="5" height="11" rx="2.5" fill="#1e293b"/>
                <!-- Head & Ears -->
                <polygon points="46,18 44,5 54,13" fill="#1e293b"/>
                <polygon points="57,13 67,5 65,18" fill="#1e293b"/>
                <circle cx="55" cy="23" r="11" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
                <!-- Bright Golden Eyes -->
                <ellipse cx="51" cy="22" rx="2.5" ry="2.8" fill="#facc15"/>
                <ellipse cx="59" cy="22" rx="2.5" ry="2.8" fill="#facc15"/>
                <circle cx="51" cy="22" r="1" fill="#0f172a"/>
                <circle cx="59" cy="22" r="1" fill="#0f172a"/>
                <polygon points="55,26 53.5,24 56.5,24" fill="#fb7185"/>
                <!-- Collar & Bell -->
                <path d="M46,30 Q55,35 63,30" fill="none" stroke="#ec4899" stroke-width="2.5"/>
                <circle cx="55" cy="33" r="2.5" fill="#facc15"/>
            </svg>`;

        case "cat_calico":
            return `<svg viewBox="0 0 80 60" width="58" height="44">
                <path d="M18,36 Q9,23 16,12" fill="none" stroke="#ea580c" stroke-width="4.5" stroke-linecap="round"/>
                <ellipse cx="36" cy="36" rx="17" ry="11" fill="#fffbeb" stroke="#78350f" stroke-width="2"/>
                <circle cx="30" cy="33" r="6" fill="#ea580c"/>
                <circle cx="41" cy="36" r="5" fill="#1e293b"/>
                <rect x="24" y="43" width="5" height="11" rx="2.5" fill="#fffbeb" stroke="#78350f" stroke-width="1.6"/>
                <rect x="44" y="43" width="5" height="11" rx="2.5" fill="#fffbeb" stroke="#78350f" stroke-width="1.6"/>
                <polygon points="46,18 44,6 54,13" fill="#ea580c" stroke="#78350f" stroke-width="1.6"/>
                <polygon points="57,13 67,6 65,18" fill="#1e293b" stroke="#78350f" stroke-width="1.6"/>
                <circle cx="55" cy="23" r="11" fill="#fffbeb" stroke="#78350f" stroke-width="2"/>
                <circle cx="51" cy="22" r="2" fill="#1e293b"/>
                <circle cx="59" cy="22" r="2" fill="#1e293b"/>
                <polygon points="55,25 53,23 57,23" fill="#fb7185"/>
            </svg>`;

        case "dolphin":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <path d="M10,36 Q32,10 62,24 Q72,26 74,29 Q66,31 60,30 Q38,34 16,42 L6,48 L10,36 Z" fill="#38bdf8" stroke="#0369a1" stroke-width="2"/>
                <path d="M36,19 L30,7 Q42,11 44,19 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.8"/>
                <path d="M24,35 Q42,27 60,30 Q40,39 24,35 Z" fill="#e0f2fe"/>
                <circle cx="58" cy="24" r="2" fill="#0f172a"/>
            </svg>`;

        case "turtle":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <ellipse cx="48" cy="16" rx="5" ry="9" transform="rotate(-35 48 16)" fill="#4ade80" stroke="#166534" stroke-width="1.8"/>
                <ellipse cx="48" cy="40" rx="5" ry="9" transform="rotate(35 48 40)" fill="#4ade80" stroke="#166534" stroke-width="1.8"/>
                <ellipse cx="24" cy="18" rx="4" ry="7" transform="rotate(35 24 18)" fill="#4ade80" stroke="#166534" stroke-width="1.8"/>
                <ellipse cx="24" cy="38" rx="4" ry="7" transform="rotate(-35 24 38)" fill="#4ade80" stroke="#166534" stroke-width="1.8"/>
                <circle cx="60" cy="28" r="7" fill="#4ade80" stroke="#166534" stroke-width="2"/>
                <circle cx="63" cy="26" r="1.8" fill="#0f172a"/>
                <ellipse cx="36" cy="28" rx="18" ry="14" fill="#15803d" stroke="#052e16" stroke-width="2"/>
                <polygon points="36,18 44,23 44,33 36,38 28,33 28,23" fill="#22c55e" stroke="#052e16" stroke-width="1.5"/>
            </svg>`;

        case "clownfish":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <polygon points="18,28 6,16 8,40" fill="#f97316" stroke="#7c2d12" stroke-width="2"/>
                <ellipse cx="42" cy="28" rx="22" ry="13" fill="#f97316" stroke="#7c2d12" stroke-width="2"/>
                <path d="M30,16 Q33,28 30,40" fill="none" stroke="#ffffff" stroke-width="5"/>
                <path d="M46,15 Q49,28 46,41" fill="none" stroke="#ffffff" stroke-width="5"/>
                <circle cx="55" cy="25" r="2.3" fill="#0f172a"/>
            </svg>`;

        case "octopus":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <path d="M22,34 Q12,46 18,49 M30,35 Q25,48 31,50 M40,36 Q40,50 45,49 M48,35 Q55,48 60,46 M54,32 Q66,42 68,36" fill="none" stroke="#ec4899" stroke-width="4.5" stroke-linecap="round"/>
                <ellipse cx="40" cy="22" rx="16" ry="14" fill="#f472b6" stroke="#9d174d" stroke-width="2"/>
                <circle cx="34" cy="23" r="2.5" fill="#0f172a"/>
                <circle cx="46" cy="23" r="2.5" fill="#0f172a"/>
                <path d="M36,28 Q40,32 44,28" fill="none" stroke="#9d174d" stroke-width="2" stroke-linecap="round"/>
            </svg>`;

        case "jellyfish":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <path d="M28,30 Q25,44 30,51 M36,30 Q39,44 35,52 M44,30 Q41,44 46,52 M52,30 Q55,44 50,51" fill="none" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M20,28 C20,10 60,10 60,28 Q50,33 40,28 Q30,33 20,28 Z" fill="#e879f9" stroke="#7e22ce" stroke-width="2"/>
                <circle cx="34" cy="22" r="2" fill="#3b0764"/>
                <circle cx="46" cy="22" r="2" fill="#3b0764"/>
            </svg>`;

        case "whale":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <path d="M48,14 Q48,5 41,4 M48,14 Q50,5 56,4" fill="none" stroke="#7dd3fc" stroke-width="2.2" stroke-linecap="round"/>
                <path d="M12,34 L4,24 L6,39 L12,34 Z" fill="#0284c7" stroke="#0c4a6e" stroke-width="1.8"/>
                <path d="M12,34 Q28,14 58,18 Q70,20 70,32 Q70,38 54,38 L12,34 Z" fill="#0ea5e9" stroke="#0c4a6e" stroke-width="2"/>
                <path d="M32,36 Q52,32 68,34 Q66,40 48,40 Z" fill="#e0f2fe"/>
                <circle cx="58" cy="26" r="2.2" fill="#0f172a"/>
            </svg>`;

        case "eagle":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <path d="M10,16 Q28,4 42,24 Q54,4 72,16 Q56,30 42,30 Q26,30 10,16 Z" fill="#78350f" stroke="#451a03" stroke-width="2"/>
                <circle cx="44" cy="24" r="8" fill="#fefce8" stroke="#451a03" stroke-width="1.8"/>
                <polygon points="51,22 60,25 51,28" fill="#facc15" stroke="#854d0e" stroke-width="1.5"/>
                <circle cx="46" cy="22" r="1.8" fill="#0f172a"/>
            </svg>`;

        case "bluebird":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <polygon points="18,30 6,22 10,36" fill="#0284c7" stroke="#0c4a6e" stroke-width="1.8"/>
                <ellipse cx="40" cy="30" rx="18" ry="12" fill="#38bdf8" stroke="#0369a1" stroke-width="2"/>
                <path d="M30,24 Q42,10 48,28 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.8"/>
                <polygon points="58,27 67,30 58,33" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
                <circle cx="51" cy="26" r="2.2" fill="#0f172a"/>
            </svg>`;

        case "owl":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <ellipse cx="40" cy="30" rx="16" ry="18" fill="#a16207" stroke="#422006" stroke-width="2"/>
                <ellipse cx="40" cy="35" rx="10" ry="11" fill="#fef08a"/>
                <circle cx="34" cy="22" r="5.5" fill="#ffffff" stroke="#422006" stroke-width="1.8"/>
                <circle cx="46" cy="22" r="5.5" fill="#ffffff" stroke="#422006" stroke-width="1.8"/>
                <circle cx="34" cy="22" r="2.3" fill="#0f172a"/>
                <circle cx="46" cy="22" r="2.3" fill="#0f172a"/>
                <polygon points="40,29 37,24 43,24" fill="#f97316"/>
            </svg>`;

        case "parrot":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <ellipse cx="38" cy="30" rx="17" ry="12" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/>
                <path d="M26,26 Q38,14 46,32 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.8"/>
                <path d="M30,28 Q38,20 44,33 Z" fill="#facc15"/>
                <circle cx="52" cy="24" r="9" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/>
                <path d="M59,21 Q68,24 62,31 L59,27 Z" fill="#fef08a" stroke="#78350f" stroke-width="1.8"/>
                <circle cx="53" cy="22" r="2" fill="#0f172a"/>
            </svg>`;

        case "butterfly":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <ellipse cx="28" cy="20" rx="14" ry="10" transform="rotate(-20 28 20)" fill="#f97316" stroke="#1e293b" stroke-width="2"/>
                <ellipse cx="52" cy="20" rx="14" ry="10" transform="rotate(20 52 20)" fill="#f97316" stroke="#1e293b" stroke-width="2"/>
                <ellipse cx="30" cy="36" rx="10" ry="8" transform="rotate(15 30 36)" fill="#fb923c" stroke="#1e293b" stroke-width="2"/>
                <ellipse cx="50" cy="36" rx="10" ry="8" transform="rotate(-15 50 36)" fill="#fb923c" stroke="#1e293b" stroke-width="2"/>
                <rect x="38" y="14" width="4" height="28" rx="2" fill="#1e293b"/>
            </svg>`;

        case "swan":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <ellipse cx="34" cy="36" rx="18" ry="10" fill="#ffffff" stroke="#64748b" stroke-width="2"/>
                <path d="M46,34 C54,28 50,12 58,12 C62,12 63,16 60,18" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
                <polygon points="62,14 69,16 62,18" fill="#f97316"/>
                <circle cx="59" cy="14" r="1.5" fill="#0f172a"/>
            </svg>`;

        case "fox":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <path d="M12,34 Q22,22 28,36 Q18,44 12,34 Z" fill="#ea580c" stroke="#7c2d12" stroke-width="2"/>
                <ellipse cx="38" cy="34" rx="15" ry="10" fill="#f97316" stroke="#7c2d12" stroke-width="2"/>
                <polygon points="44,15 48,4 54,15" fill="#ea580c" stroke="#7c2d12" stroke-width="1.8"/>
                <polygon points="56,15 62,4 65,16" fill="#ea580c" stroke="#7c2d12" stroke-width="1.8"/>
                <polygon points="43,16 66,16 55,32" fill="#f97316" stroke="#7c2d12" stroke-width="2"/>
                <circle cx="51" cy="21" r="1.8" fill="#0f172a"/>
                <circle cx="59" cy="21" r="1.8" fill="#0f172a"/>
                <circle cx="55" cy="31" r="2.2" fill="#0f172a"/>
            </svg>`;

        case "panda":
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <circle cx="30" cy="12" r="5" fill="#1e293b"/>
                <circle cx="50" cy="12" r="5" fill="#1e293b"/>
                <ellipse cx="40" cy="36" rx="16" ry="12" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
                <circle cx="40" cy="22" r="12" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
                <ellipse cx="35" cy="21" rx="3.5" ry="4" fill="#1e293b"/>
                <ellipse cx="45" cy="21" rx="3.5" ry="4" fill="#1e293b"/>
                <circle cx="35" cy="20" r="1.2" fill="#ffffff"/>
                <circle cx="45" cy="20" r="1.2" fill="#ffffff"/>
                <ellipse cx="40" cy="26" rx="2.5" ry="1.8" fill="#1e293b"/>
            </svg>`;

        default:
            return `<svg viewBox="0 0 80 55" width="58" height="42">
                <circle cx="40" cy="28" r="18" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2"/>
                <circle cx="34" cy="24" r="2.5" fill="#0f172a"/>
                <circle cx="46" cy="24" r="2.5" fill="#0f172a"/>
            </svg>`;
    }
}

/**
 * Full Scenic SVG Backgrounds matched to each Animal Theme
 * (City Skyline with Cats/Dogs Park, Underwater Coral Reef, Sky Kingdom Clouds, Woodland Forest)
 */
function getThemeScenerySVG(themeId) {
    switch (themeId) {
        case "underwater":
            return `<svg class="scenery-svg" viewBox="0 0 1200 700" preserveAspectRatio="none">
                <!-- Ocean Sun Rays -->
                <polygon points="150,0 260,0 420,700 220,700" fill="rgba(125, 211, 252, 0.08)"/>
                <polygon points="480,0 620,0 780,700 540,700" fill="rgba(125, 211, 252, 0.07)"/>
                <polygon points="860,0 980,0 1120,700 920,700" fill="rgba(125, 211, 252, 0.06)"/>
                <!-- Rising Bubbles -->
                <circle cx="140" cy="480" r="8" fill="rgba(224, 242, 254, 0.25)"/>
                <circle cx="155" cy="430" r="5" fill="rgba(224, 242, 254, 0.22)"/>
                <circle cx="132" cy="370" r="11" fill="rgba(224, 242, 254, 0.2)"/>
                <circle cx="1040" cy="510" r="9" fill="rgba(224, 242, 254, 0.25)"/>
                <circle cx="1060" cy="440" r="6" fill="rgba(224, 242, 254, 0.2)"/>
                <circle cx="1030" cy="360" r="12" fill="rgba(224, 242, 254, 0.18)"/>
                <!-- Distant Sea Hills & Sandy Seabed -->
                <path d="M0,610 Q320,560 650,615 T1200,590 L1200,700 L0,700 Z" fill="rgba(7, 89, 133, 0.55)"/>
                <path d="M0,645 Q280,610 620,650 T1200,635 L1200,700 L0,700 Z" fill="rgba(253, 230, 138, 0.22)"/>
                <!-- Seaweed & Coral Silhouettes -->
                <path d="M70,700 Q55,630 80,580 Q100,630 85,700" fill="rgba(16, 185, 129, 0.35)"/>
                <path d="M95,700 Q115,640 92,595 Q125,640 112,700" fill="rgba(52, 211, 153, 0.3)"/>
                <path d="M1110,700 Q1090,625 1120,565 Q1140,625 1125,700" fill="rgba(244, 63, 94, 0.32)"/>
                <path d="M1070,700 Q1050,640 1075,600 Q1095,640 1085,700" fill="rgba(168, 85, 247, 0.3)"/>
            </svg>`;

        case "sky":
            return `<svg class="scenery-svg" viewBox="0 0 1200 700" preserveAspectRatio="none">
                <!-- Warm Golden Sun & Rainbow Arc -->
                <circle cx="1060" cy="95" r="58" fill="rgba(254, 240, 138, 0.35)"/>
                <circle cx="1060" cy="95" r="88" fill="rgba(254, 240, 138, 0.14)"/>
                <path d="M80,680 A550,420 0 0,1 1120,680" fill="none" stroke="rgba(248, 113, 113, 0.12)" stroke-width="14"/>
                <path d="M95,680 A535,405 0 0,1 1105,680" fill="none" stroke="rgba(250, 204, 21, 0.12)" stroke-width="14"/>
                <path d="M110,680 A520,390 0 0,1 1090,680" fill="none" stroke="rgba(52, 211, 153, 0.12)" stroke-width="14"/>
                <!-- Fluffy Layered Clouds -->
                <g fill="rgba(255, 255, 255, 0.24)">
                    <ellipse cx="160" cy="130" rx="85" ry="34"/>
                    <ellipse cx="215" cy="120" rx="60" ry="42"/>
                    <ellipse cx="115" cy="138" rx="50" ry="26"/>
                    <ellipse cx="890" cy="175" rx="95" ry="36"/>
                    <ellipse cx="945" cy="162" rx="68" ry="44"/>
                    <ellipse cx="210" cy="590" rx="130" ry="42"/>
                    <ellipse cx="980" cy="600" rx="140" ry="45"/>
                </g>
                <!-- Distant Cloud Horizon -->
                <path d="M0,645 Q200,605 400,640 Q600,600 800,640 Q1000,605 1200,645 L1200,700 L0,700 Z" fill="rgba(255, 255, 255, 0.25)"/>
            </svg>`;

        case "forest":
            return `<svg class="scenery-svg" viewBox="0 0 1200 700" preserveAspectRatio="none">
                <!-- Forest Canopy Light Beams -->
                <polygon points="240,0 350,0 500,700 310,700" fill="rgba(167, 243, 208, 0.07)"/>
                <polygon points="730,0 850,0 980,700 790,700" fill="rgba(167, 243, 208, 0.06)"/>
                <!-- Rolling Woodland Hills -->
                <path d="M0,585 Q320,515 640,575 T1200,560 L1200,700 L0,700 Z" fill="rgba(6, 78, 59, 0.6)"/>
                <path d="M0,630 Q360,585 740,635 T1200,620 L1200,700 L0,700 Z" fill="rgba(4, 120, 87, 0.45)"/>
                <!-- Pine Trees Left & Right -->
                <g fill="rgba(2, 44, 34, 0.55)">
                    <polygon points="75,440 25,590 125,590"/>
                    <polygon points="75,380 35,510 115,510"/>
                    <polygon points="145,470 105,605 185,605"/>
                    <polygon points="1115,430 1065,595 1165,595"/>
                    <polygon points="1115,370 1075,505 1155,505"/>
                    <polygon points="1040,485 1000,610 1080,610"/>
                </g>
            </svg>`;

        case "city":
        default:
            return `<svg class="scenery-svg" viewBox="0 0 1200 700" preserveAspectRatio="none">
                <!-- Stars & Crescent Moon -->
                <circle cx="1050" cy="88" r="34" fill="rgba(254, 240, 138, 0.28)"/>
                <circle cx="1064" cy="78" r="28" fill="rgba(30, 27, 75, 0.85)"/>
                <circle cx="180" cy="70" r="2.5" fill="rgba(254, 240, 138, 0.5)"/>
                <circle cx="420" cy="52" r="2" fill="rgba(254, 240, 138, 0.4)"/>
                <circle cx="780" cy="65" r="2.5" fill="rgba(254, 240, 138, 0.45)"/>
                <!-- City Skyline Silhouette (Background for Cats & Dogs) -->
                <g fill="rgba(15, 23, 42, 0.46)">
                    <rect x="20" y="420" width="95" height="280" rx="4"/>
                    <rect x="110" y="470" width="80" height="230" rx="4"/>
                    <rect x="185" y="390" width="105" height="310" rx="4"/>
                    <rect x="910" y="410" width="105" height="290" rx="4"/>
                    <rect x="1010" y="460" width="85" height="240" rx="4"/>
                    <rect x="1090" y="380" width="95" height="320" rx="4"/>
                </g>
                <!-- Glowing City Windows -->
                <g fill="rgba(251, 191, 36, 0.28)">
                    <rect x="38" y="445" width="14" height="18" rx="2"/>
                    <rect x="68" y="445" width="14" height="18" rx="2"/>
                    <rect x="38" y="480" width="14" height="18" rx="2"/>
                    <rect x="205" y="415" width="16" height="20" rx="2"/>
                    <rect x="238" y="415" width="16" height="20" rx="2"/>
                    <rect x="935" y="435" width="16" height="20" rx="2"/>
                    <rect x="968" y="435" width="16" height="20" rx="2"/>
                    <rect x="1115" y="410" width="16" height="20" rx="2"/>
                    <rect x="1148" y="445" width="16" height="20" rx="2"/>
                </g>
                <!-- Cozy Park Foreground for Cats & Dogs -->
                <path d="M0,635 Q350,605 680,638 T1200,625 L1200,700 L0,700 Z" fill="rgba(28, 25, 23, 0.55)"/>
            </svg>`;
    }
}

class AnimalThemeManager {
    constructor() {
        this.currentTheme = ANIMAL_THEMES.city;
        this.activeAnimalIndex = 0;
        this.animationsEnabled = true;
        this.backdropStyle = "theme_scenic"; // 'theme_scenic' | 'midnight' | 'daylight' | 'custom_color' | 'custom_image'
        this.customBackdropColor = "#1e293b";
        this.customBackdropImageUrl = null;
    }

    setTheme(themeId) {
        if (!ANIMAL_THEMES[themeId]) return this.currentTheme;
        this.currentTheme = ANIMAL_THEMES[themeId];
        this.activeAnimalIndex = 0;
        document.body.className = this.currentTheme.bgClass;
        this.applyBackdropVisuals();
        this.renderThemeStage();
        this.renderAnimalCompanionCards();
        return this.currentTheme;
    }

    setBackdropStyle(style, customValue = null) {
        this.backdropStyle = style;
        if (style === "custom_color" && customValue) {
            this.customBackdropColor = customValue;
        } else if (style === "custom_image" && customValue) {
            this.customBackdropImageUrl = customValue;
        }
        this.applyBackdropVisuals();
        this.renderThemeStage();
    }

    applyBackdropVisuals() {
        const stageEl = document.querySelector(".workspace-stage");
        if (!stageEl) return;

        stageEl.style.backgroundImage = "";
        stageEl.style.backgroundSize = "";
        stageEl.style.backgroundPosition = "";

        if (this.backdropStyle === "midnight") {
            stageEl.style.background = "radial-gradient(circle at 50% 35%, #1e293b 0%, #090d16 100%)";
        } else if (this.backdropStyle === "daylight") {
            stageEl.style.background = "linear-gradient(180deg, #e0f2fe 0%, #f1f5f9 55%, #e2e8f0 100%)";
        } else if (this.backdropStyle === "custom_color") {
            stageEl.style.background = this.customBackdropColor;
        } else if (this.backdropStyle === "custom_image" && this.customBackdropImageUrl) {
            stageEl.style.background = `linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.35)), url("${this.customBackdropImageUrl}") center/cover no-repeat`;
        } else {
            // Default: use theme's CSS gradient (--stage-gradient)
            stageEl.style.background = "var(--stage-gradient)";
        }
    }

    /**
     * Renders the scenic background + animated themed animals inside the canvas stage border/backdrop
     * and the bottom habitat strip.
     */
    renderThemeStage() {
        const habitatBanner = document.getElementById("animalHabitatStrip");
        const backdropSprites = document.getElementById("themeBackdropSprites");
        const themeBadge = document.getElementById("activeThemeBadge");

        if (themeBadge) {
            themeBadge.textContent = this.currentTheme.badgeText;
        }

        if (habitatBanner) {
            habitatBanner.innerHTML = this.currentTheme.animals.map((animal, idx) => `
                <div class="habitat-animal-chip ${idx === this.activeAnimalIndex ? 'active' : ''}" 
                     data-animal-idx="${idx}" 
                     title="${animal.name} (${animal.species}) - Click to hear tip!">
                    <div class="habitat-svg-wrap">${getAnimalSVG(animal.svgType)}</div>
                    <div class="habitat-chip-meta">
                        <span class="habitat-chip-name">${animal.emoji} ${animal.name}</span>
                        <span class="habitat-chip-role">${animal.species} • ${animal.role}</span>
                    </div>
                </div>
            `).join("");

            habitatBanner.querySelectorAll(".habitat-animal-chip").forEach(chip => {
                chip.addEventListener("click", () => {
                    const idx = parseInt(chip.getAttribute("data-animal-idx"), 10);
                    this.selectAnimal(idx);
                });
            });
        }

        if (backdropSprites) {
            const sceneryHtml = (this.backdropStyle === "theme_scenic")
                ? getThemeScenerySVG(this.currentTheme.id)
                : "";

            // Render floating / walking SVG animal sprites around the workspace backdrop
            const animalsHtml = this.currentTheme.animals.map((animal, i) => {
                const topPositions = [8, 22, 68, 82, 14, 75];
                const topPct = topPositions[i % topPositions.length];
                const delay = (i * 2.3).toFixed(1);
                const duration = (18 + i * 3).toFixed(1);
                return `
                    <div class="floating-animal-sprite zone-${animal.zone}" 
                         style="top: ${topPct}%; animation-delay: -${delay}s; animation-duration: ${duration}s;">
                        <div class="sprite-svg">${getAnimalSVG(animal.svgType)}</div>
                        <span class="sprite-tag">${animal.emoji} ${animal.name}</span>
                    </div>
                `;
            }).join("");

            backdropSprites.innerHTML = sceneryHtml + animalsHtml;
        }
    }

    selectAnimal(idx) {
        if (idx >= 0 && idx < this.currentTheme.animals.length) {
            this.activeAnimalIndex = idx;
            this.renderThemeStage();
            this.renderAnimalCompanionCards();
        }
    }

    renderAnimalCompanionCards() {
        const container = document.getElementById("animalCompanionPanel");
        if (!container) return;

        const active = this.currentTheme.animals[this.activeAnimalIndex] || this.currentTheme.animals[0];

        container.innerHTML = `
            <div class="mascot-spotlight-card">
                <div class="mascot-avatar-box">
                    ${getAnimalSVG(active.svgType)}
                </div>
                <div class="mascot-speech-box">
                    <div class="mascot-name-row">
                        <strong>${active.emoji} ${active.name}</strong>
                        <span class="species-pill">${active.species}</span>
                    </div>
                    <p class="mascot-quote" id="mascotDynamicQuote">"${active.quote}"</p>
                </div>
            </div>
            <div class="animal-roster-grid">
                ${this.currentTheme.animals.map((a, idx) => `
                    <button class="animal-mini-btn ${idx === this.activeAnimalIndex ? 'active' : ''}" data-idx="${idx}">
                        <span>${a.emoji}</span>
                        <span>${a.name.split(" ")[0]}</span>
                    </button>
                `).join("")}
            </div>
        `;

        container.querySelectorAll(".animal-mini-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.selectAnimal(parseInt(btn.getAttribute("data-idx"), 10));
            });
        });
    }

    setMascotMessage(msg) {
        const quoteEl = document.getElementById("mascotDynamicQuote");
        if (quoteEl) {
            quoteEl.textContent = `"${msg}"`;
        }
    }
}

if (typeof window !== "undefined") {
    window.ANIMAL_THEMES = ANIMAL_THEMES;
    window.AnimalThemeManager = AnimalThemeManager;
    window.getAnimalSVG = getAnimalSVG;
}
