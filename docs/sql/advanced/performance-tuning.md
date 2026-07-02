---
title: 성능 튜닝
sidebar_position: 3
---

# SQL 성능 튜닝

## 옵티마이저 힌트 {#optimizer-hints}

쿼리 옵티마이저(query optimizer)는 가장 빠르게 실행되는 계획을 찾으려 합니다. 하지만 데이터 설계, 애플리케이션 설계, 클러스터의 데이터 분포는 사용자가 더 잘 아는 경우가 많습니다. SQL 힌트를 사용하면 옵티마이저가 더 합리적으로 최적화하거나 실행 계획을 더 빠르게 세우도록 도울 수 있습니다.

:::note
SQL 힌트 적용은 선택 사항이며, 경우에 따라 무시될 수 있습니다.
:::

### 힌트 형식 {#hints-format}

SQL 힌트는 `/*+ HINT */` 형태의 특수 주석으로 정의하며, 이를 _힌트 블록_이라고 부릅니다. 힌트 이름 앞뒤에는 공백이 반드시 있어야 합니다. 힌트 블록은 연산자 바로 뒤에 위치해야 합니다. 하나의 관계형 연산자에 여러 힌트를 지정하는 것은 지원되지 않습니다.

예시:

```sql
SELECT /*+ NO_INDEX */ T1.* FROM TBL1 where T1.V1=? and T1.V2=?
```

#### 힌트 매개변수 {#hint-parameters}

힌트 매개변수가 필요한 경우, 힌트 이름 뒤 괄호 안에 쉼표로 구분해 지정합니다.

힌트 매개변수는 따옴표로 묶을 수 있습니다. 따옴표로 묶은 매개변수는 대소문자를 구분합니다. 같은 힌트에 따옴표로 묶은 매개변수와 묶지 않은 매개변수를 함께 지정할 수는 없습니다.

예시:

```sql
SELECT /*+ FORCE_INDEX(TBL1_IDX2,TBL2_IDX1) */ T1.V1, T2.V1 FROM TBL1 T1, TBL2 T2 WHERE T1.V1 = T2.V1 AND T1.V2 > ? AND T2.V2 > ?;

SELECT /*+ FORCE_INDEX('TBL2_idx1') */ T1.V1, T2.V1 FROM TBL1 T1, TBL2 T2 WHERE T1.V1 = T2.V1 AND T1.V2 > ? AND T2.V2 > ?;
```

### 힌트 오류 {#hints-errors}

옵티마이저는 가능하면 모든 힌트와 그 매개변수를 적용하려 합니다. 다만 다음의 경우에는 힌트 또는 힌트 매개변수를 건너뜁니다.

* 힌트가 지원되지 않는 경우.
* 필수 힌트 매개변수가 전달되지 않은 경우.
* 힌트 매개변수를 전달했지만 해당 힌트가 매개변수를 지원하지 않는 경우.
* 힌트 매개변수가 잘못되었거나, 존재하지 않는 인덱스나 테이블 같은 객체를 가리키는 경우.
* 동일한 인덱스를 강제로 사용하면서 동시에 비활성화하는 경우처럼, 현재 힌트나 매개변수가 이전 힌트나 매개변수와 호환되지 않는 경우.

`FORCE_INDEX` 힌트가 존재하지 않는 인덱스를 참조하면 다음 오류가 발생합니다.

```java
Hints mentioned indexes "IDX_NOT_FOUND1", "IDX_NOT_FOUND2" were not found.
```

### 지원되는 힌트 {#supported-hints}

#### FORCE_INDEX / NO_INDEX

인덱스 스캔을 강제하거나 비활성화합니다.

##### 매개변수: {#parameters}

* 비워 두면 대상 테이블마다 인덱스 스캔을 강제합니다. 옵티마이저가 사용 가능한 인덱스 중 하나를 선택합니다. 또는 모든 인덱스를 비활성화합니다.
* 단일 인덱스 이름을 지정하면 정확히 그 인덱스만 사용하거나 건너뜁니다.
* 여러 인덱스 이름을 지정할 수 있으며, 서로 다른 테이블에 속한 인덱스도 포함됩니다. 옵티마이저는 스캔에 사용할 인덱스를 선택하거나 모두 건너뜁니다.

##### 예시: {#examples}

```sql
SELECT /*+ FORCE_INDEX */ T1.* FROM TBL1 T1 WHERE T1.V1 = T2.V1 AND T1.V2 > ?;

SELECT /*+ FORCE_INDEX(TBL1_IDX2, TBL2_IDX1) */ T1.V1, T2.V1 FROM TBL1 T1, TBL2 T2 WHERE T1.V1 = T2.V1 AND T1.V2 > ? AND T2.V2 > ?;

SELECT /*+ NO_INDEX */ T1.* FROM TBL1 T1 WHERE T1.V1 = T2.V1 AND T1.V2 > ?;

SELECT /*+ NO_INDEX(TBL1_IDX2, TBL2_IDX1) */ T1.V1, T2.V1 FROM TBL1 T1, TBL2 T2 WHERE T1.V1 = T2.V1 AND T1.V2 > ? AND T2.V2 > ?;
```

:::note
하나의 쿼리에 `FORCE_INDEX`와 `NO_INDEX` 힌트를 동시에 지정할 수 없습니다.
:::

## EXPLAIN 문 사용 {#using-explain-statement}

### EXPLAIN PLAN FOR 문 {#explain-plan-for-statement}

Apache Ignite는 쿼리의 실행 계획을 확인할 수 있는 [`EXPLAIN PLAN FOR`](/sql/reference/data-types-and-functions/operational-commands) 문을 지원합니다.

이 명령을 사용해 쿼리를 분석하고 최적화 가능성이 있는지 확인하세요. 예시:

```sql
EXPLAIN PLAN FOR SELECT name FROM Person WHERE age = 26;
```

결과는 다음과 같은 형태로 나타납니다.

```text
╔═══════════════════════════════╗
║ PLAN                          ║
╠═══════════════════════════════╣
║ Exchange                      ║
║     distribution: single      ║
║     est. row count: 333000    ║
║   TableScan                   ║
║       table: [PUBLIC, PERSON] ║
║       filters: =(AGE, 26)     ║
║       fields: [$f0]           ║
║       projects: [NAME]        ║
║       est. row count: 333000  ║
╚═══════════════════════════════╝
```

### EXPLAIN MAPPING FOR 문 {#explain-mapping-for-statement}

Apache Ignite는 쿼리가 어떻게 분할되고 각 서브쿼리가 어느 노드에서 실행되는지 추적할 수 있는 [`EXPLAIN MAPPING FOR`](/sql/reference/data-types-and-functions/operational-commands) 문을 지원합니다.

분산 클러스터에서 쿼리가 어떻게 나뉘어 여러 노드에 걸쳐 실행되는지 확인하려면 이 명령을 사용하세요.

```sql
EXPLAIN MAPPING FOR SELECT name FROM Person WHERE age = 26;
```

결과는 다음과 같이 나타납니다.

```text
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ PLAN                                                                                                                                                                                              ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ Fragment#0 root                                                                                                                                                                                   ║
║   executionNodes: [defaultNode]                                                                                                                                                                   ║
║   remoteFragments: [1]                                                                                                                                                                            ║
║   exchangeSourceNodes: {1=[defaultNode]}                                                                                                                                                          ║
║   tree:                                                                                                                                                                                           ║
║     Receiver(sourceFragment=1, exchange=1, distribution=single)                                                                                                                                   ║
║                                                                                                                                                                                                   ║
║ Fragment#1                                                                                                                                                                                        ║
║   targetNodes: [defaultNode]                                                                                                                                                                      ║
║   executionNodes: [defaultNode]                                                                                                                                                                   ║
║   tables: [PERSON]                                                                                                                                                                                ║
║   partitions: {defaultNode=[0:12, 1:12, 2:12, 3:12, 4:12, 5:12, 6:12, 7:12, 8:12, 9:12, 10:12, 11:12, 12:12, 13:12, 14:12, 15:12, 16:12, 17:12, 18:12, 19:12, 20:12, 21:12, 22:12, 23:12, 24:12]} ║
║   tree:                                                                                                                                                                                           ║
║     Sender(targetFragment=0, exchange=1, distribution=single)                                                                                                                                     ║
║       TableScan(name=PUBLIC.PERSON, source=2, partitions=25, distribution=random)                                                                                                                 ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

## 쿼리 일괄 처리 {#query-batching}

Apache Ignite는 일괄 처리된 요청을 개별 요청보다 빠르게 처리하므로, 가능하면 다중 문 실행을 사용하는 것이 좋습니다.

한 번의 호출로 여러 쿼리를 실행하면 유사한 요청은 자동으로 일괄 처리됩니다. 여러 종류의 작업을 수행하는 대규모 스크립트를 작성할 때는 다음 순서를 따르는 것이 좋습니다.

- 필요한 모든 [DDL 작업](/sql/reference/language-definition/ddl)
- [접근 권한](/sql/reference/data-types-and-functions/operational-commands) 할당
- 테이블에 데이터 적재

각 SQL 문의 실행은 첫 페이지를 반환할 준비가 되면 완료된 것으로 간주하므로, 대용량 데이터를 다룰 때는 `SELECT` 문이 같은 스크립트 안의 이후 문에 영향을 받을 수 있습니다.

## 상관 서브쿼리의 성능 고려 사항 {#performance-consideration-for-correlated-subqueries}

Apache Ignite는 상관 서브쿼리(correlated subquery)를 지원하지만, 일부 복잡한 상관 서브쿼리는 성능이 충분하지 않을 수 있으며, 처리량이 많은 트랜잭션 워크로드나 분석 워크로드에서 특히 그렇습니다.

### 상관 서브쿼리란 {#what-are-correlated-subqueries}

상관 서브쿼리는 실행 시 외부 쿼리의 값에 의존하는 서브쿼리입니다. 외부 쿼리의 각 행마다 한 번씩 평가됩니다.

예를 들어 다음과 같이 스키마가 정의되어 있다고 가정합니다.

```sql
CREATE TABLE projects (id INT PRIMARY KEY, name VARCHAR);
CREATE TABLE employees (id INT PRIMARY KEY, department_id INT, name VARCHAR, salary DECIMAl);
CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR);
CREATE TABLE assignments (project_id INT, employee_id INT, PRIMARY KEY (project_id, employee_id));
```

상관 서브쿼리는 다음과 같은 형태입니다.

```sql
SELECT e.name,
       (SELECT COUNT(*)
          FROM assignments a
         WHERE a.employee_id = e.id
       ) AS project_count
FROM employees e;
```

여기서 서브쿼리는 외부 쿼리의 `e.id`를 참조하므로 직원 행마다 다시 평가되며, 결과적으로 직원이 N명이면 서브쿼리가 N번 실행됩니다.

### 성능 영향 {#performance-impact}

Apache Ignite 3는 반복되는 서브쿼리 실행을 자동으로 최적화하지 않습니다. 그 결과:

- 스칼라 서브쿼리가 병목이 될 수 있습니다.
- 작은 테이블이라도 반복 조회하면 CPU와 메모리 사용량이 크게 늘어납니다.
- 일부 쿼리는 예상보다 느리게 동작할 수 있습니다.

### 성능 개선 {#improving-performance}

일반적으로 선택도가 높은 외부 쿼리에 비용이 적은 스칼라 서브쿼리(예: 단일 행 인덱스 조회)를 사용하면 성능에 문제가 없습니다. 예시입니다.

```sql
-- This query returns an employee along with the name of the department they belong to.
-- It uses a correlated scalar subquery to resolve the department name.
--
-- Note the predicate `e.id = ?`, which filters by the employee's primary key.
-- This makes the outer query highly selective -- typically returning only a single row.
--
-- Because the subquery is evaluated only once (or a very small number of times),
-- using a correlated scalar subquery is safe and has negligible performance impact
-- in this case. There's no need to rewrite it using a join.
SELECT e.*,
       (SELECT name
          FROM departments
         WHERE id = e.department_id
       ) AS employees_department
  FROM employees e
 WHERE e.id = ?;
```

조건자가 없는 유사한 쿼리는 성능이 낮아질 수 있습니다. 조건자가 있는 쿼리는 `0.007s`에 끝나지만, 조건자가 없는 유사한 쿼리는 `2.4s`까지 걸립니다.

다른 예시입니다.

```sql
-- This query returns all employees along with the name of the department they
-- belong to.
SELECT e.*,
       (SELECT name
          FROM departments
         WHERE id = e.department_id
       ) AS employees_department
  FROM employees e;
```

위와 같은 쿼리는 일반적인 `JOIN`으로 쉽게 다시 작성할 수 있습니다.

```sql
-- Equivalent query to the previous example, but uses a `LEFT JOIN` instead of a
-- correlated subquery. This rewrite is valid as long as the subquery in the original
-- version would return at most one row.
--
-- If multiple rows exist in the `departments` table for the same `id`, the original
-- scalar subquery would result in a runtime error (due to a non-scalar result), while
-- the join version would produce duplicated rows in the output.
--
-- In our case, `departments.id` is a primary key, so the join is safe and will return
-- at most one matching department per employee.
--
-- A `LEFT JOIN` is used to ensure that employees with no matching department are still
-- returned. If it's guaranteed that every employee has a valid department reference,
-- an `INNER JOIN` may be used instead, which is slightly more efficient.
SELECT e.*,
       d.name AS employees_department
  FROM employees e
  LEFT JOIN departments d ON d.id = e.department_id;
```

동일한 환경에서 다시 작성한 쿼리는 훨씬 빠르게 끝납니다.

### 개선된 쿼리 예시 {#examples-of-improved-queries}

첫 번째 예시는 각 행을 평가하지 않고도 데이터베이스를 올바르게 조회하는 방법을 보여줍니다.

```sql
-- This query returns all employees without assigned projects.
--
-- Finishes in 3.2s (assuming there is an index on `assignments(employee_id)`;
-- without the index, execution time increases significantly -- up to 12s).
SELECT e.id, e.name
FROM employees e
WHERE NOT EXISTS (
    SELECT 1
    FROM assignments a
    WHERE a.employee_id = e.id
);

-- Equivalent query without correlated subqueries.
-- Instead of evaluating a subquery for each row, we join the tables and compute
-- the number of assignments using aggregation. It is important to include all
-- columns that form a unique key from the outer table in the `GROUP BY` clause.
-- Otherwise, multiple rows may be grouped together incorrectly, potentially
-- affecting the result. If you're unsure about the uniqueness of specific columns,
-- include all columns from the table's `PRIMARY KEY`.
--
-- A `LEFT JOIN` is used because we want to retain employees even when there is
-- no matching assignment. An `INNER JOIN` would exclude those employees.
--
-- The `HAVING COUNT(a.employee_id) = 0` clause checks for the absence of matches.
-- You must count a column from the right-hand side of the join that is guaranteed
-- to be non-null. In this case, `a.employee_id` is suitable because the `JOIN`
-- condition (`a.employee_id = e.id`) ensures that only non-null `employee_id`s
-- are matched; nulls are excluded during the join phase.
--
-- Finishes in 0.04s.
SELECT e.id, e.name
  FROM employees e
  LEFT JOIN assignments a ON a.employee_id = e.id
 GROUP BY e.id, e.name
HAVING COUNT(a.employee_id) = 0;

-- Similar query, but returns only employees who have at least one project assigned.
-- Note the use of `INNER JOIN`: since we are only interested in employees with a
-- matching assignment, an inner join is both sufficient and more efficient in this case.
--
-- The `HAVING COUNT(a.employee_id) > 0` condition ensures that only employees
-- with one or more matching rows in the `assignments` table are returned.
-- As with the previous example, `a.employee_id` is safe to count because it cannot be null
-- due to the join condition (`a.employee_id = e.id`) filtering out nulls.
--
-- Finishes in 0.03s.
SELECT e.id, e.name
  FROM employees e
  JOIN assignments a ON a.employee_id = e.id
 GROUP BY e.id, e.name
HAVING COUNT(a.employee_id) > 0;
```

이 예시는 쿼리를 개선함으로써 얻을 수 있는 극적인 성능 향상을 보여줍니다.

```sql
-- This query returns all employees whose salary is the minimum within their department.
--
-- Finishes in 18s.
SELECT e.*
  FROM employees e
 WHERE e.salary = (SELECT MIN(salary) FROM employees WHERE department_id = e.department_id);

-- Equivalent query without a correlated subquery.
-- Instead of comparing each employee's salary with a scalar subquery result,
-- we precompute the minimum salary per department using a grouped subquery,
-- and then join it back to the employees table.
--
-- This rewrite is safe because:
--   - For each department, we compute the minimum salary exactly once.
--   - The join condition ensures we only return employees whose salary matches
--     the minimum salary for their department.
--   - No grouping is needed on the outer query because we're performing an equality match
--     on both `department_id` and the computed minimum salary.
--
-- This approach avoids per-row subquery evaluation and leverages set-based operations,
-- which are significantly faster.
--
-- Finishes in 0.02s.
SELECT e.*
  FROM employees e
  JOIN (
      SELECT department_id, MIN(salary) AS min_salary
        FROM employees
       GROUP BY department_id
  ) AS min_salaries_by_department
    ON e.department_id = min_salaries_by_department.department_id
   AND e.salary = min_salaries_by_department.min_salary;
```

## 캐시된 실행 계획 삭제 {#dropping-cached-plans}

:::warning
실험적 API입니다.
:::

쿼리 계획을 최적화하는 작업은 리소스를 많이 소모하므로, Apache Ignite는 계획을 캐시해 이후 관련 쿼리에 재사용합니다. 데이터가 갱신되면 캐시된 계획이 오래되어 다시 계산해야 할 수 있습니다. 기본적으로 캐시된 계획은 `ignite.planner.planCacheExpiresAfterSeconds` 매개변수에 지정된 기간(기본값 1800초)이 지나면 만료됩니다.

더 일찍 갱신하려면 `sql planner invalidate-cache` CLI 도구 명령을 사용하세요.

```text
sql planner invalidate-cache --tables=PUBLIC.Person
```
