const statusInfo = document.querySelector(".status-info");
const statusInfoMessage = document.querySelector(".status-info__message");

//Sendet die Informationen fürs Login an das Backend
async function sendJSONToBackend(url, JSONData) {
    statusInfo.style.display = "none";
    statusInfoMessage.textContent = "";
    try {
        const response = await fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSONData)
        })
        return response;
        if(response != ok) {
            throw new Error();
        }
    } catch (error) {
        console.error(error)

    }
}

function showStatus(Errormessage) {
    statusInfo.style.display = "flex";
    statusInfoMessage.textContent = Errormessage;
}

const loginForm = document.querySelector("#login-menu__form")
const passwordResetForm = document.querySelector("#login-reset-menu");

const resetPasswordButton = document.querySelector("#login-menu-button-reset-password");
const backToLoginButton = document.querySelector("#login-reset-menu-button-cancel");

resetPasswordButton.addEventListener("click", function() {
    loginForm.style.display = "none";
    passwordResetForm.style.display = "block";
});

backToLoginButton.addEventListener("click", function() {
    passwordResetForm.style.display = "none";
    loginForm.style.display = "block";
});

const loginFormEmail = document.querySelector("[name='login-email']");
const loginFormPassword = document.querySelector("[name='login-password']");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (loginFormEmail.value.trim() !== "" && !loginFormEmail.value.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

        //Klassen hinzufügen

        loginFormEmail.classList.remove("input-outline--red")
        loginFormPassword.classList.remove("input-outline--red")
        loginFormEmail.classList.add("input-outline--green")
        loginFormPassword.classList.add("input-outline--green")

        if (loginFormPassword.value.trim() !== "") {

            loginFormEmail.classList.add("input-outline--green")
            loginFormPassword.classList.add("input-outline--green")
            
            sendJSONToBackend("http://127.0.0.1:3000/api/user/login", {email: loginFormEmail.value, password: loginFormPassword.value}, loginInfo)
            .then((response) => response.json())
            .then((data) => {
                //Error Handling
            });

        } else {
            loginFormEmail.classList.remove("input-outline--green")
            loginFormPassword.classList.remove("input-outline--green")
            loginFormEmail.classList.add("input-outline--red")
            loginFormPassword.classList.add("input-outline--red")
        }
    } else {
        loginFormEmail.classList.remove("input-outline--green")
        loginFormPassword.classList.remove("input-outline--green")
        loginFormEmail.classList.add("input-outline--red")
        loginFormPassword.classList.add("input-outline--red")
    }
});

/*
const showPasswordButton = document.querySelector(".show-password-button");
const showPasswordButtonImage = document.querySelector(".show-password-button__image");
const showPasswordButtonText = document.querySelector(".show-password-button__text");

let showPasswordToggle = 0;

showPasswordButton.addEventListener("click", function(){
    if (showPasswordToggle == 0) {
        loginFormPassword.type = "text";
        showPasswordButtonImage.src = "./source/img/login/eye-open.png";
        showPasswordButtonText.textContent = "hide"
        showPasswordToggle = 1;
    } else {
        loginFormPassword.type = "password";
        showPasswordButtonImage.src = "./source/img/login/eye-closed.png";
        showPasswordButtonText.textContent = "show"
        showPasswordToggle = 0;
    }
}); 

*/

const resetPasswordForm = document.querySelector("#login-reset-menu__form");
const resetPasswordFormEmail = document.querySelector("[name='login-reset-email']");

const loginSuccessMenu = document.querySelector("#login-success-menu");

resetPasswordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (resetPasswordFormEmail.value !== "" && !resetPasswordFormEmail.value.search(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

        resetPasswordFormEmail.classList.remove("input-outline--red")
        resetPasswordFormEmail.classList.add("input-outline--green")

        sendJSONToBackend("http://127.0.0.1:3000/api/user/reset", {email: resetPasswordFormEmail.value}, loginInfo)
        .then((response) => response.json())
        .then((data) => {

            resetPasswordForm.style.display = "none";
            loginSuccessMenu.style.display = "block";
        });
    
    } else {
        resetPasswordFormEmail.classList.remove("input-outline--green")
        resetPasswordFormEmail.classList.add("input-outline--red")
    }
});
