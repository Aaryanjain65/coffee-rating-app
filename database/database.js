const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "coffee.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(
            "Database connection failed:",
            err.message
        );
    } else {
        console.log("SQLite database connected");
    }
});


/*
    Create / update Coffee table
*/

function setupCoffeeTable() {

    db.all(
        "PRAGMA table_info(coffees)",
        [],
        (err, columns) => {

            if (err) {
                console.error(
                    "Checking coffee table failed:",
                    err.message
                );
                return;
            }

            /*
                If old coffee table exists with old structure,
                recreate only the coffee table.

                Users table is NOT touched.
            */

            const hasOrigin =
                columns.some(
                    (column) => column.name === "origin"
                );

            const hasRoast =
                columns.some(
                    (column) => column.name === "roast"
                );

            if (columns.length > 0 && (!hasOrigin || !hasRoast)) {

                console.log(
                    "Old coffee table detected. Updating structure..."
                );

                db.run(
                    "DROP TABLE IF EXISTS coffees",
                    (err) => {

                        if (err) {
                            console.error(
                                "Failed to update coffee table:",
                                err.message
                            );
                            return;
                        }

                        createCoffeeTable();
                    }
                );

            } else {

                createCoffeeTable();

            }
        }
    );
}


/*
    Create Coffee table
*/

function createCoffeeTable() {

    db.run(`
        CREATE TABLE IF NOT EXISTS coffees (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            origin TEXT,
            roast TEXT,
            rating REAL DEFAULT 0,
            votes INTEGER DEFAULT 0
        )
    `, (err) => {

        if (err) {
            console.error(
                "Coffee table error:",
                err.message
            );
            return;
        }

        console.log("Coffee table ready");

        seedCoffeeData();

    });
}


/*
    Load Workora coffee seed JSON
*/

function seedCoffeeData() {

    const possibleFiles = [

        path.join(
            __dirname,
            "..",
            "coffee_rating_seed.json"
        ),

        path.join(
            __dirname,
            "..",
            "coffee_rating_seed (1).json"
        )

    ];

    let seedPath = null;

    for (const file of possibleFiles) {

        if (fs.existsSync(file)) {
            seedPath = file;
            break;
        }

    }


    if (!seedPath) {

        console.error(
            "Coffee seed file not found."
        );

        console.error(
            "Put coffee_rating_seed.json in the project root folder."
        );

        return;

    }


    let seedData;

    try {

        seedData = JSON.parse(
            fs.readFileSync(
                seedPath,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Failed to read coffee seed file:",
            error.message
        );

        return;

    }


    if (!Array.isArray(seedData)) {

        console.error(
            "Coffee seed file must contain an array."
        );

        return;

    }


    /*
        Check existing coffee records.

        If old data exists, replace it.
        If 60 seed records already exist,
        don't insert again on every server restart.
    */

    db.get(
        "SELECT COUNT(*) AS count FROM coffees",
        [],
        (err, row) => {

            if (err) {

                console.error(
                    "Checking coffee records failed:",
                    err.message
                );

                return;

            }


            /*
                Already seeded.
            */

            if (row.count === seedData.length) {

                console.log(
                    `${row.count} coffee records already exist`
                );

                return;

            }


            /*
                Delete old coffee records only.
                Users remain completely safe.
            */

            db.run(
                "DELETE FROM coffees",
                [],
                (err) => {

                    if (err) {

                        console.error(
                            "Failed to delete old coffee data:",
                            err.message
                        );

                        return;

                    }


                    console.log(
                        "Old coffee data deleted"
                    );


                    /*
                        Reset coffee ID sequence
                    */

                    db.run(
                        "DELETE FROM sqlite_sequence WHERE name = 'coffees'",
                        [],
                        () => {

                            insertSeedData(seedData);

                        }
                    );

                }
            );

        }
    );

}


/*
    Insert JSON seed data into SQLite
*/

function insertSeedData(seedData) {

    const sql = `
        INSERT INTO coffees
        (
            id,
            name,
            origin,
            roast,
            rating,
            votes
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    const statement =
        db.prepare(sql);


    seedData.forEach((coffee) => {

        statement.run(
            coffee.id,
            coffee.name,
            coffee.origin,
            coffee.roast,
            coffee.rating,
            coffee.votes
        );

    });


    statement.finalize((err) => {

        if (err) {

            console.error(
                "Coffee seed insertion failed:",
                err.message
            );

            return;

        }


        console.log(
            `${seedData.length} coffee records inserted successfully`
        );

    });

}


/*
    Users table
    Existing users are preserved.
*/

function setupUsersTable() {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {

        if (err) {

            console.error(
                "Users table error:",
                err.message
            );

        } else {

            console.log(
                "Users table ready"
            );

        }

    });

}


/*
    Start database setup
*/

setupCoffeeTable();
setupUsersTable();


module.exports = db;