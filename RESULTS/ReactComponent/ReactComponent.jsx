/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    2022-04-03, 8:49:54 PM
 * Company: frity corp.
 */
   
import styles from './ReactComponent.module.sass';
const cn = new ClassNameResolver(styles);

export function ReactComponent(props) {
   return (
      <div className={cn`react-component`}>

      </div>
   )
}