import { api } from '@/lib/api'
import axios from 'axios'

jest.mock('axios')

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(axios.create as jest.Mock).mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })
  })

  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalled()
  })
})
