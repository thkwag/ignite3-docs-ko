---
title: Java API 참조
id: java-api-reference
sidebar_position: 1
---

# Java API 참조

Apache Ignite 3 Java API의 전체 참조 문서입니다.

## 개요 {#overview}

Java API는 Apache Ignite 3의 모든 기능을 다루는 인터페이스와 클래스를 제공합니다. 이 참조 문서는 애플리케이션 개발에 쓰는 공개 API를 설명합니다.

## API 문서 {#api-documentation}

JavaDoc 문서는 소스 코드의 애노테이션과 주석에서 생성됩니다.

### 문서 확인 {#access-the-documentation}

<a href="https://ignite.apache.org/releases/ignite3/javadoc/index.html" target="_blank" rel="noopener noreferrer" style={{
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#0066cc',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  marginBottom: '20px'
}}>Java API 참조 문서 열기 →</a>

로컬에서 생성한 JavaDoc은 모든 공개 API를 포함하며, 클래스, 인터페이스, 메서드, 필드를 상세히 설명합니다.

### 온라인 문서 {#online-documentation}

최신 JavaDoc은 릴리스마다 게시됩니다:

- [최신 릴리스 JavaDoc](https://ignite.apache.org/releases/ignite3/javadoc/)

### 로컬 문서 생성 {#generating-local-documentation}

소스 코드에서 로컬로 JavaDoc을 생성합니다:

```bash
./gradlew aggregateJavadoc
```

생성된 문서는 `build/docs/aggregateJavadoc/`에 나타납니다.

## 핵심 패키지 {#core-packages}

### 클라이언트와 서버 {#client-and-server}

- `org.apache.ignite` - 진입점 인터페이스(Ignite, IgniteClient)
- `org.apache.ignite.client` - 씬 클라이언트 구현

### 데이터 접근 {#data-access}

- `org.apache.ignite.table` - Table, RecordView, KeyValueView 인터페이스
- `org.apache.ignite.table.partition` - 파티션 관리와 데이터 스트리밍
- `org.apache.ignite.sql` - SQL 실행과 결과 처리

### 트랜잭션과 컴퓨트 {#transactions-and-compute}

- `org.apache.ignite.tx` - 트랜잭션 관리
- `org.apache.ignite.compute` - 분산 컴퓨트 작업과 태스크

### 스키마 관리 {#schema-management}

- `org.apache.ignite.catalog` - 플루언트 빌더를 사용한 스키마 정의
- `org.apache.ignite.table.mapper` - 애노테이션 기반 매핑(@Table, @Column, @Id)

### 인프라 {#infrastructure}

- `org.apache.ignite.network` - 클러스터 노드와 네트워크 주소 지정
- `org.apache.ignite.security` - 인증 구성

## 모듈 구조 {#module-structure}

Ignite 3는 모듈형 아키텍처를 사용합니다. 주요 모듈은 다음과 같습니다:

- `ignite-api` - 공개 API 인터페이스
- `ignite-client` - 씬 클라이언트 구현
- `ignite-runner` - 임베디드 노드 구현
- `ignite-table` - 테이블 작업
- `ignite-sql-engine` - SQL 처리
- `ignite-compute` - 컴퓨트 엔진

## 다음 단계 {#next-steps}

- [Java API 문서](../native-clients/java) - API 영역별 사용 가이드
- [Java 클라이언트 가이드](../../develop/ignite-clients/java-client) - 클라이언트 설정과 구성
- [시작하기](../../getting-started) - 튜토리얼과 예시
