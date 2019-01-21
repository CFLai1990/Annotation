/*
 * Console Message Components
 *
 */

class MsgBox {
  constructor (header) {
    this.header = header || 'UNDEFINED'
    this.priorMsg = null
  }
  isMessage (msg) {
    return typeof (msg) === 'string'
  }
  isNULL (msg) {
    return ((msg == undefined) || (msg == null))
  }
  showMsg (msg, udfMsg, color = '#000', trace = false) {
    let isNullSign = this.isNULL(msg)
    if (!isNullSign) {
      if (this.isMessage(msg)) {
        console.info('%c%s', `color: ${color}`, `[${this.header}] ${this.priorMsg ? (this.priorMsg + ' ') : ''}${msg}`)
      } else {
        console.info('%c%s', `color: ${color}`, `[${this.header}] ${this.priorMsg ? (this.priorMsg + ' ') : ''}`, msg)
      }
    } else {
      console.info('%c%s', `color: ${color}`, `[${this.header}] ${this.priorMsg ? (this.priorMsg + ' ') : ''}${udfMsg}`)
    }
    if (trace) {
      console.trace('%c%s', `color: ${color}`, `[${this.header}] call stack`)
    }
    this.priorMsg = null
  }
  prior (msg) {
    if (this.isMessage(msg)) {
      this.priorMsg = msg
    }
    return this
  }
  info (msg) {
    this.showMsg(msg, 'Undefined information', '#3182bd')
  }
  error (msg) {
    this.showMsg(msg, 'Undefined error', '#F00', true)
  }
  warn (msg) {
    this.showMsg(msg, 'Undefined warning', '#feb24c')
  }
  log (msg) {
    this.showMsg(msg, 'Undefined log')
  }
  groupStart (msg) {
    console.group(`[${this.header}] ${msg || 'Undefined group'}`)
  }
  groupEnd () {
    console.groupEnd()
  }
}

export default MsgBox
