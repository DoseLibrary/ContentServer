const db = require('../../../../lib/db');
const Logger = require('../../../../lib/logger');
const validateUser = require('../../../../lib/validateUser');
const cors = require('../../../../lib/cors');


const GetLibraries = (req, res) => {
    return new Promise(resolve => {
        res = cors(res);
        if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
            res.status(403).end();
            return;
        }

        db.any(`SELECT * FROM library`)
        .then(data => {
            res.status(200).json(data);
            resolve();
        });
    });
}

export default GetLibraries;