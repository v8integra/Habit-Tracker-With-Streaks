import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  // Each test starts on the Today screen with no habit in the URL.
  window.history.replaceState(null, '', '/')
})
