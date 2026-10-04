const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

const registerMessage =
    document.getElementById("register-message");

const loginMessage =
    document.getElementById("login-message");


// Register
if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const name =
                document.getElementById("register-name").value.trim();

            const email =
                document.getElementById("register-email").value.trim();

            const password =
                document.getElementById("register-password").value;

            registerMessage.textContent =
                "Creating account...";

            try {

                const response =
                    await fetch("/api/register", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })

                    });

                const data =
                    await response.json();

                if (!response.ok) {

                    registerMessage.textContent =
                        data.error || "Registration failed.";

                    return;
                }

                registerMessage.textContent =
                    "Account created successfully.";

                registerForm.reset();

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                registerMessage.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}


// Login
if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById("login-email").value.trim();

            const password =
                document.getElementById("login-password").value;

            loginMessage.textContent =
                "Logging in...";

            try {

                const response =
                    await fetch("/api/login", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })

                    });

                const data =
                    await response.json();

                if (!response.ok) {

                    loginMessage.textContent =
                        data.error || "Login failed.";

                    return;
                }

                // Save logged-in user
                localStorage.setItem(
                    "coffeeRateUser",
                    JSON.stringify(data.user)
                );

                loginMessage.textContent =
                    "Login successful.";

                // Go to Home page
                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 500);

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                loginMessage.textContent =
                    "Unable to connect to server.";

            }

        }
    );

}