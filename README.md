# Herald

Herald는 Qwik 기반 개인 기록 블로그입니다.  
기술 글(MDX), 댓글, 방문자 집계, 운동일지 같은 개인 데이터 기록 기능을 Supabase와 함께 운영합니다.

## 핵심 기능

- MDX 기반 포스트 작성 및 자동 목록화 (`src/routes/posts/*/index.mdx`)
- 홈에서 포스트 검색/카테고리/태그 필터/페이지네이션
- Supabase Auth(Google OAuth) 로그인
- 포스트 댓글 조회/등록
- 일간 방문자 수(Asia/Seoul 기준) 및 누적 방문자 수 표시
- 운동일지 조회/등록 (`/workouts`)
- 에세이/노트/소개 페이지 라우팅

## 기술 스택

- Frontend: Qwik + QwikCity + TypeScript + Tailwind CSS + DaisyUI
- Backend(BaaS): Supabase (Auth, Postgres, RLS, RPC)
- Content: MDX (frontmatter 메타데이터 기반)
- Test: Node 내장 test runner (`node:test`)

## 시작하기

### 1) 요구사항

- Node.js: `^18.17.0 || ^20.3.0 || >=21.0.0`
- (선택) 로컬 Supabase 실행 시 Docker + Supabase CLI

### 2) 설치

```bash
npm install
```

### 3) 환경 변수

`.env.local` 파일을 만들고 값을 설정합니다.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

로컬 Supabase 예시:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from `supabase status`>
```

### 4) 개발 서버 실행

```bash
npm run dev
```

Tailscale 등 외부 디바이스에서 접속하려면:

```bash
npm start
```

기본 포트는 `5173`입니다.

## 자주 쓰는 명령어

- `npm run dev`: SSR 개발 서버 실행
- `npm start`: `0.0.0.0:5173`으로 개발 서버 실행 (원격 접속용)
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 결과 프리뷰
- `npm run build.types`: 타입 체크
- `npm run lint`: ESLint 검사
- `npm run fmt` / `npm run fmt.check`: 포맷 적용 / 검사
- `npm test`: 테스트 실행

## Supabase 로컬 개발

```bash
npm run supabase:start
npm run supabase:status
```

필요 시 초기화/중지:

```bash
npm run supabase:db:reset
npm run supabase:stop
```

스키마와 마이그레이션은 `supabase/` 디렉터리에서 관리합니다.

## 디렉터리 구조

```text
src/
  routes/        # QwikCity 라우트 및 페이지
  components/    # 공통 컴포넌트
  data/          # 포스트 메타데이터 로딩 유틸
  lib/           # Supabase 클라이언트 등
supabase/        # 로컬 DB 스키마/마이그레이션
automator/       # .NET 기반 포스트 자동 생성 워커(선택)
tests/           # node:test 기반 테스트
```

## Automator (선택)

`automator/Herald.Automator`는 AI 기반으로 MDX 포스트를 생성해 `src/routes/posts/...`에 반영하는 별도 워커입니다.  
상세 내용은 `automator/Herald.Automator/README.md`를 참고하세요.
