---
title: 연산자와 함수
---

# 연산자와 함수 {#operators-and-functions}

:::note
Apache Calcite가 지원하는 함수를 자세히 알아보려면 [제품 문서](https://calcite.apache.org/docs/reference.html#operators-and-functions)를 참고하세요.
:::

## 집계 함수 {#aggregate-functions}

### AVG

```sql
AVG( [ ALL | DISTINCT ] numeric)
```

모든 입력 값에 대한 numeric의 평균(산술 평균)을 반환합니다. 사용 시 데이터 타입은 다음과 같이 바뀝니다:

| 입력 타입 | 결과 타입 | 최소 스케일 |
|---|---|---|
| `DECIMAL`, `BIGINT`, `INTEGER`, `SMALLINT`, `TINYINT` | `DECIMAL` | 16 |
| `DOUBLE`, `REAL` | `DOUBLE` | |

### COUNT

```sql
COUNT( [ ALL | DISTINCT ] value [, value ]*)
```

value가 null이 아닌 입력 행의 개수를 반환합니다(value가 복합 값이면 전체가 null이 아니어야 합니다).

### MAX

```sql
MAX( [ ALL | DISTINCT ] value)
```

모든 입력 값 중 최댓값을 반환합니다.

### MIN

```sql
MIN( [ ALL | DISTINCT ] value)
```

모든 입력 값 중 최솟값을 반환합니다.

### SUM

```sql
SUM( [ ALL | DISTINCT ] numeric)
```

모든 입력 값에 대한 numeric의 합을 반환합니다.

### ANY_VALUE

```sql
ANY_VALUE( [ ALL | DISTINCT ] value)
```

모든 입력 값 중 value 값 하나를 반환합니다. 이 함수는 SQL 표준에 정의되어 있지 않습니다.

### EVERY

```sql
EVERY(condition)
```

condition의 모든 값이 TRUE이면 TRUE를 반환합니다.

### SOME

```sql
SOME(condition)
```

condition의 값 중 하나 이상이 TRUE이면 TRUE를 반환합니다.

### GROUPING

```sql
GROUPING(column_reference [,column_reference])
```

주어진 그룹화 표현식의 비트 벡터를 반환합니다.

## JSON 함수 {#json-functions}

### JSON_TYPE

```sql
JSON_TYPE(jsonValue)
```

jsonValue의 타입을 나타내는 문자열 값을 반환합니다.

### FORMAT JSON

값이 JSON 형식임을 나타냅니다.

### JSON_VALUE

```sql
JSON_VALUE(jsonValue, path [ RETURNING type ] [ { ERROR | NULL | DEFAULT expr } ON EMPTY ] [ { ERROR | NULL | DEFAULT expr } ON ERROR ] )
```

JSON 경로 표현식 path를 사용해 jsonValue에서 SQL 스칼라 값을 추출합니다.

### JSON_QUERY

```sql
JSON_QUERY(jsonValue, path [ RETURNING type ] [ { WITHOUT [ ARRAY ] | WITH [ CONDITIONAL | UNCONDITIONAL ] [ ARRAY ] } WRAPPER ] [ { ERROR | NULL | EMPTY ARRAY | EMPTY OBJECT } ON EMPTY ] [ { ERROR | NULL | EMPTY ARRAY | EMPTY OBJECT } ON ERROR ] )
```

JSON 경로 표현식 path를 사용해 jsonValue에서 JSON 객체 또는 JSON 배열을 추출합니다.

### JSON_EXISTS

```sql
JSON_EXISTS(jsonValue, path [ { TRUE | FALSE | UNKNOWN | ERROR } ON ERROR ] )
```

jsonValue가 JSON 경로 표현식 path로 기술한 검색 조건을 만족하는지 여부를 반환합니다.

### JSON_DEPTH

```sql
JSON_DEPTH(jsonValue)
```

jsonValue의 깊이를 나타내는 정수 값을 반환합니다.

### JSON_KEYS

```sql
JSON_KEYS(jsonValue [, path ])
```

JSON jsonValue의 키를 나타내는 문자열을 반환합니다.

### JSON_PRETTY

```sql
JSON_PRETTY(jsonValue)
```

jsonValue를 보기 좋게 정렬한 형태로 반환합니다.

### JSON_LENGTH

```sql
JSON_LENGTH(jsonValue [, path ])
```

jsonValue의 길이를 나타내는 정수를 반환합니다.

### JSON_REMOVE

```sql
JSON_REMOVE(jsonValue, path [, path ])
```

일련의 path 표현식을 사용해 jsonValue에서 데이터를 제거하고 그 결과를 반환합니다.

### JSON_STORAGE_SIZE

```sql
JSON_STORAGE_SIZE(jsonValue)
```

jsonValue의 바이너리 표현을 저장하는 데 사용되는 바이트 수를 반환합니다.

### JSON_OBJECT

```sql
JSON_OBJECT( jsonKeyVal [, jsonKeyVal ]* [ nullBehavior ] )
```

일련의 키-값 쌍으로 JSON 객체를 생성합니다.

### JSON_ARRAY

```sql
JSON_ARRAY( [ jsonVal [, jsonVal ]* ] [ nullBehavior ] )
```

일련의 값으로 JSON 배열을 생성합니다.

### IS JSON VALUE

```sql
jsonValue IS JSON [ VALUE ]
```

jsonValue가 JSON 값인지 여부를 반환합니다.

### IS JSON OBJECT

```sql
jsonValue IS JSON OBJECT
```

jsonValue가 JSON 객체인지 여부를 반환합니다.

### IS JSON ARRAY

```sql
jsonValue IS JSON ARRAY
```

jsonValue가 JSON 배열인지 여부를 반환합니다.

### IS JSON SCALAR

```sql
jsonValue IS JSON SCALAR
```

jsonValue가 JSON 스칼라 값인지 여부를 반환합니다.

## 정규 표현식 함수 {#regular-expression-functions}

### POSIX REGEX CASE INSENSITIVE

```sql
value 1 POSIX REGEX CASE INSENSITIVE value 2
```

대소문자를 구분하는 POSIX 정규 표현식입니다.

### POSIX REGEX CASE SENSITIVE

```sql
value 1 POSIX REGEX CASE SENSITIVE value 2
```

대소문자를 구분하는 POSIX 정규 표현식입니다.

### REGEXP_REPLACE

```sql
REGEXP_REPLACE(string, regexp, rep [, pos [, occurrence [, matchType]]])
```

expr의 시작 위치 pos부터 regexp와 일치하는 string의 모든 부분 문자열을 rep로 치환합니다(pos를 생략하면 기본값은 1입니다). occurrence는 검색할 일치 항목의 순번을 지정하고(생략하면 기본값은 1입니다), matchType은 일치 방식을 지정합니다.

```sql
REGEXP_REPLACE(string, regexp)
```

regexp와 일치하는 value의 모든 부분 문자열을 빈 문자열로 치환하고, 수정된 value를 반환합니다.

## 숫자 함수 {#numeric-functions}

### MOD

```sql
MOD(numeric1, numeric2)
```

numeric1을 numeric2로 나눈 나머지(모듈러스)를 반환합니다. 결과는 numeric1이 음수일 때만 음수가 됩니다.

### EXP

```sql
EXP(numeric)
```

e를 numeric 제곱한 값을 반환합니다.

### POWER

```sql
POWER(numeric1, numeric2)
```

numeric1을 numeric2 제곱한 값을 반환합니다.

### LN

```sql
LN(numeric)
```

numeric의 자연로그(밑 e)를 반환합니다.

### LOG10

```sql
LOG10(numeric)
```

numeric의 밑 10 로그를 반환합니다.

### ABS

```sql
ABS(numeric)
```

numeric의 절댓값을 반환합니다.

### RAND

```sql
RAND([seed])
```

0과 1 사이(양 끝 포함)의 임의의 double 값을 생성하며, 선택적으로 seed로 난수 생성기를 초기화합니다.

### RAND_INTEGER

```sql
RAND_INTEGER([seed, ] numeric)
```

0과 numeric - 1 사이(양 끝 포함)의 임의의 정수를 생성하며, 선택적으로 seed로 난수 생성기를 초기화합니다.

### ACOS

```sql
ACOS(numeric)
```

numeric의 아크코사인을 반환합니다.

### ASIN

```sql
ASIN(numeric)
```

numeric의 아크사인을 반환합니다.

### ATAN

```sql
ATAN(numeric)
```

numeric의 아크탄젠트를 반환합니다.

### ATAN2

```sql
ATAN2(numeric, numeric)
```

numeric 좌표의 아크탄젠트를 반환합니다.

### SQRT

```sql
SQRT(numeric)
```

numeric의 제곱근을 반환합니다.

### CBRT

```sql
CBRT(numeric)
```

numeric의 세제곱근을 반환합니다.

### COS

```sql
COS(numeric)
```

numeric의 코사인을 반환합니다.

### COSH

```sql
COSH(numeric)
```

numeric의 쌍곡코사인을 반환합니다.

### COT

```sql
COT(numeric)
```

numeric의 코탄젠트를 반환합니다.

### DEGREES

```sql
DEGREES(numeric)
```

numeric을 라디안에서 도(degree)로 변환합니다.

### RADIANS

```sql
RADIANS(numeric)
```

numeric을 도에서 라디안으로 변환합니다.

### ROUND

```sql
ROUND(numeric1 [, integer2])
```

numeric1을 소수점 오른쪽 integer2 자리에서 반올림합니다(integer2를 지정하지 않으면 0입니다).

### SIGN

```sql
SIGN(numeric)
```

numeric의 부호(signum)를 반환합니다.

### SIN

```sql
SIN(numeric)
```

numeric의 사인을 반환합니다.

### SINH

```sql
SINH(numeric)
```

numeric의 쌍곡사인을 반환합니다.

### TAN

```sql
TAN(numeric)
```

numeric의 탄젠트를 반환합니다.

### TANH

```sql
TANH(numeric)
```

numeric의 쌍곡탄젠트를 반환합니다.

### TRUNCATE

```sql
TRUNCATE(numeric1 [, integer2])
```

numeric1을 소수점 오른쪽 integer2 자리에서 버림합니다(integer2를 지정하지 않으면 0입니다).

### PI

```sql
PI()
```

다른 어떤 값보다도 원주율(Pi)에 가까운 값을 반환합니다.

## 문자열 함수 {#string-functions}

### UPPER

```sql
UPPER(string)
```

대문자로 변환한 문자열을 반환합니다.

### LOWER

```sql
LOWER(string)
```

소문자로 변환한 문자열을 반환합니다.

### INITCAP

```sql
INITCAP(string)
```

각 단어의 첫 글자를 대문자로, 나머지를 소문자로 변환한 string을 반환합니다. 단어는 영숫자가 아닌 문자로 구분되는 영숫자 문자의 연속입니다.

### TO_BASE64

```sql
TO_BASE64(string)
```

string을 base-64로 인코딩한 형태로 변환해 인코딩된 문자열을 반환합니다.

### FROM_BASE64

```sql
FROM_BASE64(string)
```

base-64 문자열을 디코딩한 결과를 문자열로 반환합니다.

### MD5

```sql
MD5(string)
```

string의 MD5 128비트 체크섬을 계산해 16진수 문자열로 반환합니다.

### SHA1

```sql
SHA1(string)
```

string의 SHA-1 해시 값을 계산해 16진수 문자열로 반환합니다.

### SUBSTRING

```sql
SUBSTRING(string FROM integer)
```

지정한 위치부터 시작하는 문자열의 부분 문자열을 반환합니다.

```sql
SUBSTRING(string FROM integer FOR integer)
```

지정한 위치부터 지정한 길이만큼의 문자열 부분 문자열을 반환합니다.

```sql
SUBSTRING(binary FROM integer)
```

지정한 위치부터 시작하는 binary의 부분 문자열을 반환합니다.

```sql
SUBSTRING(binary FROM integer FOR integer)
```

지정한 위치부터 지정한 길이만큼의 binary 부분 문자열을 반환합니다.

### LEFT

```sql
LEFT(string, length)
```

string의 왼쪽에서 length개 문자를 반환합니다.

### RIGHT

```sql
RIGHT(string, length)
```

string의 오른쪽에서 length개 문자를 반환합니다.

### REPLACE

```sql
REPLACE(char, search_string [, replace_string])
```

search_string을 replace_string으로 치환합니다.

### TRANSLATE

```sql
TRANSLATE(expr, fromString, toString)
```

expr에서 fromString의 각 문자가 나타날 때마다 toString의 대응하는 문자로 치환한 결과를 반환합니다. expr에서 fromString에 없는 문자는 치환하지 않습니다.

### CHR

```sql
CHR(integer)
```

UTF-8 코드가 integer인 문자를 반환합니다.

### CHAR_LENGTH

```sql
CHAR_LENGTH(string)
```

문자열의 문자 개수를 반환합니다.

### CHARACTER_LENGTH

```sql
CHARACTER_LENGTH(string)
```

문자열의 문자 개수를 반환합니다.

### ||

```sql
string || string
```

두 문자열을 연결합니다.

### CONCAT

```sql
CONCAT(string, string)
```

두 문자열을 연결하며, 두 string 인수가 모두 null일 때만 null을 반환하고, 그렇지 않으면 null을 빈 문자열로 취급합니다.

```sql
CONCAT(string [, string ]*)
```

하나 이상의 문자열을 연결하며, 인수 중 하나라도 null이면 null을 반환합니다.

```sql
CONCAT(string [, string ]*)
```

하나 이상의 문자열을 연결하며, null은 빈 문자열로 취급합니다.

### OVERLAY

```sql
OVERLAY(string1 PLACING string2 FROM integer [ FOR integer2 ])
```

string1의 부분 문자열을 string2로 치환합니다.

```sql
OVERLAY(binary1 PLACING binary2 FROM integer [ FOR integer2 ])
```

binary1의 부분 문자열을 binary2로 치환합니다.

### POSITION

```sql
POSITION(substring IN string)
```

string에서 substring이 처음 나타나는 위치를 반환합니다.

```sql
POSITION(substring IN string FROM integer)
```

지정한 위치부터 시작해 string에서 substring이 처음 나타나는 위치를 반환합니다(표준 SQL 아님).

```sql
POSITION(binary1 IN binary2)
```

binary2에서 binary1이 처음 나타나는 위치를 반환합니다.

```sql
POSITION(binary1 IN binary2 FROM integer)
```

지정한 위치부터 시작해 binary2에서 binary1이 처음 나타나는 위치를 반환합니다(표준 SQL 아님).

### ASCII

```sql
ASCII(string)
```

string의 첫 문자의 ASCII 코드를 반환합니다. 첫 문자가 ASCII가 아닌 문자이면 해당 유니코드 코드 포인트를 반환하고, string이 비어 있으면 0을 반환합니다.

### REPEAT

```sql
REPEAT(string, integer)
```

string을 integer번 반복한 문자열을 반환합니다. integer가 1보다 작으면 빈 문자열을 반환합니다.

### SPACE

```sql
SPACE(integer)
```

공백을 integer개 담은 문자열을 반환합니다. integer가 1보다 작으면 빈 문자열을 반환합니다.

### STRCMP

```sql
STRCMP(string, string)
```

두 문자열이 같으면 0을 반환하고, 첫 번째 인수가 두 번째보다 작으면 -1을, 두 번째가 첫 번째보다 작으면 1을 반환합니다.

### SOUNDEX

```sql
SOUNDEX(string)
```

- string의 발음 표현을 반환합니다. string이 UTF-8 같은 멀티바이트 인코딩으로 인코딩되어 있으면 예외를 던집니다. 또는
- string의 발음 표현을 반환합니다. string이 UTF-8 같은 멀티바이트 인코딩으로 인코딩되어 있으면 원본 string을 반환합니다.

### DIFFERENCE

```sql
DIFFERENCE(string, string)
```

두 문자열의 유사도, 즉 두 문자열의 SOUNDEX 값이 공통으로 갖는 문자 위치의 개수를 반환합니다. SOUNDEX 값이 같으면 4, 완전히 다르면 0입니다.

### REVERSE

```sql
REVERSE(string)
```

문자 순서를 뒤집은 string을 반환합니다.

### TRIM

```sql
TRIM( { BOTH | LEADING | TRAILING } string1 FROM string2)
```

string1에 포함된 문자만으로 이루어진 가장 긴 문자열을 string1의 앞·뒤·양쪽 끝에서 제거합니다.

### LTRIM

```sql
LTRIM(string)
```

시작 부분의 모든 공백을 제거한 string을 반환합니다.

### RTRIM

```sql
RTRIM(string)
```

끝 부분의 모든 공백을 제거한 string을 반환합니다.

### SUBSTR

```sql
SUBSTR(string, position [, substringLength ])
```

string에서 position 위치부터 substringLength 길이만큼의 부분을 반환합니다. SUBSTR은 입력 문자 집합에 정의된 문자를 기준으로 길이를 계산합니다.

### LENGTH

```sql
LENGTH(string)
```

CHAR_LENGTH(string)과 동일합니다.

### OCTET_LENGTH

```sql
OCTET_LENGTH(binary)
```

binary의 바이트 수를 반환합니다.

### LIKE

```sql
string1 LIKE string2 [ ESCAPE string3 ]
```

string1이 패턴 string2와 일치하는지 여부를 반환합니다.

### SIMILAR TO

```sql
string1 SIMILAR TO string2 [ ESCAPE string3 ]
```

string1이 정규 표현식 string2와 일치하는지 여부를 반환합니다.

## 날짜/시간 함수 {#datetime-functions}

### EXTRACT

```sql
EXTRACT(timeUnit FROM datetime)
```

datetime 값 표현식에서 지정한 datetime 필드의 값을 추출해 반환합니다.

### FLOOR

```sql
FLOOR(datetime TO timeUnit)
```

datetime을 timeUnit 단위로 내림합니다.

### CEIL

```sql
CEIL(datetime TO timeUnit)
```

datetime을 timeUnit 단위로 올림합니다.

### TIMESTAMPDIFF

```sql
TIMESTAMPDIFF(timeUnit, datetime, datetime2)
```

datetime과 datetime2 사이의 timeUnit 간격 개수를 (부호 있는) 값으로 반환합니다. (datetime2 - datetime) timeUnit과 동일합니다.

### LAST_DAY

```sql
LAST_DAY(date)
```

해당 월의 마지막 날짜를 DATE 타입 값으로 반환합니다. 예를 들어 DATE'2020-02-10'과 TIMESTAMP'2020-02-10 10:10:10' 모두에 대해 DATE'2020-02-29'를 반환합니다.

### DAYNAME

```sql
DAYNAME(datetime)
```

datetime 값을 기준으로 요일 이름을 반환합니다.

### MONTHNAME

```sql
MONTHNAME(date)
```

연결의 로케일로 datetime의 월 이름을 반환합니다. 예를 들어 DATE '2020-02-10'과 TIMESTAMP '2020-02-10 10:10:10' 모두에 대해 '二月'을 반환합니다.

### DAYOFMONTH

```sql
DAYOFMONTH(date)
```

EXTRACT(DAY FROM date)와 동일합니다. 1과 31 사이의 정수를 반환합니다.

### DAYOFWEEK

```sql
DAYOFWEEK(date)
```

EXTRACT(DOW FROM date)와 동일합니다. 1과 7 사이의 정수를 반환합니다.

### DAYOFYEAR

```sql
DAYOFYEAR(date)
```

EXTRACT(DOY FROM date)와 동일합니다. 1과 366 사이의 정수를 반환합니다.

### YEAR

```sql
YEAR(date)
```

EXTRACT(YEAR FROM date)와 동일합니다. 정수를 반환합니다.

### QUARTER

```sql
QUARTER(date)
```

EXTRACT(QUARTER FROM date)와 동일합니다. 1과 4 사이의 정수를 반환합니다.

### MONTH

```sql
MONTH(date)
```

EXTRACT(MONTH FROM date)와 동일합니다. 1과 12 사이의 정수를 반환합니다.

### WEEK

```sql
WEEK(date)
```

EXTRACT(WEEK FROM date)와 동일합니다. 1과 53 사이의 정수를 반환합니다.

### HOUR

```sql
HOUR(date)
```

EXTRACT(HOUR FROM date)와 동일합니다. 0과 23 사이의 정수를 반환합니다.

### MINUTE

```sql
MINUTE(date)
```

EXTRACT(MINUTE FROM date)와 동일합니다. 0과 59 사이의 정수를 반환합니다.

### SECOND

```sql
SECOND(date)
```

EXTRACT(SECOND FROM date)와 동일합니다. 0과 59 사이의 정수를 반환합니다.

### TIMESTAMP_SECONDS

```sql
TIMESTAMP_SECONDS(integer)
```

1970-01-01 00:00:00으로부터 integer초 뒤의 TIMESTAMP를 반환합니다.

### TIMESTAMP_MILLIS

```sql
TIMESTAMP_MILLIS(integer)
```

1970-01-01 00:00:00으로부터 integer밀리초 뒤의 TIMESTAMP를 반환합니다.

### TIMESTAMP_MICROS

```sql
TIMESTAMP_MICROS(integer)
```

1970-01-01 00:00:00으로부터 integer마이크로초 뒤의 TIMESTAMP를 반환합니다.

### UNIX_SECONDS

```sql
UNIX_SECONDS(timestamp)
```

1970-01-01 00:00:00 이후의 초 수를 반환합니다.

### UNIX_MILLIS

```sql
UNIX_MILLIS(timestamp)
```

1970-01-01 00:00:00 이후의 밀리초 수를 반환합니다.

### UNIX_MICROS

```sql
UNIX_MICROS(timestamp)
```

1970-01-01 00:00:00 이후의 마이크로초 수를 반환합니다.

### UNIX_DATE

```sql
UNIX_DATE(date)
```

1970-01-01 이후의 일 수를 반환합니다.

### DATE_FROM_UNIX_DATE

```sql
DATE_FROM_UNIX_DATE(integer)
```

1970-01-01로부터 integer일 뒤의 DATE를 반환합니다.

### DATE

```sql
DATE(timestamp)
```

timestamp에서 DATE를 추출합니다.

```sql
DATE(timestampLtz)
```

UTC를 가정하고 timestampLtz(순간값; BigQuery의 TIMESTAMP 타입)에서 DATE를 추출합니다.

```sql
DATE(timestampLtz, timeZone)
```

timeZone 기준으로 timestampLtz(순간값; BigQuery의 TIMESTAMP 타입)에서 DATE를 추출합니다.

```sql
DATE(string)
```

CAST(string AS DATE)와 동일합니다.

```sql
DATE(year, month, day)
```

year, month, day(모두 INTEGER 타입)로 구성된 DATE 값을 반환합니다.

### CURRENT_TIMESTAMP

```sql
CURRENT_TIMESTAMP
```

세션 시간대 기준 현재 날짜와 시간을 TIMESTAMP WITH LOCAL TIME ZONE 타입 값으로 반환합니다.

### CURRENT_DATE

```sql
CURRENT_DATE
```

세션 시간대 기준 현재 날짜를 DATE 타입 값으로 반환합니다.

### LOCALTIME

```sql
LOCALTIME
```

세션 시간대 기준 현재 날짜와 시간을 TIME 타입 값으로 반환합니다.

```sql
LOCALTIME(precision)
```

세션 시간대 기준 현재 날짜와 시간을 TIME 타입 값으로 반환하며, precision 자리의 정밀도를 갖습니다.

### LOCALTIMESTAMP

```sql
LOCALTIMESTAMP
```

세션 시간대 기준 현재 날짜와 시간을 TIMESTAMP 타입 값으로 반환합니다.

```sql
LOCALTIMESTAMP(precision)
```

세션 시간대 기준 현재 날짜와 시간을 TIMESTAMP 타입 값으로 반환하며, precision 자리의 정밀도를 갖습니다.

## 기타 함수 {#other-functions}

### CAST

```sql
CAST(value AS type)
```

값을 지정한 타입으로 변환합니다. 정수 타입 간 캐스팅은 0 방향으로 버림합니다.

### COALESCE

```sql
COALESCE(value, value [, value ]*)
```

첫 번째 값이 null이면 다른 값을 제공합니다. 예를 들어 COALESCE(NULL, 5)는 5를 반환합니다.

### GREATEST

```sql
GREATEST(expr [, expr ]*)
```

표현식 중 가장 큰 값을 반환합니다.

### NULLIF

```sql
NULLIF(value, value)
```

두 값이 같으면 NULL을 반환합니다. 예를 들어 NULLIF(5, 5)는 NULL을, NULLIF(5, 0)은 5를 반환합니다.

### NVL

```sql
NVL(value1, value2)
```

value1이 null이 아니면 value1을, 그렇지 않으면 value2를 반환합니다.

### CASE

```sql
CASE value
WHEN value1 [, value11 ]* THEN result1
[ WHEN valueN [, valueN1 ]* THEN resultN ]*
[ ELSE resultZ ]
END
```

단순 CASE입니다.

```sql
CASE
WHEN condition1 THEN result1
[ WHEN conditionN THEN resultN ]*
[ ELSE resultZ ]
END
```

검색 CASE입니다.

### DECODE

```sql
DECODE(value, value1, result1 [, valueN, resultN ]* [, default ])
```

value를 각 valueN 값과 하나씩 비교해, value가 어떤 valueN과 같으면 대응하는 resultN을 반환하고, 그렇지 않으면 default를 반환하며, default를 지정하지 않으면 NULL을 반환합니다.

### LEAST

```sql
LEAST(expr [, expr ]* )
```

표현식 중 가장 작은 값을 반환합니다.

### COMPRESS

```sql
COMPRESS(string)
```

zlib 압축으로 문자열을 압축하고 그 결과를 바이너리 문자열로 반환합니다.

### TYPEOF

```sql
TYPEOF value
```

지정한 값의 타입을 반환합니다.

### RAND_UUID

```sql
RAND_UUID
```

임의의 UUID를 생성합니다.

### SYSTEM_RANGE

```sql
SYSTEM_RANGE(start, end[, increment])
```

테이블에서 범위를 반환하며, 증가값을 선택적으로 지정할 수 있습니다.

## 보안 함수 {#security-functions}

### CURRENT_USER

```sql
CURRENT_USER
```

현재 데이터베이스 사용자의 이름을 반환합니다. 보안이 비활성화되어 있으면 대신 시스템 사용자 이름을 반환합니다.
