---
title: .NET API 참조
id: dotnet-api-reference
sidebar_position: 2
---

# .NET API 참조

Apache Ignite 3 .NET API의 전체 참조 문서입니다.

## 개요 {#overview}

.NET API는 Apache Ignite 3 씬 클라이언트 작업을 위한 인터페이스와 클래스를 제공합니다. 모든 API는 비동기 패턴을 사용하며, 타입 지정 접근과 동적 접근을 모두 지원합니다.

## API 문서 {#api-documentation}

API 문서는 소스 코드의 XML 주석에서 생성됩니다.

### 문서 접근 {#access-the-documentation}

<a href="https://ignite.apache.org/releases/ignite3/dotnetdoc/api/" target="_blank" rel="noopener noreferrer" style={{
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#0066cc',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  marginBottom: '20px'
}}>.NET API 참조 문서 열기 →</a>

로컬에서 생성한 DocFX 문서는 모든 공개 API를 포함하며, 인터페이스, 클래스, 메서드, 속성의 상세한 설명을 제공합니다.

### 온라인 문서 {#online-documentation}

최신 API 참조 문서는 릴리스마다 게시됩니다:

- [최신 릴리스 .NET API](https://ignite.apache.org/releases/ignite3/dotnetdoc/)

### 로컬 문서 생성 {#generating-local-documentation}

DocFX를 사용해 API 문서를 로컬에서 생성합니다:

```bash
cd modules/platforms/dotnet
dotnet build Apache.Ignite/Apache.Ignite.csproj -c Release
dotnet tool restore
dotnet docfx docs/docfx.json
```

생성된 문서는 `modules/platforms/dotnet/docs/_site/`에 나타납니다.

## 핵심 네임스페이스 {#core-namespaces}

### 클라이언트 {#client}

- `Apache.Ignite` - IIgniteClient 인터페이스와 구성

### 데이터 접근 {#data-access}

- `Apache.Ignite.Table` - ITable, IRecordView, IKeyValueView 인터페이스
- `Apache.Ignite.Table.DataStreamer` - 스트리밍을 사용한 대량 적재
- `Apache.Ignite.Sql` - 쿼리 실행과 결과 집합

### 트랜잭션과 컴퓨트 {#transactions-and-compute}

- `Apache.Ignite.Transactions` - ITransactions, ITransaction 인터페이스
- `Apache.Ignite.Compute` - 분산 작업 실행

### 인프라 {#infrastructure}

- `Apache.Ignite.Network` - 클러스터 노드 정보

## NuGet 패키지 {#nuget-package}

NuGet에서 클라이언트 패키지를 설치합니다:

```bash
dotnet add package Apache.Ignite
```

이 패키지는 다음을 포함합니다:

- 클라이언트 구현
- API 인터페이스
- 타입 직렬화
- 연결 관리

## 프레임워크 지원 {#framework-support}

.NET 클라이언트는 다음을 지원합니다:

- .NET 6.0 이상
- .NET Standard 2.1(제한적으로 지원)

비동기 API는 최신 비동기 패턴을 위해 `Task<T>`, `ValueTask<T>`, `IAsyncEnumerable<T>`를 사용합니다.

## 다음 단계 {#next-steps}

- [.NET API 문서](../native-clients/dotnet) - 각 API 영역의 사용 가이드
- [.NET 클라이언트 가이드](../../develop/ignite-clients/dotnet-client) - 클라이언트 설정과 구성
