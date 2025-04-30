import { updateUsernameCookieExpiration } from "../../helpers/basicElements.js";
import { config } from "../../config.js";

// const link = 'https://3pglejwdppysefv2sz5l4m6wqe0ephtt.lambda-url.us-east-2.on.aws/'
const link = 'https://bsfev7vemoo63wvpxa7u5o44ui0obxxw.lambda-url.us-east-2.on.aws/'

export async function rebootInstances(Instance) {
    try {
        const response = await fetch( link, {//update to new link from lambda
            method: 'PUT', // Change to POST method
            body: JSON.stringify({ Use:{ Instance, email: config.receiveEmail, action: 'Reboot' }, Key: 'reboot', Retry: false }),
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
            body: JSON.stringify({ Use:{ Instance, email: config.receiveEmail, action: 'Start'  }, Key: 'start', Retry: false }),
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
            body: JSON.stringify({ Use:{ Instance, email: config.receiveEmail, action: 'Stop'  }, Key: 'stop', Retry: false }),
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
        const response = await fetch( link,
        {
            method: 'PUT',
            body: JSON.stringify({Use:{ email: config.receiveEmail }, Key:'update', Retry: false }),
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
    
    const password = simpleEncrypt(pass);
    try {
        const response = await fetch(link, {
            method: 'POST',
            body: JSON.stringify({ Use: {username, password}, Key: 'login', Retry: false })
        });

        if (!response.ok) {
            fail();
            throw new Error(`Failed to login. HTTP status: ${response.status}`);
        }
        const data = await response.json();
        if (data.valid == false) {
            fail();
            return data;
        }
        else{
        success();
        return data;
            
        }
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
            body: JSON.stringify({ Use:{username}, Key: 'verify', Retry: false  })
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
            body: JSON.stringify({ Use: { username: user}, Key:'logout', Retry: false }),
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


