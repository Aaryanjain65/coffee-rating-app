const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = require("./database/database");

const app = express();
const PORT = 3000;


// Middleware
app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// Get all coffee items
app.get("/api/coffees", (req, res) => {

    const sql =
        "SELECT * FROM coffees ORDER BY rating DESC";

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(err.message);

            return res.status(500).json({
                error: "Failed to fetch coffees"
            });
        }

        res.json(rows);
    });
});


// Vote for a coffee
app.post("/api/coffees/:id/vote", (req, res) => {

    const coffeeId = req.params.id;

    const sql = `
        UPDATE coffees
        SET
            votes = votes + 1,
            rating = CASE
                WHEN rating < 5 THEN rating + 1
                ELSE 5
            END
        WHERE id = ?
    `;

    db.run(
        sql,
        [coffeeId],
        function (err) {

            if (err) {

                console.error(err.message);

                return res.status(500).json({
                    error: "Failed to record vote"
                });
            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error: "Coffee not found"
                });
            }

            res.json({
                message: "Vote recorded successfully"
            });
        }
    );
});


// Register new user
app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;


    // Check required fields
    if (!name || !email || !password) {

        return res.status(400).json({
            error: "Name, email and password are required"
        });
    }


    // Check password length
    if (password.length < 6) {

        return res.status(400).json({
            error: "Password must be at least 6 characters"
        });
    }


    try {

        // Check whether email already exists
        db.get(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, user) => {

                if (err) {

                    console.error(err.message);

                    return res.status(500).json({
                        error: "Database error"
                    });
                }


                if (user) {

                    return res.status(409).json({
                        error: "Email already registered"
                    });
                }


                // Hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);


                // Insert user
                const sql = `
                    INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)
                `;


                db.run(
                    sql,
                    [
                        name.trim(),
                        email.trim().toLowerCase(),
                        hashedPassword
                    ],
                    function (err) {

                        if (err) {

                            console.error(err.message);

                            return res.status(500).json({
                                error: "Failed to create account"
                            });
                        }


                        res.status(201).json({
                            message: "Account created successfully",
                            userId: this.lastID
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
});

// Login user
app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            error: "Email and password are required"
        });

    }

    try {

        db.get(
            "SELECT * FROM users WHERE email = ?",
            [email.trim().toLowerCase()],
            async (err, user) => {

                if (err) {

                    console.error(err.message);

                    return res.status(500).json({
                        error: "Database error"
                    });

                }

                if (!user) {

                    return res.status(401).json({
                        error: "Invalid email or password"
                    });

                }

                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!passwordMatch) {

                    return res.status(401).json({
                        error: "Invalid email or password"
                    });

                }

                res.json({

                    message: "Login successful",

                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }

                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

});

// Main page
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// Start server
app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});