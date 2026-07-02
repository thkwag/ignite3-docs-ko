---
id: colocation
title: 데이터 콜로케이션
sidebar_label: 콜로케이션
---

관련 데이터를 같은 노드에 저장하고 싶을 때가 많습니다. 이렇게 하면 여러 항목을 조회하는 쿼리가 다른 노드에서 데이터를 가져올 필요가 없어 더 빠르게 실행됩니다.

테이블을 생성할 때 데이터를 함께 배치할 키를 선택할 수 있습니다.

예를 들어 `Person` 객체와 `Company` 객체가 있고, 각 사람마다 자신이 근무하는 회사를 나타내는 companyId 필드가 있다고 가정해 봅시다. `Person.companyId`와 `Company.ID`를 콜로케이션(colocation) 키로 지정하면, 같은 회사에 근무하는 모든 사람이 회사 객체가 저장된 노드와 같은 노드에 저장됩니다. 특정 회사에 근무하는 사람을 조회하는 쿼리는 단일 노드에서 처리됩니다.

## 콜로케이션 키 구성 {#configuring-colocation-key}

데이터 콜로케이션은 테이블을 생성할 때 `COLOCATE BY` 절로 구성합니다. 데이터를 함께 배치하는 데 사용하는 컬럼은 기본 키에 포함되어야 하며, 주 테이블의 `PRIMARY KEY`와 같은 순서로 지정해야 합니다.

예를 들어 아래 테이블은 `city_id` 컬럼을 기준으로 사람 데이터를 함께 배치합니다.

```sql
CREATE TABLE IF NOT EXISTS Person (
  id int,
  city_id int primary key,
  name varchar,
  age int,
  company varchar
) COLOCATE BY (city_id)
```

복합 기본 키를 사용할 때는 데이터를 함께 배치할 컬럼을 여러 개 지정할 수 있습니다.

```sql
CREATE TABLE Company (
  company_id int,
  department_id int,
  city_id int,
  company_name timestamp,
  PRIMARY KEY (company_id, city_id)
)

CREATE TABLE IF NOT EXISTS Person (
  id int,
  city_id int,
  name varchar,
  age int,
  company_id int,
  PRIMARY KEY (id, company_id, city_id)
)
COLOCATE BY (company_id, city_id)
```

이 경우 Ignite는 이 두 테이블을 저장할 때 함께 배치하려고 시도합니다.

:::note
데이터를 함께 배치하려면, 함께 배치되는 테이블(위 예시의 `Person` 테이블)의 `COLOCATE BY` 절이 주 테이블(위 예시의 Company 테이블)의 `PRIMARY KEY` 절과 동일한 컬럼 집합을 동일한 순서로 포함해야 합니다.
:::
