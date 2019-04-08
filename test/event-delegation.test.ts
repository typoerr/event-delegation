import { closest, proxy, EventDelegator, fire, delegate } from '../src/event-delegation'

beforeAll(() => {
  const html = String.raw

  const template = document.createElement('template')

  template.innerHTML = html`
    <div class="a">
      <div class="b">
        <div class="c">child a</div>
        <div class="c">child b</div>
        <input class="c" type="text" value="test" />
      </div>
    </div>
  `
  document.body.appendChild(template.content)
})

const context = () => ({
  a: document.querySelector('.a')! as HTMLElement,
  b: document.querySelector('.b')! as HTMLElement,
  c: document.querySelector('.c')! as HTMLElement,
})

describe('context', () => {
  test('return test nodes', () => {
    const { a, b, c } = context()
    expect(a).toBeInstanceOf(HTMLElement)
    expect(b).toBeInstanceOf(HTMLElement)
    expect(c).toBeInstanceOf(HTMLElement)
  })
})

describe('closest', () => {
  test('find ancestor of current element which matches the selector', () => {
    const { a, b, c } = context()
    expect(closest(a, c, '.b')).toBe(b)
  })
  test('match own element', () => {
    const { a, c } = context()
    expect(closest(a, c, '.c')).toBe(c)
  })
  test('match root element', () => {
    const { a, c } = context()
    expect(closest(a, c, '.a')).toBe(a)
  })
  test('dont match higher element than root', () => {
    const { b, c } = context()
    expect(closest(b, c, '.a')).toBeNull()
  })
  test('return null if unmatched', () => {
    const { a, c } = context()
    expect(closest(a, c, '.d')).toBeNull()
  })
})

describe('proxy', () => {
  test('Disguise event.target as matched element', () => {
    const event = new MouseEvent('click')
    const target = document.createElement('div')
    expect(event.target).toBeNull()

    const actual = proxy(event, target)
    expect(actual.target).toBe(target)
    expect(actual.type).toBe('click')
    expect(event).toBeInstanceOf(Event)
    expect(event.target).toBe(null)
  })
})

describe('fire', () => {
  test('dispatch CustomEvent', () => {
    const { c } = context()
    const type = 'custom-event'
    const listener = jest.fn()
    document.body.addEventListener(type, listener)

    const actual = fire(c, type, { context: '!' })
    const event = listener.mock.calls[0][0]

    expect(actual).toBe(true)
    expect(listener.mock.calls.length).toBe(1)
    expect(event).toBeInstanceOf(CustomEvent)
    expect(event.bubbles).toBe(true)
    expect(event.cancelable).toBe(true)
    // expect(event.composed).toBe(true) // not supported by jsdom
    expect(event.detail).toStrictEqual({ context: '!' })

    // cleanup
    document.body.removeEventListener(type, listener)
  })
})

describe('EventDelegator', () => {
  test('add event listener / remove event listener', () => {
    expect.assertions(4)

    const { c } = context()
    const delegator = new EventDelegator(document.body)
    const listener = jest.fn((ev: MouseEvent) => {
      expect(ev.currentTarget).toBe(document.body)
      expect(ev.target).toBe(c)
    })
    const off = delegator.on('click', '.c', listener)
    expect(typeof off === 'function').toBe(true)

    // emit
    c.click()
    // remove event listener
    off()
    // re-emit
    c.click()

    expect(listener).toBeCalledTimes(1)
  })

  test('default listener option', () => {
    expect.assertions(2)
    const { c } = context()
    const delegator = new EventDelegator(document.body, { capture: true, once: true })
    const listener = jest.fn((ev: Event) => expect(ev.eventPhase).toBe(ev.CAPTURING_PHASE))
    delegator.on('click', '.c', listener)
    c.click()
    c.click()
    expect(listener).toBeCalledTimes(1)
  })

  test('override listener option', () => {
    expect.assertions(2)
    const { c } = context()
    const delegator = new EventDelegator(document.body, { capture: true })
    const listener = jest.fn((ev: Event) => expect(ev.eventPhase).toBe(ev.BUBBLING_PHASE))
    delegator.on('click', '.c', listener, { capture: false, once: true })
    c.click()
    c.click()
    expect(listener).toBeCalledTimes(1)
  })
})

describe('delegate', () => {
  test('return EventDelegator', () => {
    expect(delegate(document)).toBeInstanceOf(EventDelegator)
  })
})
