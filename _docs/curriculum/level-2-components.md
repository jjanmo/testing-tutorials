# Level 2: 컴포넌트 단위 테스트

> 🎯 목표: React Testing Library를 사용해 사용자 관점에서 컴포넌트를 테스트한다

## 📋 과제 개요

| 항목           | 내용                                                              |
| -------------- | ----------------------------------------------------------------- |
| 난이도         | ⭐⭐ 초급                                                         |
| 예상 소요 시간 | 8-10시간                                                          |
| 선수 지식      | Level 1 완료, React 기초                                          |
| 학습 키워드    | `render`, `screen`, `userEvent`, `getByRole`, `findBy`, `waitFor` |

---

## 🎨 과제 2-1: Counter 컴포넌트

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                        Counter Component                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │         0           │  ← 현재 값           │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                  │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│         │   -10   │    │   -1    │    │   +1    │              │
│         └─────────┘    └─────────┘    └─────────┘              │
│                                                                  │
│         ┌─────────┐    ┌─────────────────────────┐              │
│         │   +10   │    │        초기화           │              │
│         └─────────┘    └─────────────────────────┘              │
│                                                                  │
│  Props:                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • initialValue?: number (기본값: 0)                       │   │
│  │ • min?: number (최소값 제한, 기본값: 없음)                 │   │
│  │ • max?: number (최대값 제한, 기본값: 없음)                 │   │
│  │ • step?: number (증감 단위, 기본값: 1)                     │   │
│  │ • onChange?: (value: number) => void                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  상태별 UI:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • min에 도달하면 감소 버튼 disabled                        │   │
│  │ • max에 도달하면 증가 버튼 disabled                        │   │
│  │ • 값이 음수면 빨간색, 양수면 검정색                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 인터페이스

```typescript
interface CounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}
```

### 테스트 케이스 명세

```typescript
// src/level-2-components/__tests__/Counter.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { Counter } from '../Counter'

describe('Counter', () => {
  describe('초기 렌더링', () => {
    test('기본값 0으로 렌더링된다', () => {
      render(<Counter />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    test('initialValue prop으로 초기값을 설정할 수 있다', () => {
      render(<Counter initialValue={10} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    test('모든 버튼이 렌더링된다', () => {
      render(<Counter />)
      expect(screen.getByRole('button', { name: '-10' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '-1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+10' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument()
    })
  })

  describe('증가/감소 동작', () => {
    test('+1 버튼 클릭 시 값이 1 증가한다', async () => {
      const user = userEvent.setup()
      render(<Counter />)

      await user.click(screen.getByRole('button', { name: '+1' }))

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    test('-1 버튼 클릭 시 값이 1 감소한다', async () => {
      const user = userEvent.setup()
      render(<Counter initialValue={5} />)

      await user.click(screen.getByRole('button', { name: '-1' }))

      expect(screen.getByText('4')).toBeInTheDocument()
    })

    test('+10 버튼 클릭 시 값이 10 증가한다', async () => {
      // TODO: 구현
    })

    test('-10 버튼 클릭 시 값이 10 감소한다', async () => {
      // TODO: 구현
    })

    test('여러 번 클릭하면 누적된다', async () => {
      const user = userEvent.setup()
      render(<Counter />)

      await user.click(screen.getByRole('button', { name: '+1' }))
      await user.click(screen.getByRole('button', { name: '+1' }))
      await user.click(screen.getByRole('button', { name: '+10' }))

      expect(screen.getByText('12')).toBeInTheDocument()
    })
  })

  describe('초기화 동작', () => {
    test('초기화 버튼 클릭 시 initialValue로 돌아간다', async () => {
      const user = userEvent.setup()
      render(<Counter initialValue={5} />)

      await user.click(screen.getByRole('button', { name: '+10' }))
      await user.click(screen.getByRole('button', { name: '초기화' }))

      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('min/max 제한', () => {
    test('max에 도달하면 증가 버튼이 비활성화된다', async () => {
      render(<Counter initialValue={10} max={10} />)

      expect(screen.getByRole('button', { name: '+1' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '+10' })).toBeDisabled()
    })

    test('min에 도달하면 감소 버튼이 비활성화된다', async () => {
      render(<Counter initialValue={0} min={0} />)

      expect(screen.getByRole('button', { name: '-1' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '-10' })).toBeDisabled()
    })

    test('max를 초과하는 값으로 증가하지 않는다', async () => {
      const user = userEvent.setup()
      render(<Counter initialValue={5} max={10} />)

      await user.click(screen.getByRole('button', { name: '+10' }))

      expect(screen.getByText('10')).toBeInTheDocument() // max로 제한
    })
  })

  describe('onChange 콜백', () => {
    test('값이 변경될 때 onChange가 호출된다', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(<Counter onChange={handleChange} />)

      await user.click(screen.getByRole('button', { name: '+1' }))

      expect(handleChange).toHaveBeenCalledWith(1)
    })

    test('초기화 시에도 onChange가 호출된다', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(<Counter initialValue={0} onChange={handleChange} />)

      await user.click(screen.getByRole('button', { name: '+1' }))
      await user.click(screen.getByRole('button', { name: '초기화' }))

      expect(handleChange).toHaveBeenLastCalledWith(0)
    })
  })

  describe('스타일/접근성', () => {
    test('음수 값은 빨간색으로 표시된다', async () => {
      const user = userEvent.setup()
      render(<Counter initialValue={0} />)

      await user.click(screen.getByRole('button', { name: '-1' }))

      const display = screen.getByText('-1')
      expect(display).toHaveClass('text-red-500') // 또는 해당 클래스
    })

    test('카운터 값에 적절한 aria-label이 있다', () => {
      render(<Counter initialValue={5} />)
      expect(screen.getByLabelText(/현재 값/i)).toBeInTheDocument()
    })
  })
})
```

---

## 🎨 과제 2-2: Toggle/Switch 컴포넌트

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                       Toggle Component                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  기본 상태 (OFF):                                                │
│  ┌──────────────────────────────────────────────────┐           │
│  │                                                   │           │
│  │    ┌────────────────────────────┐                │           │
│  │    │ ⚪─────────────────────────│  OFF           │           │
│  │    └────────────────────────────┘                │           │
│  │     ↑ 회색 배경, 왼쪽 정렬 동그라미               │           │
│  │                                                   │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  활성 상태 (ON):                                                 │
│  ┌──────────────────────────────────────────────────┐           │
│  │                                                   │           │
│  │    ┌────────────────────────────┐                │           │
│  │    │─────────────────────────⚪ │  ON            │           │
│  │    └────────────────────────────┘                │           │
│  │     ↑ 파란색 배경, 오른쪽 정렬 동그라미            │           │
│  │                                                   │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  비활성 상태 (Disabled):                                         │
│  ┌──────────────────────────────────────────────────┐           │
│  │                                                   │           │
│  │    ┌────────────────────────────┐                │           │
│  │    │ ⚪─────────────────────────│  (연한 회색)   │           │
│  │    └────────────────────────────┘                │           │
│  │     ↑ 클릭 불가, 커서 not-allowed                 │           │
│  │                                                   │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  Props:                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • checked?: boolean (기본값: false)                       │   │
│  │ • defaultChecked?: boolean (비제어 컴포넌트용)             │   │
│  │ • disabled?: boolean (기본값: false)                      │   │
│  │ • label?: string                                          │   │
│  │ • onChange?: (checked: boolean) => void                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 인터페이스

```typescript
interface ToggleProps {
  checked?: boolean; // 제어 컴포넌트
  defaultChecked?: boolean; // 비제어 컴포넌트
  disabled?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
}
```

### 테스트 케이스 명세

```typescript
// src/level-2-components/__tests__/Toggle.test.tsx

describe('Toggle', () => {
  describe('비제어 컴포넌트 (defaultChecked)', () => {
    test('기본값은 off 상태다', () => {
      render(<Toggle />)
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    test('defaultChecked=true면 on 상태로 시작한다', () => {
      render(<Toggle defaultChecked />)
      expect(screen.getByRole('switch')).toBeChecked()
    })

    test('클릭하면 상태가 토글된다', async () => {
      const user = userEvent.setup()
      render(<Toggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      expect(toggle).toBeChecked()
    })

    test('다시 클릭하면 원래 상태로 돌아간다', async () => {
      const user = userEvent.setup()
      render(<Toggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)
      await user.click(toggle)

      expect(toggle).not.toBeChecked()
    })
  })

  describe('제어 컴포넌트 (checked)', () => {
    test('checked prop으로 상태를 제어한다', () => {
      const { rerender } = render(<Toggle checked={false} />)
      expect(screen.getByRole('switch')).not.toBeChecked()

      rerender(<Toggle checked={true} />)
      expect(screen.getByRole('switch')).toBeChecked()
    })

    test('클릭해도 onChange 없이는 상태가 바뀌지 않는다', async () => {
      const user = userEvent.setup()
      render(<Toggle checked={false} />)

      await user.click(screen.getByRole('switch'))

      expect(screen.getByRole('switch')).not.toBeChecked()
    })
  })

  describe('onChange 콜백', () => {
    test('토글 시 onChange가 새 상태와 함께 호출된다', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(<Toggle onChange={handleChange} />)

      await user.click(screen.getByRole('switch'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('disabled 상태', () => {
    test('disabled면 클릭해도 상태가 바뀌지 않는다', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(<Toggle disabled onChange={handleChange} />)

      await user.click(screen.getByRole('switch'))

      expect(handleChange).not.toHaveBeenCalled()
    })

    test('disabled면 switch가 비활성화된다', () => {
      render(<Toggle disabled />)
      expect(screen.getByRole('switch')).toBeDisabled()
    })
  })

  describe('레이블', () => {
    test('label prop이 있으면 레이블이 표시된다', () => {
      render(<Toggle label="알림 설정" />)
      expect(screen.getByText('알림 설정')).toBeInTheDocument()
    })

    test('레이블을 클릭해도 토글된다', async () => {
      const user = userEvent.setup()
      render(<Toggle label="알림 설정" />)

      await user.click(screen.getByText('알림 설정'))

      expect(screen.getByRole('switch')).toBeChecked()
    })
  })

  describe('키보드 접근성', () => {
    test('Space 키로 토글할 수 있다', async () => {
      const user = userEvent.setup()
      render(<Toggle />)

      const toggle = screen.getByRole('switch')
      toggle.focus()
      await user.keyboard(' ')

      expect(toggle).toBeChecked()
    })

    test('Enter 키로 토글할 수 있다', async () => {
      const user = userEvent.setup()
      render(<Toggle />)

      const toggle = screen.getByRole('switch')
      toggle.focus()
      await user.keyboard('{Enter}')

      expect(toggle).toBeChecked()
    })
  })
})
```

---

## 🎨 과제 2-3: Accordion 컴포넌트

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                      Accordion Component                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  접힌 상태:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ▶  섹션 제목 1                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ▶  섹션 제목 2                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ▶  섹션 제목 3                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  펼친 상태 (섹션 2 클릭 후):                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ▶  섹션 제목 1                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ▼  섹션 제목 2                                    ←클릭됨  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  여기에 섹션 2의 내용이 표시됩니다.                         │   │
│  │  애니메이션과 함께 펼쳐집니다.                              │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ▶  섹션 제목 3                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Props:                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ items: Array<{ id: string, title: string, content: node }>│   │
│  │ allowMultiple?: boolean (여러 개 동시 열기, 기본: false)   │   │
│  │ defaultOpenIds?: string[] (기본 열린 항목들)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 인터페이스

```typescript
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
}
```

### 테스트 케이스 명세

```typescript
// src/level-2-components/__tests__/Accordion.test.tsx

const mockItems: AccordionItem[] = [
  { id: '1', title: '섹션 1', content: '섹션 1의 내용입니다.' },
  { id: '2', title: '섹션 2', content: '섹션 2의 내용입니다.' },
  { id: '3', title: '섹션 3', content: <div data-testid="custom-content">커스텀 컨텐츠</div> },
]

describe('Accordion', () => {
  describe('초기 렌더링', () => {
    test('모든 항목의 제목이 표시된다', () => {
      render(<Accordion items={mockItems} />)

      expect(screen.getByText('섹션 1')).toBeInTheDocument()
      expect(screen.getByText('섹션 2')).toBeInTheDocument()
      expect(screen.getByText('섹션 3')).toBeInTheDocument()
    })

    test('기본적으로 모든 내용이 숨겨져 있다', () => {
      render(<Accordion items={mockItems} />)

      expect(screen.queryByText('섹션 1의 내용입니다.')).not.toBeInTheDocument()
      expect(screen.queryByText('섹션 2의 내용입니다.')).not.toBeInTheDocument()
    })

    test('defaultOpenIds로 초기에 열린 항목을 지정할 수 있다', () => {
      render(<Accordion items={mockItems} defaultOpenIds={['2']} />)

      expect(screen.queryByText('섹션 1의 내용입니다.')).not.toBeInTheDocument()
      expect(screen.getByText('섹션 2의 내용입니다.')).toBeInTheDocument()
    })
  })

  describe('열기/닫기 동작', () => {
    test('제목 클릭 시 내용이 표시된다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      await user.click(screen.getByText('섹션 1'))

      expect(screen.getByText('섹션 1의 내용입니다.')).toBeInTheDocument()
    })

    test('열린 항목의 제목을 클릭하면 닫힌다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} defaultOpenIds={['1']} />)

      await user.click(screen.getByText('섹션 1'))

      expect(screen.queryByText('섹션 1의 내용입니다.')).not.toBeInTheDocument()
    })

    test('allowMultiple=false면 하나만 열 수 있다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} allowMultiple={false} />)

      await user.click(screen.getByText('섹션 1'))
      await user.click(screen.getByText('섹션 2'))

      expect(screen.queryByText('섹션 1의 내용입니다.')).not.toBeInTheDocument()
      expect(screen.getByText('섹션 2의 내용입니다.')).toBeInTheDocument()
    })

    test('allowMultiple=true면 여러 개를 동시에 열 수 있다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} allowMultiple={true} />)

      await user.click(screen.getByText('섹션 1'))
      await user.click(screen.getByText('섹션 2'))

      expect(screen.getByText('섹션 1의 내용입니다.')).toBeInTheDocument()
      expect(screen.getByText('섹션 2의 내용입니다.')).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    test('각 제목 버튼에 aria-expanded 속성이 있다', () => {
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-expanded')
      })
    })

    test('열린 항목의 aria-expanded는 true다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const button = screen.getByRole('button', { name: '섹션 1' })
      expect(button).toHaveAttribute('aria-expanded', 'false')

      await user.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    test('키보드로 탐색할 수 있다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const firstButton = screen.getByRole('button', { name: '섹션 1' })
      firstButton.focus()

      await user.keyboard('{Enter}')

      expect(screen.getByText('섹션 1의 내용입니다.')).toBeInTheDocument()
    })
  })

  describe('커스텀 컨텐츠', () => {
    test('ReactNode를 content로 렌더링할 수 있다', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      await user.click(screen.getByText('섹션 3'))

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    })
  })
})
```

---

## 🎨 과제 2-4: Tabs 컴포넌트

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                         Tabs Component                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────┬────────┬────────┬────────┐                          │
│  │  탭 1  │  탭 2  │  탭 3  │        │  ← 탭 버튼들             │
│  │ ═══════│        │        │        │    (탭 1 선택됨)         │
│  └────────┴────────┴────────┴────────┘                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │              탭 1의 내용이 여기에 표시됩니다               │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  탭 2 클릭 후:                                                   │
│  ┌────────┬────────┬────────┬────────┐                          │
│  │  탭 1  │  탭 2  │  탭 3  │        │                          │
│  │        │ ═══════│        │        │                          │
│  └────────┴────────┴────────┴────────┘                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │              탭 2의 내용이 여기에 표시됩니다               │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  비활성 탭:                                                      │
│  ┌────────┬────────┬────────┬────────┐                          │
│  │  탭 1  │  탭 2  │ 탭 3   │        │                          │
│  │ ═══════│        │ (회색) │        │  ← 탭 3 disabled         │
│  └────────┴────────┴────────┴────────┘                          │
│                                                                  │
│  Props:                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ tabs: Array<{                                             │   │
│  │   id: string,                                             │   │
│  │   label: string,                                          │   │
│  │   content: ReactNode,                                     │   │
│  │   disabled?: boolean                                      │   │
│  │ }>                                                        │   │
│  │ defaultActiveId?: string                                  │   │
│  │ onChange?: (id: string) => void                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 테스트 케이스 명세

```typescript
// src/level-2-components/__tests__/Tabs.test.tsx

const mockTabs = [
  { id: 'tab1', label: '프로필', content: '프로필 내용입니다.' },
  { id: 'tab2', label: '설정', content: '설정 내용입니다.' },
  { id: 'tab3', label: '알림', content: '알림 내용입니다.', disabled: true },
]

describe('Tabs', () => {
  describe('초기 렌더링', () => {
    test('모든 탭 레이블이 표시된다', () => {
      render(<Tabs tabs={mockTabs} />)

      expect(screen.getByRole('tab', { name: '프로필' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: '설정' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: '알림' })).toBeInTheDocument()
    })

    test('첫 번째 탭이 기본으로 선택된다', () => {
      render(<Tabs tabs={mockTabs} />)

      expect(screen.getByRole('tab', { name: '프로필' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('프로필 내용입니다.')).toBeInTheDocument()
    })

    test('defaultActiveId로 초기 선택 탭을 지정할 수 있다', () => {
      render(<Tabs tabs={mockTabs} defaultActiveId="tab2" />)

      expect(screen.getByRole('tab', { name: '설정' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('설정 내용입니다.')).toBeInTheDocument()
    })
  })

  describe('탭 전환', () => {
    test('탭 클릭 시 해당 컨텐츠가 표시된다', async () => {
      const user = userEvent.setup()
      render(<Tabs tabs={mockTabs} />)

      await user.click(screen.getByRole('tab', { name: '설정' }))

      expect(screen.getByText('설정 내용입니다.')).toBeInTheDocument()
      expect(screen.queryByText('프로필 내용입니다.')).not.toBeInTheDocument()
    })

    test('탭 전환 시 onChange가 호출된다', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(<Tabs tabs={mockTabs} onChange={handleChange} />)

      await user.click(screen.getByRole('tab', { name: '설정' }))

      expect(handleChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('disabled 탭', () => {
    test('disabled 탭은 클릭해도 선택되지 않는다', async () => {
      const user = userEvent.setup()
      render(<Tabs tabs={mockTabs} />)

      await user.click(screen.getByRole('tab', { name: '알림' }))

      expect(screen.getByRole('tab', { name: '알림' })).toHaveAttribute('aria-selected', 'false')
      expect(screen.queryByText('알림 내용입니다.')).not.toBeInTheDocument()
    })

    test('disabled 탭에 aria-disabled 속성이 있다', () => {
      render(<Tabs tabs={mockTabs} />)

      expect(screen.getByRole('tab', { name: '알림' })).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('키보드 네비게이션', () => {
    test('좌우 화살표로 탭 간 이동할 수 있다', async () => {
      const user = userEvent.setup()
      render(<Tabs tabs={mockTabs} />)

      const firstTab = screen.getByRole('tab', { name: '프로필' })
      firstTab.focus()

      await user.keyboard('{ArrowRight}')

      expect(screen.getByRole('tab', { name: '설정' })).toHaveFocus()
    })

    test('disabled 탭은 건너뛴다', async () => {
      const user = userEvent.setup()
      render(<Tabs tabs={mockTabs} />)

      const secondTab = screen.getByRole('tab', { name: '설정' })
      secondTab.focus()

      await user.keyboard('{ArrowRight}')

      // 알림 탭(disabled)을 건너뛰고 첫 번째로 돌아감
      expect(screen.getByRole('tab', { name: '프로필' })).toHaveFocus()
    })
  })

  describe('접근성', () => {
    test('tablist role이 있다', () => {
      render(<Tabs tabs={mockTabs} />)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    test('각 탭에 tab role이 있다', () => {
      render(<Tabs tabs={mockTabs} />)
      expect(screen.getAllByRole('tab')).toHaveLength(3)
    })

    test('탭 패널에 tabpanel role이 있다', () => {
      render(<Tabs tabs={mockTabs} />)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })
  })
})
```

---

## ✅ 완료 체크리스트

### 과제 2-1: Counter

- [ ] 초기 렌더링 테스트 (3개 케이스)
- [ ] 증가/감소 동작 테스트 (5개 케이스)
- [ ] min/max 제한 테스트 (4개 케이스)
- [ ] onChange 콜백 테스트 (2개 케이스)
- [ ] 접근성 테스트 (2개 케이스)

### 과제 2-2: Toggle

- [ ] 비제어 컴포넌트 테스트 (4개 케이스)
- [ ] 제어 컴포넌트 테스트 (2개 케이스)
- [ ] disabled 상태 테스트 (2개 케이스)
- [ ] 레이블 테스트 (2개 케이스)
- [ ] 키보드 접근성 테스트 (2개 케이스)

### 과제 2-3: Accordion

- [ ] 초기 렌더링 테스트 (3개 케이스)
- [ ] 열기/닫기 테스트 (4개 케이스)
- [ ] allowMultiple 테스트 (2개 케이스)
- [ ] 접근성 테스트 (3개 케이스)

### 과제 2-4: Tabs

- [ ] 초기 렌더링 테스트 (3개 케이스)
- [ ] 탭 전환 테스트 (2개 케이스)
- [ ] disabled 탭 테스트 (2개 케이스)
- [ ] 키보드 네비게이션 테스트 (2개 케이스)
- [ ] 접근성 테스트 (3개 케이스)

---

## 💡 학습 포인트

### RTL 쿼리 우선순위

```typescript
// 1순위: 접근성 쿼리 (권장)
screen.getByRole('button', { name: '제출' });
screen.getByLabelText('이메일');

// 2순위: 시맨틱 쿼리
screen.getByText('안녕하세요');
screen.getByAltText('프로필 이미지');

// 3순위: Test ID (최후의 수단)
screen.getByTestId('custom-element');
```

### userEvent vs fireEvent

```typescript
// ✅ userEvent 권장 - 실제 사용자 동작 시뮬레이션
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'hello');

// ⚠️ fireEvent - 단순 이벤트 발생 (빠르지만 비현실적)
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'hello' } });
```

### 비동기 쿼리

```typescript
// findBy* - 요소가 나타날 때까지 대기
await screen.findByText('로딩 완료');

// waitFor - 조건이 충족될 때까지 대기
await waitFor(() => {
  expect(screen.getByText('완료')).toBeInTheDocument();
});
```

---

## 🚀 다음 단계

Level 2를 완료했다면 [Level 3: 폼과 유효성 검사 테스트](./level-3-forms.md)로 진행하세요.
