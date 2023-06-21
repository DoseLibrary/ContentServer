import { Component } from 'react';
import React from 'react';
import Layout from '../../components/layout';
import CountBox from '../../components/countBox';
import Transcoding from '../../components/transcoding';
import validateDashboardAccess from '../../lib/validateDashboardAccess';
import Styles from '../../styles/dashboard.module.css';

import { Router } from 'next/router';

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.host = props.host;

        this.state = {
            transcodings: []
        }

        this.movieCount = React.createRef(0);
        this.showCount = React.createRef(0);
        this.episodeCount = React.createRef(0);
        this.userCount = React.createRef(0);
    }

    componentDidMount() {
        this.getStats();
        this.getActiveTranscodings();
    }

    getStats() {
        validateDashboardAccess()
        .then(token => {
            fetch(`${this.host}/api/dashboard/getStats?token=${token}`)
            .then(res => res.json())
            .then(data => {
                this.movieCount.current.setCount(data.movieCount);
                this.showCount.current.setCount(data.showCount);
                this.episodeCount.current.setCount(data.episodeCount);
                this.userCount.current.setCount(data.userCount);

            });
        });
    }

    getActiveTranscodings() {
        validateDashboardAccess()
        .then((token) => {
            fetch(`${this.host}/api/dashboard/transcoding/getActive?token=${token}`)
            .then(res => res.json())
            .then(data => {
                this.setState({
                    transcodings: data
                });
            });
        })
        .catch(err => {
            Router.push('/');
        })
    }

    render() {
        return (
                <Layout>
                <div className={Styles.container}>
                    <div className={Styles.countBoxWrapper}>
                        <CountBox type="Movies" ref={this.movieCount}  />
                        <CountBox type="Shows" ref={this.showCount} />
                        <CountBox type="Episodes" ref={this.episodeCount} />
                        <CountBox type="Users" ref={this.userCount} />
                    </div>
                </div>
                <div className={Styles.transcodingContainer}>
                    <div className={Styles.transcodingWrapper}>
                        <h3 className={Styles.transcodingTitle}>Transcodings</h3>
                        <div className={Styles.transcodingItems}>
                            {this.state.transcodings.length > 0 &&
                            
                            this.state.transcodings.map((transcoding, index) => {
                                return <Transcoding
                                                    key={index} 
                                                    title={transcoding.title}
                                                    username={transcoding.user.username}
                                                    quality={transcoding.quality}
                                                    backdrop={transcoding.backdrop}
                                                    progress={transcoding.watchProgress} />
                            })}
                            {this.state.transcodings.length == 0 &&
                                <p>No Transcodings</p>
                            }
                        </div>
                    </div>
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