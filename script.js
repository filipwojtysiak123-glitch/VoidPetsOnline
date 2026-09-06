/* =========================================
   VOID PETS ONLINE
   VERSION 0.3
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
            lastSave: Date.now()
        };

    }


    try {

        const parsed =
            JSON.parse(saved);


        const loaded = {
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


        loaded.equipped =
            loaded.equipped.filter(
                id =>
                    loaded.inventory.some(
                        pet =>
                            pet.id === id
                    )
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
                offlineTime / 1000
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


        return loaded;


    } catch (error) {

        console.error(
            "Save loading error:",
            error
        );


        return {
            ...DEFAULT_SAVE,
            lastSave: Date.now()
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
        JSON.stringify(game)
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
        PETS[pet.type];


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

    let total = 0;


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
    ) <
    SHINY_CHANCE;

}


/* =========================================
   ROLL HUGE
========================================= */

function rollHuge() {

    return (
        Math.random() *
        100
    ) <
    HUGE_CHANCE;

}


/* =========================================
   ROLL SECRET
========================================= */

function rollSecret() {

    return (
        Math.random() *
        100
    ) <
    SECRET_CHANCE;

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
        EVERY VARIANT IS ROLLED
        SEPARATELY.

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
        START WITH GOLD / RAINBOW
        MULTIPLIER.
    */

    let multiplier =
        material.multiplier;


    /*
        SHINY STACKS WITH EVERYTHING.
    */

    if (shiny) {

        multiplier *=
            SHINY_MULTIPLIER;

    }


    /*
        HUGE STACKS WITH EVERYTHING.
    */

    if (huge) {

        multiplier *=
            HUGE_MULTIPLIER;

    }


    /*
        SECRET STACKS WITH EVERYTHING.

        Secret is the strongest
        special variant.
    */

    if (secret) {

        multiplier *=
            SECRET_MULTIPLIER;

    }


    /*
        FINAL POWER
    */

    const power =
        Math.floor(
            definition.power *
            multiplier
        );


    /* =====================================
       BUILD VARIANT NAME
    ===================================== */

    const variantParts = [];


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
            ? variantParts.join(" ")
            : "Normal";


    /* =====================================
       BUILD VARIANT EMOJIS
    ===================================== */

    const variantEmojis = [];


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
       RETURN PET
    ===================================== */

    return {

        id:
            `${type}_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 10)}`,

        type:
            type,

        obtainedAt:
            Date.now(),


        /*
            MATERIAL
        */

        variant:
            material.name.toLowerCase(),


        /*
            FULL VARIANT NAME
        */

        variantName:
            variantName,


        /*
            EMOJIS
        */

        variantEmoji:
            variantEmoji,


        /*
            SPECIAL FLAGS
        */

        shiny:
            shiny,

        huge:
            huge,

        secret:
            secret,


        /*
            POWER
        */

        basePower:
            definition.power,

        variantMultiplier:
            multiplier,

        power:
            power

    };

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


    game.inventory.push(
        pet
    );


    selectedPetId =
        pet.id;


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
        `You hatched ${variantText}${definition.name}!`,
        "success"
    );

}


/* =========================================
   RENDER PETS
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
                game.equipped.includes(
                    pet.id
                );


            const power =
                getPetPower(
                    pet
                );


            const variantName =
                pet.variantName ||
                "Normal";


            const variantEmoji =
                pet.variantEmoji ||
                "";


            const displayName =
                variantName ===
                "Normal"

                    ? definition.name

                    : `${variantName} ${definition.name}`;


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


                ${
                    pet.secret

                    ? `

                        <div class="equipped-badge">

                            SECRET

                        </div>

                    `

                    : ""
                }


                ${
                    equipped

                    ? `

                        <div class="equipped-badge">

                            EQUIPPED

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
        game.equipped.includes(
            pet.id
        );


    const power =
        getPetPower(
            pet
        );


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
        variantName ===
        "Normal"

            ? definition.name

            : `${variantName} ${definition.name}`;


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
                    Power
                </span>

                <strong>
                    ${formatNumber(power)}
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
            equipped

            ? `

                <button
                    class="btn danger full"
                    onclick="unequipPet('${pet.id}')"
                >

                    Unequip

                </button>

            `

            : `

                <button
                    class="btn primary full"
                    onclick="equipPet('${pet.id}')"
                >

                    Equip

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

    if (
        game.equipped.includes(
            petId
        )
    ) {

        return;

    }


    const equipLimit =
        3;


    if (
        game.equipped.length >=
        equipLimit
    ) {

        showToast(
            `Equip limit reached: ${equipLimit} pets.`,
            "error"
        );

        return;

    }


    const exists =
        game.inventory.some(
            pet =>
                pet.id ===
                petId
        );


    if (!exists) {

        return;

    }


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
   UNEQUIP PET
========================================= */

function unequipPet(
    petId
) {

    game.equipped =
        game.equipped.filter(
            id =>
                id !==
                petId
        );


    saveGame();

    renderAll();


    showToast(
        "Pet unequipped.",
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

        count.textContent =
            game.inventory.length;

    }


    if (equippedCount) {

        equippedCount.textContent =
            `${game.equipped.length} / 3`;

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
                game.equipped.includes(
                    pet.id
                );


            const power =
                getPetPower(
                    pet
                );


            const variantName =
                pet.variantName ||
                "Normal";


            const variantEmoji =
                pet.variantEmoji ||
                "";


            const displayName =
                variantName ===
                "Normal"

                    ? definition.name

                    : `${variantName} ${definition.name}`;


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


                ${
                    equipped

                    ? `

                        <div class="equipped-badge">

                            EQUIPPED

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


    game.equipped.forEach(
        petId => {

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


            const variantName =
                pet.variantName ||
                "Normal";


            const variantEmoji =
                pet.variantEmoji ||
                "";


            const displayName =
                variantName ===
                "Normal"

                    ? definition.name

                    : `${variantName} ${definition.name}`;


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

                </span>


                <span class="side-pet-power">

                    ${formatNumber(power)}

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
                            WORLDS[worldId].cost
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
            `${game.equipped.length} / 3`;

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
