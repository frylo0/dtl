/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    2022-12-07, 7:26:34 PM
 */

import styles from './OtherName.module.scss';
import cx from 'classnames';

interface OtherNameProps {
   className?: string,
};

export const OtherName: React.FC<OtherNameProps> = ({
   className = '',
}) => {
   return (
      <div className={cx(styles.otherName, className)}>

      </div>
   );
};