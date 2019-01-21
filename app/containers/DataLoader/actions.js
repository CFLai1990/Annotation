/*
 *
 * DataLoader actions
 *
 */

import { UPDATE_DATA } from './constants'
import { DEFAULT_DATA } from './constants'
import { fetchData } from './utils'

// Read the data options
import dataCollection from 'data/options.json' // Data options, data: {name: info}

const loadData = (dataSelection = DEFAULT_DATA) => {
  let dataInfo = dataCollection[dataSelection]
  let newState = {
    type: UPDATE_DATA,
    dataSelection: dataSelection,
    dataLoading: true,
    dataBody: null,
    success: false,
    error: null
  }
  return (dispatch, getState) => {
    dispatch(newState)
    return fetchData(dataInfo, dataSelection)
            .then(data => {
              dispatch(
                    Object.assign({}, newState, {
                      dataLoading: false,
                      dataBody: data,
                      success: true
                    })
                )
            })
            .catch(err => {
              dispatch(
                    Object.assign({}, newState, {
                      dataLoading: false,
                      success: false,
                      error: err
                    })
                )
            })
  }
}

export default {
  loadData
}
