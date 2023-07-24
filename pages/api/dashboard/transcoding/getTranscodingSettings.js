import validateUserByHeader from "../../../../lib/validateUserByHeader";

const Settings = require("../../../../lib/settings");

const GetTranscodingSettings = async (req, res) =>{
    if (!validateUserByHeader(req, process.env.DASHBOARD_SECRET)) {
        res.status(403).end();
        return;
    }

    const settings = new Settings();
    const h265Enabled = await settings.ish265Enabled();

    res.status(200).json({ h265Enabled });
}

export default GetTranscodingSettings;