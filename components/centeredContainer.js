import styles from './centeredContainer.module.css';

export const CenteredContainer = ({title, children}) => {
    return (
        <>
            <h3>{title}</h3>
            <div className={styles.centeredContainer}>
                {children}
            </div>
        </>
    )
}