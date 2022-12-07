/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    2022-12-07, 7:26:34 PM
 */

import styles from './--Name--.module.scss';
import cx from 'classnames';

interface --Name--Props {
   className?: string,
};

export const --Name--: React.FC<--Name--Props> = ({
   className = '',
}) => {
   return (
      <div className={cx(styles.--naMe--, className)}>

      </div>
   );
};