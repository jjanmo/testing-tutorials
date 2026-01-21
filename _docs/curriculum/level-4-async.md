# Level 4: 비동기와 API 모킹

> 🎯 목표: MSW를 사용해 API를 모킹하고, 로딩/에러/성공 상태를 테스트한다

## 📋 과제 개요

| 항목           | 내용                                                            |
| -------------- | --------------------------------------------------------------- |
| 난이도         | ⭐⭐⭐⭐ 중급                                                   |
| 예상 소요 시간 | 10-12시간                                                       |
| 선수 지식      | Level 3 완료                                                    |
| 학습 키워드    | MSW, 로딩 상태, 에러 처리, `findBy`, `waitFor`, 낙관적 업데이트 |

---

## 🛠 MSW 설정

### 설치 및 초기 설정

```bash
npm install msw --save-dev
```

### mocks/handlers.ts

```typescript
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // 상품 목록
  http.get('/api/products', async () => {
    await delay(100);
    return HttpResponse.json({
      products: [
        { id: 1, name: '노트북', price: 1500000, stock: 10 },
        { id: 2, name: '키보드', price: 150000, stock: 25 },
        { id: 3, name: '마우스', price: 80000, stock: 0 },
      ],
      total: 3,
    });
  }),

  // 상품 상세
  http.get('/api/products/:id', async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      id: Number(params.id),
      name: '노트북',
      price: 1500000,
      description: '고성능 노트북입니다.',
      stock: 10,
      images: ['/images/laptop1.jpg', '/images/laptop2.jpg'],
    });
  }),

  // 장바구니 조회
  http.get('/api/cart', async () => {
    await delay(100);
    return HttpResponse.json({
      items: [
        { id: 1, productId: 1, quantity: 2, product: { name: '노트북', price: 1500000, stock: 10 } },
        { id: 2, productId: 2, quantity: 1, product: { name: '키보드', price: 150000, stock: 25 } },
      ],
      totalPrice: 3150000,
    });
  }),

  // 장바구니 추가
  http.post('/api/cart', async ({ request }) => {
    await delay(100);
    const body = await request.json();
    return HttpResponse.json({ success: true, item: body });
  }),

  // 장바구니 수량 변경
  http.patch('/api/cart/:itemId', async ({ request }) => {
    await delay(100);
    const body = await request.json();
    return HttpResponse.json({ success: true, quantity: body.quantity });
  }),

  // 장바구니 삭제
  http.delete('/api/cart/:itemId', async () => {
    await delay(100);
    return HttpResponse.json({ success: true });
  }),
];
```

### mocks/server.ts

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### vitest.setup.ts 수정

```typescript
import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 🎨 과제 4-1: 상품 목록 페이지

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                      Product List Page                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  로딩 상태:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    ┌──────┐  ┌──────┐  ┌──────┐                          │   │
│  │    │ ░░░░ │  │ ░░░░ │  │ ░░░░ │  ← 스켈레톤 UI           │   │
│  │    │ ░░░░ │  │ ░░░░ │  │ ░░░░ │                          │   │
│  │    └──────┘  └──────┘  └──────┘                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  성공 상태:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│  │  │   [이미지]   │  │   [이미지]   │  │   [이미지]   │       │   │
│  │  │  노트북      │  │  키보드      │  │  마우스      │       │   │
│  │  │  ₩1,500,000 │  │  ₩150,000   │  │  ₩80,000    │       │   │
│  │  │  재고: 10   │  │  재고: 25   │  │  품절        │       │   │
│  │  │ [장바구니]  │  │ [장바구니]  │  │ [품절]       │       │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  에러 상태:                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       ⚠️ 상품을 불러오는데 실패했습니다                    │   │
│  │            [다시 시도]                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  빈 상태:                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           📦 표시할 상품이 없습니다                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 테스트 케이스 명세

```typescript
// src/level-4-async/__tests__/ProductList.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { server } from '@/mocks/server'
import { ProductList } from '../ProductList'

describe('ProductList', () => {
  describe('로딩 상태', () => {
    test('데이터 로딩 중 스켈레톤 UI가 표시된다', async () => {
      server.use(
        http.get('/api/products', async () => {
          await delay(500)
          return HttpResponse.json({ products: [], total: 0 })
        })
      )

      render(<ProductList />)

      expect(screen.getAllByTestId('product-skeleton')).toHaveLength(6)
    })

    test('로딩 완료 후 스켈레톤이 사라진다', async () => {
      render(<ProductList />)

      await waitFor(() => {
        expect(screen.queryAllByTestId('product-skeleton')).toHaveLength(0)
      })
    })
  })

  describe('성공 상태', () => {
    test('상품 목록이 표시된다', async () => {
      render(<ProductList />)

      expect(await screen.findByText('노트북')).toBeInTheDocument()
      expect(await screen.findByText('키보드')).toBeInTheDocument()
    })

    test('가격이 포맷팅되어 표시된다', async () => {
      render(<ProductList />)

      expect(await screen.findByText('₩1,500,000')).toBeInTheDocument()
    })

    test('품절 상품은 품절 표시가 된다', async () => {
      render(<ProductList />)

      await screen.findByText('마우스')
      expect(screen.getByText('품절')).toBeInTheDocument()
    })

    test('품절 상품의 장바구니 버튼이 비활성화된다', async () => {
      render(<ProductList />)

      await screen.findByText('마우스')

      const buttons = screen.getAllByRole('button', { name: /장바구니|품절/i })
      const outOfStockButton = buttons.find(btn => btn.textContent === '품절')

      expect(outOfStockButton).toBeDisabled()
    })
  })

  describe('에러 상태', () => {
    test('API 에러 시 에러 메시지가 표시된다', async () => {
      server.use(
        http.get('/api/products', () => {
          return HttpResponse.json({ error: '서버 오류' }, { status: 500 })
        })
      )

      render(<ProductList />)

      expect(await screen.findByText(/상품을 불러오는데 실패했습니다/i)).toBeInTheDocument()
    })

    test('다시 시도 버튼 클릭 시 재요청한다', async () => {
      let callCount = 0

      server.use(
        http.get('/api/products', () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json({ error: '에러' }, { status: 500 })
          }
          return HttpResponse.json({
            products: [{ id: 1, name: '노트북', price: 1500000, stock: 10 }],
            total: 1,
          })
        })
      )

      const user = userEvent.setup()
      render(<ProductList />)

      await screen.findByText(/실패했습니다/i)
      await user.click(screen.getByRole('button', { name: /다시 시도/i }))

      expect(await screen.findByText('노트북')).toBeInTheDocument()
    })
  })

  describe('빈 상태', () => {
    test('상품이 없으면 빈 상태 메시지가 표시된다', async () => {
      server.use(
        http.get('/api/products', () => {
          return HttpResponse.json({ products: [], total: 0 })
        })
      )

      render(<ProductList />)

      expect(await screen.findByText(/표시할 상품이 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('장바구니 추가', () => {
    test('장바구니 버튼 클릭 시 API가 호출된다', async () => {
      let addedProduct = null

      server.use(
        http.post('/api/cart', async ({ request }) => {
          addedProduct = await request.json()
          return HttpResponse.json({ success: true })
        })
      )

      const user = userEvent.setup()
      render(<ProductList />)

      await screen.findByText('노트북')

      const addButtons = screen.getAllByRole('button', { name: /장바구니/i })
      await user.click(addButtons[0])

      await waitFor(() => {
        expect(addedProduct).toEqual({ productId: 1, quantity: 1 })
      })
    })

    test('장바구니 추가 성공 시 토스트 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      render(<ProductList />)

      await screen.findByText('노트북')

      const addButtons = screen.getAllByRole('button', { name: /장바구니/i })
      await user.click(addButtons[0])

      expect(await screen.findByText(/장바구니에 추가되었습니다/i)).toBeInTheDocument()
    })
  })
})
```

---

## 🎨 과제 4-2: 장바구니 페이지

### 와이어프레임

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cart Page                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  장바구니 (2)                                                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ☑  ┌─────┐  노트북 Pro         ┌───┐┌───┐┌───┐          │   │
│  │    │     │  ₩1,500,000         │ - ││ 2 ││ + │  ₩3,000,000│   │
│  │    └─────┘                     └───┘└───┘└───┘    [삭제] │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ☑  ┌─────┐  키보드            ┌───┐┌───┐┌───┐           │   │
│  │    │     │  ₩150,000          │ - ││ 1 ││ + │  ₩150,000 │   │
│  │    └─────┘                    └───┘└───┘└───┘     [삭제] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  ☑ 전체 선택                                                    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  상품 금액                              ₩3,150,000       │   │
│  │  배송비                                      ₩0          │   │
│  │  ─────────────────────────────────────────────────────── │   │
│  │  총 결제 금액                           ₩3,150,000       │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              2개 상품 주문하기                        │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 테스트 케이스 명세

```typescript
// src/level-4-async/__tests__/Cart.test.tsx

describe('Cart', () => {
  describe('장바구니 조회', () => {
    test('장바구니 아이템이 표시된다', async () => {
      render(<Cart />)

      expect(await screen.findByText('노트북')).toBeInTheDocument()
      expect(screen.getByText('₩3,000,000')).toBeInTheDocument()
    })

    test('빈 장바구니면 빈 상태 메시지가 표시된다', async () => {
      server.use(
        http.get('/api/cart', () => {
          return HttpResponse.json({ items: [], totalPrice: 0 })
        })
      )

      render(<Cart />)

      expect(await screen.findByText(/장바구니가 비어있습니다/i)).toBeInTheDocument()
    })
  })

  describe('수량 변경', () => {
    test('수량 증가 시 API가 호출되고 UI가 업데이트된다', async () => {
      let patchedQuantity = null

      server.use(
        http.patch('/api/cart/:itemId', async ({ request }) => {
          const body = await request.json()
          patchedQuantity = body.quantity
          return HttpResponse.json({ success: true })
        })
      )

      const user = userEvent.setup()
      render(<Cart />)

      await screen.findByText('노트북')

      const increaseButtons = screen.getAllByRole('button', { name: '+' })
      await user.click(increaseButtons[0])

      await waitFor(() => {
        expect(patchedQuantity).toBe(3)
      })
    })

    test('낙관적 업데이트: API 응답 전에 UI가 먼저 변경된다', async () => {
      server.use(
        http.patch('/api/cart/:itemId', async () => {
          await delay(1000)
          return HttpResponse.json({ success: true })
        })
      )

      const user = userEvent.setup()
      render(<Cart />)

      await screen.findByText('노트북')
      expect(screen.getByText('2')).toBeInTheDocument()

      const increaseButtons = screen.getAllByRole('button', { name: '+' })
      await user.click(increaseButtons[0])

      // API 응답 전에 즉시 UI가 변경됨
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    test('수량 변경 실패 시 원래 값으로 롤백된다', async () => {
      server.use(
        http.patch('/api/cart/:itemId', () => {
          return HttpResponse.json({ error: '재고 부족' }, { status: 400 })
        })
      )

      const user = userEvent.setup()
      render(<Cart />)

      await screen.findByText('노트북')

      const increaseButtons = screen.getAllByRole('button', { name: '+' })
      await user.click(increaseButtons[0])

      // 에러 후 원래 값으로 롤백
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })
  })

  describe('아이템 삭제', () => {
    test('삭제 버튼 클릭 시 확인 다이얼로그가 표시된다', async () => {
      const user = userEvent.setup()
      render(<Cart />)

      await screen.findByText('노트북')

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i })
      await user.click(deleteButtons[0])

      expect(screen.getByText(/정말 삭제하시겠습니까/i)).toBeInTheDocument()
    })

    test('확인 시 아이템이 삭제된다', async () => {
      const user = userEvent.setup()
      render(<Cart />)

      await screen.findByText('노트북')

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i })
      await user.click(deleteButtons[0])
      await user.click(screen.getByRole('button', { name: /확인/i }))

      await waitFor(() => {
        expect(screen.queryByText('노트북')).not.toBeInTheDocument()
      })
    })
  })

  describe('가격 계산', () => {
    test('선택된 상품의 총 금액이 계산된다', async () => {
      render(<Cart />)

      await screen.findByText('노트북')

      expect(screen.getByText('₩3,150,000')).toBeInTheDocument()
    })
  })
})
```

---

## ✅ 완료 체크리스트

### 과제 4-1: 상품 목록

- [ ] 로딩 상태 테스트 (2개 케이스)
- [ ] 성공 상태 테스트 (4개 케이스)
- [ ] 에러 상태 테스트 (2개 케이스)
- [ ] 빈 상태 테스트 (1개 케이스)
- [ ] 장바구니 추가 테스트 (2개 케이스)

### 과제 4-2: 장바구니

- [ ] 조회 테스트 (2개 케이스)
- [ ] 수량 변경 테스트 (3개 케이스)
- [ ] 아이템 삭제 테스트 (2개 케이스)
- [ ] 가격 계산 테스트 (1개 케이스)

---

## 💡 학습 포인트

### MSW 핸들러 오버라이드

```typescript
test('에러 케이스', async () => {
  server.use(
    http.get('/api/products', () => {
      return HttpResponse.json({ error: '에러' }, { status: 500 });
    }),
  );
  // 이 테스트에서만 에러 응답
});
```

### 비동기 테스트 패턴

```typescript
// findBy* - 요소가 나타날 때까지 대기
await screen.findByText('데이터');

// waitFor - 조건 충족까지 대기
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

---

## 🚀 다음 단계

Level 4를 완료했다면 [Level 5: 통합 테스트](./level-5-integration.md)로 진행하세요.
