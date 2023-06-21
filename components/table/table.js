import { Component } from 'react';
import React from 'react';
import equal from 'fast-deep-equal';
import Styles from './table.module.css';



export default class Table extends Component {
    constructor(props) {
        super(props);
        this.title = props.title;

        this.state = {
            columns: this.props.columns ? this.props.columns : [],
            data: this.props.data ? this.props.data : []
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!equal(this.props.data, prevProps.data)) {
            this.setState({
                data: this.props.data
            });
        }
    }

    renderData(row, columnIndex) {
        for (const column of row) {
            if (column.key === this.state.columns[columnIndex].key) {
                if (this.state.columns[columnIndex].dataRender) {
                    return this.state.columns[columnIndex].dataRender(column);
                } else {
                    return (
                        <td className={Styles.tdata}>
                            <div>{column.value}</div>
                        </td>
                    )
                }
            }
        }
    }

    render() {
        return (
            <>
                <h1>{this.title}</h1>
                <br />
                <div className={Styles.tableWrapper}>
                    <table className={Styles.table}>
                        <thead className={Styles.thead}>
                            <tr className={Styles.trow} scope="col" key="header">
                                {this.state.columns.map(column => (
                                    column.render ? column.render(column.title) : column.title
                                ))}
                            </tr>
                        </thead>
                        <tbody className={Styles.tbody}>
                            {this.state.data.map((row, rowNum) => {

                                return (
                                    <tr className={Styles.trow} key={rowNum}>
                                        {row.map((column, columnNum) => {
                                            return this.renderData(row, columnNum);
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        )
    }
}