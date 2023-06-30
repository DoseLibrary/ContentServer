import { Component } from 'react';
import React from 'react';
import Layout from '../../../components/layout';
import validateDashboardAccess from '../../../lib/validateDashboardAccess';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';

import Styles from '../../../styles/libraries.module.css';

export default class Libraries extends Component {
    constructor(props) {
        super(props);
        this.host = props.host;

        this.state = {
            libraries: []
        }


        this.getLibraryElementList = this.getLibraryElementList.bind(this);
    }


    componentDidMount() {
        this.getLibs();
        //this.getActiveTranscodings();
    }

    getLibs() {
        validateDashboardAccess()
        .then(token => {
            fetch(`${this.host}/api/dashboard/libraries/get`,  {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })
            .then(res => res.json())
            .then(async (data) => {
                for(let lib of data) {
                    await fetch(`${this.host}/api/dashboard/libraries/stats?libtype=${lib.type}&id=${lib.id}`,  {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                    })
                    .then(res => res.json())
                    .then(stats => {
                        lib['stats'] = stats;
                    });
                }
                this.setState({libraries: data});
            });
        });
    }


    getLibraryElementList () {
        let elementList = [];
        for (let lib of this.state.libraries) {
            console.log(lib)
            elementList.push(
                <div className={Styles.card} key={lib.id} onClick={() => window.location.href = "/dashboard/libraries/" + lib.id + "?name=Test"}>
                    <div className={Styles.cardHeader}>
                        {lib.type == "MOVIES" &&
                        <MovieIcon fontSize="large"></MovieIcon>}
                        {lib.type == "SERIES" &&
                        <TvIcon fontSize="large"></TvIcon>}
                        <span className={Styles.cardTitle} title={lib.name}>{lib.name}</span>
                    </div>

                    <span>Path: {lib.path}</span>
                    <span>Count: {lib.stats.count}</span>
                </div>
            )
        }

        return elementList
    }

    render() {
        return (
                <Layout>
                    <div className={Styles.container}>

                            {
                                this.getLibraryElementList()
                            }
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