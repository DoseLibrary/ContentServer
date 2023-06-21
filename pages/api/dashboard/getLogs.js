const fs = require('fs');
const path = require('path');

const cors = require('../../../lib/cors');
const validateUser = require('../../../lib/validateUser');

const GetLogs = (req, res) => {
    return new Promise(resolve => {
        res = cors(res);

        const token = req.query.token;

        if (!validateUser(token, process.env.DASHBOARD_SECRET)) {
            res.status(403).end();
            return;
        }

        let dateString = req.query.date;
        const logGroup = req.query.group;

        if(dateString == null) {
            const d = new Date();
            dateString = d.toDateString().split(" ").join("."); 
        }

        const logDir = path.resolve(__dirname, `../../../../../logs/${dateString}`);

        if (!fs.existsSync(logDir)){
            res.status(404).json({"message": "No log directory found"});
        }

        let logs = {
            "info": fs.createReadStream(path.join(logDir, `${dateString}_info.log`), 'utf8'),
            "warning": fs.createReadStream(path.join(logDir, `${dateString}_warning.log`), 'utf8'),
            "error": fs.createReadStream(path.join(logDir, `${dateString}_error.log`), 'utf8'),
            "debug": fs.createReadStream(path.join(logDir, `${dateString}_debug.log`), 'utf8'),
            "all": fs.createReadStream(path.join(logDir, `${dateString}_all.log`), 'utf8')
        };

        if (!(logGroup in logs)) {
            res.status(404).json({"message": "No log group found"});
        }

        logs[logGroup].pipe(res);

        resolve();
    });
}

export default GetLogs;