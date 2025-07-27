# TaskManager - Beautiful Task Management Application

테스크 관리 사이트입니다.

##  주요 기능

- **아름다운 디자인**: Glass morphism 효과와 그라데이션 배경
- **부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 전환 효과
- **태스크 관리**: 생성, 수정, 삭제, 완료 처리
- **우선순위 설정**: 높음, 보통, 낮음 우선순위 지원
- **마감일 설정**: 날짜와 시간 설정 가능
- **필터링**: 전체, 진행중, 완료된 태스크 필터링
- **진행률 표시**: 완료된 태스크 비율을 시각적으로 표시
- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **로컬 저장**: 브라우저 로컬 스토리지에 데이터 저장

## 시작하기

### 필수 요구사항

- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. Supabase 설정:
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - SQL Editor에서 다음 테이블 생성:
   ```sql
   CREATE TABLE tasks (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
     status TEXT NOT NULL CHECK(status IN ('pending', 'completed')),
     dueDate TEXT,
     createdAt TEXT NOT NULL,
     completedAt TEXT,
     repeatDays TEXT
   );
   ```
   - Settings > API에서 URL과 anon key 복사
   - 프로젝트 루트에 `.env` 파일 생성:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. 개발 서버 실행:
```bash
npm start
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 기술 스택

- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안전성 보장
- **Supabase** - 클라우드 데이터베이스
- **MCP (Model Context Protocol)** - AI 모델과의 통신
- **Framer Motion** - 부드러운 애니메이션
- **Lucide React** - 아이콘 라이브러리
- **date-fns** - 날짜 처리
- **CSS3** - 모던한 스타일링

## 디자인 특징

- **Glass Morphism**: 반투명 배경과 블러 효과
- **그라데이션**: 아름다운 색상 그라데이션
- **부드러운 전환**: 모든 상호작용에 애니메이션 적용
- **직관적인 UI**: 사용하기 쉬운 인터페이스
- **다크 테마**: 눈에 편안한 다크 모드

## 사용법

1. **태스크 추가**: "새 태스크" 버튼을 클릭하여 새로운 태스크 생성
2. **태스크 완료**: 체크박스를 클릭하여 태스크 완료 처리
3. **태스크 삭제**: 휴지통 아이콘을 클릭하여 태스크 삭제
4. **필터링**: 상단의 필터 버튼으로 태스크 상태별 필터링
5. **상세 보기**: 태스크를 클릭하여 자세한 정보 확인

## 빌드

프로덕션 빌드:
```bash
npm run build
```

## MCP 서버

### MCP 서버 실행
```bash
npm run mcp-server
```

### 사용 가능한 도구들
- `get_all_tasks` - 모든 태스크 조회
- `add_task` - 새로운 태스크 추가
- `update_task` - 태스크 업데이트
- `delete_task` - 태스크 삭제
- `get_tasks_by_date` - 특정 날짜의 태스크 조회
- `get_repeat_tasks` - 반복 태스크 조회

### MCP 클라이언트 설정
`mcp-config.json` 파일을 MCP 클라이언트의 설정 디렉토리에 복사하세요.

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 