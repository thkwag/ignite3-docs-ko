---
id: data-types
title: SQL 데이터 타입
sidebar_label: 데이터 타입
---

# 데이터 타입 {#data-types}

이 페이지는 Apache Ignite에서 사용할 수 있는 문자열, 숫자, 날짜·시간 등 SQL 데이터 타입 목록을 다룹니다.

모든 SQL 타입은 Apache Ignite가 기본으로 지원하는 프로그래밍 언어별 또는 드라이버별 타입에 매핑됩니다.

## 불리언 타입 {#boolean-types}

### BOOLEAN

가능한 값: `TRUE`와 `FALSE`.

#### 타입 매핑 {#type-mapping}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| BOOLEAN | BOOLEAN | Boolean | bool | bool |

## 숫자 타입 {#numeric-types}

### TINYINT

가능한 값: `[-128, 127]`.

#### 타입 매핑 {#type-mapping-1}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| INT8 | TINYINT | Byte | sbyte | std::int8_t |

### SMALLINT

가능한 값: [`-32768`, `32767`].

#### 타입 매핑 {#type-mapping-2}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| INT16 | SMALLINT | Short | short | std::int16_t |

### INT

가능한 값: [`-2147483648`, `2147483647`].

별칭: `INTEGER`

#### 타입 매핑 {#type-mapping-3}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| INT32 | INT | Integer | int | std::int32_t |

### BIGINT

가능한 값: [`-9223372036854775808`, `9223372036854775807`].

#### 타입 매핑 {#type-mapping-4}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| INT64 | BIGINT | Long | long | std::int64_t |

### DECIMAL

가능한 값: 정밀도를 지정할 수 있는 정확한 수치.

기본 정밀도: `32767`

최대 정밀도: `32767`

기본 스케일: `0`

최대 스케일: `16383`

#### Apache Ignite의 Decimal 정밀도와 스케일 {#decimal-precision-and-scale-in-apache-ignite}

Apache Ignite는 decimal 값을 처리할 때 다음과 같은 특성이 있습니다:

- 정밀도보다 큰 스케일을 지정할 수 있습니다. 이 경우 컬럼은 소수 값만 저장하며, 소수점 오른쪽의 0 자릿수는 스케일에서 정밀도를 뺀 값과 같아야 합니다. 예를 들어 다음과 같이 선언하면:

```sql
DECIMAL(3, 6)
```

-0.000999부터 0.000999까지(양 끝 포함) 값을 저장할 수 있습니다.

- `BigDecimal` 데이터 타입은 `DECIMAL(28, 6)`으로 파생됩니다. 소수점 이하 자릿수가 6자리를 넘으면 초과분은 버려집니다. 정밀도보다 큰 값을 전달하면 범위 초과 예외가 발생합니다.

더 큰 decimal 값을 저장하려면 사용자 지정 정밀도로 캐스팅하세요. 예를 들어 `CAST(? as DECIMAL(100, 50))`처럼 씁니다.

#### 타입 매핑 {#type-mapping-5}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| DECIMAL | DECIMAL | BigDecimal | BigDecimal | big_decimal |

### REAL

가능한 값: 단정밀도(32비트) IEEE 754 부동소수점 수.

특수 값: `NaN`, `-Infinity`, `+Infinity`

#### 타입 매핑 {#type-mapping-6}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| FLOAT | REAL | Float | float | float |

### DOUBLE

가능한 값: 배정밀도(64비트) IEEE 754 부동소수점 수.

별칭: `DOUBLE PRECISION`

특수 값: `NaN`, `-Infinity`, `+Infinity`

#### 타입 매핑 {#type-mapping-7}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| DOUBLE | DOUBLE | Double | double | double |

## 문자열 타입 {#character-string-types}

### VARCHAR

가능한 값: 유니코드 문자열.

별칭: `CHARACTER VARYING`

기본 길이: `65536`

최대 길이: `2147483648`

#### 타입 매핑 {#type-mapping-8}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| STRING | VARCHAR | String | string | std::string |

### CHAR (제한적 지원) {#char-limited-support}

:::warning
이 타입은 표현식에서만 사용할 수 있으며(예: CAST('a' AS CHAR(3))), `CREATE TABLE`, `ALTER TABLE`, `ADD COLUMN` 같은 DDL 문에서는 사용할 수 없습니다. 대신 [VARCHAR](#varchar)를 사용하세요.
:::

공백으로 채워지는 고정 길이 유니코드 문자열입니다.

기본 길이: `1`

최대 길이: `65536`

#### 타입 매핑 {#type-mapping-9}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| STRING | CHAR | String | string | std::string |

## 바이너리 문자열 타입 {#binary-string-types}

### VARBINARY

가능한 값: 바이너리 데이터("바이트 배열").

별칭: `BINARY`, `BINARY VARYING`

기본 길이: `65536`

최대 길이: `2147483648`

#### 타입 매핑 {#type-mapping-10}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| BYTE_ARRAY | VARBINARY | byte[] | byte[] | std::vector\<std::byte\> |

## 날짜·시간 타입 {#date-and-time-types}

### TIME

:::note
다음 Java 타입은 지원되지 않으며 [table API](/develop/work-with-data/table-api)에서 사용할 수 없습니다:

- `java.sql.Time`
- `java.util.Date`
:::

가능한 값: 시간 데이터 타입. 형식은 `hh:mm:ss`입니다.

기본 정밀도: `0`

최대 정밀도: `3`

매핑 대상: `LocalTime`

#### 타입 매핑 {#type-mapping-11}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| TIME | TIME | LocalTime | LocalTime | ignite_time |

### DATE

:::note
다음 Java 타입은 지원되지 않으며 [table API](/develop/work-with-data/table-api)에서 사용할 수 없습니다:

- `java.sql.Time`
- `java.util.Date`
:::

가능한 값: 날짜 데이터 타입.

형식은 `yyyy-MM-dd`입니다.

매핑 대상: `LocalDate`

#### 타입 매핑 {#type-mapping-12}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| DATE | DATE | LocalDate | LocalDate | ignite_date |

### TIMESTAMP

:::warning
timestamp 데이터 타입은 밀리초(3자리)까지의 정밀도만 지원합니다. 3자리를 넘는 값은 무시됩니다.
:::

:::note
다음 Java 타입은 지원되지 않으며 [table API](/develop/work-with-data/table-api)에서 사용할 수 없습니다:

- `java.sql.Time`
- `java.util.Date`
:::

가능한 값: timestamp 데이터 타입. 형식은 `yyyy-MM-dd hh:mm:ss[.mmm]`입니다.

기본 정밀도: `6`

최대 정밀도: `9`

매핑 대상:

- 시간대 없이 사용할 때는 `LocalDateTime`.
- 시간대와 함께 사용할 때는 `Instant`.

#### 타입 매핑 {#type-mapping-13}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| DATETIME | TIMESTAMP | LocalDateTime | LocalDateTime | ignite_date_time |

### TIMESTAMP WITH LOCAL TIMEZONE

:::warning
로컬 시간대 기준 timestamp 데이터 타입은 밀리초(3자리)까지의 정밀도만 지원합니다. 3자리를 넘는 값은 무시됩니다.
:::

:::note
다음 Java 타입은 지원되지 않으며 [table API](/develop/work-with-data/table-api)에서 사용할 수 없습니다:

- `java.sql.Time`
- `java.util.Date`
:::

가능한 값: 사용자의 로컬 시간대 오프셋을 반영하는 timestamp 데이터 타입. 시간대 오프셋은 컬럼 데이터에 저장되지 않습니다. 값을 조회하면 세션의 시간대로 자동 변환됩니다. 형식은 `yyyy-MM-dd hh:mm:ss[.mmm]`입니다.

기본 정밀도: `6`

최대 정밀도: `9`

매핑 대상:

- 시간대 없이 사용할 때는 `LocalDateTime`.
- 시간대와 함께 사용할 때는 `Instant`.

#### 타입 매핑 {#type-mapping-14}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| DATETIME | TIMESTAMP | LocalDateTime | LocalDateTime | ignite_date_time |

## 기타 타입 {#other-types}

### UUID

가능한 값: 범용 고유 식별자입니다. 128비트 값입니다.

UUID 예시: `7d24b70e-25d5-45ed-a5fa-39d8e1d966b9`

#### 타입 매핑 {#type-mapping-15}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| UUID | UUID | UUID | Guid | uuid |

### NULL

null 값을 담는 필드입니다.

#### 타입 매핑 {#type-mapping-16}

| ColumnType | SQL | Java | .NET | C++ |
|------------|-----|------|------|-----|
| NULL | NULL | Void | Null | nullptr |

## 암묵적 타입 변환 {#implicit-type-conversion}

Apache Ignite 3에서 암묵적 타입 변환은 같은 타입 계열 내의 타입으로 제한됩니다. 아래 표는 가능한 암묵적 변환을 정리한 것입니다:

| 타입 계열 | 사용 가능한 타입 |
|-------------|-----------------|
| 불리언 | `BOOLEAN` |
| 숫자 | `TINYINT`, `SMALLINT`, `INT`, `BIGINT`, `DECIMAL`, `FLOAT`, `DOUBLE` |
| 문자열 | `VARCHAR`, `CHAR` |
| 바이너리 문자열 | `VARBINARY` `BINARY` |
| 날짜 | `DATE` |
| 시간 | `TIME` |
| 날짜·시간 | `TIMESTAMP`, `TIMESTAMP WITH LOCAL TIME ZONE` |
| UUID | `UUID` |
