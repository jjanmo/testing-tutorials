# Level 6: E2E 테스트

> 🎯 목표: Playwright로 실제 브라우저에서 전체 사용자 플로우를 테스트한다

## 📋 과제 개요

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐⭐⭐⭐ 고급 |
| 예상 소요 시간 | 8-10시간 |
| 선수 지식 | Level 5 완료 |
| 학습 키워드 | Playwright, 브라우저 자동화, 시각적 테스트, CI/CD |

---

## 🛠 Playwright 설정

### 설치

```bash
npm install -D @playwright/test
npx playwright install
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 🎨 과제 6-1: 회원가입 → 로그인 → 프로필 수정

### 사용자 시나리오

```
┌─────────────────────────────────────────────────────────────────┐
│              User Registration & Profile Flow                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 홈페이지 → 회원가입 버튼 클릭                                 │
│  2. 회원가입 폼 작성 및 제출                                      │
│  3. 로그인 페이지에서 로그인                                      │
│  4. 프로필 페이지에서 정보 수정                                   │
│  5. 변경 사항 확인                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 테스트 코드

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('회원가입 및 프로필 수정 플로우', () => {
  const uniqueEmail = `test-${Date.now()}@example.com`
  
  test('신규 사용자 회원가입 → 로그인 → 프로필 수정', async ({ page }) => {
    // 1. 홈페이지 접속
    await page.goto('/')
    
    // 2. 회원가입 페이지로 이동
    await page.click('text=회원가입')
    await expect(page).toHaveURL('/register')
    
    // 3. 회원가입 폼 작성
    await page.fill('input[name="name"]', '테스트유저')
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="passwordConfirm"]', 'SecurePass123!')
    await page.check('input[name="agreeToTerms"]')
    await page.click('button:has-text("가입하기")')
    
    // 4. 회원가입 성공 확인
    await expect(page).toHaveURL('/login')
    
    // 5. 로그인
    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.click('button:has-text("로그인")')
    
    await expect(page.locator('header')).toContainText('테스트유저')
    
    // 6. 프로필 페이지로 이동 및 수정
    await page.click('[aria-label="프로필 메뉴"]')
    await page.click('text=프로필 설정')
    
    await page.fill('input[name="name"]', '홍길동')
    await page.click('button:has-text("저장")')
    
    // 7. 변경 사항 확인
    await expect(page.locator('header')).toContainText('홍길동')
  })
})
```

---

## 🎨 과제 6-2: 쇼핑 전체 플로우

### 사용자 시나리오

```
┌─────────────────────────────────────────────────────────────────┐
│                    Full Shopping Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 상품 검색 → 2. 상품 선택 → 3. 장바구니 추가                  │
│  4. 장바구니 확인 → 5. 주문하기 → 6. 결제 완료                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 테스트 코드

```typescript
// e2e/shopping.spec.ts
import { test, expect } from '@playwright/test'

test.describe('쇼핑 전체 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("로그인")')
  })

  test('상품 검색 → 장바구니 → 주문 완료', async ({ page }) => {
    // 1. 상품 검색
    await page.fill('[placeholder*="검색"]', '노트북')
    await page.press('[placeholder*="검색"]', 'Enter')
    await expect(page.locator('text=검색 결과')).toBeVisible()
    
    // 2. 상품 선택
    await page.click('text=노트북 Pro')
    
    // 3. 장바구니 추가
    await page.click('button:has-text("장바구니에 담기")')
    await expect(page.locator('[aria-label="장바구니"] .badge')).toContainText('1')
    
    // 4. 장바구니 페이지
    await page.click('[aria-label="장바구니"]')
    await expect(page.locator('text=노트북 Pro')).toBeVisible()
    
    // 5. 주문하기
    await page.click('button:has-text("주문하기")')
    await page.fill('input[name="address"]', '서울시 강남구')
    
    // 6. 결제
    await page.click('button:has-text("결제하기")')
    await expect(page.locator('text=주문이 완료되었습니다')).toBeVisible()
  })

  test('장바구니에서 수량 변경', async ({ page }) => {
    await page.goto('/products/1')
    await page.click('button:has-text("장바구니에 담기")')
    await page.goto('/cart')
    
    await page.click('button[aria-label="수량 증가"]')
    await expect(page.locator('.quantity-display')).toContainText('2')
  })
})
```

---

## 🎨 과제 6-3: 반응형 및 접근성 테스트

### 테스트 코드

```typescript
// e2e/responsive.spec.ts
import { test, expect } from '@playwright/test'

test.describe('반응형 테스트', () => {
  test('모바일에서 햄버거 메뉴가 동작한다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // 데스크톱 네비게이션이 숨겨짐
    await expect(page.locator('nav.desktop-nav')).not.toBeVisible()
    
    // 햄버거 메뉴 클릭
    await page.click('[aria-label="메뉴 열기"]')
    await expect(page.locator('.mobile-menu')).toBeVisible()
  })

  test('태블릿에서 그리드가 2열로 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/products')
    
    const grid = page.locator('.product-grid')
    await expect(grid).toHaveCSS('grid-template-columns', /repeat\(2/)
  })
})

// e2e/accessibility.spec.ts
test.describe('접근성 테스트', () => {
  test('키보드만으로 네비게이션이 가능하다', async ({ page }) => {
    await page.goto('/')
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    // 포커스된 요소가 활성화됨
  })

  test('ARIA 라벨이 올바르게 설정되어 있다', async ({ page }) => {
    await page.goto('/cart')
    
    await expect(page.locator('button[aria-label="수량 증가"]')).toBeVisible()
    await expect(page.locator('button[aria-label="수량 감소"]')).toBeVisible()
  })
})
```

---

## 🎨 과제 6-4: 시각적 회귀 테스트

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('시각적 회귀 테스트', () => {
  test('홈페이지 스냅샷', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('상품 목록 스냅샷', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('products.png')
  })

  test('다크모드 스냅샷', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page).toHaveScreenshot('home-dark.png')
  })
})
```

---

## ✅ 완료 체크리스트

### 과제 6-1: 회원가입 플로우
- [ ] 회원가입 → 로그인 → 프로필 수정 테스트

### 과제 6-2: 쇼핑 플로우
- [ ] 검색 → 장바구니 → 주문 완료 테스트
- [ ] 장바구니 수량 변경 테스트

### 과제 6-3: 반응형/접근성
- [ ] 모바일 네비게이션 테스트
- [ ] 키보드 접근성 테스트

### 과제 6-4: 시각적 회귀
- [ ] 주요 페이지 스냅샷 테스트

---

## 💡 학습 포인트

### Playwright 주요 API

```typescript
// 요소 선택
page.locator('text=버튼')
page.locator('button:has-text("클릭")')

// 액션
await page.click('button')
await page.fill('input', 'text')
await page.press('input', 'Enter')

// 단언
await expect(page).toHaveURL('/path')
await expect(locator).toBeVisible()
await expect(locator).toHaveText('text')
```

### CI/CD 설정

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 🎉 커리큘럼 완료

모든 레벨을 완료했습니다!

| 레벨 | 핵심 학습 |
|------|----------|
| Level 1 | Vitest, 순수 함수 테스트 |
| Level 2 | RTL, 컴포넌트 단위 테스트 |
| Level 3 | 폼 테스트, 유효성 검사 |
| Level 4 | MSW, 비동기/API 모킹 |
| Level 5 | 통합 테스트, 사용자 플로우 |
| Level 6 | E2E 테스트, Playwright |

### 다음 단계
1. 실제 프로젝트에 테스트 적용
2. `vitest --coverage`로 커버리지 측정
3. GitHub Actions로 CI/CD 구축
