import { Component } from "react";
import Layout from '../../components/layout';
import { CenteredContainer } from "../../components/centeredContainer";
import styles from '../../styles/settings.module.css';
import validateDashboardAccess from '../../lib/validateDashboardAccess';

export default class Setting extends Component {
    constructor(props) {
        super(props);

        this.state = {
            h265Enabled: false,
            h264Settings: {},
            h265Settings: {}
        }


        this.h265Changed = this.h265Changed.bind(this);
        this.setSelectedH264Profile = this.setSelectedH264Profile.bind(this);
        this.setSelectedH264Crf = this.setSelectedH264Crf.bind(this);
        this.setSelectedH264Threads = this.setSelectedH264Threads.bind(this);

        this.setSelectedH265Profile = this.setSelectedH265Profile.bind(this);
        this.setSelectedH265Crf = this.setSelectedH265Crf.bind(this);
        this.setSelectedH265Threads = this.setSelectedH265Threads.bind(this);

        this.saveH264Settings = this.saveH264Settings.bind(this);
        this.saveH265Settings = this.saveH265Settings.bind(this);
    }

    componentDidMount() {
        this.getTranscodingSettings();
    }

    async getTranscodingSettings() {
        validateDashboardAccess().then( async (token) => {
            fetch('/api/dashboard/transcoding/getTranscodingSettings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(settings => {
                this.setState({
                    h265Enabled: settings.h265Enabled,
                    h265Settings: settings.h265Settings,
                    h264Settings: settings.h264Settings
                });
                console.log(settings.h264Settings);
            });
        });
    }

    sendSetH265Request(enabled) {
        validateDashboardAccess().then(token => {
            fetch('/api/dashboard/transcoding/setH265', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    enabled
                })
            }).then(response => {
                this.setState({
                    h265Enabled: enabled
                })
            });
        });
    }

    saveH264Settings() {
        const crf = this.state.h264Settings.crf;
        const preset = this.state.h264Settings.preset;
        const threads = this.state.h264Settings.threads;
        validateDashboardAccess().then(token => {
            fetch('/api/dashboard/transcoding/setH264Settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    crf,
                    preset,
                    threads
                })
            });
        });
    }

    saveH265Settings() {
        const crf = this.state.h265Settings.crf;
        const preset = this.state.h265Settings.preset;
        const threads = this.state.h265Settings.threads;
        validateDashboardAccess().then(token => {
            fetch('/api/dashboard/transcoding/setH265Settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    crf,
                    preset,
                    threads
                })
            });
        });
    }


    h265Changed(event) {
        const enabled = event.target.checked;
        this.sendSetH265Request(enabled);
    }

    setSelectedH264Profile(event) {
        this.setState(prevState => ({
            h264Settings: {
                ...prevState.h264Settings,
                preset: event.target.value
            }
        }));
    }

    setSelectedH265Profile(event) {
        this.setState(prevState => ({
            h265Settings: {
                ...prevState.h265Settings,
                preset: event.target.value
            }
        }));
    }

    setSelectedH264Crf(event) {
        const crf = parseInt(event.target.value);
        if (crf < 0 || crf > 51) {
            return;
        }

        this.setState(prevState => ({
            h264Settings: {
                ...prevState.h264Settings,
                crf: crf
            }
        }));
    }

    setSelectedH265Crf(event) {
        const crf = parseInt(event.target.value);
        if (crf < 0 || crf > 51) {
            return;
        }

        this.setState(prevState => ({
            h265Settings: {
                ...prevState.h265Settings,
                crf: crf
            }
        }));
    }

    setSelectedH264Threads(event) {
        const threads = parseInt(event.target.value);
        if (threads < 1 || threads > 8) {
            return;
        }
        this.setState(prevState => ({
            h264Settings: {
                ...prevState.h264Settings,
                threads: threads
            }
        }));
        console.log(this.state.h264Settings);
    }

    setSelectedH265Threads(event) {
        const threads = parseInt(event.target.value);
        if (threads < 1 || threads > 8) {
            return;
        }
        this.setState(prevState => ({
            h265Settings: {
                ...prevState.h265Settings,
                threads: threads
            }
        }));
    }

    render() {
        return (
            <Layout>
                <h1>Settings</h1>
                <br/>
                <CenteredContainer title="Transcodings">
                    <input onChange={this.h265Changed} checked={this.state.h265Enabled} type="checkbox" className={styles.h265} name="h265" id="h265" />
                    <label htmlFor="h265">Enable h265</label>
                    <p className={styles.small}><i>If h265 encoding should be used for supported clients. This also adds support for HDR transcodings.</i></p>
                    <br/>

                    <div className={styles.flexBox}>
                        <div className={styles.halfBox}>
                            <h5>H264 settings</h5>
                            <input onChange={this.setSelectedH264Crf} value={this.state.h264Settings.crf} min={0} max={51} className={styles.input} type="number" id="h264_crf" name="h264_crf" />
                            <label className={styles.label} htmlFor="h264_crf">CRF (0-51)</label>
                            <br/>
                            <select
                                value={this.state.h264Settings.preset}
                                name="h264_preset"
                                id="h264_preset"
                                className={styles.input}
                                onChange={this.setSelectedH264Profile}
                            >
                                <option value="ultrafast">ultrafast (default)</option>
                                <option value="superfast">superfast</option>
                                <option value="veryfast">veryfast</option>
                                <option value="faster">faster</option>
                                <option value="fast">fast</option>
                                <option value="medium">medium</option>
                                <option value="slow">slow</option>
                                <option value="slower">slower</option>
                                <option value="veryslow">veryslow</option>
                            </select>
                            <label htmlFor="h264_preset" className={styles.label}>Preset</label>
                            <br/>
                            <input max={8} min={1} onChange={this.setSelectedH264Threads} value={this.state.h264Settings.threads} className={styles.input} type="number" id="h264_threads" name="h264_threads" />
                            <label className={styles.label} htmlFor="h264_threads">threads (1-8)</label>
                            <br/>
                            <br/>
                            <input onClick={this.saveH264Settings} type="button" className={styles.button} value="Save" />
                        </div>
                        <div className={styles.halfBox}>
                            <h5>H265 settings</h5>
                            <input onChange={this.setSelectedH265Crf} value={this.state.h265Settings.crf} min={0} max={51} className={styles.input} type="number" id="h264_crf" name="h264_crf" />
                            <label className={styles.label} htmlFor="h264_crf">CRF (0-51)</label>
                            <br/>
                            <select
                                value={this.state.h265Settings.preset}
                                name="h264_preset"
                                id="h264_preset"
                                className={styles.input}
                                onChange={this.setSelectedH265Profile}
                            >
                                <option value="ultrafast">ultrafast (default)</option>
                                <option value="superfast">superfast</option>
                                <option value="veryfast">veryfast</option>
                                <option value="faster">faster</option>
                                <option value="fast">fast</option>
                                <option value="medium">medium</option>
                                <option value="slow">slow</option>
                                <option value="slower">slower</option>
                                <option value="veryslow">veryslow</option>
                            </select>
                            <label htmlFor="h264_preset" className={styles.label}>Preset</label>
                            <br/>
                            <input max={8} min={1} onChange={this.setSelectedH265Threads} value={this.state.h265Settings.threads} className={styles.input} type="number" id="h264_threads" name="h264_threads" />
                            <label className={styles.label} htmlFor="h264_threads">threads (1-8)</label>
                            <br/>
                            <br/>
                            <input onClick={this.saveH265Settings} type="button" className={styles.button} value="Save" />
                        </div>
                    </div>

                </CenteredContainer>
            </Layout>
        )
    }
}