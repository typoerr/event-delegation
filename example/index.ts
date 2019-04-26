import { delegate } from '../src'

const del = delegate(window, { capture: true })

del.on('DOMContentLoaded', ev => {
  console.log(ev)
  console.log(ev.target)
  console.log(ev.eventPhase === ev.CAPTURING_PHASE)
})

del.on('click', ev => {
  console.log(ev)
  console.log(ev.target)
})

del.on('click', '#b', (ev: MouseEvent) => {
  console.log(ev)
  console.log(ev.target) // #b
})
