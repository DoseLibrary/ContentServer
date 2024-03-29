const db = require('../../../../lib/db');
const cors = require('../../../../lib/cors');
const validateUser = require('../../../../lib/validateUser');

const SetUserAccess = (req, res) => {
    return new Promise(resolve => {
        if (req.method !== 'POST') {
            res.status(405).send({ message: 'Only POST requests allowed' })
            return
        }
        const { id, access } = req.body;
        const setValue = access ? true : false; // Convert to boolean if weird data was sent in
        res = cors(res);

        if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
            res.status(403).end();
            return;
        }

        db.none(`UPDATE users SET has_access = $1 WHERE id = $2`, [setValue, id])
            .then(data => {
                res.status(200).json(data);
                resolve();
            });
    });
}

export default SetUserAccess;