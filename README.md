# 🏎️ F1 Community – Apex Charge

> Speed-inspired UI/UX with GSAP scroll motions, team-color identity, API-ready data modeling, and dynamic state-driven components.

F1 Community는 포뮬러 원(Formula 1) 팬들을 위한 인터랙티브 웹 애플리케이션으로,  
2025 시즌을 기반으로 **팀 컬러 아이덴티티 · GSAP 모션 · API 확장 구조 · Zustand 상태관리**를 조합하여  
F1의 속도감과 브랜드 감성을 담은 UI/UX를 제공하기 위해 제작되었습니다.

---

## ✨ 주요 기능

### 🎨 팀 컬러 아이덴티티
- 각 팀의 고유한 브랜드 컬러를 기반으로 UI 스타일 자동 변경  
- 버튼, 카드, 하이라이트 요소가 팀 선택 시 동적 변경

### 🚀 GSAP 스크롤 애니메이션
- F1 특유의 속도감과 흐름을 스크롤 기반 모션으로 구현  
- 텍스트, 로고, 이미지 등장 타이밍 제어  
- 섹션별 스토리텔링 강화

### 👥 2025 시즌 드라이버 정보
- 21명의 현역 드라이버 프로필  
- 드라이버 이미지 AVIF/WebP로 최적화  
- 팀-드라이버 자동 매칭 구조

### 🏁 10개 팀 정보
- Mercedes, Red Bull, Ferrari, McLaren 등 모든 팀 정보 제공  
- 팀 로고 및 컬러 기반 디자인 시스템 유지

### 🔌 API 기반 구조

#### **구현된 API 엔드포인트**

**1. 인증 API (`/api/auth`)**
- 이메일/비밀번호 기반 로그인
- JWT 토큰 인증 방식
- Admin/User 역할 기반 권한 관리
- ADMIN_EMAILS 리스트로 관리자 계정 자동 구분

**2. 레이스 데이터 API**
- 레이스 일정 조회 (Race Schedule)
  - 서킷 정보, 날짜/시간(UTC)
  - 라운드별 정렬
- 레이스 결과 조회 (Race Results)
  - 순위, 드라이버, 팀, 포인트
  - Fastest Lap 기록

**3. 커뮤니티 API**
- 포럼 스레드 CRUD
  - 카테고리별 분류 (strategy, driver, free)
  - 작성자, 날짜 정보
- 포스트 관리
  - 생성, 조회, 좋아요, 댓글 수 추적
  - localStorage persist로 오프라인 지원

**4. 미디어 API**
- 갤러리 이미지 업로드/조회
- Blob URL 처리 및 최적화
- 메타데이터 관리 (작성자, 날짜, 캡션)

#### **데이터 모델 구조**

```typescript
// Race: 레이스 일정
interface Race {
  id: string;
  round: number;
  name: string;
  circuit: string;
  startUTC: string;
}

// Result: 레이스 결과
interface Result {
  raceId: string;
  pos: number;
  driver: string;
  team: Team;
  points: number;
  fl?: string;  // Fastest Lap
}

// Thread: 포럼 스레드
interface Thread {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  category: "strategy" | "driver" | "free";
}

// Post: 커뮤니티 포스트
interface Post {
  id: string;
  title: string;
  content: string;
  comments: number;
  likes: number;
  createdAt: string;
}
```

#### **API 확장성**

- **환경변수 기반 설정**: `VITE_API_BASE`로 프로덕션/개발 환경 분리
- **Mock 데이터 구조**: 실제 백엔드 연결 전 프론트엔드 독립 개발 가능
- **Ergast API 호환**: F1 공식 API와 동일한 데이터 모델로 쉬운 마이그레이션
- **TypeScript 타입 안정성**: 모든 API 응답에 엄격한 타입 정의

### 🧩 상태관리 — Zustand
- selectedTeam, selectedDriver, highlightMode 등 전역 제어  
- Redux 대비 가볍고 빠르며 GSAP 모션과 충돌 없음  
- Selector로 불필요한 렌더 최소화

### 🔐 Admin-ready 아키텍처

**현재 구현된 기능:**
- 이메일 기반 Admin/User 역할 구분 (ADMIN_EMAILS)
- JWT 토큰 인증 시스템
- 커뮤니티 포스트 CRUD
- 미디어 업로드 및 관리
- 레이스 일정 및 결과 데이터 관리

**확장 가능한 구조:**
- Firebase/Supabase 연결 시 실서비스로 전환 가능
- Mock 데이터를 실제 API 호출로 교체만 하면 됨
- TypeScript 타입으로 API 스펙 명확히 정의

**향후 기능:**
- 팀/드라이버 정보 실시간 수정
- 사용자 권한 관리 대시보드
- 이미지 CDN 연동
- WebSocket 기반 실시간 업데이트

### 📱 반응형 UI/UX
- 모바일 · 태블릿 · PC 모두 자연스럽게 대응  
- 레이아웃이 화면 크기에 따라 자동 전환  

### ⚡ 퍼포먼스 최적화
- WebP / AVIF 이미지 사용  
- Lazy loading 적용  
- Vite 빌드 기반 초고속 렌더링

### 🎮 커뮤니티 & 소셜 기능
- 포럼 스레드 (전략, 드라이버, 자유 카테고리)
- 포스트 생성, 좋아요, 댓글
- 갤러리 이미지 업로드 및 공유
- 개인 프로필: 내 포스트, 댓글, 업로드한 미디어 관리
- localStorage 기반 오프라인 동기화

### 🔒 인증 & 보안
- 이메일/비밀번호 기반 로그인
- JWT 토큰 인증
- Admin/User 역할 기반 권한 관리
- Protected Routes (로그인 필수 페이지)  

---

## 🏆 2025 시즌 팀 & 드라이버

### 🔸 Teams

- **Mercedes-AMG Petronas** — George Russell, Kimi Antonelli  
- **Red Bull Racing** — Max Verstappen, Liam Lawson  
- **Scuderia Ferrari** — Charles Leclerc, Lewis Hamilton  
- **McLaren** — Lando Norris, Oscar Piastri  
- **Aston Martin** — Fernando Alonso, Lance Stroll  
- **Alpine** — Pierre Gasly, Jack Doohan  
- **Williams** — Alexander Albon, Carlos Sainz  
- **RB (AlphaTauri)** — Yuki Tsunoda, Isack Hadjar  
- **Haas F1 Team** — Esteban Ocon, Oliver Bearman  
- **Kick Sauber** — Nico Hulkenberg, Gabriel Bortoleto  

---

## 🛠 기술 스택

### **Frontend**
- React 18  
- TypeScript  
- Vite  

### **Animation**
- GSAP  
- ScrollTrigger  

### **Styling**
- Modern CSS  
- Team-based 디자인 토큰  

### **Optimization**
- AVIF/WebP 이미지  
- Lazy loading  
- Vite 빌드 최적화  

### **State Management**
- Zustand — 가볍고 강력한 전역 상태관리

### **Backend & API**
- RESTful API 설계 원칙
- TypeScript 기반 타입 안전성
- Zustand persist로 오프라인 지원
- Mock 데이터로 프론트엔드 독립 개발
- 환경변수 기반 API 엔드포인트 관리  

---

## 📦 프로젝트 구조

```bash
f1-community/
├── public/
│   └── assets/
│       ├── drivers/        # 21명 드라이버 이미지 (AVIF/WebP)
│       └── teams/          # 10개 팀 로고
├── src/
│   ├── api/
│   │   └── auth.ts         # 인증 API (로그인, 권한 관리)
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── AppHeader.tsx
│   │   ├── BottomNav.tsx
│   │   ├── LoginDialog.tsx
│   │   ├── UploadDialog.tsx
│   │   └── ...
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.tsx
│   │   ├── DriversTab.tsx
│   │   ├── ConstructorsTab.tsx
│   │   ├── Forum.tsx
│   │   ├── Gallery.tsx
│   │   └── ...
│   ├── stores/             # Zustand 전역 상태관리
│   │   ├── auth.ts         # 인증 상태
│   │   ├── community.ts    # 커뮤니티 포스트
│   │   ├── media.ts        # 미디어 관리
│   │   └── settings.ts     # 사용자 설정
│   ├── utils/
│   │   ├── apiBase.ts      # API 엔드포인트 설정
│   │   └── asset.ts        # 이미지 경로 헬퍼
│   ├── data/
│   │   └── imageRegistry.ts # 드라이버/팀 이미지 매핑
│   ├── types.ts            # TypeScript 타입 정의
│   ├── mock.ts             # Mock 데이터 (Race, Result, Thread)
│   ├── router.tsx          # React Router 설정
│   └── main.tsx
├── .env.development        # 개발 환경변수
├── .env.production         # 프로덕션 환경변수
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── LICENSE
```
## 🚀 실행 방법

### 설치

```bash
git clone https://github.com/ziziziwon/f1-community.git
cd f1-community
npm install
```

### 환경변수 설정

프로젝트 루트에 `.env.development` 또는 `.env.production` 파일 생성:

```bash
# .env.development
VITE_API_BASE=http://localhost:3000/api

# .env.production
VITE_API_BASE=https://your-api-domain.com/api
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

---

## 💻 API 사용 예시

### 로그인 인증

```typescript
import { loginWithEmail } from './api/auth';

// 사용자 로그인
const { token, user } = await loginWithEmail('user@example.com', 'password');

// Admin 권한 확인
if (user.role === 'admin') {
  // Admin 전용 기능 접근
}
```

### 커뮤니티 포스트 관리

```typescript
import { useCommunityStore } from './stores/community';

// 포스트 생성
const addPost = useCommunityStore(state => state.addPost);
addPost({
  title: '맥라렌 우승 축하!',
  content: '드디어 컨스트럭터 챔피언십 우승!'
});

// 좋아요
const likePost = useCommunityStore(state => state.likePost);
likePost(postId);
```

### 레이스 데이터 조회

```typescript
import { races, results } from './mock';

// 다음 레이스 조회
const nextRace = races.find(r => new Date(r.startUTC) > new Date());

// 특정 레이스 결과 조회
const raceResults = results.filter(r => r.raceId === 'r-jpn-25');
```

### 미디어 업로드

```typescript
import { useMediaStore } from './stores/media';

// 이미지 업로드
const addPhoto = useMediaStore(state => state.addPhoto);
addPhoto({
  id: crypto.randomUUID(),
  coverUrl: blobUrl,
  author: currentUser.name,
  createdAt: new Date().toISOString()
});
```
## 🎯 개발 목표

- **UI/UX**: F1의 속도감·에너지·브랜드 감성을 UI/UX로 구현

- **확장성**: Mock 데이터 → 실제 API로 쉽게 전환 가능한 구조

- **애니메이션**: GSAP 모션 + 데이터 UI 자연스럽게 결합

- **상태관리**: Zustand로 가벼운 전역 상태관리 & 렌더 최적화

- **타입 안전성**: TypeScript로 API 스펙 명확히 정의

- **오프라인 지원**: localStorage persist로 네트워크 없이도 동작

- **인증/권한**: Admin/User 역할 기반 접근 제어

- **유지보수**: 시즌 업데이트가 쉬운 데이터 구조

## 🎨 디자인 철학
Speed — 빠르게 반응하는 애니메이션

Identity — 팀 컬러로 전체 분위기 유지

Precision — 데이터 정확성 및 UI 정교함

Minimal — 과하지 않고 집중도 높은 구성

## 🤝 기여하기
``` bash
git checkout -b feature/AmazingFeature
git commit -m "Add AmazingFeature"
git push origin feature/AmazingFeature
```
## 📄 라이선스
MIT License

## 📞 연락처
GitHub: https://github.com/ziziziwon

---

Made with ❤️ for F1 fans worldwide

