# data/ - 구직 자동화 데이터

## 구조
```
data/
  profile.md              ← 핵심 프로필 (모든 지원에 재사용)
  self-introduction.md    ← 자기소개서 원본 (커스터마이징 베이스)
  career-description.md   ← 경력기술서 원본 (커스터마이징 베이스)
  companies/
    {회사명}/
      지원분석.md          ← 공고 분석 + 매칭 분석 + 커스터마이징 메모
      자기소개서.md        ← 해당 회사 맞춤 자기소개서
      경력기술서.md        ← 해당 회사 맞춤 경력기술서
```

## 사용법
"XX회사 서류 만들어줘" 요청 시:
1. `profile.md` 읽기 (프로필 확인)
2. 채용 공고 분석 (URL 또는 검색)
3. `companies/{회사명}/지원분석.md` 생성 (공고 분석 + 매칭)
4. `self-introduction.md` 기반 맞춤 자기소개서 생성
5. `career-description.md` 기반 맞춤 경력기술서 생성
