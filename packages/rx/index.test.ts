import { delegate } from './index'
import { tap, map, take, toArray } from 'rxjs/operators'

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

test('delegate', (done) => {
  expect.assertions(3)
  const c = document.querySelector('.c') as HTMLElement
  const select = delegate(document.body)
  const mock = jest.fn((ev: Event) => ev)

  select('click', '.c')
    .pipe(
      map(mock),
      tap((e) => expect(e.target).toBe(c)),
      take(1),
      toArray(),
    )
    .toPromise()
    .then((arr) => {
      expect(mock).toBeCalledTimes(1)
      expect(arr.length).toBe(1)
      done()
    })

  c.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  c.dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
