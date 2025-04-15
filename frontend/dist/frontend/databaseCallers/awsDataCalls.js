import { updateUsernameCookieExpiration } from "../../helpers/basicElements.js";

const link = 'https://rrooxjwdksx6uizlc6brxjs4ye0qreet.lambda-url.us-east-2.on.aws/'

export async function rebootInstances(Instance) {
    try {
        const response = await fetch( link, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Use:{ Instance }, Key: 'reboot' }),
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


export async function startInstances(Instance) {
    try {
        const response = await fetch( link, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Use:{ Instance }, Key: 'start' }),
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


export async function stopInstances(Instance) {
    try {
        const response = await fetch( link, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Use:{ Instance }, Key: 'stop' }),
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

export async function apiTest(instance) {
    try {
        const response = await fetch( link, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Use:{ Instance: instance }, Key:'start' }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data; // Assuming data is already structured correctly by Lambda
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function getInstances() {
    try {
        const response = await fetch( link,
        {
            method: 'PUT',
            body: JSON.stringify({Use:{}, Key:'refresh' }),
        });
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
        const response = await fetch(link, {
            method: 'POST',
            body: JSON.stringify({ Use: {username, password}, Key: 'login' })
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

export async function verifySession(username) {
    try {
        const response = await fetch( link, {
            method: 'POST',
            body: JSON.stringify({ Use:{username}, Key: 'verify'  })
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
        const response = await fetch( link, {//update to new link from lambda
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


