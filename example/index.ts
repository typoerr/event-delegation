/*  eslint-disable no-console */
import { EventDelegator } from '../packages/core'

const del = new EventDelegator(window, { capture: true })

del.on('DOMContentLoaded', (ev) => {
  console.log(ev)
  console.log(ev.target)
  console.log(ev.eventPhase === ev.CAPTURING_PHASE)
})

del.on('click', (ev) => {
  console.log('[window]: ', ev)
  console.log('[window]: ', ev.target)
})

del.on('click', '#b', (ev: MouseEvent) => {
  const el = document.getElementById('message')
  console.log('[#b] ', ev)
  el.innerText = 'Hello'
})

del.on('click', '#c', (ev: MouseEvent) => {
  const el = document.getElementById('message')
  console.log('[#c] ', ev)
  el.innerText = 'World'
})
