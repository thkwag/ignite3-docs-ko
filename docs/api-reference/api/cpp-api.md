---
title: C++ API 참조
id: cpp-api-reference
sidebar_position: 3
---

# C++ API 참조

Apache Ignite 3 C++ API의 전체 참조 문서입니다.

## 개요 {#overview}

C++ API는 씬 클라이언트(thin client) 작업에 필요한 헤더와 라이브러리를 제공합니다. 구현은 콜백 기반 비동기 패턴과 함께 최신 C++17 기능을 사용합니다.

## API 문서 {#api-documentation}

API 문서는 Doxygen을 사용해 소스 코드 주석에서 생성합니다.

### 문서 접근 {#access-the-documentation}

<a href="https://ignite.apache.org/releases/ignite3/cppdoc/index.html" target="_blank" rel="noopener noreferrer" style={{
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#0066cc',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  marginBottom: '20px'
}}>C++ API 참조 열기 →</a>

로컬에서 생성한 Doxygen 문서에는 모든 공개 API가 포함되며, 클래스·함수·타입의 상세한 문서를 제공합니다.

### 로컬 문서 생성 {#generating-local-documentation}

C++ 모듈에서 API 문서를 생성합니다:

```bash
cd modules/platforms/cpp
doxygen Doxyfile
```

생성된 문서는 `modules/platforms/cpp/docs/html/`에 나타납니다.

참조 문서를 보려면 브라우저에서 `index.html`을 여세요.

## 핵심 헤더 {#core-headers}

### 클라이언트 {#client}

- `ignite/client/ignite_client.h` - 클라이언트 인터페이스와 구성

### 데이터 접근 {#data-access}

- `ignite/client/table/tables.h` - 테이블 검색
- `ignite/client/table/table.h` - 테이블 작업
- `ignite/client/table/record_view.h` - 타입이 지정된 레코드 접근
- `ignite/client/table/key_value_view.h` - 타입이 지정된 키-값 접근
- `ignite/client/table/ignite_tuple.h` - 바이너리 튜플 컨테이너

### SQL {#sql}

- `ignite/client/sql/sql.h` - 쿼리 실행 인터페이스
- `ignite/client/sql/result_set.h` - 결과 처리

### 트랜잭션과 컴퓨트 {#transactions-and-compute}

- `ignite/client/transaction/transactions.h` - 트랜잭션 팩토리
- `ignite/client/transaction/transaction.h` - 트랜잭션 제어
- `ignite/client/compute/compute.h` - 작업 실행 인터페이스

### 인프라 {#infrastructure}

- `ignite/client/network/cluster_node.h` - 노드 정보

## 애플리케이션 빌드 {#building-applications}

Ignite 클라이언트 라이브러리를 링크합니다:

```cmake
find_package(ignite-client REQUIRED)
target_link_libraries(your_app ignite-client)
```

이 라이브러리는 다음을 제공합니다:

- 클라이언트 구현
- 타입 직렬화
- 연결 처리
- 프로토콜 구현

## 컴파일러 요구 사항 {#compiler-requirements}

C++ 클라이언트에는 다음이 필요합니다:

- C++17 호환 컴파일러
- CMake 3.10 이상
- OpenSSL(선택 사항, TLS용)

테스트를 거친 컴파일러:

- GCC 7.0+
- Clang 5.0+
- MSVC 2017+

## 다음 단계 {#next-steps}

- [C++ API 문서](../native-clients/cpp) - API 영역별 사용 가이드
- [C++ 클라이언트 가이드](../../develop/ignite-clients/cpp-client) - 빌드 설정과 구성
- [시작하기](../../getting-started) - 튜토리얼과 예시
