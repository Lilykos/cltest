import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

jest.mock('@/lib/api')

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should handle successful login', async () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      settings: {},
      created_at: new Date().toISOString(),
    }

    ;(api.login as jest.Mock).mockResolvedValue({
      access_token: 'test-token',
      token_type: 'bearer',
    })
    ;(api.getMe as jest.Mock).mockResolvedValue(mockUser)

    await useAuthStore.getState().login({
      username: 'testuser',
      password: 'password123',
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe('test-token')
  })

  it('should handle logout', () => {
    useAuthStore.setState({
      user: { id: '123', username: 'test', email: 'test@example.com', settings: {}, created_at: '' },
      token: 'test-token',
      isAuthenticated: true,
    })

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
