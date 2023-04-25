import { Component } from 'react';
import React from 'react';
import Link from 'next/link';
import Router from 'next/router'
import Styles from './layout.module.css'
import { Menu } from './menu/menu'

export default class Register extends Component {
    constructor(props) {
        super(props);

        this.sidebar = React.createRef();
    }



    render() {
        return (
            <nav className={Styles.wrapper}>
                <Menu></Menu>

                <div className={Styles.contentWrapper}>
                    {/* Content */}
                    {this.props.children}
                </div>
            </nav>
        )
    }
}
