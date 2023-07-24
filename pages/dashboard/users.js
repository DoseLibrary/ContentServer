import { Component } from 'react';
import React from 'react';
import Layout from '../../components/layout';
import validateDashboardAccess from '../../lib/validateDashboardAccess';
import { Form } from 'react-bootstrap';
import Table from '../../components/table/table';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Styles from '../../styles/users.module.css';


export default class Register extends Component {
    constructor(props) {
        super(props);
        this.host = props.host;

        this.state = {
            admins: [],
            users: [],
            username: '',
            password: '',
            statusMessage: '',
            createUser: {
                username: '',
                hasAccess: true
            }
        }

        this.createAdmin = this.createAdmin.bind(this);
        this.createUser = this.createUser.bind(this);
    }

    componentDidMount() {
        this.getAdminList();
        this.getUserList();
    }

    getColumns() {
        return [
            {
                title: 'Username',
                key: 'username',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>Username</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'Delete',
                key: 'delete',
                render: () => (
                    <th scope="col" className={Styles.centerText}>
                        <span>Delete</span>
                    </th>
                ),
                dataRender: (admin) => (
                    <td className={Styles.centerText}>
                        <DeleteIcon href="#" className={Styles.iconButton} onClick={() => this.deleteAdmin(admin.extra.id)}>
                            {admin.value}
                        </DeleteIcon>
                    </td>
                )
            }
        ]
    }

    getUserColumns() {
        return [
            {
                title: 'Username',
                key: 'username',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>Username</span>
                    </th>
                ),
                dataRender: (column) => (
                    <td className={Styles.centerContent}>
                        <div className={Styles.tableText}>{column.value}</div>
                    </td>
                )
            },
            {
                title: 'Have access',
                key: 'access',
                render: () => (
                    <th scope="col" className={Styles.tableText}>
                        <span>Have access</span>
                    </th>
                ),
                dataRender: (data) => (
                    <td className={Styles.accessCheckbox}>
                        <input type="checkbox" checked={data.value} onChange={(event) => this.setAccess(data.extra.id, event.target.checked)} />
                    </td>
                )
            },
            {
                title: 'Delete',
                key: 'delete',
                render: () => (
                    <th scope="col" className={Styles.centerText}>
                        <span>Delete</span>
                    </th>
                ),
                dataRender: (user) => (
                    <td className={Styles.centerText}>
                        <DeleteIcon href="#" className={Styles.iconButton} onClick={() => this.deleteUser(user.extra.id, user.extra.username)}>
                            {user.value}
                        </DeleteIcon>
                    </td>
                )
            }
        ]
    }

    getUserData() {
        return this.state.users.map(user => {
            return [
                {
                    key: 'username',
                    value: user.username,
                },
                {
                    key: 'access',
                    value: user.has_access,
                    extra: {
                        id: user.id
                    }
                },
                {
                    key: 'delete',
                    value: 'Delete',
                    extra: {
                        id: user.id,
                        username: user.username
                    }
                }
            ]
        });
    }

    getData() {
        return this.state.admins.map(admin => {
            return [
                {
                    key: 'delete',
                    value: 'Delete',
                    extra: {
                        id: admin.id
                    }
                },
                {
                    key: 'username',
                    value: admin.username,
                }
            ]
        });
    }

    getAdminList() {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/admin/getList?token=${token}`).then(res => res.json())
                .then(data => {
                    this.setState({
                        admins: data
                    });
                });
        });
    }

    getUserList() {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/users/get?token=${token}`).then(res => res.json()).then(data => {
                this.setState({
                    users: data
                });
            });
        });
    }

    createUser() {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/users/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.createUser.username,
                    token: token
                })
            }).then(res => res.json()).then(res => {
                if (res.success) {
                    this.setState({
                        statusMessageUser: ''
                    });
                    this.getUserList();
                } else {
                    this.setState({
                        statusMessageUser: res.error
                    });
                }
            });
        });
    }

    createAdmin() {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/admin/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                    token: token
                })
            }).then(res => res.json()).then(res => {
                if (res.success) {
                    this.setState({
                        statusMessage: ''
                    });
                    this.getAdminList();
                } else {
                    this.setState({
                        statusMessage: res.error
                    });
                }
            });
        });
    }


    deleteAdmin(id) {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/admin/delete?token=${token}&id=${id}`).then(response => {
                if (response.status === 200) {
                    this.setState({
                        statusMessage: ''
                    });
                    this.getAdminList();
                } else if (response.status === 406) {
                    this.setState({
                        statusMessage: 'You cannot delete yourself'
                    });
                }
            });
        });
    }

    deleteUser(id, username) {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/users/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    username: username,
                    token: token,
                })
            }).then(response => {
                this.getUserList();
            });
        });
    }

    setAccess(id, access) {
        validateDashboardAccess().then(token => {
            fetch(`/api/dashboard/users/access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    token: token,
                    access: access
                })
            }).then(response => {
                this.getUserList();
            });
        });
    }

    newUserNameChanged(value) {
        this.setState(prevState => ({
            createUser: {
                ...prevState.createUser,
                username: value
            }
        }));
    }

    render() {
        return (
            <Layout>
                <Table title="Admin accounts" columns={this.getColumns()} data={this.getData()}></Table>
                <br />
                <div className={Styles.inputForm}>
                    <Form.Control className={Styles.inputField} type="text" placeholder="Username" onChange={(e) => this.setState({ username: e.target.value })} />

                    <Form.Control className={Styles.inputField} type="password" placeholder="Password" onChange={(e) => this.setState({ password: e.target.value })} />
                    <PersonAddAltIcon className={Styles.saveIconButton} onClick={this.createAdmin}></PersonAddAltIcon>
                    <p className={Styles.errorText}>{this.state.statusMessage}</p>
                </div>

                <br></br>
                <br></br>
                <Table title="Users" columns={this.getUserColumns()} data={this.getUserData()}></Table>
                <br />
                <div className={Styles.inputForm}>
                    <Form.Control className={Styles.inputField} type="text" placeholder="Username" onChange={(e) => this.newUserNameChanged(e.target.value)} />
                    <PersonAddAltIcon className={Styles.saveIconButton} onClick={this.createUser}></PersonAddAltIcon>
                    <p className={Styles.errorText}>{this.state.statusMessageUser}</p>
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