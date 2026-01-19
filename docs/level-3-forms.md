# Level 3: 폼과 유효성 검사 테스트

> 🎯 목표: 폼 입력, 유효성 검사, 에러 표시, 제출 흐름을 테스트한다

## 📋 과제 개요

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐⭐ 중급 |
| 예상 소요 시간 | 6-8시간 |
| 선수 지식 | Level 2 완료 |
| 학습 키워드 | 폼 상호작용, 유효성 검사, 에러 메시지, `waitFor`, 제어/비제어 컴포넌트 |

---

## 🎨 과제 3-1: 로그인 폼

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                         Login Form                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                      │
│                    │      로그인          │                      │
│                    └─────────────────────┘                      │
│                                                                  │
│  이메일                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  example@email.com                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ⚠️ 올바른 이메일 형식이 아닙니다 (에러 시)                       │
│                                                                  │
│  비밀번호                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ••••••••                           👁️                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ⚠️ 비밀번호는 8자 이상이어야 합니다 (에러 시)                    │
│                                                                  │
│  ☐ 로그인 상태 유지                                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       로그인                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  계정이 없으신가요? 회원가입                                      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  로딩 상태:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             ⟳ 로그인 중...                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  (모든 입력 필드와 버튼 disabled)                                 │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  에러 상태 (서버 에러):                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ❌ 이메일 또는 비밀번호가 올바르지 않습니다                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 인터페이스

```typescript
interface LoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>
  onSignupClick?: () => void
}

interface LoginData {
  email: string
  password: string
  rememberMe: boolean
}
```

### 유효성 검사 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| 이메일 | 필수, 이메일 형식 | "이메일을 입력해주세요" / "올바른 이메일 형식이 아닙니다" |
| 비밀번호 | 필수, 8자 이상 | "비밀번호를 입력해주세요" / "비밀번호는 8자 이상이어야 합니다" |

### 테스트 케이스 명세

```typescript
// src/level-3-forms/__tests__/LoginForm.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()
  
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('초기 렌더링', () => {
    test('이메일, 비밀번호 입력 필드가 렌더링된다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    })

    test('로그인 버튼이 렌더링된다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)
      expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument()
    })

    test('로그인 상태 유지 체크박스가 렌더링된다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)
      expect(screen.getByRole('checkbox', { name: /로그인 상태 유지/i })).toBeInTheDocument()
    })

    test('초기에 에러 메시지가 없다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('입력 상호작용', () => {
    test('이메일을 입력할 수 있다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      const emailInput = screen.getByLabelText(/이메일/i)
      await user.type(emailInput, 'test@example.com')
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    test('비밀번호를 입력할 수 있다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      await user.type(passwordInput, 'password123')
      
      expect(passwordInput).toHaveValue('password123')
    })

    test('비밀번호 보기 버튼을 클릭하면 비밀번호가 표시된다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      const passwordInput = screen.getByLabelText(/비밀번호/i)
      await user.type(passwordInput, 'password123')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      const toggleButton = screen.getByRole('button', { name: /비밀번호 보기/i })
      await user.click(toggleButton)
      
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('유효성 검사', () => {
    test('빈 이메일로 제출하면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      expect(await screen.findByText(/이메일을 입력해주세요/i)).toBeInTheDocument()
    })

    test('잘못된 이메일 형식이면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      expect(await screen.findByText(/올바른 이메일 형식이 아닙니다/i)).toBeInTheDocument()
    })

    test('8자 미만 비밀번호면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/비밀번호/i), '1234567')
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      expect(await screen.findByText(/비밀번호는 8자 이상이어야 합니다/i)).toBeInTheDocument()
    })

    test('유효한 입력 후 에러가 사라진다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      // 에러 발생
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      expect(await screen.findByText(/이메일을 입력해주세요/i)).toBeInTheDocument()
      
      // 유효한 값 입력
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      
      // 에러 사라짐
      await waitFor(() => {
        expect(screen.queryByText(/이메일을 입력해주세요/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('폼 제출', () => {
    test('유효한 데이터로 제출하면 onSubmit이 호출된다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        })
      })
    })

    test('로그인 상태 유지 체크 시 rememberMe가 true로 전달된다', async () => {
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('checkbox', { name: /로그인 상태 유지/i }))
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true,
        })
      })
    })
  })

  describe('로딩 상태', () => {
    test('제출 중에는 로딩 표시가 나타난다', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      expect(await screen.findByText(/로그인 중/i)).toBeInTheDocument()
    })

    test('제출 중에는 폼이 비활성화된다', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      await waitFor(() => {
        expect(screen.getByLabelText(/이메일/i)).toBeDisabled()
        expect(screen.getByLabelText(/비밀번호/i)).toBeDisabled()
        expect(screen.getByRole('button', { name: /로그인 중/i })).toBeDisabled()
      })
    })
  })

  describe('서버 에러 처리', () => {
    test('제출 실패 시 에러 메시지가 표시된다', async () => {
      mockOnSubmit.mockRejectedValue(new Error('이메일 또는 비밀번호가 올바르지 않습니다'))
      
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))
      
      expect(await screen.findByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument()
    })
  })

  describe('회원가입 링크', () => {
    test('회원가입 클릭 시 onSignupClick이 호출된다', async () => {
      const handleSignupClick = vi.fn()
      const user = userEvent.setup()
      render(<LoginForm onSubmit={mockOnSubmit} onSignupClick={handleSignupClick} />)
      
      await user.click(screen.getByText(/회원가입/i))
      
      expect(handleSignupClick).toHaveBeenCalled()
    })
  })
})
```

---

## 🎨 과제 3-2: 회원가입 폼

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                       Registration Form                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                      │
│                    │      회원가입        │                      │
│                    └─────────────────────┘                      │
│                                                                  │
│  이름 *                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  홍길동                                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  이메일 *                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  example@email.com                          ✓ 사용가능     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  비밀번호 *                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ••••••••                                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  비밀번호 강도: [■■■□□] 보통                                     │
│  • 8자 이상 ✓   • 대문자 포함 ✓   • 숫자 포함 ✗                 │
│                                                                  │
│  비밀번호 확인 *                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ••••••••                                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ⚠️ 비밀번호가 일치하지 않습니다 (불일치 시)                      │
│                                                                  │
│  휴대폰 번호                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  010-1234-5678                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ☐ 이용약관에 동의합니다 (필수)                                   │
│  ☐ 마케팅 정보 수신에 동의합니다 (선택)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      가입하기                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 인터페이스

```typescript
interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => Promise<void>
  checkEmailAvailable: (email: string) => Promise<boolean>
}

interface RegistrationData {
  name: string
  email: string
  password: string
  phone?: string
  agreeToTerms: boolean
  agreeToMarketing: boolean
}
```

### 유효성 검사 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| 이름 | 필수, 2-20자 | "이름을 입력해주세요" / "이름은 2-20자여야 합니다" |
| 이메일 | 필수, 이메일 형식, 중복 검사 | "이미 사용 중인 이메일입니다" |
| 비밀번호 | 필수, 8자 이상, 대문자/숫자 포함 | 조건별 메시지 |
| 비밀번호 확인 | 필수, 비밀번호와 일치 | "비밀번호가 일치하지 않습니다" |
| 휴대폰 | 선택, 형식: 010-XXXX-XXXX | "올바른 휴대폰 번호 형식이 아닙니다" |
| 이용약관 | 필수 | "이용약관에 동의해주세요" |

### 테스트 케이스 명세

```typescript
// src/level-3-forms/__tests__/RegistrationForm.test.tsx

describe('RegistrationForm', () => {
  const mockOnSubmit = vi.fn()
  const mockCheckEmailAvailable = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockCheckEmailAvailable.mockClear()
    mockCheckEmailAvailable.mockResolvedValue(true)
  })

  describe('이메일 중복 검사', () => {
    test('이메일 입력 후 blur 시 중복 검사가 수행된다', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      const emailInput = screen.getByLabelText(/이메일/i)
      await user.type(emailInput, 'test@example.com')
      await user.tab()
      
      await waitFor(() => {
        expect(mockCheckEmailAvailable).toHaveBeenCalledWith('test@example.com')
      })
    })

    test('사용 가능한 이메일이면 성공 표시가 나타난다', async () => {
      mockCheckEmailAvailable.mockResolvedValue(true)
      
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.tab()
      
      expect(await screen.findByText(/사용가능/i)).toBeInTheDocument()
    })

    test('이미 사용 중인 이메일이면 에러가 표시된다', async () => {
      mockCheckEmailAvailable.mockResolvedValue(false)
      
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      await user.type(screen.getByLabelText(/이메일/i), 'existing@example.com')
      await user.tab()
      
      expect(await screen.findByText(/이미 사용 중인 이메일/i)).toBeInTheDocument()
    })
  })

  describe('비밀번호 강도 표시', () => {
    test('8자 이상 입력 시 조건이 충족 표시된다', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      await user.type(screen.getByLabelText(/^비밀번호$/i), '12345678')
      
      // 8자 이상 조건 충족 확인
      expect(screen.getByText(/8자 이상/i)).toHaveAttribute('data-satisfied', 'true')
    })
  })

  describe('비밀번호 확인', () => {
    test('비밀번호가 일치하지 않으면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123')
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'DifferentPass')
      await user.tab()
      
      expect(await screen.findByText(/비밀번호가 일치하지 않습니다/i)).toBeInTheDocument()
    })
  })

  describe('휴대폰 번호 포맷팅', () => {
    test('숫자만 입력해도 자동으로 하이픈이 추가된다', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      const phoneInput = screen.getByLabelText(/휴대폰/i)
      await user.type(phoneInput, '01012345678')
      
      expect(phoneInput).toHaveValue('010-1234-5678')
    })
  })

  describe('이용약관 동의', () => {
    test('이용약관 미동의 시 가입이 불가능하다', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      await user.type(screen.getByLabelText(/이름/i), '홍길동')
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123')
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123')
      
      await user.click(screen.getByRole('button', { name: /가입하기/i }))
      
      expect(await screen.findByText(/이용약관에 동의해주세요/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('폼 제출', () => {
    test('모든 필수 항목 충족 시 제출된다', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmit={mockOnSubmit} checkEmailAvailable={mockCheckEmailAvailable} />)
      
      await user.type(screen.getByLabelText(/이름/i), '홍길동')
      await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^비밀번호$/i), 'Password123')
      await user.type(screen.getByLabelText(/비밀번호 확인/i), 'Password123')
      await user.click(screen.getByRole('checkbox', { name: /이용약관/i }))
      
      await user.click(screen.getByRole('button', { name: /가입하기/i }))
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: '홍길동',
          email: 'test@example.com',
          password: 'Password123',
          phone: '',
          agreeToTerms: true,
          agreeToMarketing: false,
        })
      })
    })
  })
})
```

---

## 🎨 과제 3-3: 검색 및 필터 폼

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                     Search & Filter Form                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────┬─────────┬───────┐  │
│  │  🔍  검색어를 입력하세요                 │ 카테고리▼│ 검색  │  │
│  └─────────────────────────────────────────┴─────────┴───────┘  │
│                                                                  │
│  가격대                                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ○─────────────────●─────────────────○                     │ │
│  │  ₩0            ₩50,000           ₩100,000                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌─────────────┐ ~ ┌─────────────┐                              │
│  │   10,000    │   │   80,000    │  직접 입력                   │
│  └─────────────┘   └─────────────┘                              │
│                                                                  │
│  정렬                                                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ ● 최신순   │ │ ○ 인기순   │ │ ○ 가격낮은 │ │ ○ 가격높은 │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                  │
│  필터                                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑ 무료배송    ☐ 할인상품    ☑ 품절제외    ☐ 당일배송       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  현재 필터:  [무료배송 ✕] [₩10,000-₩80,000 ✕]  [필터 초기화]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 인터페이스

```typescript
interface SearchFilterFormProps {
  categories: Array<{ value: string; label: string }>
  onSearch: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

interface SearchFilters {
  keyword: string
  category: string
  priceMin: number
  priceMax: number
  sortBy: 'latest' | 'popular' | 'priceAsc' | 'priceDesc'
  freeShipping: boolean
  discounted: boolean
  inStockOnly: boolean
  sameDay: boolean
}
```

### 테스트 케이스 명세

```typescript
// src/level-3-forms/__tests__/SearchFilterForm.test.tsx

const mockCategories = [
  { value: '', label: '전체' },
  { value: 'electronics', label: '전자제품' },
  { value: 'fashion', label: '패션' },
]

describe('SearchFilterForm', () => {
  const mockOnSearch = vi.fn()

  describe('검색어 입력', () => {
    test('검색어를 입력하고 Enter를 누르면 검색이 실행된다', async () => {
      const user = userEvent.setup()
      render(<SearchFilterForm categories={mockCategories} onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/검색어/i)
      await user.type(searchInput, '노트북{Enter}')
      
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: '노트북' })
      )
    })
  })

  describe('가격 범위', () => {
    test('최소가 최대보다 크면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      render(<SearchFilterForm categories={mockCategories} onSearch={mockOnSearch} />)
      
      await user.type(screen.getByLabelText(/최소 가격/i), '80000')
      await user.type(screen.getByLabelText(/최대 가격/i), '10000')
      
      expect(screen.getByText(/최소 가격이 최대 가격보다 클 수 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('필터 초기화', () => {
    test('초기화 버튼 클릭 시 모든 필터가 초기 상태로 돌아간다', async () => {
      const user = userEvent.setup()
      render(<SearchFilterForm categories={mockCategories} onSearch={mockOnSearch} />)
      
      await user.type(screen.getByPlaceholderText(/검색어/i), '노트북')
      await user.click(screen.getByRole('checkbox', { name: /무료배송/i }))
      
      await user.click(screen.getByRole('button', { name: /필터 초기화/i }))
      
      expect(screen.getByPlaceholderText(/검색어/i)).toHaveValue('')
      expect(screen.getByRole('checkbox', { name: /무료배송/i })).not.toBeChecked()
    })
  })
})
```

---

## ✅ 완료 체크리스트

### 과제 3-1: 로그인 폼
- [ ] 초기 렌더링 테스트 (4개 케이스)
- [ ] 입력 상호작용 테스트 (3개 케이스)
- [ ] 유효성 검사 테스트 (4개 케이스)
- [ ] 폼 제출 테스트 (2개 케이스)
- [ ] 로딩 상태 테스트 (2개 케이스)
- [ ] 에러 처리 테스트 (1개 케이스)

### 과제 3-2: 회원가입 폼
- [ ] 이메일 중복 검사 테스트 (3개 케이스)
- [ ] 비밀번호 강도 테스트 (3개 케이스)
- [ ] 비밀번호 확인 테스트 (2개 케이스)
- [ ] 휴대폰 포맷팅 테스트 (2개 케이스)
- [ ] 이용약관 테스트 (1개 케이스)
- [ ] 폼 제출 테스트 (1개 케이스)

### 과제 3-3: 검색 및 필터 폼
- [ ] 검색어 테스트 (2개 케이스)
- [ ] 가격 범위 테스트 (3개 케이스)
- [ ] 필터 체크박스 테스트 (2개 케이스)
- [ ] 필터 초기화 테스트 (1개 케이스)

---

## 💡 학습 포인트

### 폼 테스트에서 자주 쓰는 패턴

```typescript
// 1. 입력 후 blur
await user.type(input, 'value')
await user.tab()

// 2. 폼 제출
await user.click(submitButton)

// 3. 에러 메시지 확인 (비동기)
expect(await screen.findByText(/에러 메시지/i)).toBeInTheDocument()

// 4. 에러 메시지 사라짐 확인
await waitFor(() => {
  expect(screen.queryByText(/에러 메시지/i)).not.toBeInTheDocument()
})
```

---

## 🚀 다음 단계

Level 3를 완료했다면 [Level 4: 비동기와 API 모킹](./level-4-async.md)로 진행하세요.
