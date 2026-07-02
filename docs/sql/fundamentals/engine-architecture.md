---
id: engine-architecture
title: SQL 엔진 아키텍처
sidebar_label: 엔진 아키텍처
---

# SQL 엔진 아키텍처

Apache Ignite 3는 SQL 엔진으로 Apache Calcite를 사용합니다. Apache Calcite는 동적 데이터 관리 프레임워크로, 애플리케이션과 하나 이상의 데이터 저장 위치·데이터 처리 엔진 사이를 중개하는 역할을 합니다. Apache Calcite를 더 알아보려면 [Calcite 문서](https://calcite.apache.org/docs/)를 참고하세요.

Apache Ignite 3 SQL 엔진은 다음과 같은 장점을 제공합니다.

- **분산 환경에 최적화된 SQL**: Apache Ignite 3의 분산 쿼리는 단일 맵리듀스 단계로 제한되지 않아 더 복잡한 데이터 수집이 가능합니다.
- **트랜잭션 SQL**: Apache Ignite 3의 모든 테이블은 트랜잭션 보장이 적용된 SQL 트랜잭션을 지원합니다.
- **클러스터 전역 시스템 뷰**: Apache Ignite 3의 [시스템 뷰](/configure-and-operate/monitoring/metrics-system-views)는 클러스터 전역 정보를 동적으로 갱신해 제공합니다.
- **다중 인덱스 쿼리**: Apache Ignite 3에서는 여러 인덱스를 동시에 사용하는 쿼리를 실행해 쿼리 속도를 높일 수 있습니다.
- **표준을 준수하는 SQL**: Apache Ignite 3 SQL은 최신 SQL 표준을 충실히 따릅니다.
- **개선된 최적화 알고리즘**: Apache Ignite 3의 SQL은 플래너 규칙을 관계형 표현식에 반복 적용해 쿼리를 최적화합니다.
- **뛰어난 전반적 성능**: Apache Ignite 3는 실행 유연성이 뛰어나고, 메모리와 CPU 사용 효율도 높습니다.
