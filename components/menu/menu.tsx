import React, { FunctionComponent, useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './menu.module.css';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import HomeIcon from '@material-ui/icons/Home';
import FolderIcon from '@mui/icons-material/Folder';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArticleIcon from '@mui/icons-material/Article';
import WebhookIcon from '@mui/icons-material/Webhook';

type MenuProps = {}
export const Menu: FunctionComponent<MenuProps> = () => {
    const [success, setSuccess] = useState(false);
    const [menuWrapperClass, setMenuWrapperClass] = useState(styles.menuWrapper);
    const toggleMenuActive = () => {
        setMenuWrapperClass(styles.menuWrapperActive)
    }

    const toggleMenuNotActive = () => {
        setMenuWrapperClass(styles.menuWrapper)
    }

    return(
        <div className={styles.menuWrapperActive}>
            <Link href="/dashboard">
                <div className={styles.iconWrapper}>
                    <HomeIcon className={styles.icon}></HomeIcon>
                    <p className={styles.showOnMenuActive}>Home</p>
                </div>
            </Link>

            <Link href="/dashboard/libraries">
                <div className={styles.iconWrapper}>
                    <FolderIcon className={styles.icon}></FolderIcon>
                    <p className={styles.showOnMenuActive}>Libraries</p>
                </div>
            </Link>
            <Link href="/dashboard/users">
                <div className={styles.iconWrapper}>
                    <ManageAccountsIcon className={styles.icon}></ManageAccountsIcon>
                    <p className={styles.showOnMenuActive}>Users</p>
                </div>
            </Link>
            <Link href="/dashboard/plugins">
            <div className={styles.iconWrapper}>
                <ExtensionIcon className={styles.icon}></ExtensionIcon>
                <p className={styles.showOnMenuActive}>Plugins</p>
            </div>
            </Link>
            <Link href="/dashboard/plugins">
            <div className={styles.iconWrapper}>
                <WebhookIcon className={styles.icon}></WebhookIcon>
                <p className={styles.showOnMenuActive}>Integrations</p>
            </div>
            </Link>
            <Link href="/dashboard/logs">
            <div className={styles.iconWrapper}>
                <ArticleIcon className={styles.icon}></ArticleIcon>
                <p className={styles.showOnMenuActive}>Logs</p>
            </div>
            </Link>
            <Link href="/dashboard/settings">
                <div className={styles.iconWrapper}>
                    <SettingsIcon className={styles.icon}></SettingsIcon>
                    <p className={styles.showOnMenuActive}>Settings</p>
                </div>
            </Link>
            <div className={styles.logoutWrapper}>
                <LogoutIcon className={styles.icon}></LogoutIcon>
                <p className={styles.showOnMenuActive}>Logout</p>
            </div>
        </div>
    )
}