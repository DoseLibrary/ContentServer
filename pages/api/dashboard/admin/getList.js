const db = require('../../../../lib/db');
const cors = require('../../../../lib/cors');
const validateUser = require('../../../../lib/validateUser');

const GetAdminList = (req, res) => {
    return new Promise(resolve => {
        res = cors(res);
        if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
            res.status(403).end();
            return;
        }

        db.any(`SELECT username, id FROM admin`)
        .then(data => {
            res.status(200).json(data);
            resolve();
        });
    });
}

export default GetAdminList;