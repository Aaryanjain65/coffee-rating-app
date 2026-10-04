const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = require("./database/database");

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 3000;

// =============================
// Middleware
// =============================

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// =============================
// Main Page
// =============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =============================
// Get All Coffees
// =============================

app.get("/api/coffees", (req, res) => {

    const sql = `
        SELECT *
        FROM coffees
        ORDER BY rating DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error("Coffee fetch error:", err.message);

            return res.status(500).json({
                error: "Failed to fetch coffees"
            });
        }

        res.json(rows);
    });
});

// =============================
// Vote for Coffee
// =============================

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

    db.run(sql, [coffeeId], function (err) {

        if (err) {
            console.error("Vote error:", err.message);

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
    });
});

// =============================
// Register User
// =============================

app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            error: "Name, email and password are required"
        });
    }

    if (password.length < 6) {

        return res.status(400).json({
            error: "Password must be at least 6 characters"
        });
    }

    try {

        db.get(
            "SELECT id FROM users WHERE email = ?",
            [email.trim().toLowerCase()],
            async (err, user) => {

                if (err) {

                    console.error("User check error:", err.message);

                    return res.status(500).json({
                        error: "Database error"
                    });
                }

                if (user) {

                    return res.status(409).json({
                        error: "Email already registered"
                    });
                }

                const hashedPassword = await bcrypt.hash(
                    password,
                    10
                );

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

                            console.error(
                                "Registration error:",
                                err.message
                            );

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

        console.error("Registration server error:", error);

        res.status(500).json({
            error: "Server error"
        });
    }
});

// =============================
// Login User
// =============================

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

                    console.error(
                        "Login database error:",
                        err.message
                    );

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

        console.error("Login server error:", error);

        res.status(500).json({
            error: "Server error"
        });
    }
});

// =============================
// Handle Unknown Routes
// =============================

app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });
});

// =============================
// Start Server
// =============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `CoffeeRate server running on port ${PORT}`
    );

});