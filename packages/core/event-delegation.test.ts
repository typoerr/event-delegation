import { closest, proxy, EventDelegator, fire } from './event-delegation'

beforeAll(() => {
  const html = String.raw

  const template = document.createElement('template')

  template.innerHTML = html`
    <div class="a">
      <div class="b">
        <div class="c">child a</div>
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
  test('#on - add event listener and return remove evnet listener function', () => {
    expect.assertions(4)

    const { c } = context()
    const delegator = new EventDelegator(document.body)
    const listener = jest.fn((ev: MouseEvent) => {
      expect(ev.currentTarget).toBe(document.body)
      expect(ev.target).toBe(c)
    })
    // add listener
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

  test('#on - add listener to delegator directly', () => {
    expect.assertions(2)
    const delegator = new EventDelegator(document, { once: true })
    const listener = jest.fn((ev: Event) => expect(ev.target).toBe(delegator.target))
    delegator.on('click', listener)
    const { c } = context()
    c.click()
    expect(listener).toBeCalled()
  })

  test('#on - undefined sel', () => {
    expect.assertions(2)
    const delegator = new EventDelegator(document)
    const listener = jest.fn((ev: Event) => expect(ev.target).toBe(delegator.target))
    delegator.on('click', undefined, listener, { once: true })
    const { c } = context()
    c.click()
    expect(listener).toBeCalled()
  })

  test('#off - remove event listener', () => {
    const { c } = context()
    const delegator = new EventDelegator(document.body)
    const listener = jest.fn()
    delegator.on('click', '.c', listener)
    c.click()
    delegator.off('click', listener)
    c.click()
    expect(listener).toBeCalledTimes(1)
  })

  test('#off - dont throw error when listener is already removed', () => {
    const delegator = new EventDelegator(document.body)
    const listener = jest.fn()
    const off = delegator.on('click', '.c', listener)
    off()
    expect(() => delegator.off('click', listener)).not.toThrowError()
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

  test('.assignEventTarget', () => {
    expect(EventDelegator.assignEventTarget).toBe(proxy)
  })
})
