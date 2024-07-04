/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    2022-12-07, 7:26:34 PM
 */

import styles from './SomeName.module.scss';
import cx from 'classnames';

interface SomeNameProps {
   className?: string,
};

export const SomeName: React.FC<SomeNameProps> = ({
   className = '',
}) => {
   return (
      <div className={cx(styles.someName, className)}>

      </div>
   );
};