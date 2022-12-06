/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    2022-04-03, 8:49:18 PM
 * Company: frity corp.
 */
   
import styles from './ReactComponentInnerReadme.module.sass';
const cn = new ClassNameResolver(styles);

export function ReactComponentInnerReadme(props) {
   return (
      <div className={cn`react-component-inner-readme`}>

      </div>
   )
}