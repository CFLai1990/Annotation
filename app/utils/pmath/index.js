import * as n from 'numeric'

class PMathClass {
  // check if the parameter is a number within the given range
  isLegal (number, limit, type = 'value') {
    let legal = !isNaN(number)
    if (legal) {
      switch (type) {
        // value: limit = [lowLimit, highLImit]
        case 'value':
          legal = (number >= limit[0] && number <= limit[1])
          break
          // set: limit = allowed values
        case 'set':
          legal = limit.includes(number)
          break
      }
    }
    return legal
  }
}

const PMath = new PMathClass()

export default PMath
