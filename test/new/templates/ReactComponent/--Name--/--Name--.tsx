import cx from 'classnames';
import styles from './--Name--.module.scss';

interface --Name--Props {
    className: string;
}

export const --Name--: React.FC<--Name--Props> = ({
    className,
}) => {
    return (
        <div className={cx(styles.--name--, className)}>
            Hello, World!
        </div>
    );
};