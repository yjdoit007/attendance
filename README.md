# 우리 학원 출석부

학생별 수업 요일·횟수로 출석 일정을 만들고, 공휴일을 빼고, 보강과 일정 변경을 반영해 날짜별로 출석을 체크하는 웹앱이에요.
아이폰, 아이패드, 갤럭시 탭에서 홈 화면에 추가해 앱처럼 쓰고, Firebase로 기기끼리 동기화해요.

- `index.html` 앱 전체
- `firebase-config.js` Firebase 웹 앱 설정 (공개 정보)
- `firestore.rules` 각자 자기 출석부만 읽고 쓰게 하는 보안 규칙
- `sw.js`, `manifest.webmanifest`, 아이콘: 홈 화면 설치와 오프라인 실행
