# Testing Tutorial

> 이 프로젝트는 다양한 프런트엔드 테스팅 기법을 연습하며, 안정적이고 신뢰할 수 있는 코드를 검증하는 방법을 탐구하는 것을 목표로 한다.

## 테스팅 공부 커리큘럼 

> created by Claude 


| 레벨 | 주제 |  핵심 학습 |
|------|------|-----------|
| **Level 1** | 기초 - 순수 함수와 유틸리티 테스트 |  Vitest 기본, 테스트 구조 |
| **Level 2** | 컴포넌트 단위 테스트 |  RTL, 사용자 이벤트 |
| **Level 3** | 폼과 유효성 검사 테스트 |  폼 상호작용, 에러 처리 |
| **Level 4** | 비동기와 API 모킹 |  MSW, 로딩/에러 상태 |
| **Level 5** | 통합 테스트 |  다중 컴포넌트, 상태 관리 |
| **Level 6** | E2E 테스트 |  Playwright, 실제 유저 플로우 |


> 각 레벨별 상세 과제는 개별 문서를 참고

- [Level 1: 순수 함수와 유틸리티 테스트](./_docs/curriculum/level-1-utils.md)
- [Level 2: 컴포넌트 단위 테스트](./_docs/curriculum/level-2-components.md)
- [Level 3: 폼과 유효성 검사 테스트](./_docs/curriculum/level-3-forms.md)
- [Level 4: 비동기와 API 모킹](./_docs/curriculum/level-4-async.md)
- [Level 5: 통합 테스트](./_docs/curriculum/level-5-integration.md)
- [Level 6: E2E 테스트](./_docs/curriculum/level-6-e2e.md)



## 프로젝트 구조

> 각 레벨별 과제는  **레벨별 라우트**를 구성하여 진행 예정

```
├── app/
│   ├── page.tsx                    # 홈: 레벨별 링크 목록
│   ├── layout.tsx
│   │
│   ├── level-1/                    # 순수 함수 테스트
│   ├── level-2/                    # 컴포넌트 단위 테스트
│   ├── level-3/                    # 폼 테스트
│   ├── level-4/                    # 비동기 테스트
│   ├── level-5/                    # 통합 테스트
│   └── level-6/                    # E2E 대상
├── components/                     # 공유 컴포넌트
│
├── __tests__/                      # 테스트 파일 (라우트 구조와 1:1 매칭)
│   ├── level-1/
│   ├── level-2/
│   ├── level-3/
│   ├── level-4/
│   └── level-5/
│
├── mocks/                          # MSW 핸들러 (Level 4+)
│
├── e2e/                            # Playwright E2E 테스트 (Level 6)
│
```