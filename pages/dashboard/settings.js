import { Component } from "react";
import Layout from '../../components/layout';
import { CenteredContainer } from "../../components/centeredContainer";
import styles from '../../styles/settings.module.css';
import validateDashboardAccess from '../../lib/validateDashboardAccess';

export default class Setting extends Component {
    constructor(props) {
        super(props);

        this.state = {
            h265Enabled: false
        }


        this.h265Changed = this.h265Changed.bind(this);
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
                    h265Enabled: settings.h265Enabled
                })
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


    h265Changed(event) {
        const enabled = event.target.checked;
        this.sendSetH265Request(enabled);
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
                </CenteredContainer>
            </Layout>
        )
    }
}