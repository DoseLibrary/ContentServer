import fetch from 'node-fetch';
const db = require('../../../../lib/db');
const cors = require('../../../../lib/cors');
const validateUser = require('../../../../lib/validateUser');

export default (req, res) => {
    return new Promise(async (resolve) => {
        let movieID = req.query.movie;
        let poster = req.query.poster;
        let backdrop = req.query.backdrop;
        res = cors(res);

        let token = req.query.token;
        if (!validateUser(req)) {
            res.status(403).end();
            resolve();
            return;
        }

        // TODO: Error handling when imageID or movieID does not exist
        await db.none('UPDATE movie_image SET active = false WHERE movie_id = $1', [movieID]);
        if (poster != null) {
            db.none('UPDATE movie_image SET active = true WHERE movie_id = $1 AND image_id = $2', [movieID, poster]);
        }
        if (backdrop != null) {
            db.none('UPDATE movie_image SET active = true WHERE movie_id = $1 AND image_id = $2', [movieID, backdrop]);
        }
        res.status(200).json({success: true});
        resolve();
    });
}
