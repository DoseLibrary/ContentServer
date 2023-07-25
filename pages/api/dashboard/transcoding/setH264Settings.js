import Logger from '../../../../lib/logger';
import validateUser from '../../../../lib/validateUser';

const logger = new Logger();
const db = require('../../../../lib/db');

const SetH264Settings = async (req, res) => {
    if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
        res.status(403).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send({message: 'Only POST requests allowed'});
        return;
    }
    const { crf, preset, threads } = req.body;
    
    await db.none('UPDATE settings SET h264_crf = $1, h264_preset = $2, h264_threads = $3', [crf, preset, threads]);
    logger.INFO(`h264 settings was updated. CRF: ${crf}, preset: ${preset}, threads: ${threads}`);

    res.status(200).send();
}

export default SetH264Settings;