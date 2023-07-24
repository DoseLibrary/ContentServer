const jwt = require('jsonwebtoken');

/**
 * 
 * @param {String} token - The token to be verified 
 * @param {*} secret - The secret key used to verify the token
 * @param {*} maxAge - The max age of the token in seconds. If not provided, the default value is the same as the token's expiry time.
 * @returns User object if the token is valid, false otherwise
 */
function validateUser(request, secret=process.env.SECRET, maxAge=0) {
    let token = request.query.token;
    const bodyToken = request.body?.token;
    if (!token && request.headers.authorization?.split(" ")[0] === "Bearer") { 
        const urlEncodedToken = request.headers.authorization.split(" ")[1];
        token = decodeURIComponent(urlEncodedToken);
    } 
    
    if (!token && bodyToken) { 
        token = request.body.token;
    } 

    let decoded;
    if (token === undefined || token === null) {
        return false;
    }

    try {
        const ignoreExpiration = maxAge !== 0;
        decoded = jwt.verify(token, secret, {ignoreExpiration: ignoreExpiration});

        if (ignoreExpiration) {
            const now = Date.now() / 1000;
            if (now > (decoded.exp + maxAge)) {
                return false;
            }
        }
        return decoded;
    } catch (e) {
        return false;
    }

}

module.exports = validateUser;
