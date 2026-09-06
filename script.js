/* =========================================================
   VoidPetsOnline
   Main Game Script
========================================================= */


/* =========================================================
   PLAYER DATA
========================================================= */

let player = {

    coins: 1000,

    diamonds: 100,

    pets: [],

    clan: null

};


/* =========================================================
   PET DATABASE
========================================================= */

const PETS = [

    {
        name: "Void Cat",
        rarity: "Common",
        power: 5,
        icon: "🐱",
        chance: 50
    },

    {
        name: "Void Dog",
        rarity: "Rare",
        power: 15,
        icon: "🐶",
        chance: 30
    },

    {
        name: "Void Fox",
        rarity: "Epic",
        power: 40,
        icon: "🦊",
        chance: 15
    },

    {
        name: "Void Dragon",
        rarity: "Legendary",
        power: 100,
        icon: "🐉",
        chance: 5
    }

];


/* =========================================================
   GAME SETTINGS
========================================================= */

const EGG_COST = 100;


/* =========================================================
   LOAD SAVE
========================================================= */

function loadGame() {

    const savedData =
        localStorage.getItem("voidPetsOnlineSave");


    if (!savedData) {

        saveGame();

        return;
    }


    try {

        const data =
            JSON.parse(savedData);


        if (data.coins !== undefined) {

            player.coins = data.coins;

        }


        if (data.diamonds !== undefined) {

            player.diamonds = data.diamonds;

        }


        if (Array.isArray(data.pets)) {

            player.pets = data.pets;

        }


        if (data.clan !== undefined) {

            player.clan = data.clan;

        }

    }

    catch (error) {

        console.error(
            "Save data could not be loaded.",
            error
        );

    }

}


/* =========================================================
   SAVE GAME
========================================================= */

function saveGame() {

    localStorage.setItem(

        "voidPetsOnlineSave",

        JSON.stringify(player)

    );

}


/* =========================================================
   RAP
========================================================= */

function getRAP() {

    let totalRAP = 0;


    player.pets.forEach(pet => {

        totalRAP += pet.power;

    });


    return totalRAP;

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateCurrencies() {

    document.getElementById(
        "coins"
    ).textContent =
        formatNumber(player.coins);


    document.getElementById(
        "diamonds"
    ).textContent =
        formatNumber(player.diamonds);


    document.getElementById(
        "rap"
    ).textContent =
        formatNumber(getRAP());


    document.getElementById(
        "weekly-player"
    ).textContent =
        formatNumber(player.diamonds)
        + " 💎";


    document.getElementById(
        "monthly-player"
    ).textContent =
        formatNumber(getRAP())
        + " RAP";


    document.getElementById(
        "pet-count"
    ).textContent =
        player.pets.length;

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(number) {

    return number.toLocaleString(
        "en-US"
    );

}


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(screenName) {

    const screens =
        document.querySelectorAll(".screen");


    screens.forEach(screen => {

        screen.classList.add("hidden");

    });


    const target =
        document.getElementById(screenName);


    if (target) {

        target.classList.remove("hidden");

    }


    if (screenName === "pets") {

        updatePets();

    }


    if (screenName === "leaderboards") {

        updateLeaderboards();

    }


    if (screenName === "clans") {

        updateClan();

    }

}


/* =========================================================
   RANDOM PET
========================================================= */

function getRandomPet() {

    const random =
        Math.random() * 100;


    let current = 0;


    for (const pet of PETS) {

        current += pet.chance;


        if (random <= current) {

            return {

                name: pet.name,

                rarity: pet.rarity,

                power: pet.power,

                icon: pet.icon

            };

        }

    }


    return {

        name: PETS[0].name,

        rarity: PETS[0].rarity,

        power: PETS[0].power,

        icon: PETS[0].icon

    };

}


/* =========================================================
   HATCH EGG
========================================================= */

function hatchEgg() {

    if (player.coins < EGG_COST) {

        alert(
            "You don't have enough Coins!"
        );

        return;
    }


    player.coins -= EGG_COST;


    const egg =
        document.getElementById(
            "egg-image"
        );


    const button =
        document.getElementById(
            "hatch-button"
        );


    const result =
        document.getElementById(
            "result"
        );


    button.disabled = true;


    egg.classList.add(
        "hatching"
    );


    result.classList.add(
        "hidden"
    );


    setTimeout(() => {

        const pet =
            getRandomPet();


        player.pets.push(pet);


        egg.classList.remove(
            "hatching"
        );


        result.classList.remove(
            "hidden"
        );


        result.innerHTML = `

            <div style="font-size:70px">
                ${pet.icon}
            </div>

            <strong>
                You hatched a ${pet.name}!
            </strong>

            <br><br>

            ⭐ Rarity:
            ${pet.rarity}

            <br>

            ⚡ Power:
            ${pet.power}

            <br><br>

            📊 Your RAP:
            ${formatNumber(getRAP())}

        `;


        button.disabled = false;


        updateCurrencies();

        saveGame();


    }, 1000);

}


/* =========================================================
   PET LIST
========================================================= */

function updatePets() {

    const list =
        document.getElementById(
            "pet-list"
        );


    if (player.pets.length === 0) {

        list.innerHTML = `

            <p>
                You don't have any pets yet.
                Go hatch an egg!
            </p>

        `;

        return;
    }


    list.innerHTML = "";


    player.pets.forEach(
        (pet, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "pet";


            element.innerHTML = `

                <div class="pet-icon">
                    ${pet.icon}
                </div>

                <div class="pet-name">
                    ${pet.name}
                </div>

                <div class="pet-rarity">
                    ⭐ ${pet.rarity}
                </div>

                <div class="pet-power">
                    ⚡ Power:
                    ${pet.power}
                </div>

            `;


            list.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   LEADERBOARDS
========================================================= */

function updateLeaderboards() {

    document.getElementById(
        "weekly-player"
    ).textContent =

        formatNumber(
            player.diamonds
        )
        + " 💎";


    document.getElementById(
        "monthly-player"
    ).textContent =

        formatNumber(
            getRAP()
        )
        + " RAP";

}


/* =========================================================
   PASSIVE INCOME
========================================================= */

/*

    The player receives Coins automatically.

    Current rate:
    +1 Coin every second.

*/

setInterval(() => {

    player.coins += 1;

    updateCurrencies();

    saveGame();

}, 1000);


/* =========================================================
   CLANS
========================================================= */

function createClan() {

    if (player.clan) {

        alert(
            "You already have a clan!"
        );

        return;
    }


    const clanName =
        prompt(
            "Enter your clan name:"
        );


    if (!clanName) {

        return;
    }


    player.clan = {

        name: clanName,

        members: 1,

        racePoints: 0

    };


    saveGame();

    updateClan();

}


function updateClan() {

    const info =
        document.getElementById(
            "clan-info"
        );


    if (!player.clan) {

        info.classList.add(
            "hidden"
        );

        return;
    }


    info.classList.remove(
        "hidden"
    );


    info.innerHTML = `

        <h3>
            🛡️ ${player.clan.name}
        </h3>

        <p>
            Members:
            ${player.clan.members}
        </p>

        <p>
            🏁 Race Points:
            ${player.clan.racePoints}
        </p>

    `;

}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    const confirmReset =
        confirm(
            "Are you sure you want to delete your save?"
        );


    if (!confirmReset) {

        return;
    }


    localStorage.removeItem(
        "voidPetsOnlineSave"
    );


    location.reload();

}


/* =========================================================
   START GAME
========================================================= */

loadGame();

updateCurrencies();

updatePets();
