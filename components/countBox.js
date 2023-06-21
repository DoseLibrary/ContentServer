import { Component } from 'react';
import React from 'react';
import Styles from './countBox.module.css';
import GroupIcon from '@mui/icons-material/Group';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import DvrIcon from '@mui/icons-material/Dvr';

export default class CountBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: props.count
        }

        this.type = props.type;

    }

    setCount(count) {
        if(count == 1) {
            this.type = this.type.slice(0, -1);
        }
        this.setState({
            count: count
        });
    }


    render() {
        return (
            <div className={Styles.countBox}>
                    {(this.type == "Users" || this.type == "User") &&
                        <GroupIcon fontSize="large" />
                    }
                    {(this.type == "Movies" || this.type == "Movie") &&
                        <MovieIcon fontSize="large" />
                    }
                    {(this.type == "Shows" || this.type == "Show") &&
                        <TvIcon fontSize="large" />
                    }
                    {(this.type == "Episodes" || this.type == "Episode") &&
                        <DvrIcon fontSize="large" />
                    }
                    <p className={Styles.countBoxText}>{this.state.count} {this.type}</p>
            </div>
        )
    }
}