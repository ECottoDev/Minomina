import { updateUsernameCookieExpiration } from "../../helpers/basicElements.js";

export async function rebootInstances(instance) {
    try {
        const response = await fetch(`https://bciyoxdhuqvyph7ifz3esrpjye0kivqn.lambda-url.us-east-1.on.aws/`, {//update to new link from lambda
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
        const response = await fetch(`https://4tneofgfl5ypaynrx43v66gxge0tmpdh.lambda-url.us-east-1.on.aws/`, {//update to new link from lambda
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
        const response = await fetch(`https://6ugvex4yw3ihpb4wkq742fygk40mgouw.lambda-url.us-east-1.on.aws/`, {//update to new link from lambda
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
        const response = await fetch(`https://gxhg3syyw6hdq6cw4aydmhvc2a0xgjar.lambda-url.us-east-1.on.aws/`);
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
        const response = await fetch(`https://kbbfoxeztz4nqgmo32caby7p7a0yjlke.lambda-url.us-east-1.on.aws/`, {
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
        const response = await fetch(`https://2wjnbyzleg37ugb27izordwqvq0zjucw.lambda-url.us-east-1.on.aws/`, {
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
        const response = await fetch(`https://3owjqmogs3eth7cwqq5arg3wyu0ofoxq.lambda-url.us-east-1.on.aws/`, {
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
        const response = await fetch(`https://hudj4p6r3akj3bwslmzc2orvra0lxwie.lambda-url.us-east-1.on.aws/`, {//update to new link from lambda
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


