import { createStore } from 'redux';
import reducer from '../reducer/category';

export default () => createStore(reducer);

// export default function() {
//   return createStore(reducer);
// }