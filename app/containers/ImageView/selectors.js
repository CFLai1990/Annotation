import { createSelector } from 'reselect'
/**
 * Direct selector to the dataSelector state domain
 */
const selectData = (state) => state.get('data')

/**
 * Select the data
 */

const makeSelectData = () => createSelector(
  selectData,
  (dataState) => dataState.get('dataBody')
)

export {
  selectData,
  makeSelectData
}
