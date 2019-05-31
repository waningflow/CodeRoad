import { getDepcruise } from '../util'

test('should return undefined', () => {
  function getDepcruiseWrapFn() {
    getDepcruise()
  }
  expect(getDepcruiseWrapFn).toThrow('params is required')
})
