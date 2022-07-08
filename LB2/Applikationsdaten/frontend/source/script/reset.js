const registerInfo = document.querySelector(".register-info");


async function sendRegister(registerdata) {
    try {
        let url = "http://127.0.0.1/api/user/register"
        await fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            header: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(registerdata)
        });
    } catch (error) {
        console.log(error)
        registerInfo.style.display = "block";
        registerInfo.childNodes[0].textContent = `Fehler bei der Übertragung ${error}`;
    }
}

const closeRegisterInfoButton = document.querySelector(".register-info__close-window");
closeRegisterInfoButton.addEventListener("click", () => {
    registerInfo.style.display = "none";
});

const registerForm = document.querySelector(".register-form");
const registerSubmitButton = document.querySelector(".form-element__submit-button");
const registerFormEmail = document.querySelector(".register-form-email");
const registerFormPassword = document.querySelector(".register-form-password");
const registerFormPasswordRepeat = document.querySelector(".register-form-password-repeat");
const registerFormInfo = document.querySelector(".form-element__info");
const registerFormInfoP = document.querySelector(".form-element__info").childNodes[1];

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (registerFormEmail.search(/@./gi)) {
        registerFormInfo.style.display = "none";
    
        if (registerFormPassword.search(/[1-9][a-z][A-Z]/gi)) {
            registerFormInfo.style.display = "none";
            
            if (registerFormPassword === registerFormPasswordRepeat) {
                registerFormInfo.style.display = "none";
                sendRegister({email: registerFormEmail.value});

            } else {
                registerFormInfo.style.display = "block";
                formElementInfoP.textContent = "Password do not match";
            }
        } else {
            registerFormInfo.style.display = "block";
            formElementInfoP.textContent = "Password is to weak"
        }
    } else {
        registerFormInfo.style.display = "block";
        formElementInfoP.textContent = "Not an E-Mail";
    }
});

const showPasswordButton = document.querySelector(".show-password-button");
const showPasswordButtonImage = document.querySelector(".show-password-button__image");
const showPasswordButtonText = document.querySelector(".show-password-button__text");

let showPasswordToggle = 0;

showPasswordButton.addEventListener("click", function(){
    if (showPasswordToggle == 0) {
        registerFormPassword.type = "text";
        showPasswordButtonImage.src = "./source/img/login/eye-open.png";
        showPasswordButtonText.textContent = "hide"
        showPasswordToggle = 1;
    } else {
        registerFormPassword.type = "password";
        showPasswordButtonImage.src = "./source/img/login/eye-closed.png";
        showPasswordButtonText.textContent = "show"
        showPasswordToggle = 0;
    }
}); 

