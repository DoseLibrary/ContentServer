import { Component } from 'react';
import React from 'react';
import Styles from './transcoding.module.css';

export default class Transcoding extends Component {
    constructor(props) {
        super(props);
        this.title = props.title;
        this.username = props.username;
        this.quality = props.quality;
        this.progress = Math.floor(props.progress);
        this.backdrop = `https://image.tmdb.org/t/p/w500/${props.backdrop}`;
    }

    render() {
        return (
                <div className={Styles.transcodingWrapper}>
                    <div className={Styles.transcodingBackground} style={{ backgroundImage: "url('" + this.backdrop + "')" }}></div>
                    <div className={Styles.text}>
                        <p className={Styles.title}>{this.title}</p>
                        <p className={Styles.username}>{this.username}</p>
                        <p className={Styles.quality}>{this.quality}</p>
                    </div>
                    <div className={Styles.progressBar}>
                        <div style={{ width: `${this.progress}%` }} className={Styles.progress}></div>
                    </div>
                </div>
        )
    }
}