# Level 1: 순수 함수와 유틸리티 테스트

> 🎯 목표: Vitest의 기본 문법을 익히고, 순수 함수 테스트의 기초를 다진다

## 📋 과제 개요

| 항목           | 내용                                                          |
| -------------- | ------------------------------------------------------------- |
| 난이도         | ⭐ 입문                                                       |
| 예상 소요 시간 | 4-6시간                                                       |
| 선수 지식      | TypeScript 기초                                               |
| 학습 키워드    | `test`, `expect`, `describe`, `beforeEach`, `toBe`, `toEqual` |

---

## 🎨 과제 1-1: 가격 계산 유틸리티

### 요구사항

쇼핑몰의 가격 계산 유틸리티 함수들을 만들고 테스트하세요.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Price Calculator Utility                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input:                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ originalPrice: 50000                                     │    │
│  │ discountPercent: 20                                      │    │
│  │ quantity: 3                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Functions to implement:                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. calculateDiscount(price, percent)                     │    │
│  │    → 할인 금액 반환                                        │    │
│  │                                                          │    │
│  │ 2. calculateFinalPrice(price, discountPercent)           │    │
│  │    → 할인 적용된 최종 가격                                  │    │
│  │                                                          │    │
│  │ 3. calculateTotal(items[])                               │    │
│  │    → 장바구니 총액 계산                                     │    │
│  │                                                          │    │
│  │ 4. formatPrice(price)                                    │    │
│  │    → "₩50,000" 형식 문자열                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Output:                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ discountAmount: 10000                                    │    │
│  │ finalPrice: 40000                                        │    │
│  │ totalPrice: 120000                                       │    │
│  │ formatted: "₩120,000"                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 구현해야 할 함수 명세

#### `calculateDiscount(price: number, discountPercent: number): number`

- 원가와 할인율을 받아 할인 금액을 반환
- 할인율은 0-100 사이
- 음수 가격이나 100 초과 할인율은 에러 throw

#### `calculateFinalPrice(price: number, discountPercent: number): number`

- 할인 적용된 최종 가격 반환
- 소수점 이하 버림 처리

#### `calculateTotal(items: CartItem[]): number`

```typescript
interface CartItem {
  price: number;
  quantity: number;
  discountPercent?: number;
}
```

- 장바구니 아이템 배열의 총액 계산
- 빈 배열이면 0 반환

#### `formatPrice(price: number): string`

- 천 단위 콤마와 ₩ 기호 포함
- 음수는 "-₩10,000" 형식

### 테스트 케이스 작성 가이드

```typescript
// src/level-1-utils/priceUtils.test.ts

import { describe, test, expect } from 'vitest';
import { calculateDiscount, calculateFinalPrice, calculateTotal, formatPrice } from './priceUtils';

describe('calculateDiscount', () => {
  test('정상적인 할인 금액을 계산한다', () => {
    // TODO: 구현
  });

  test('할인율이 0이면 0을 반환한다', () => {
    // TODO: 구현
  });

  test('할인율이 100이면 전체 금액을 반환한다', () => {
    // TODO: 구현
  });

  test('음수 가격이 들어오면 에러를 던진다', () => {
    // TODO: 구현
    // Hint: expect(() => fn()).toThrow()
  });

  test('100 초과 할인율이 들어오면 에러를 던진다', () => {
    // TODO: 구현
  });
});

describe('calculateFinalPrice', () => {
  test('할인된 최종 가격을 계산한다', () => {
    // TODO: 구현
  });

  test('소수점 이하는 버림 처리한다', () => {
    // TODO: 15000원의 7% 할인 → 13950원
  });
});

describe('calculateTotal', () => {
  test('장바구니 총액을 계산한다', () => {
    // TODO: 구현
  });

  test('할인이 적용된 상품도 계산한다', () => {
    // TODO: 구현
  });

  test('빈 장바구니는 0을 반환한다', () => {
    // TODO: 구현
  });
});

describe('formatPrice', () => {
  test('천 단위 콤마를 포함한다', () => {
    // TODO: 구현
  });

  test('음수 가격을 포맷한다', () => {
    // TODO: 구현
  });

  test('0원을 포맷한다', () => {
    // TODO: 구현
  });
});
```

### 평가 기준

- [ ] 모든 테스트 케이스 통과
- [ ] 엣지 케이스(0, 음수, 최대값) 처리
- [ ] 에러 케이스 테스트 포함
- [ ] describe로 논리적 그룹핑
- [ ] 테스트 이름이 명확하고 한글로 의도 전달

---

## 🎨 과제 1-2: 문자열 유틸리티

### 요구사항

```
┌─────────────────────────────────────────────────────────────────┐
│                     String Utilities                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. truncate(text, maxLength)                                   │
│     ┌────────────────────────────────────────┐                  │
│     │ Input:  "안녕하세요 반갑습니다", 8      │                  │
│     │ Output: "안녕하세요..."                 │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│  2. slugify(text)                                               │
│     ┌────────────────────────────────────────┐                  │
│     │ Input:  "Hello World! 안녕"             │                  │
│     │ Output: "hello-world-안녕"              │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│  3. maskEmail(email)                                            │
│     ┌────────────────────────────────────────┐                  │
│     │ Input:  "john.doe@example.com"         │                  │
│     │ Output: "jo***oe@example.com"          │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│  4. extractHashtags(text)                                       │
│     ┌────────────────────────────────────────┐                  │
│     │ Input:  "오늘 #맛집 방문! #서울 #카페"  │                  │
│     │ Output: ["맛집", "서울", "카페"]        │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 구현해야 할 함수 명세

#### `truncate(text: string, maxLength: number): string`

- 최대 길이를 초과하면 "..." 추가
- maxLength는 "..." 포함 길이
- maxLength가 3 이하면 에러

#### `slugify(text: string): string`

- 소문자 변환
- 공백과 특수문자는 하이픈으로 대체
- 연속 하이픈은 하나로
- 한글은 유지

#### `maskEmail(email: string): string`

- @ 앞부분 가운데를 \*\*\*로 마스킹
- 앞 2글자, 뒤 2글자는 보이게
- 이메일 형식이 아니면 에러

#### `extractHashtags(text: string): string[]`

- #으로 시작하는 태그 추출
- # 기호는 제외하고 반환
- 중복 제거
- 해시태그 없으면 빈 배열

### 테스트 케이스 작성 가이드

```typescript
// src/level-1-utils/stringUtils.test.ts

describe('truncate', () => {
  test('긴 텍스트를 잘라서 ...을 붙인다', () => {});
  test('maxLength보다 짧으면 그대로 반환한다', () => {});
  test('정확히 maxLength와 같으면 그대로 반환한다', () => {});
  test('maxLength가 3 이하면 에러를 던진다', () => {});
  test('빈 문자열은 빈 문자열을 반환한다', () => {});
});

describe('slugify', () => {
  test('공백을 하이픈으로 변환한다', () => {});
  test('대문자를 소문자로 변환한다', () => {});
  test('특수문자를 제거한다', () => {});
  test('연속 하이픈을 하나로 합친다', () => {});
  test('한글을 유지한다', () => {});
  test('앞뒤 하이픈을 제거한다', () => {});
});

describe('maskEmail', () => {
  test('이메일 가운데를 마스킹한다', () => {});
  test('짧은 이메일도 처리한다', () => {});
  test('잘못된 이메일 형식은 에러를 던진다', () => {});
});

describe('extractHashtags', () => {
  test('해시태그를 추출한다', () => {});
  test('중복 해시태그를 제거한다', () => {});
  test('해시태그가 없으면 빈 배열을 반환한다', () => {});
  test('# 뒤에 공백만 있으면 추출하지 않는다', () => {});
});
```

---

## 🎨 과제 1-3: 날짜 유틸리티

### 요구사항

```
┌─────────────────────────────────────────────────────────────────┐
│                      Date Utilities                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. formatRelativeTime(date)                                    │
│     ┌────────────────────────────────────────┐                  │
│     │ 방금 전 / 5분 전 / 3시간 전 /           │                  │
│     │ 어제 / 3일 전 / 2주 전 /                │                  │
│     │ 1개월 전 / 2024년 3월 15일              │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│  2. isBusinessDay(date)                                         │
│     ┌────────────────────────────────────────┐                  │
│     │ 평일: true                              │                  │
│     │ 주말: false                             │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│  3. getNextBusinessDay(date)                                    │
│     ┌────────────────────────────────────────┐                  │
│     │ 금요일 → 다음 월요일                    │                  │
│     │ 토요일 → 다음 월요일                    │                  │
│     │ 수요일 → 목요일                         │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
│  4. getDaysBetween(startDate, endDate)                          │
│     ┌────────────────────────────────────────┐                  │
│     │ Input:  2024-01-01, 2024-01-10         │                  │
│     │ Output: 9                               │                  │
│     └────────────────────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 구현해야 할 함수 명세

#### `formatRelativeTime(date: Date, now?: Date): string`

- 현재 시간 기준 상대 시간 표시
- 1분 미만: "방금 전"
- 1시간 미만: "N분 전"
- 24시간 미만: "N시간 전"
- 48시간 미만: "어제"
- 7일 미만: "N일 전"
- 30일 미만: "N주 전"
- 90일 미만: "N개월 전"
- 그 외: "YYYY년 M월 D일"

#### `isBusinessDay(date: Date): boolean`

- 월~금: true
- 토, 일: false

#### `getNextBusinessDay(date: Date): Date`

- 다음 영업일(평일) 반환
- 금요일이면 월요일
- 토요일이면 월요일
- 일요일이면 월요일

#### `getDaysBetween(startDate: Date, endDate: Date): number`

- 두 날짜 사이 일수 (절대값)
- 같은 날이면 0

### 테스트 케이스 작성 가이드

```typescript
// src/level-1-utils/dateUtils.test.ts

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('formatRelativeTime', () => {
  // 테스트에서 현재 시간을 고정하는 방법
  const fixedNow = new Date('2024-06-15T12:00:00');

  test('1분 미만이면 "방금 전"을 반환한다', () => {
    const date = new Date('2024-06-15T11:59:30');
    expect(formatRelativeTime(date, fixedNow)).toBe('방금 전');
  });

  test('1시간 미만이면 "N분 전"을 반환한다', () => {
    const date = new Date('2024-06-15T11:30:00');
    expect(formatRelativeTime(date, fixedNow)).toBe('30분 전');
  });

  // ... 더 많은 케이스
});

describe('isBusinessDay', () => {
  test('월요일은 영업일이다', () => {
    const monday = new Date('2024-06-17'); // 월요일
    expect(isBusinessDay(monday)).toBe(true);
  });

  test('토요일은 영업일이 아니다', () => {
    const saturday = new Date('2024-06-15'); // 토요일
    expect(isBusinessDay(saturday)).toBe(false);
  });
});

describe('getNextBusinessDay', () => {
  test('금요일의 다음 영업일은 월요일이다', () => {
    const friday = new Date('2024-06-14');
    const result = getNextBusinessDay(friday);
    expect(result.getDay()).toBe(1); // 1 = 월요일
  });
});

describe('getDaysBetween', () => {
  test('두 날짜 사이 일수를 계산한다', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-10');
    expect(getDaysBetween(start, end)).toBe(9);
  });

  test('순서가 바뀌어도 양수를 반환한다', () => {
    const start = new Date('2024-01-10');
    const end = new Date('2024-01-01');
    expect(getDaysBetween(start, end)).toBe(9);
  });
});
```

---

## ✅ 완료 체크리스트

### 과제 1-1: 가격 계산

- [ ] calculateDiscount 함수 구현 및 테스트 (5개 이상 케이스)
- [ ] calculateFinalPrice 함수 구현 및 테스트 (3개 이상 케이스)
- [ ] calculateTotal 함수 구현 및 테스트 (4개 이상 케이스)
- [ ] formatPrice 함수 구현 및 테스트 (4개 이상 케이스)

### 과제 1-2: 문자열 유틸리티

- [ ] truncate 함수 구현 및 테스트 (5개 이상 케이스)
- [ ] slugify 함수 구현 및 테스트 (6개 이상 케이스)
- [ ] maskEmail 함수 구현 및 테스트 (3개 이상 케이스)
- [ ] extractHashtags 함수 구현 및 테스트 (4개 이상 케이스)

### 과제 1-3: 날짜 유틸리티

- [ ] formatRelativeTime 함수 구현 및 테스트 (7개 이상 케이스)
- [ ] isBusinessDay 함수 구현 및 테스트 (4개 이상 케이스)
- [ ] getNextBusinessDay 함수 구현 및 테스트 (4개 이상 케이스)
- [ ] getDaysBetween 함수 구현 및 테스트 (3개 이상 케이스)

---

## 💡 학습 포인트

### 배운 Vitest 기능들

```typescript
// 기본 테스트
test('설명', () => {});
it('설명', () => {}); // test와 동일

// 그룹핑
describe('그룹명', () => {});

// 검증
expect(value).toBe(expected); // 원시값 비교
expect(value).toEqual(expected); // 객체/배열 깊은 비교
expect(fn).toThrow(); // 에러 발생 확인
expect(fn).toThrow('에러 메시지'); // 특정 에러 메시지

// 매처
expect(arr).toContain(item); // 배열에 포함
expect(str).toMatch(/pattern/); // 정규식 매칭
expect(value).toBeTruthy(); // truthy 값
expect(value).toBeFalsy(); // falsy 값
```

### 흔한 실수

1. **구현 세부사항 테스트하기**

   ```typescript
   // ❌ Bad: 내부 구현에 의존
   expect(fn.calls).toBe(1);

   // ✅ Good: 결과에 집중
   expect(result).toBe(expected);
   ```

2. **테스트 간 의존성**

   ```typescript
   // ❌ Bad: 이전 테스트 결과에 의존
   let total = 0
   test('첫 번째', () => { total += 1 })
   test('두 번째', () => { expect(total).toBe(1) }) // 위험!

   // ✅ Good: 각 테스트가 독립적
   test('첫 번째', () => { ... })
   test('두 번째', () => { ... })
   ```

---

## 🚀 다음 단계

Level 1을 완료했다면 [Level 2: 컴포넌트 단위 테스트](./level-2-components.md)로 진행하세요.
