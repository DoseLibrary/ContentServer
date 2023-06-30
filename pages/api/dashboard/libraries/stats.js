const db = require('../../../../lib/db');
const Logger = require('../../../../lib/logger');
const validateUser = require('../../../../lib/validateUser');
const cors = require('../../../../lib/cors');


const GetStats = (req, res) => {
    const libtype = req.query.libtype
    const id = req.query.id
    console.log(req.query)
    return new Promise(resolve => {
        res = cors(res);
        if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
            res.status(403).end();
            return;
        }

        //if (typeof id != Number) {
          //  res.status(403).end();
        //}
        console.log(libtype)
        let query = "";

        if (libtype == "MOVIES") {
            query = `SELECT COUNT(*) FROM movie where library=${id}`;
        }

        
        if (libtype == "SERIES") {
            query = `SELECT COUNT(*) FROM serie where library=${id}`;
        }
        console.log(query)

        if (query == "") {
            res.status(403).end();
            return
        }



        db.any(query)
        .then(data => {
            console.log(data)
            res.status(200).json({'count': data[0].count});
            resolve();
        });
    });
}

export default GetStats;