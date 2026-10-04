// ==========================================
// CoffeeRate - Main JavaScript
// 60 Unique Coffee Bean Images
// ==========================================

const userAvatar = document.getElementById("user-avatar");
const logoutButton = document.getElementById("logout-button");

const storedUser = localStorage.getItem("coffeeRateUser");

let currentUser = null;

if (storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch (error) {
        console.error("Invalid user data.");
    }
}


// ==========================================
// User Initials
// ==========================================

function getUserInitials(name) {

    if (!name) {
        return "U";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


if (userAvatar && currentUser) {

    userAvatar.textContent =
        getUserInitials(currentUser.name);

    userAvatar.title =
        currentUser.name || "User Profile";
}


// ==========================================
// Logout
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", () => {

        localStorage.removeItem("coffeeRateUser");

        window.location.href = "auth.html";

    });

}


// ==========================================
// Coffee Data
// ==========================================

let allCoffees = [];


// ==========================================
// Image Data
// ==========================================

let coffeeImages = [];

const coffeeImageCache = {};

const usedImages = new Set();


// ==========================================
// Default Coffee Bean Image
// ==========================================

const defaultCoffeeImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Coffee_beans2.jpg/800px-Coffee_beans2.jpg";


// ==========================================
// Coffee Bean Search Queries
// ==========================================

const beanQueries = [

    "coffee beans",
    "roasted coffee beans",
    "arabica coffee beans",
    "robusta coffee beans",
    "green coffee beans",
    "coffee bean close up",
    "coffee beans macro",
    "coffee beans pile",
    "fresh coffee beans",
    "dark roasted coffee beans",
    "light roasted coffee beans",
    "medium roasted coffee beans",
    "coffee bean roasting",
    "coffee bean texture",
    "coffee bean photography",
    "coffee beans background",
    "coffee beans closeup",
    "arabica beans",
    "robusta beans",
    "roasted arabica beans"

];


// ==========================================
// Search Wikimedia Images
// ==========================================

async function searchBeanImages(query) {

    const params =
        new URLSearchParams({

            action: "query",

            format: "json",

            origin: "*",

            generator: "search",

            gsrnamespace: "6",

            gsrlimit: "50",

            gsrsearch: query,

            prop: "imageinfo",

            iiprop: "url|mime",

            iiurlwidth: "900"

        });


    const apiUrl =
        "https://commons.wikimedia.org/w/api.php?" +
        params.toString();


    try {

        const response =
            await fetch(apiUrl);

        if (!response.ok) {
            return [];
        }


        const data =
            await response.json();


        const pages =
            data.query?.pages || {};


        const images = [];


        Object.values(pages).forEach(page => {

            const info =
                page.imageinfo?.[0];

            if (!info) {
                return;
            }


            const mime =
                info.mime || "";

            if (!mime.startsWith("image/")) {
                return;
            }


            const imageUrl =
                info.thumburl ||
                info.url;


            if (!imageUrl) {
                return;
            }


            const title =
                String(page.title || "")
                    .toLowerCase();


            /*
                Reject obvious non-bean images.
            */

            const badWords = [

                "cup",
                "mug",
                "latte",
                "cappuccino",
                "espresso",
                "machine",
                "cake",
                "bread",
                "restaurant",
                "person",
                "people",
                "animal",
                "tiger",
                "cat",
                "dog",
                "building",
                "beach"

            ];


            const containsBadWord =
                badWords.some(word =>
                    title.includes(word)
                );


            if (containsBadWord) {
                return;
            }


            /*
                Keep images related to beans.
            */

            const goodWords = [

                "coffee",
                "bean",
                "arabica",
                "robusta",
                "roast"

            ];


            const containsGoodWord =
                goodWords.some(word =>
                    title.includes(word)
                );


            if (!containsGoodWord) {
                return;
            }


            if (!images.includes(imageUrl)) {

                images.push(imageUrl);

            }

        });


        return images;


    } catch (error) {

        console.error(
            "Image search error:",
            error
        );

        return [];

    }

}


// ==========================================
// Load 60+ Unique Coffee Bean Images
// ==========================================

async function loadCoffeeImages() {

    const imageSet =
        new Set();


    for (
        const query of beanQueries
    ) {

        const images =
            await searchBeanImages(query);


        for (
            const image of images
        ) {

            imageSet.add(image);


            /*
                We need more than 60
                so that filtering/loading
                has some backup images.
            */

            if (
                imageSet.size >= 80
            ) {

                break;

            }

        }


        if (
            imageSet.size >= 80
        ) {

            break;

        }

    }


    coffeeImages =
        Array.from(imageSet);


    /*
        Shuffle the complete image pool.
    */

    for (
        let i = coffeeImages.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            coffeeImages[i],
            coffeeImages[randomIndex]
        ] = [
            coffeeImages[randomIndex],
            coffeeImages[i]
        ];

    }


    console.log(
        "Unique coffee bean images found:",
        coffeeImages.length
    );


    return coffeeImages;
}


// ==========================================
// Assign UNIQUE Image
// ==========================================

function getCoffeeImage(coffee, index) {

    const coffeeId =
        coffee.id || index;


    /*
        If this coffee already has an image,
        always keep the same image.
    */

    if (
        coffeeImageCache[coffeeId]
    ) {

        return coffeeImageCache[coffeeId];

    }


    let selectedImage = null;


    /*
        Find the first image which has
        never been assigned before.
    */

    for (
        const image of coffeeImages
    ) {

        if (
            !usedImages.has(image)
        ) {

            selectedImage = image;

            break;

        }

    }


    /*
        Mark image as used.
    */

    if (selectedImage) {

        usedImages.add(
            selectedImage
        );

    }


    /*
        If there are no unused images,
        use default instead of intentionally
        duplicating another coffee's image.
    */

    if (!selectedImage) {

        selectedImage =
            defaultCoffeeImage;

    }


    coffeeImageCache[coffeeId] =
        selectedImage;


    return selectedImage;
}


// ==========================================
// Escape HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// Stars
// ==========================================

function createStars(rating) {

    const value =
        Number(rating) || 0;


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= Math.floor(value)
                ? "★"
                : "☆";

    }


    return stars;
}


// ==========================================
// Coffee Card
// ==========================================

function createCoffeeCard(
    coffee,
    index
) {

    const imageUrl =
        getCoffeeImage(
            coffee,
            index
        );


    const name =
        escapeHTML(
            coffee.name ||
            "Coffee"
        );


    const origin =
        escapeHTML(
            coffee.origin ||
            "Unknown"
        );


    const roast =
        escapeHTML(
            coffee.roast ||
            "Unknown"
        );


    const rating =
        Number(
            coffee.rating || 0
        ).toFixed(1);


    const votes =
        Number(
            coffee.votes || 0
        );


    return `

        <div class="coffee-card">

            <img
                src="${imageUrl}"
                alt="${name} coffee beans"
                class="coffee-image"
                loading="lazy"
                onerror="
                    this.onerror=null;
                    this.src='${defaultCoffeeImage}';
                "
            >

            <div class="coffee-card-content">

                <h3>
                    ${name}
                </h3>

                <p>
                    Origin: ${origin}
                </p>

                <p>
                    Roast: ${roast}
                </p>

                <div class="coffee-rating">

                    <span class="stars">
                        ${createStars(rating)}
                    </span>

                    <strong>
                        ${rating}
                    </strong>

                </div>

                <p class="vote-count">
                    ${votes} votes
                </p>

                <button
                    class="rate-button"
                    onclick="voteForCoffee(${coffee.id})"
                >
                    Rate This Coffee
                </button>

            </div>

        </div>

    `;
}


// ==========================================
// Display Coffees
// ==========================================

function displayCoffees(coffees) {

    const coffeeList =
        document.getElementById(
            "coffee-list"
        );


    if (!coffeeList) {
        return;
    }


    if (!coffees.length) {

        coffeeList.innerHTML = `
            <div class="loading">
                No coffee found.
            </div>
        `;

        return;
    }


    const cards =
        coffees.map(coffee => {

            const index =
                allCoffees.indexOf(
                    coffee
                );


            return createCoffeeCard(
                coffee,
                index
            );

        });


    coffeeList.innerHTML =
        cards.join("");

}


// ==========================================
// Search + Filter
// ==========================================

function updateCoffeeList() {

    const searchInput =
        document.getElementById(
            "coffee-search"
        );


    const filterSelect =
        document.getElementById(
            "coffee-filter"
        );


    if (
        !searchInput ||
        !filterSelect
    ) {
        return;
    }


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filter =
        filterSelect.value;


    let filtered =
        [...allCoffees];


    if (search) {

        filtered =
            filtered.filter(coffee => {

                const name =
                    String(
                        coffee.name || ""
                    ).toLowerCase();


                const origin =
                    String(
                        coffee.origin || ""
                    ).toLowerCase();


                const roast =
                    String(
                        coffee.roast || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    origin.includes(search) ||
                    roast.includes(search)
                );

            });

    }


    if (filter === "rating") {

        filtered.sort(
            (a, b) =>
                Number(b.rating || 0) -
                Number(a.rating || 0)
        );

    }


    else if (filter === "votes") {

        filtered.sort(
            (a, b) =>
                Number(b.votes || 0) -
                Number(a.votes || 0)
        );

    }


    else if (filter === "name") {

        filtered.sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        );

    }


    displayCoffees(
        filtered
    );

}


// ==========================================
// Load Coffees
// ==========================================

async function loadCoffees() {

    const coffeeList =
        document.getElementById(
            "coffee-list"
        );


    if (!coffeeList) {
        return;
    }


    try {

        coffeeList.innerHTML = `
            <div class="loading">
                Loading 60 coffee bean images...
            </div>
        `;


        /*
            Load images first.
        */

        await loadCoffeeImages();


        /*
            Load coffee records.
        */

        const response =
            await fetch(
                "/api/coffees"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load coffees"
            );

        }


        const data =
            await response.json();


        allCoffees =
            Array.isArray(data)
                ? data
                : [];


        /*
            Reset assignments.
        */

        usedImages.clear();


        Object.keys(
            coffeeImageCache
        ).forEach(key => {

            delete coffeeImageCache[key];

        });


        /*
            Check whether enough
            unique images were found.
        */

        console.log(
            "Coffee records:",
            allCoffees.length
        );

        console.log(
            "Available unique images:",
            coffeeImages.length
        );


        displayCoffees(
            allCoffees
        );


    } catch (error) {

        console.error(
            "Coffee loading error:",
            error
        );


        coffeeList.innerHTML = `
            <div class="loading">
                Unable to load coffee collection.
            </div>
        `;

    }

}


// ==========================================
// Vote
// ==========================================

async function voteForCoffee(
    coffeeId
) {

    try {

        const response =
            await fetch(
                `/api/coffees/${coffeeId}/vote`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to record vote."
            );

            return;
        }


        const updatedResponse =
            await fetch(
                "/api/coffees"
            );


        const updatedData =
            await updatedResponse.json();


        allCoffees =
            Array.isArray(updatedData)
                ? updatedData
                : [];


        updateCoffeeList();


    } catch (error) {

        console.error(
            "Voting error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// Search
// ==========================================

const searchInput =
    document.getElementById(
        "coffee-search"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        updateCoffeeList
    );

}


// ==========================================
// Filter
// ==========================================

const filterSelect =
    document.getElementById(
        "coffee-filter"
    );


if (filterSelect) {

    filterSelect.addEventListener(
        "change",
        updateCoffeeList
    );

}


// ==========================================
// Start Application
// ==========================================

loadCoffees();