import validateUser from "../../../../lib/validateUser";

const Settings = require("../../../../lib/settings");

const GetTranscodingSettings = async (req, res) =>{
    if (!validateUser(req, process.env.DASHBOARD_SECRET)) {
        res.status(403).end();
        return;
    }

    const settings = new Settings();
    const h265Enabled = await settings.ish265Enabled();
    const h265Settings = await settings.getH265Settings();
    const h264Settings = await settings.getH264Settings();

    res.status(200).json({ h265Enabled, h265Settings, h264Settings });
}

export default GetTranscodingSettings;