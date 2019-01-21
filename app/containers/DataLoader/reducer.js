/*
 *
 * DataLoader reducer
 *
 */

import { fromJS } from 'immutable'

import { UPDATE_DATA } from './constants'
import { DEFAULT_DATA } from './constants'

const initialState = fromJS({
  dataSelection: DEFAULT_DATA
})

function dataLoaderReducer (state = initialState, action) {
  switch (action.type) {
    case UPDATE_DATA:
      return state
                .set('dataSelection', action.dataSelection)
                .set('dataLoading', action.dataLoading)
                .set('dataBody', action.dataBody)
                .set('success', action.success)
                .set('error', action.error)
    default:
      return state
  }
}

export default dataLoaderReducer
