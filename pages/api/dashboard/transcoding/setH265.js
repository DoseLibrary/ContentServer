import Logger from '../../../../lib/logger';
import validateUser from '../../../../lib/validateUser';

const logger = new Logger();
const db = require('../../../../lib/db');

const SetH265 = async (req, res) => {
    if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
        res.status(403).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send({message: 'Only POST requests allowed'});
        return;
    }
    const { enabled } = req.body;
    
    await db.none('UPDATE settings SET h265 = $1', [enabled === true]);
    logger.INFO(`h265 transcoding was ${enabled ? 'enabled' : 'disabled'}`);

    res.status(200).send();
}

export default SetH265;