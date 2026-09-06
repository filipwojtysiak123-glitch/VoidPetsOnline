/* =========================================
   VOID PETS ONLINE
   VERSION 0.1
========================================= */


/* =========================================
   PET DEFINITIONS
========================================= */

const PETS = {// =========================
// PET VARIANTS
// =========================

const PET_VARIANTS = {
    normal: {
        name: "Normal",
        multiplier: 1,
        chance: 94.44,
        emoji: ""
    },

    shiny: {
        name: "Shiny",
        multiplier: 2,
        chance: 5,
        emoji: "✨"
    },

    gold: {
        name: "Gold",
        multiplier: 5,
        chance: 0.5,
        emoji: "🟡"
    },

    rainbow: {
        name: "Rainbow",
        multiplier: 10,
        chance: 0.05,
        emoji: "🌈"
    }
};


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

        /*
            Offline earnings
        */

        const now = Date.now();

        const elapsed =
            now - loaded.lastSave;

        const maxOffline =
            8 * 60 * 60 * 1000;

        const offlineTime =
            Math.min(
                elapsed,
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
            ] || WORLDS.void;

        const offlineCoins =
            Math.floor(
                power *
                world.multiplier *
                seconds
            );

        if (offlineCoins > 0) {

            loaded.coins +=
                offlineCoins;

            setTimeout(() => {

                showToast(
                    `Offline earnings: +${formatNumber(offlineCoins)} Coins`,
                    "success"
                );

            }, 500);

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

function formatNumber(number) {

    return Math.floor(number)
        .toLocaleString("en-US");
}


/* =========================================
   GET EQUIPPED POWER
========================================= */

function getEquippedPower(
    state = game
) {

    let total = 0;

    state.equipped.forEach(
        petId => {

            const pet =
                state.inventory.find(
                    p => p.id === petId
                );

            if (!pet) return;

            const definition =
                PETS[pet.type];

            if (!definition) return;

            total +=
                definition.power;
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

setInterval(() => {

    const income =
        getPassiveIncome();

    if (income <= 0) {
        return;
    }

    game.coins += income;

    saveGame();

    updateUI();

}, 1000);


/* =========================================
   PAGE SYSTEM
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


function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );
        });


    const target =
        document.getElementById(
            `page-${pageName}`
        );

    if (!target) return;

    target.classList.add(
        "active"
    );


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

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
        });


    const data =
        PAGE_DATA[pageName];

    if (data) {

        document.getElementById(
            "page-title"
        ).textContent =
            data.title;

        document.getElementById(
            "page-subtitle"
        ).textContent =
            data.subtitle;
    }


    renderAll();


    /*
        Close mobile sidebar
    */

    document
        .querySelector(".sidebar")
        .classList.remove(
            "open"
        );
}


/* =========================================
   NAV BUTTONS
========================================= */

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

            }
        );

    });


/* =========================================
   MOBILE MENU
========================================= */

document
    .getElementById("mobile-menu")
    .addEventListener(
        "click",
        () => {

            document
                .querySelector(".sidebar")
                .classList.toggle(
                    "open"
                );

        }
    );


/* =========================================
   HATCH EGG
========================================= */

function hatchBasicEgg() {

    const price = 100;

    if (game.coins < price) {

        showToast(
            "You don't have enough Coins.",
            "error"
        );

        return;
    }


    game.coins -= price;


    /*
        Weighted RNG
    */

    const random =
        Math.random() * 100;

    let cumulative = 0;

    let selectedType =
        "void_cat";


    for (
        const type in PETS
    ) {

        cumulative +=
            PETS[type].chance;

        if (
            random <= cumulative
        ) {

            selectedType =
                type;

            break;
        }
    }


    /*
        Unique pet ID
    */

    const pet = {

        id:
            `${selectedType}_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 8)}`,

        type:
            selectedType,

        obtainedAt:
            Date.now()

    };


    game.inventory.push(
        pet
    );


    saveGame();

    renderAll();


    const definition =
        PETS[selectedType];


    showToast(
        `You hatched ${definition.name}!`,
        "success"
    );


    /*
        Show pet details
    */

    selectedPetId =
        pet.id;

    showPage("pets");

}


/* =========================================
   RENDER PET LIST
========================================= */

function renderPetsList() {

    const container =
        document.getElementById(
            "pets-list"
        );

    if (!container) return;

    container.innerHTML = "";


    if (
        game.inventory.length === 0
    ) {

        container.innerHTML = `

            <div class="panel empty-state"
                 style="grid-column:1/-1">

                <div>🥚</div>

                <h3>No Pets Yet</h3>

                <p>
                    Hatch an egg to get your first pet.
                </p>

                <br>

                <button
                    class="btn primary"
                    onclick="showPage('eggs')">

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
                PETS[pet.type];

            if (!definition) return;


            const equipped =
                game.equipped.includes(
                    pet.id
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
                    ${definition.name}
                </h3>

                <div class="pet-rarity ${definition.rarity.toLowerCase()}">
                    ${definition.rarity}
                </div>

                <div class="pet-power">
                    Power: ${definition.power}
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

    if (!container) return;


    const pet =
        game.inventory.find(
            p => p.id === selectedPetId
        );


    if (!pet) {

        container.innerHTML = `

            <div class="empty-state">

                <div>🐾</div>

                <h3>Select a Pet</h3>

                <p>
                    Select one of your pets to
                    view its statistics.
                </p>

            </div>

        `;

        return;
    }


    const definition =
        PETS[pet.type];


    const equipped =
        game.equipped.includes(
            pet.id
        );


    container.innerHTML = `

        <div class="detail-visual">
            ${definition.icon}
        </div>

        <h2 class="detail-name">
            ${definition.name}
        </h2>

        <div class="detail-rarity pet-rarity ${definition.rarity.toLowerCase()}">
            ${definition.rarity}
        </div>

        <div class="detail-stats">

            <div class="detail-stat">
                <span>Power</span>
                <strong>
                    ${definition.power}
                </strong>
            </div>

            <div class="detail-stat">
                <span>Hatch Chance</span>
                <strong>
                    ${definition.chance}%
                </strong>
            </div>

            <div class="detail-stat">
                <span>Passive Income</span>
                <strong>
                    ${definition.power}
                    Coins/s
                </strong>
            </div>

        </div>

        ${
            equipped
            ? `
                <button
                    class="btn danger full"
                    onclick="unequipPet('${pet.id}')">

                    Unequip

                </button>
            `
            : `
                <button
                    class="btn primary full"
                    onclick="equipPet('${pet.id}')">

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


    const equipLimit = 3;


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
            pet => pet.id === petId
        );


    if (!exists) return;


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
            id => id !== petId
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

    if (!container) return;

    container.innerHTML = "";


    document.getElementById(
        "inventory-count"
    ).textContent =
        game.inventory.length;


    document.getElementById(
        "inventory-equipped"
    ).textContent =
        `${game.equipped.length} / 3`;


    if (
        game.inventory.length === 0
    ) {

        container.innerHTML = `

            <div class="panel empty-state"
                 style="grid-column:1/-1">

                <div>🎒</div>

                <h3>Inventory Empty</h3>

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
                PETS[pet.type];

            if (!definition) return;


            const equipped =
                game.equipped.includes(
                    pet.id
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
                    ${definition.name}
                </h3>

                <div class="pet-rarity ${definition.rarity.toLowerCase()}">
                    ${definition.rarity}
                </div>

                <div class="pet-power">
                    Power: ${definition.power}
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

                    showPage("pets");

                }
            );


            container.appendChild(
                card
            );

        }
    );
}


/* =========================================
   SIDE EQUIPPED PETS
========================================= */

function renderEquippedSide() {

    const container =
        document.getElementById(
            "equipped-side-list"
        );

    if (!container) return;

    container.innerHTML = "";


    if (
        game.equipped.length === 0
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
                    p => p.id === petId
                );

            if (!pet) return;


            const definition =
                PETS[pet.type];


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
                    ${definition.name}
                </span>

                <span class="side-pet-power">
                    ${definition.power}
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

function unlockWorld(
    worldId
) {

    const world =
        WORLDS[worldId];

    if (!world) return;


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
        game.coins < world.cost
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
        WORLDS[worldId];

    if (!world) return;


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
        24 * 60 * 60 * 1000;


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


    game.coins += 500;

    game.gems += 25;

    game.dailyClaimedAt =
        now;


    saveGame();

    renderAll();


    showToast(
        "Daily reward claimed! +500 Coins +25 Gems",
        "success"
    );
}


function updateDailyButton() {

    const button =
        document.getElementById(
            "daily-button"
        );

    const status =
        document.getElementById(
            "daily-status"
        );

    if (!button || !status) {
        return;
    }


    if (!game.dailyClaimedAt) {

        button.disabled = false;

        button.textContent =
            "Claim Reward";

        status.textContent =
            "Available now";

        return;
    }


    const oneDay =
        24 * 60 * 60 * 1000;


    const remaining =
        oneDay -
        (
            Date.now() -
            game.dailyClaimedAt
        );


    if (remaining <= 0) {

        button.disabled = false;

        button.textContent =
            "Claim Reward";

        status.textContent =
            "Available now";

        return;
    }


    button.disabled = true;

    button.textContent =
        "Already Claimed";


    const hours =
        Math.floor(
            remaining /
            (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (
                remaining %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );


    status.textContent =
        `Next reward in ${hours}h ${minutes}m`;
}


/* =========================================
   UI UPDATE
========================================= */

function updateUI() {

    document.getElementById(
        "coins"
    ).textContent =
        formatNumber(
            game.coins
        );


    document.getElementById(
        "gems"
    ).textContent =
        formatNumber(
            game.gems
        );


    const world =
        WORLDS[
            game.currentWorld
        ] ||
        WORLDS.void;


    document.getElementById(
        "home-world"
    ).textContent =
        world.name;


    document.getElementById(
        "side-world"
    ).textContent =
        world.name;


    document.getElementById(
        "home-equipped"
    ).textContent =
        `${game.equipped.length} / 3`;


    const income =
        getPassiveIncome();


    document.getElementById(
        "home-income"
    ).textContent =
        `${formatNumber(income)} Coins/s`;


    document.getElementById(
        "side-income"
    ).textContent =
        formatNumber(income);


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
        ].includes(theme)
    ) {

        theme = "normal";
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
        lastSave: Date.now()
    };


    selectedPetId =
        null;


    saveGame();

    renderAll();

    showPage("home");


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

showPage("home");


/*
    Save periodically.
*/

setInterval(
    () => {

        saveGame();

    },
    5000
);


/*
    Update daily timer.
*/

setInterval(
    () => {

        updateDailyButton();

    },
    30000
);
