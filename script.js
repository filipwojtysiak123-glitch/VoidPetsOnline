/* =========================================
   VOID PETS ONLINE
   VERSION 0.4
   STACKING SYSTEM
========================================= */


/* =========================================
   PET DEFINITIONS
========================================= */

const PETS = {

    void_cat: {
        name: "Void Cat",
        rarity: "Common",
        chance: 50,
        power: 5,
        icon: "🐱"
    },

    void_dog: {
        name: "Void Dog",
        rarity: "Uncommon",
        chance: 30,
        power: 10,
        icon: "🐶"
    },

    void_bat: {
        name: "Void Bat",
        rarity: "Rare",
        chance: 15,
        power: 20,
        icon: "🦇"
    },

    void_dragon: {
        name: "Void Dragon",
        rarity: "Legendary",
        chance: 5,
        power: 50,
        icon: "🐉"
    }

};


/* =========================================
   MATERIAL VARIANTS
========================================= */

const PET_VARIANTS = {

    normal: {
        name: "Normal",
        multiplier: 1
    },

    gold: {
        name: "Gold",
        multiplier: 5
    },

    rainbow: {
        name: "Rainbow",
        multiplier: 10
    }

};


/* =========================================
   SPECIAL CHANCES
========================================= */

const SHINY_CHANCE = 5;

const HUGE_CHANCE = 0.01;

const SECRET_CHANCE = 0.001;


/* =========================================
   SPECIAL MULTIPLIERS
========================================= */

const SHINY_MULTIPLIER = 2;

const HUGE_MULTIPLIER = 25;

const SECRET_MULTIPLIER = 100;


/* =========================================
   WORLDS
========================================= */

const WORLDS = {

    void: {
        name: "Void",
        cost: 0,
        multiplier: 1
    },

    forest: {
        name: "Void Forest",
        cost: 5000,
        multiplier: 2
    }

};


/* =========================================
   DEFAULT SAVE
========================================= */

const DEFAULT_SAVE = {

    coins: 1000,

    gems: 0,

    inventory: [],

    equipped: [],

    unlockedWorlds: [
        "void"
    ],

    currentWorld: "void",

    lastSave: Date.now(),

    dailyClaimedAt: null

};


let game = loadGame();

let selectedPetId = null;


/* =========================================
   PET STACK KEY
========================================= */

function getPetStackKey(
    pet
) {

    return [

        pet.type,

        pet.variant ||
            "normal",

        pet.shiny
            ? 1
            : 0,

        pet.huge
            ? 1
            : 0,

        pet.secret
            ? 1
            : 0

    ].join("|");

}


/* =========================================
   GET STACK COUNT
========================================= */

function getPetStackCount(
    pet
) {

    const count =
        Number(
            pet &&
            pet.stack
        );


    if (
        !Number.isFinite(
            count
        ) ||
        count < 1
    ) {

        return 1;

    }


    return Math.floor(
        count
    );

}


/* =========================================
   GET TOTAL PET COUNT
========================================= */

function getTotalPetCount(
    state = game
) {

    if (
        !Array.isArray(
            state.inventory
        )
    ) {

        return 0;

    }


    return state.inventory.reduce(
        (
            total,
            pet
        ) => {

            return total +
                getPetStackCount(
                    pet
                );

        },
        0
    );

}


/* =========================================
   COUNT EQUIPPED PETS
========================================= */

function getEquippedCount() {

    if (
        !Array.isArray(
            game.equipped
        )
    ) {

        return 0;

    }


    return game.equipped.length;

}


/* =========================================
   COUNT EQUIPPED FROM STACK
========================================= */

function getEquippedFromStack(
    petId
) {

    if (
        !Array.isArray(
            game.equipped
        )
    ) {

        return 0;

    }


    return game.equipped.filter(
        id =>
            id ===
            petId
    ).length;

}


/* =========================================
   NORMALIZE / MIGRATE STACKS
========================================= */

function normalizeInventoryStacks(
    state
) {

    if (
        !Array.isArray(
            state.inventory
        )
    ) {

        state.inventory = [];

    }


    if (
        !Array.isArray(
            state.equipped
        )
    ) {

        state.equipped = [];

    }


    const oldInventory =
        state.inventory;


    const oldEquipped =
        state.equipped;


    const groups =
        new Map();


    const idMap =
        new Map();


    /*
        Merge pets with the exact same:

        type
        material
        shiny
        huge
        secret
    */

    oldInventory.forEach(
        rawPet => {

            if (
                !rawPet ||
                !rawPet.type
            ) {

                return;

            }


            const pet = {

                ...rawPet,

                stack:
                    getPetStackCount(
                        rawPet
                    )

            };


            /*
                Older saves may not have
                all variant properties.
            */

            if (
                typeof pet.shiny !==
                "boolean"
            ) {

                pet.shiny = false;

            }


            if (
                typeof pet.huge !==
                "boolean"
            ) {

                pet.huge = false;

            }


            if (
                typeof pet.secret !==
                "boolean"
            ) {

                pet.secret = false;

            }


            if (
                !pet.variant
            ) {

                pet.variant =
                    "normal";

            }


            if (
                !pet.variantName
            ) {

                pet.variantName =
                    PET_VARIANTS[
                        pet.variant
                    ]
                        ? PET_VARIANTS[
                            pet.variant
                        ].name
                        : "Normal";

            }


            if (
                !pet.id
            ) {

                pet.id =
                    `stack_${Date.now()}_${Math.random()
                        .toString(36)
                        .substring(2, 10)}`;

            }


            const key =
                getPetStackKey(
                    pet
                );


            if (
                !groups.has(
                    key
                )
            ) {

                groups.set(
                    key,
                    {
                        ...pet,
                        stack: 0
                    }
                );

            }


            const group =
                groups.get(
                    key
                );


            group.stack +=
                pet.stack;


            /*
                Make sure the group
                keeps useful data.
            */

            group.basePower =
                pet.basePower ||
                group.basePower;


            group.power =
                pet.power ||
                group.power;


            group.variantMultiplier =
                pet.variantMultiplier ||
                group.variantMultiplier ||
                1;


            group.variantName =
                pet.variantName ||
                group.variantName;


            group.variantEmoji =
                pet.variantEmoji ||
                group.variantEmoji ||
                "";


            /*
                Map old pet ID to
                the new stack ID.
            */

            idMap.set(
                pet.id,
                group.id
            );

        }
    );


    /*
        Build new inventory.
    */

    state.inventory =
        Array.from(
            groups.values()
        );


    /*
        Convert old equipped IDs
        into the new stack IDs.
    */

    state.equipped =
        oldEquipped
            .map(
                oldId => {

                    return (
                        idMap.get(
                            oldId
                        ) ||
                        oldId
                    );

                }
            )
            .filter(
                id =>
                    state.inventory.some(
                        pet =>
                            pet.id ===
                            id
                    )
            )
            .slice(
                0,
                3
            );


    return state;

}


/* =========================================
   LOAD GAME
========================================= */

function loadGame() {

    const saved =
        localStorage.getItem(
            "voidPetsSave"
        );


    if (!saved) {

        return {

            ...DEFAULT_SAVE,

            lastSave:
                Date.now()

        };

    }


    try {

        const parsed =
            JSON.parse(
                saved
            );


        let loaded = {

            ...DEFAULT_SAVE,

            ...parsed

        };


        if (
            !Array.isArray(
                loaded.inventory
            )
        ) {

            loaded.inventory = [];

        }


        if (
            !Array.isArray(
                loaded.equipped
            )
        ) {

            loaded.equipped = [];

        }


        if (
            !Array.isArray(
                loaded.unlockedWorlds
            )
        ) {

            loaded.unlockedWorlds = [
                "void"
            ];

        }


        /*
            STACK MIGRATION
        */

        loaded =
            normalizeInventoryStacks(
                loaded
            );


        /*
            Remove invalid equipped IDs.
        */

        loaded.equipped =
            loaded.equipped.filter(
                id =>
                    loaded.inventory.some(
                        pet =>
                            pet.id ===
                            id
                    )
            );


        /*
            Maximum 3 equipped pets.
        */

        loaded.equipped =
            loaded.equipped.slice(
                0,
                3
            );


        /*
            OFFLINE EARNINGS
        */

        const now =
            Date.now();


        const elapsed =
            now -
            (
                loaded.lastSave ||
                now
            );


        const maxOffline =
            8 *
            60 *
            60 *
            1000;


        const offlineTime =
            Math.min(
                Math.max(
                    elapsed,
                    0
                ),
                maxOffline
            );


        const seconds =
            Math.floor(
                offlineTime /
                1000
            );


        const power =
            getEquippedPower(
                loaded
            );


        const world =
            WORLDS[
                loaded.currentWorld
            ] ||
            WORLDS.void;


        const offlineCoins =
            Math.floor(
                power *
                world.multiplier *
                seconds
            );


        if (
            offlineCoins > 0
        ) {

            loaded.coins +=
                offlineCoins;


            setTimeout(
                () => {

                    showToast(
                        `Offline earnings: +${formatNumber(offlineCoins)} Coins`,
                        "success"
                    );

                },
                500
            );

        }


        loaded.lastSave =
            now;


        /*
            Save migrated data.
        */

        localStorage.setItem(
            "voidPetsSave",
            JSON.stringify(
                loaded
            )
        );


        return loaded;


    } catch (error) {

        console.error(
            "Save loading error:",
            error
        );


        return {

            ...DEFAULT_SAVE,

            lastSave:
                Date.now()

        };

    }

}


/* =========================================
   SAVE GAME
========================================= */

function saveGame() {

    game.lastSave =
        Date.now();


    localStorage.setItem(
        "voidPetsSave",
        JSON.stringify(
            game
        )
    );

}


/* =========================================
   FORMAT NUMBERS
========================================= */

function formatNumber(
    number
) {

    return Math.floor(
        Number(number) || 0
    ).toLocaleString(
        "en-US"
    );

}


/* =========================================
   GET PET POWER
========================================= */

function getPetPower(
    pet
) {

    if (!pet) {

        return 0;

    }


    if (
        typeof pet.power ===
        "number"
    ) {

        return pet.power;

    }


    const definition =
        PETS[
            pet.type
        ];


    if (!definition) {

        return 0;

    }


    return definition.power;

}


/* =========================================
   GET EQUIPPED POWER
========================================= */

function getEquippedPower(
    state = game
) {

    let total =
        0;


    if (
        !Array.isArray(
            state.equipped
        ) ||
        !Array.isArray(
            state.inventory
        )
    ) {

        return 0;

    }


    state.equipped.forEach(
        petId => {

            const pet =
                state.inventory.find(
                    p =>
                        p.id ===
                        petId
                );


            if (!pet) {

                return;

            }


            total +=
                getPetPower(
                    pet
                );

        }
    );


    return total;

}


/* =========================================
   WORLD MULTIPLIER
========================================= */

function getWorldMultiplier() {

    const world =
        WORLDS[
            game.currentWorld
        ];


    return world
        ? world.multiplier
        : 1;

}


/* =========================================
   PASSIVE INCOME
========================================= */

function getPassiveIncome() {

    return (

        getEquippedPower() *

        getWorldMultiplier()

    );

}


/* =========================================
   PASSIVE LOOP
========================================= */

setInterval(
    () => {

        const income =
            getPassiveIncome();


        if (
            income <= 0
        ) {

            return;

        }


        game.coins +=
            income;


        saveGame();

        updateUI();

    },
    1000
);


/* =========================================
   PAGE DATA
========================================= */

const PAGE_DATA = {

    home: {
        title: "Home",
        subtitle: "Welcome to the Void."
    },

    eggs: {
        title: "Eggs",
        subtitle: "Hatch new pets."
    },

    pets: {
        title: "Pets",
        subtitle: "Manage your collection."
    },

    inventory: {
        title: "Inventory",
        subtitle: "Your collected pets."
    },

    worlds: {
        title: "Worlds",
        subtitle: "Explore the Void."
    },

    shop: {
        title: "Shop",
        subtitle: "Items and upgrades."
    },

    daily: {
        title: "Daily Reward",
        subtitle: "Come back every day."
    },

    leaderboards: {
        title: "Leaderboards",
        subtitle: "Compete with other players."
    },

    clans: {
        title: "Clans",
        subtitle: "Team up and compete."
    },

    settings: {
        title: "Settings",
        subtitle: "Customize your experience."
    }

};


/* =========================================
   SHOW PAGE
========================================= */

function showPage(
    pageName
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page => {

                page.classList.remove(
                    "active"
                );

            }
        );


    const target =
        document.getElementById(
            `page-${pageName}`
        );


    if (!target) {

        return;

    }


    target.classList.add(
        "active"
    );


    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.page ===
                    pageName
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    const data =
        PAGE_DATA[
            pageName
        ];


    if (data) {

        const title =
            document.getElementById(
                "page-title"
            );


        const subtitle =
            document.getElementById(
                "page-subtitle"
            );


        if (title) {

            title.textContent =
                data.title;

        }


        if (subtitle) {

            subtitle.textContent =
                data.subtitle;

        }

    }


    renderAll();


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =========================================
   NAV BUTTONS
========================================= */

document
    .querySelectorAll(
        ".nav-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );

                }
            );

        }
    );


/* =========================================
   MOBILE MENU
========================================= */

const mobileMenu =
    document.getElementById(
        "mobile-menu"
    );


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


/* =========================================
   ROLL BASE PET
========================================= */

function rollBasePet() {

    const random =
        Math.random() *
        100;


    let cumulative =
        0;


    for (
        const type in PETS
    ) {

        cumulative +=
            PETS[type].chance;


        if (
            random <=
            cumulative
        ) {

            return type;

        }

    }


    return "void_cat";

}


/* =========================================
   ROLL GOLD / RAINBOW
========================================= */

function rollMaterialVariant() {

    const random =
        Math.random() *
        100;


    /*
        Rainbow = 0.05%
        Gold    = 0.50%
        Normal  = 99.45%
    */

    if (
        random <
        0.05
    ) {

        return PET_VARIANTS.rainbow;

    }


    if (
        random <
        0.55
    ) {

        return PET_VARIANTS.gold;

    }


    return PET_VARIANTS.normal;

}


/* =========================================
   ROLL SHINY
========================================= */

function rollShiny() {

    return (

        Math.random() *
        100

    ) < SHINY_CHANCE;

}


/* =========================================
   ROLL HUGE
========================================= */

function rollHuge() {

    return (

        Math.random() *
        100

    ) < HUGE_CHANCE;

}


/* =========================================
   ROLL SECRET
========================================= */

function rollSecret() {

    return (

        Math.random() *
        100

    ) < SECRET_CHANCE;

}


/* =========================================
   CREATE HATCHED PET
========================================= */

function createHatchedPet(
    type
) {

    const definition =
        PETS[type];


    /*
        Every variant rolls
        independently.

        This means:

        Gold + Shiny
        Rainbow + Shiny
        Huge + Shiny
        Secret + Shiny
        etc.

        CAN ALL HAPPEN.
    */

    const material =
        rollMaterialVariant();


    const shiny =
        rollShiny();


    const huge =
        rollHuge();


    const secret =
        rollSecret();


    /*
        START WITH MATERIAL
        MULTIPLIER.
    */

    let multiplier =
        material.multiplier;


    /*
        SHINY STACKS.
    */

    if (shiny) {

        multiplier *=
            SHINY_MULTIPLIER;

    }


    /*
        HUGE STACKS.
    */

    if (huge) {

        multiplier *=
            HUGE_MULTIPLIER;

    }


    /*
        SECRET STACKS.
    */

    if (secret) {

        multiplier *=
            SECRET_MULTIPLIER;

    }


    /*
        FINAL POWER.
    */

    const power =
        Math.floor(
            definition.power *
            multiplier
        );


    /* =====================================
       BUILD VARIANT NAME
    ===================================== */

    const variantParts =
        [];


    if (secret) {

        variantParts.push(
            "Secret"
        );

    }


    if (huge) {

        variantParts.push(
            "Huge"
        );

    }


    if (
        material.name !==
        "Normal"
    ) {

        variantParts.push(
            material.name
        );

    }


    if (shiny) {

        variantParts.push(
            "Shiny"
        );

    }


    const variantName =
        variantParts.length > 0

            ? variantParts.join(
                " "
            )

            : "Normal";


    /* =====================================
       BUILD VARIANT EMOJIS
    ===================================== */

    const variantEmojis =
        [];


    if (secret) {

        variantEmojis.push(
            "❓"
        );

    }


    if (huge) {

        variantEmojis.push(
            "🟣"
        );

    }


    if (
        material.name ===
        "Gold"
    ) {

        variantEmojis.push(
            "🟡"
        );

    }


    if (
        material.name ===
        "Rainbow"
    ) {

        variantEmojis.push(
            "🌈"
        );

    }


    if (shiny) {

        variantEmojis.push(
            "✨"
        );

    }


    const variantEmoji =
        variantEmojis.join(
            " "
        );


    /* =====================================
       RETURN NEW STACKABLE PET
    ===================================== */

    return {

        id:
            `stack_${type}_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 10)}`,

        type:
            type,

        obtainedAt:
            Date.now(),

        /*
            Material variant.
        */

        variant:
            material.name.toLowerCase(),

        variantName:
            variantName,

        variantEmoji:
            variantEmoji,

        /*
            Special variants.
        */

        shiny:
            shiny,

        huge:
            huge,

        secret:
            secret,

        /*
            Power.
        */

        basePower:
            definition.power,

        variantMultiplier:
            multiplier,

        power:
            power,

        /*
            STACK SIZE
        */

        stack:
            1

    };

}


/* =========================================
   ADD PET TO INVENTORY
========================================= */

function addPetToInventory(
    pet
) {

    /*
        Find an existing stack with
        EXACTLY the same pet type
        and variants.
    */

    const stackKey =
        getPetStackKey(
            pet
        );


    const existing =
        game.inventory.find(
            existingPet =>
                getPetStackKey(
                    existingPet
                ) ===
                stackKey
        );


    if (existing) {

        existing.stack =
            getPetStackCount(
                existing
            ) + 1;


        /*
            Keep the strongest / correct
            power data.
        */

        existing.power =
            pet.power;


        existing.basePower =
            pet.basePower;


        existing.variantMultiplier =
            pet.variantMultiplier;


        existing.variantName =
            pet.variantName;


        existing.variantEmoji =
            pet.variantEmoji;


        return existing;

    }


    /*
        No matching stack found.
        Create a new one.
    */

    pet.stack =
        1;


    game.inventory.push(
        pet
    );


    return pet;

}


/* =========================================
   HATCH BASIC EGG
========================================= */

function hatchBasicEgg() {

    const price =
        100;


    if (
        game.coins <
        price
    ) {

        showToast(
            "You don't have enough Coins.",
            "error"
        );

        return;

    }


    game.coins -=
        price;


    const selectedType =
        rollBasePet();


    const pet =
        createHatchedPet(
            selectedType
        );


    /*
        ADD TO STACK
        OR CREATE NEW STACK.
    */

    const stack =
        addPetToInventory(
            pet
        );


    /*
        Select the stack.
    */

    selectedPetId =
        stack.id;


    saveGame();

    renderAll();


    const definition =
        PETS[
            selectedType
        ];


    const variantText =
        pet.variantName ===
        "Normal"

            ? ""

            : `${pet.variantEmoji} ${pet.variantName} `;


    showToast(
        `You hatched ${variantText}${definition.name}! ×${stack.stack}`,
        "success"
    );

}


/* =========================================
   GET DISPLAY NAME
========================================= */

function getPetDisplayName(
    pet
) {

    const definition =
        PETS[
            pet.type
        ];


    if (!definition) {

        return "Unknown Pet";

    }


    const variantName =
        pet.variantName ||
        "Normal";


    if (
        variantName ===
        "Normal"
    ) {

        return definition.name;

    }


    return `${variantName} ${definition.name}`;

}


/* =========================================
   RENDER PETS LIST
========================================= */

function renderPetsList() {

    const container =
        document.getElementById(
            "pets-list"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        game.inventory.length ===
        0
    ) {

        container.innerHTML = `

            <div
                class="panel empty-state"
                style="grid-column:1/-1"
            >

                <div>
                    🥚
                </div>

                <h3>
                    No Pets Yet
                </h3>

                <p>
                    Hatch an egg to get your first pet.
                </p>

                <br>

                <button
                    class="btn primary"
                    onclick="showPage('eggs')"
                >
                    Go to Eggs
                </button>

            </div>

        `;


        renderPetDetails();

        return;

    }


    game.inventory.forEach(
        pet => {

            const definition =
                PETS[
                    pet.type
                ];


            if (!definition) {

                return;

            }


            const equipped =
                getEquippedFromStack(
                    pet.id
                );


            const power =
                getPetPower(
                    pet
                );


            const stack =
                getPetStackCount(
                    pet
                );


            const variantName =
                pet.variantName ||
                "Normal";


            const variantEmoji =
                pet.variantEmoji ||
                "";


            const displayName =
                getPetDisplayName(
                    pet
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "pet-card";


            if (
                selectedPetId ===
                pet.id
            ) {

                card.classList.add(
                    "selected"
                );

            }


            card.innerHTML = `

                <div class="pet-visual">

                    ${definition.icon}

                </div>


                <h3>

                    ${variantEmoji}
                    ${displayName}

                </h3>


                ${
                    variantName !==
                    "Normal"

                    ? `

                        <div class="pet-variant">

                            ${variantEmoji}
                            ${variantName}

                        </div>

                    `

                    : ""
                }


                <div
                    class="pet-rarity ${definition.rarity.toLowerCase()}"
                >

                    ${definition.rarity}

                </div>


                <div class="pet-power">

                    Power:
                    ${formatNumber(power)}

                </div>


                <div class="pet-stack">

                    ×${formatNumber(stack)}

                </div>


                ${
                    equipped > 0

                    ? `

                        <div class="equipped-badge">

                            EQUIPPED ${equipped}/${stack}

                        </div>

                    `

                    : ""
                }


                ${
                    pet.secret

                    ? `

                        <div class="equipped-badge">

                            SECRET

                        </div>

                    `

                    : ""
                }

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedPetId =
                        pet.id;


                    renderAll();

                }
            );


            container.appendChild(
                card
            );

        }
    );


    renderPetDetails();

}


/* =========================================
   PET DETAILS
========================================= */

function renderPetDetails() {

    const container =
        document.getElementById(
            "pet-details"
        );


    if (!container) {

        return;

    }


    const pet =
        game.inventory.find(
            p =>
                p.id ===
                selectedPetId
        );


    if (!pet) {

        container.innerHTML = `

            <div class="empty-state">

                <div>
                    🐾
                </div>

                <h3>
                    Select a Pet
                </h3>

                <p>
                    Select one of your pets to
                    view its statistics.
                </p>

            </div>

        `;

        return;

    }


    const definition =
        PETS[
            pet.type
        ];


    if (!definition) {

        return;

    }


    const equipped =
        getEquippedFromStack(
            pet.id
        );


    const stack =
        getPetStackCount(
            pet
        );


    const power =
        getPetPower(
            pet
        );


    const totalStackPower =
        power *
        stack;


    const variantName =
        pet.variantName ||
        "Normal";


    const variantEmoji =
        pet.variantEmoji ||
        "";


    const basePower =
        pet.basePower ||
        definition.power;


    const displayName =
        getPetDisplayName(
            pet
        );


    const canEquip =
        equipped <
        stack &&
        getEquippedCount() <
        3;


    container.innerHTML = `

        <div class="detail-visual">

            ${definition.icon}

        </div>


        <h2 class="detail-name">

            ${variantEmoji}
            ${displayName}

        </h2>


        <div
            class="detail-rarity pet-rarity ${definition.rarity.toLowerCase()}"
        >

            ${definition.rarity}

        </div>


        ${
            variantName !==
            "Normal"

            ? `

                <div class="pet-variant detail-variant">

                    ${variantEmoji}
                    ${variantName}

                </div>

            `

            : ""
        }


        <div class="detail-stats">


            <div class="detail-stat">

                <span>
                    Stack
                </span>

                <strong>
                    ×${formatNumber(stack)}
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Equipped
                </span>

                <strong>
                    ${equipped} / ${stack}
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Power
                </span>

                <strong>
                    ${formatNumber(power)}
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Total Stack Power
                </span>

                <strong>
                    ${formatNumber(totalStackPower)}
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Base Power
                </span>

                <strong>
                    ${formatNumber(basePower)}
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Power Multiplier
                </span>

                <strong>
                    ×${pet.variantMultiplier || 1}
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Hatch Chance
                </span>

                <strong>
                    ${definition.chance}%
                </strong>

            </div>


            <div class="detail-stat">

                <span>
                    Passive Income
                </span>

                <strong>
                    ${formatNumber(power)}
                    Coins/s
                </strong>

            </div>


            ${
                pet.secret

                ? `

                    <div class="detail-stat">

                        <span>
                            Secret
                        </span>

                        <strong>
                            YES
                        </strong>

                    </div>

                `

                : ""
            }


            ${
                pet.huge

                ? `

                    <div class="detail-stat">

                        <span>
                            Huge
                        </span>

                        <strong>
                            YES
                        </strong>

                    </div>

                `

                : ""
            }


            ${
                pet.shiny

                ? `

                    <div class="detail-stat">

                        <span>
                            Shiny
                        </span>

                        <strong>
                            YES
                        </strong>

                    </div>

                `

                : ""
            }


        </div>


        ${
            equipped > 0

            ? `

                <button
                    class="btn danger full"
                    onclick="unequipPet('${pet.id}')"
                >

                    Unequip One

                </button>

            `

            : ""
        }


        ${
            canEquip

            ? `

                <button
                    class="btn primary full"
                    onclick="equipPet('${pet.id}')"
                >

                    Equip One

                </button>

            `

            : `

                <button
                    class="btn primary full"
                    disabled
                >

                    ${
                        getEquippedCount() >= 3

                        ? "Equip Limit Reached"

                        : "No More Available"

                    }

                </button>

            `
        }

    `;

}


/* =========================================
   EQUIP PET
========================================= */

function equipPet(
    petId
) {

    const pet =
        game.inventory.find(
            p =>
                p.id ===
                petId
        );


    if (!pet) {

        return;

    }


    const equippedTotal =
        getEquippedCount();


    const equipLimit =
        3;


    if (
        equippedTotal >=
        equipLimit
    ) {

        showToast(
            `Equip limit reached: ${equipLimit} pets.`,
            "error"
        );

        return;

    }


    const stack =
        getPetStackCount(
            pet
        );


    const equippedFromStack =
        getEquippedFromStack(
            petId
        );


    if (
        equippedFromStack >=
        stack
    ) {

        showToast(
            "You don't have more of this pet to equip.",
            "error"
        );

        return;

    }


    /*
        Same ID can appear multiple
        times in equipped.

        Example:

        Void Cat ×20

        equipped:
        [
            "stack_id",
            "stack_id",
            "stack_id"
        ]

        = 3 Void Cats equipped.
    */

    game.equipped.push(
        petId
    );


    saveGame();

    renderAll();


    showToast(
        "Pet equipped!",
        "success"
    );

}


/* =========================================
   UNEQUIP ONE PET
========================================= */

function unequipPet(
    petId
) {

    /*
        Remove only ONE copy
        from equipped.
    */

    const index =
        game.equipped.lastIndexOf(
            petId
        );


    if (
        index ===
        -1
    ) {

        return;

    }


    game.equipped.splice(
        index,
        1
    );


    saveGame();

    renderAll();


    showToast(
        "One pet unequipped.",
        "success"
    );

}


/* =========================================
   INVENTORY
========================================= */

function renderInventory() {

    const container =
        document.getElementById(
            "inventory-list"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const count =
        document.getElementById(
            "inventory-count"
        );


    const equippedCount =
        document.getElementById(
            "inventory-equipped"
        );


    if (count) {

        /*
            Show number of STACKS,
            because that is the amount
            of inventory entries.
        */

        count.textContent =
            game.inventory.length;

    }


    if (equippedCount) {

        equippedCount.textContent =
            `${getEquippedCount()} / 3`;

    }


    if (
        game.inventory.length ===
        0
    ) {

        container.innerHTML = `

            <div
                class="panel empty-state"
                style="grid-column:1/-1"
            >

                <div>
                    🎒
                </div>

                <h3>
                    Inventory Empty
                </h3>

                <p>
                    Your pets will appear here.
                </p>

            </div>

        `;

        return;

    }


    game.inventory.forEach(
        pet => {

            const definition =
                PETS[
                    pet.type
                ];


            if (!definition) {

                return;

            }


            const equipped =
                getEquippedFromStack(
                    pet.id
                );


            const power =
                getPetPower(
                    pet
                );


            const stack =
                getPetStackCount(
                    pet
                );


            const variantName =
                pet.variantName ||
                "Normal";


            const variantEmoji =
                pet.variantEmoji ||
                "";


            const displayName =
                getPetDisplayName(
                    pet
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "pet-card";


            card.innerHTML = `

                <div class="pet-visual">

                    ${definition.icon}

                </div>


                <h3>

                    ${variantEmoji}
                    ${displayName}

                </h3>


                ${
                    variantName !==
                    "Normal"

                    ? `

                        <div class="pet-variant">

                            ${variantEmoji}
                            ${variantName}

                        </div>

                    `

                    : ""
                }


                <div
                    class="pet-rarity ${definition.rarity.toLowerCase()}"
                >

                    ${definition.rarity}

                </div>


                <div class="pet-power">

                    Power:
                    ${formatNumber(power)}

                </div>


                <div class="pet-stack">

                    ×${formatNumber(stack)}

                </div>


                ${
                    equipped > 0

                    ? `

                        <div class="equipped-badge">

                            EQUIPPED ${equipped}/${stack}

                        </div>

                    `

                    : ""
                }

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedPetId =
                        pet.id;


                    showPage(
                        "pets"
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   EQUIPPED SIDE
========================================= */

function renderEquippedSide() {

    const container =
        document.getElementById(
            "equipped-side-list"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        game.equipped.length ===
        0
    ) {

        container.innerHTML = `

            <div class="side-pet">

                <span>
                    No equipped pets
                </span>

            </div>

        `;

        return;

    }


    /*
        Group equipped IDs.

        Example:

        [
            cat,
            cat,
            dragon
        ]

        becomes:

        cat ×2
        dragon ×1
    */

    const equippedGroups =
        new Map();


    game.equipped.forEach(
        petId => {

            if (
                equippedGroups.has(
                    petId
                )
            ) {

                equippedGroups.set(
                    petId,
                    equippedGroups.get(
                        petId
                    ) + 1
                );

            } else {

                equippedGroups.set(
                    petId,
                    1
                );

            }

        }
    );


    equippedGroups.forEach(
        (
            quantity,
            petId
        ) => {

            const pet =
                game.inventory.find(
                    p =>
                        p.id ===
                        petId
                );


            if (!pet) {

                return;

            }


            const definition =
                PETS[
                    pet.type
                ];


            if (!definition) {

                return;

            }


            const power =
                getPetPower(
                    pet
                );


            const totalPower =
                power *
                quantity;


            const variantName =
                pet.variantName ||
                "Normal";


            const variantEmoji =
                pet.variantEmoji ||
                "";


            const displayName =
                getPetDisplayName(
                    pet
                );


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "side-pet";


            element.innerHTML = `

                <span class="side-pet-icon">

                    ${definition.icon}

                </span>


                <span>

                    ${variantEmoji}
                    ${displayName}
                    ×${quantity}

                </span>


                <span class="side-pet-power">

                    ${formatNumber(totalPower)}

                </span>

            `;


            container.appendChild(
                element
            );

        }
    );

}


/* =========================================
   WORLDS
========================================= */

function renderWorlds() {

    const cards =
        document.querySelectorAll(
            ".world-card"
        );


    if (
        !cards.length
    ) {

        return;

    }


    cards.forEach(
        card => {

            const button =
                card.querySelector(
                    "button"
                );


            const status =
                card.querySelector(
                    ".world-status"
                );


            if (!button) {

                return;

            }


            const text =
                card.textContent
                    .toLowerCase();


            let worldId =
                null;


            if (
                text.includes(
                    "void forest"
                )
            ) {

                worldId =
                    "forest";

            }


            if (
                text.includes(
                    "void"
                ) &&
                !text.includes(
                    "forest"
                )
            ) {

                worldId =
                    "void";

            }


            if (!worldId) {

                return;

            }


            const unlocked =
                game.unlockedWorlds.includes(
                    worldId
                );


            const isCurrent =
                game.currentWorld ===
                worldId;


            if (status) {

                if (isCurrent) {

                    status.textContent =
                        "CURRENT WORLD";

                } else if (unlocked) {

                    status.textContent =
                        "UNLOCKED";

                } else {

                    status.textContent =
                        `${formatNumber(
                            WORLDS[
                                worldId
                            ].cost
                        )} COINS`;

                }

            }


            if (unlocked) {

                button.textContent =
                    isCurrent

                        ? "Current World"

                        : "Enter World";


                button.onclick =
                    () => {

                        enterWorld(
                            worldId
                        );

                    };


                button.disabled =
                    isCurrent;

            } else {

                button.textContent =
                    "Unlock";


                button.disabled =
                    false;


                button.onclick =
                    () => {

                        unlockWorld(
                            worldId
                        );

                    };

            }

        }
    );

}


/* =========================================
   UNLOCK WORLD
========================================= */

function unlockWorld(
    worldId
) {

    const world =
        WORLDS[
            worldId
        ];


    if (!world) {

        return;

    }


    if (
        game.unlockedWorlds.includes(
            worldId
        )
    ) {

        enterWorld(
            worldId
        );

        return;

    }


    if (
        game.coins <
        world.cost
    ) {

        showToast(
            `You need ${formatNumber(world.cost)} Coins.`,
            "error"
        );

        return;

    }


    game.coins -=
        world.cost;


    game.unlockedWorlds.push(
        worldId
    );


    saveGame();

    renderAll();


    showToast(
        `${world.name} unlocked!`,
        "success"
    );


    enterWorld(
        worldId
    );

}


/* =========================================
   ENTER WORLD
========================================= */

function enterWorld(
    worldId
) {

    if (
        !game.unlockedWorlds.includes(
            worldId
        )
    ) {

        showToast(
            "This world is locked.",
            "error"
        );

        return;

    }


    const world =
        WORLDS[
            worldId
        ];


    if (!world) {

        return;

    }


    game.currentWorld =
        worldId;


    saveGame();

    renderAll();


    showToast(
        `Entered ${world.name}.`,
        "success"
    );

}


/* =========================================
   DAILY REWARD
========================================= */

function claimDailyReward() {

    const now =
        Date.now();


    const oneDay =
        24 *
        60 *
        60 *
        1000;


    if (
        game.dailyClaimedAt &&
        now -
        game.dailyClaimedAt <
        oneDay
    ) {

        showToast(
            "Your daily reward is not ready yet.",
            "error"
        );

        return;

    }


    game.coins +=
        500;


    game.gems +=
        25;


    game.dailyClaimedAt =
        now;


    saveGame();

    renderAll();


    showToast(
        "Daily reward claimed! +500 Coins +25 Gems",
        "success"
    );

}


/* =========================================
   DAILY BUTTON
========================================= */

function updateDailyButton() {

    const button =
        document.getElementById(
            "daily-button"
        );


    const status =
        document.getElementById(
            "daily-status"
        );


    if (
        !button ||
        !status
    ) {

        return;

    }


    if (
        !game.dailyClaimedAt
    ) {

        button.disabled =
            false;


        button.textContent =
            "Claim Reward";


        status.textContent =
            "Available now";


        return;

    }


    const oneDay =
        24 *
        60 *
        60 *
        1000;


    const remaining =
        oneDay -
        (
            Date.now() -
            game.dailyClaimedAt
        );


    if (
        remaining <=
        0
    ) {

        button.disabled =
            false;


        button.textContent =
            "Claim Reward";


        status.textContent =
            "Available now";


        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Already Claimed";


    const hours =
        Math.floor(
            remaining /
            (
                1000 *
                60 *
                60
            )
        );


    const minutes =
        Math.floor(
            (
                remaining %
                (
                    1000 *
                    60 *
                    60
                )
            ) /
            (
                1000 *
                60
            )
        );


    status.textContent =
        `Next reward in ${hours}h ${minutes}m`;

}


/* =========================================
   UI UPDATE
========================================= */

function updateUI() {

    const coins =
        document.getElementById(
            "coins"
        );


    const gems =
        document.getElementById(
            "gems"
        );


    if (coins) {

        coins.textContent =
            formatNumber(
                game.coins
            );

    }


    if (gems) {

        gems.textContent =
            formatNumber(
                game.gems
            );

    }


    const world =
        WORLDS[
            game.currentWorld
        ] ||
        WORLDS.void;


    const homeWorld =
        document.getElementById(
            "home-world"
        );


    const sideWorld =
        document.getElementById(
            "side-world"
        );


    const homeEquipped =
        document.getElementById(
            "home-equipped"
        );


    const homeIncome =
        document.getElementById(
            "home-income"
        );


    const sideIncome =
        document.getElementById(
            "side-income"
        );


    if (homeWorld) {

        homeWorld.textContent =
            world.name;

    }


    if (sideWorld) {

        sideWorld.textContent =
            world.name;

    }


    if (homeEquipped) {

        homeEquipped.textContent =
            `${getEquippedCount()} / 3`;

    }


    const income =
        getPassiveIncome();


    if (homeIncome) {

        homeIncome.textContent =
            `${formatNumber(income)} Coins/s`;

    }


    if (sideIncome) {

        sideIncome.textContent =
            formatNumber(income);

    }


    updateDailyButton();

}


/* =========================================
   RENDER EVERYTHING
========================================= */

function renderAll() {

    updateUI();

    renderPetsList();

    renderInventory();

    renderEquippedSide();

    renderWorlds();

    updateThemeButtons();

}


/* =========================================
   THEME SYSTEM
========================================= */

function setTheme(
    theme
) {

    if (
        ![
            "normal",
            "dark",
            "light"
        ].includes(
            theme
        )
    ) {

        theme =
            "normal";

    }


    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );


    localStorage.setItem(
        "voidPetsTheme",
        theme
    );


    updateThemeButtons();

}


/* =========================================
   UPDATE THEME BUTTONS
========================================= */

function updateThemeButtons() {

    const current =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) ||
        "normal";


    document
        .querySelectorAll(
            ".theme-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.theme ===
                    current
                );

            }
        );

}


/* =========================================
   LOAD THEME
========================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            "voidPetsTheme"
        ) ||
        "normal";


    setTheme(
        saved
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toast-container"
        );


    if (!container) {

        return;

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3000
    );

}


/* =========================================
   RESET GAME
========================================= */

function resetGame() {

    const confirmed =
        confirm(
            "Are you sure you want to delete your Void Pets save?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        "voidPetsSave"
    );


    game = {

        ...DEFAULT_SAVE,

        inventory: [],

        equipped: [],

        unlockedWorlds: [
            "void"
        ],

        currentWorld:
            "void",

        lastSave:
            Date.now()

    };


    selectedPetId =
        null;


    saveGame();

    renderAll();

    showPage(
        "home"
    );


    showToast(
        "Save reset.",
        "success"
    );

}


/* =========================================
   INITIALIZATION
========================================= */

loadTheme();

renderAll();

showPage(
    "home"
);


/* =========================================
   PERIODIC SAVE
========================================= */

setInterval(
    () => {

        saveGame();

    },
    5000
);


/* =========================================
   DAILY TIMER UPDATE
========================================= */

setInterval(
    () => {

        updateDailyButton();

    },
    30000
);
