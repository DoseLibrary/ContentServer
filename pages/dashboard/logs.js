import { Component } from 'react';
import React from 'react';
import Layout from '../../components/layout';
import validateDashboardAccess from '../../lib/validateDashboardAccess';

import Styles from '../../styles/logs.module.css';

import { Router } from 'next/router';

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.host = props.host;

        this.state = {
            logText: ""
        }
    }

    componentDidMount() {
        this.getStats();
        //this.getActiveTranscodings();
    }

    getStats() {
        validateDashboardAccess()
        .then(token => {
            fetch(`${this.host}/api/dashboard/getLogs?token=${token}&group=all&date=Mon.Apr.10.2023`)
            .then(res => res.text())
            .then(data => {
                console.log(data)
                //this.logText = data;
                this.setState({logText: data});
            });
        });
    }

    render() {
        return (
                <Layout>
                <div className={Styles.container}>
                    <p className={Styles.logText}>
                        {
                            this.state.logText
                        }
                    </p>
                </div>
               

            </Layout>
        )
    }
}

export async function getServerSideProps(context) {
    let host = context.req.headers.host;
    if (context.req.rawHeaders.includes('https')) {
        host = `https://${host}`;
    } else {
        host = `http://${host}`;
    }
    return {
        props: { host },
    }
}