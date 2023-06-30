import { Component } from 'react';
import React from 'react';
import Layout from '../../../components/layout';
import validateDashboardAccess from '../../../lib/validateDashboardAccess';
import { withRouter } from 'next/router'
import Table from '../../../components/table/table';
import EditIcon from '@mui/icons-material/Edit';

import Styles from '../../../styles/libraries.module.css';


export default withRouter(class Libraries extends Component {
    
    constructor(props) {
        super(props);
        const { id } = props.router.query;
        this.host = props.host;
        this.state = {
            id: id,
            data: []
        }


    }


    componentDidMount() {
        this.fetchData(0, 25);
    }

    fetchData(offset, limit) {
        validateDashboardAccess().then(token => {
            fetch(`${this.host}/api/dashboard/libraries/getItems?offset=${offset}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            }).then(res => res.json()).then(data => {
                console.log(data)
                this.setState({
                    data: data.result
                });
            });
        });
    }

    getColumns() {
        return [
            {
                title: 'Edit',
                key: 'edit',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>Edit</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <EditIcon className={Styles.tableText}></EditIcon>
                    </td>
                )
            },
            {
                title: 'Title',
                key: 'title',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>Title</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'overview',
                key: 'overview',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>overview</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value.length > 50 ? column.value.slice(0, 50) + "..." : column.value}</div>
                    </td>
                )
            },            
            {
                title: 'release_date',
                key: 'release_date',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>release_date</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'runtime',
                key: 'runtime',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>runtime</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'popularity',
                key: 'popularity',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>popularity</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'added_date',
                key: 'added_date',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>added_date</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'trailer',
                key: 'trailer',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>trailer</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'genres',
                key: 'genres',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>genres</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{JSON.stringify(column.value)}</div>
                    </td>
                )
            }

            
        ]
    }

    getData() {
        return this.state.data.map(item => {
            return [
                {
                    key: 'edit',
                    value: 'Edit',
                    extra: {
                        id: item.id
                    }
                },
                {
                    key: 'title',
                    value: item.title,
                },
                {
                    key: 'overview',
                    value: item.overview,
                },
                {
                    key: 'release_date',
                    value: item.release_date,
                },
                {
                    key: 'runtime',
                    value: item.runtime,
                },
                {
                    key: 'popularity',
                    value: item.popularity,
                },
                {
                    key: 'added_date',
                    value: item.added_date,
                },
                {
                    key: 'trailer',
                    value: item.trailer,
                },
                {
                    key: 'genres',
                    value: item.genres,
                }
            ]
        });
    }

    render() {
        return (
            <Layout>
                <Table title="HARDCODED" columns={this.getColumns()} data={this.getData()}></Table>
            </Layout>
        )
    }
})

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