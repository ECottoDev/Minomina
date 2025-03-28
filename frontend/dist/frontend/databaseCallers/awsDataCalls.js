import { updateUsernameCookieExpiration } from "../../helpers/basicElements.js";

export async function rebootInstances(instance) {
    try {
        const response = await fetch(`https://stvjomxfk6wz24dqfr53yzrgk40ktllw.lambda-url.us-east-2.on.aws/`, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Instance: instance }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Assuming data is already structured correctly by Lambda
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
export async function startInstances(instance) {
    console.log(instance)
    try {
        const response = await fetch(`https://zebjxwtn242jrfidqgrs3daae40cjhqw.lambda-url.us-east-2.on.aws/`, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Instance: instance }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Assuming data is already structured correctly by Lambda
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
export async function stopInstances(instance) {
    try {
        const response = await fetch(`https://b55djaqswj7qb5hk3qczg4zkby0jczvk.lambda-url.us-east-2.on.aws/`, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Instance: instance }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Assuming data is already structured correctly by Lambda
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


export async function getInstances() {
    try {
        const response = await fetch(`https://3pebkutpk44hi7aclissxba7ee0vwvof.lambda-url.us-east-2.on.aws/`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
// Simple Caesar Cipher Encryption/Decryption (Insecure)
function simpleEncrypt(text) {
    const shift = 7; // Shift each character by 3
    return text.split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) + shift))
        .join('');
}


export async function login(username, pass, success = () => { }, fail = () => { }) {
    if (!username || !pass) {
        const errorMessage = 'Username and password are required';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    const password = simpleEncrypt(pass)
    try {
        const response = await fetch(`https://o67fdzvwsb7dlxpfj23z32ecyq0hfvit.lambda-url.us-east-2.on.aws/`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            fail();
            throw new Error(`Failed to login. HTTP status: ${response.status}`);
        }
        const data = await response.json();
        success();
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        // fail();
        throw error;
    }
}

export async function subscription(email) {
    try {
        const response = await fetch(``, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            // throw new Error(`Failed to verify session. HTTP status: ${response.status}`);
            return { success: false };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export async function verifySession(username) {
    try {
        const response = await fetch(`https://ydc2lqry764mlvugvoilsxm55q0adajz.lambda-url.us-east-2.on.aws/`, {
            method: 'POST',
            body: JSON.stringify({ username })
        });
        if (!response.ok) {
            // throw new Error(`Failed to verify session. HTTP status: ${response.status}`);
            return { success: false };
        }
        await updateUsernameCookieExpiration(username);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error verifying session:', error);
        throw error;
    }
}
export async function logout(user) {
    try {
        const response = await fetch(`https://4klo2jyhlvg5rnkavketh7eoqi0kxtwo.lambda-url.us-east-2.on.aws/`, {//update to new link from lambda
            method: 'POST', // Change to POST method
            body: JSON.stringify({ username: user }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Assuming data is already structured correctly by Lambda
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


