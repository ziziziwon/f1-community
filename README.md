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

### 🔌 API 기반 구조 (Ergast API Compatible)
- 실제 F1 API(Ergast)와 동일한 데이터 모델 사용  
- 시즌 변경 시 API 엔드포인트만 교체하면 전체 사이트 자동 업데이트  
- `getDrivers()`, `getTeams()` 형태로 확장 가능

### 🧩 상태관리 — Zustand
- selectedTeam, selectedDriver, highlightMode 등 전역 제어  
- Redux 대비 가볍고 빠르며 GSAP 모션과 충돌 없음  
- Selector로 불필요한 렌더 최소화

### 🔐 Admin-ready 아키텍처
- 시즌 데이터 CRUD 구조로 설계  
- Firebase/Supabase 연결 시 실서비스처럼 확장 가능  
- 향후 기능:
  - 팀 정보 관리
  - 드라이버 정보 변경
  - 이미지 교체
  - 실시간 데이터 반영

### 📱 반응형 UI/UX
- 모바일 · 태블릿 · PC 모두 자연스럽게 대응  
- 레이아웃이 화면 크기에 따라 자동 전환  

### ⚡ 퍼포먼스 최적화
- WebP / AVIF 이미지 사용  
- Lazy loading 적용  
- Vite 빌드 기반 초고속 렌더링  

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

### **API Ready**
- Ergast API와 동일한 데이터 모델 구조  
- 시즌 업데이트가 쉬운 확장성  

---

## 📦 프로젝트 구조

```bash
f1-community/
├── assets/
│   ├── drivers/        # 21 drivers
│   ├── teams/          # 10 teams
│   └── index-B_QDMs0p.js
├── src/
│   ├── components/     # UI 컴포넌트
│   ├── store/          # Zustand 상태관리
│   ├── api/            # Ergast API 모델 구조
│   ├── pages/          # 메인 페이지
│   └── styles/
├── index.html
├── README.md
└── LICENSE
```
## 🚀 실행 방법
설치
```bash
git clone https://github.com/ziziziwon/f1-community.git
cd f1-community
npm install
```

개발 서버 실행
```bash
npm run dev
```

프로덕션 빌드
```bash
npm run build
```
## 🎯 개발 목표
- F1의 속도감·에너지·브랜드 감성을 UI/UX로 구현

- 실서비스처럼 API 기반 구조로 확장 가능하게 설계

- GSAP 모션 + 데이터 UI 자연스럽게 결합

- Zustand로 가벼운 상태관리 & 렌더 최적화

- 시즌 업데이트가 쉬운 구조

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

