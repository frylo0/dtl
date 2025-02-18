import cx from 'classnames';
import styles from './SomeName.module.scss';

interface SomeNameProps {
    className: string;
}

export const SomeName: React.FC<SomeNameProps> = ({
    className,
}) => {
    return (
        <div className={cx(styles.somename, className)}>
            Hello, World!
        </div>
    );
};