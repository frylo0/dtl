/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    2022-12-07, 7:26:34 PM
 */

import styles from './MultipleFiles.module.scss';
import cx from 'classnames';

interface MultipleFilesProps {
   className?: string,
};

export const MultipleFiles: React.FC<MultipleFilesProps> = ({
   className = '',
}) => {
   return (
      <div className={cx(styles.multipleFiles, className)}>

      </div>
   );
};