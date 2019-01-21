/**
 * Asynchronously loads the component for LanguageChanger
 */
import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
