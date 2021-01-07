import ava, { TestInterface } from 'ava'
import { DOMWindow, JSDOM } from 'jsdom'
import * as sinon from 'sinon'
import { closest, proxy, fire, EventDelegator } from '../src/event-delegator'

interface TestContext {
  dom: JSDOM
  window: DOMWindow
  doc: Document
  a: HTMLElement
  b: HTMLElement
  c: HTMLElement
}

const test = ava as TestInterface<TestContext>

test.before((t) => {
  const html = String.raw

  const dom = new JSDOM(html`
    <div class="a">
      <div class="b">
        <div class="c">child a</div>
      </div>
    </div>
  `)

  const doc = dom.window.document

  global.CustomEvent = dom.window.CustomEvent

  t.context.dom = dom
  t.context.window = dom.window
  t.context.doc = dom.window.document
  t.context.a = doc.querySelector('.a') as HTMLElement
  t.context.b = doc.querySelector('.b') as HTMLElement
  t.context.c = doc.querySelector('.c') as HTMLElement
})

test('colsest - find ancestor of current element which matches the selector', (t) => {
  const { a, b, c } = t.context
  t.is(closest(a, c, '.b'), b)
})

test('colsest - match own element', (t) => {
  const { a, c } = t.context
  t.is(closest(a, c, '.c'), c)
})

test('colsest - match root element', (t) => {
  const { a, c } = t.context
  t.is(closest(a, c, '.a'), a)
})
test('colsest - dont match higher element than root', (t) => {
  const { b, c } = t.context
  t.is(closest(b, c, '.a'), null)
})
test('colsest - return null if unmatched', (t) => {
  const { a, c } = t.context
  t.is(closest(a, c, '.d'), null)
})

test('proxy - Disguise event.target as matched element', (t) => {
  const { window, doc } = t.context
  const event = new window.MouseEvent('click')
  const target = doc.createElement('div')
  t.is(event.target, null)

  const actual = proxy(event, target)
  t.is(actual.target, target)
  t.is(actual.type, 'click')
  t.assert(event instanceof window.Event)
  t.is(event.target, null)
})

test('fire - dispatch CustomEvent', (t) => {
  const { c, doc, window } = t.context
  const type = 'custom-event'
  const listener = sinon.fake()
  doc.body.addEventListener(type, listener)

  const actual = fire(c, type, { context: '!' })
  const event = listener.firstCall.firstArg
  t.is(actual, true)
  t.is(listener.callCount, 1)
  t.assert(event instanceof window.CustomEvent)
  t.is(event.bubbles, true)
  t.is(event.cancelable, true)
  t.is(event.composed, true)
  t.deepEqual(event.detail, { context: '!' })

  // cleanup
  doc.body.removeEventListener(type, listener)
})

test('EventDelegator#on - add event listener and return remove evnet listener function', (t) => {
  t.plan(4)

  const { c, doc } = t.context

  const del = new EventDelegator(doc.body)
  const listener = sinon.fake((ev: MouseEvent) => {
    t.is(ev.currentTarget, doc.body)
    t.is(ev.target, c)
  })
  // add listener
  const off = del.on('click', '.c', listener)
  t.is(typeof off === 'function', true)
  // emit
  c.click()
  // remove event listener
  off()
  // re-emit
  c.click()

  t.is(listener.callCount, 1)
})

test('EventDelegator#on - add listener to delegator directly', (t) => {
  t.plan(2)
  const { doc, c } = t.context
  const del = new EventDelegator(doc, { once: true })
  const listener = sinon.fake((ev: Event) => t.is(ev.target, del.target))
  del.on('click', listener)
  c.click()
  t.assert(listener.called)
})

test('EventDelegator#on - undefined selector', (t) => {
  t.plan(2)
  const { c, doc } = t.context
  const del = new EventDelegator(doc)
  const listener = sinon.fake((ev: Event) => t.is(ev.target, del.target))
  del.on('click', undefined, listener, { once: true })
  c.click()
  t.assert(listener.called)
})

test('EventDelegator#off - remove event listener', (t) => {
  const { c, doc } = t.context
  const delegator = new EventDelegator(doc.body)
  const listener = sinon.fake()
  delegator.on('click', '.c', listener)
  c.click()
  delegator.off('click', listener)
  c.click()
  t.is(listener.callCount, 1)
})

test('EventDelegator#off - dont throw error when listener is already removed', (t) => {
  const { doc } = t.context
  const delegator = new EventDelegator(doc.body)
  const listener = sinon.fake()
  const off = delegator.on('click', '.c', listener)
  off()
  t.notThrows(() => delegator.off('click', listener))
})

test('EventDelegator - default listener option', (t) => {
  t.plan(2)
  const { c, doc } = t.context
  const delegator = new EventDelegator(doc.body, { capture: true, once: true })
  const listener = sinon.fake((ev: Event) => t.is(ev.eventPhase, ev.CAPTURING_PHASE))
  delegator.on('click', '.c', listener)
  c.click()
  c.click()
  t.is(listener.callCount, 1)
})

test('EventDelegator - Override listener option', (t) => {
  t.plan(2)
  const { doc, c } = t.context
  const delegator = new EventDelegator(doc.body, { capture: true })
  const listener = sinon.fake((ev: Event) => t.is(ev.eventPhase, ev.BUBBLING_PHASE))
  delegator.on('click', '.c', listener, { capture: false, once: true })
  c.click()
  c.click()
  t.is(listener.callCount, 1)
})
