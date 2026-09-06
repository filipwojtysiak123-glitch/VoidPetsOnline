let coins = 1000;
let diamonds = 100;

let pets = [];


// ============================
// SCREEN SYSTEM
// ============================

function showScreen(screenName) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    document.getElementById(screenName).classList.remove("hidden");

    if (screenName === "pets") {
        updatePets();
    }
}


// ============================
// CURRENCY
// ============================

function updateCurrencies() {

    document.getElementById("coins").textContent = coins;
    document.getElementById("diamonds").textContent = diamonds;

}


// ============================
// EGG SYSTEM
// ============================

function hatchEgg() {

    const eggCost = 100;

    if (coins < eggCost) {

        alert("Not enough Coins!");

        return;
    }

    coins -= eggCost;

    updateCurrencies();


    // RANDOM PET

    const random = Math.random();

    let pet;


    if (random < 0.50) {

        pet = {
            name: "Void Cat",
            rarity: "Common",
            power: 5
        };

    } else if (random < 0.80) {

        pet = {
            name: "Void Dog",
            rarity: "Rare",
            power: 15
        };

    } else if (random < 0.95) {

        pet = {
            name: "Void Fox",
            rarity: "Epic",
            power: 40
        };

    } else {

        pet = {
            name: "Void Dragon",
            rarity: "Legendary",
            power: 100
        };

    }


    pets.push(pet);


    const result = document.getElementById("result");

    result.classList.remove("hidden");

    result.innerHTML = `
        🎉 You hatched a pet!<br><br>

        🐾 <strong>${pet.name}</strong><br>

        ⭐ ${pet.rarity}<br>

        ⚡ Power: ${pet.power}
    `;

}


// ============================
// PETS
// ============================

function updatePets() {

    const list = document.getElementById("pet-list");

    if (pets.length === 0) {

        list.innerHTML = `
            <p>You don't have any pets yet.</p>
        `;

        return;
    }


    list.innerHTML = "";


    pets.forEach((pet, index) => {

        const element = document.createElement("div");

        element.className = "pet";

        element.innerHTML = `
            🐾 <strong>${pet.name}</strong><br>
            ⭐ ${pet.rarity}<br>
            ⚡ Power: ${pet.power}
        `;

        list.appendChild(element);

    });

}


// ============================
// START
// ============================

updateCurrencies();
