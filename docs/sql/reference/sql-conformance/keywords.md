---
id: keywords
title: SQL 키워드
sidebar_label: 키워드
---

# 키워드

이 문서에서는 Apache Ignite 3의 키워드를 설명합니다.

예약되지 않은 키워드는 따옴표나 특별한 이스케이프 없이 식별자(테이블, 컬럼 등의 이름)로 사용할 수 있습니다. 이런 키워드는 SQL 문맥에서 의미가 있지만 기본 SQL 문법과 충돌하지 않습니다.

예약된 키워드를 식별자(예: 테이블 이름이나 컬럼 이름)로 사용하려면 큰따옴표로 감싸야 합니다. 예약어를 따옴표 없이 식별자로 사용하면 구문 오류가 발생합니다.

```sql
-- Valid keyword usage.
SELECT 1 AS "ABS";

-- The query below would cause an error.
-- SELECT 1 AS ABS;
```

다음은 Apache Ignite 3의 키워드 목록입니다.

| 키워드 | Apache Ignite 3 | SQL 2016 |
|---------|-----------------|----------|
| A | | |
| ABS | 예약됨 | 예약됨 |
| ABSENT | | 예약됨 |
| ABSOLUTE | | |
| ACTION | | |
| ADA | | |
| ADD | | |
| ADMIN | | |
| AFTER | | |
| ALGORITHM | | |
| ALL | 예약됨 | 예약됨 |
| ALLOCATE | | 예약됨 |
| ALLOW | | |
| ALTER | 예약됨 | 예약됨 |
| ALWAYS | | |
| AND | 예약됨 | 예약됨 |
| ANY | 예약됨 | 예약됨 |
| APPLY | | |
| ARE | | 예약됨 |
| ARRAY | 예약됨 | 예약됨 |
| ARRAY_AGG | | 예약됨 |
| ARRAY_CONCAT_AGG | | |
| ARRAY_MAX_CARDINALITY | 예약됨 | 예약됨 |
| AS | 예약됨 | 예약됨 |
| ASC | | 예약됨 |
| ASENSITIVE | | 예약됨 |
| ASOF | 예약됨 | |
| ASSERTION | | |
| ASSIGNMENT | | |
| ASYMMETRIC | 예약됨 | 예약됨 |
| AT | | 예약됨 |
| ATOMIC | | 예약됨 |
| ATTRIBUTE | | |
| ATTRIBUTES | | |
| AUTHORIZATION | | 예약됨 |
| AUTO | | |
| AVG | 예약됨 | 예약됨 |
| BEFORE | | |
| BEGIN | | 예약됨 |
| BEGIN_FRAME | | 예약됨 |
| BEGIN_PARTITION | | 예약됨 |
| BERNOULLI | | |
| BETWEEN | 예약됨 | 예약됨 |
| BIGINT | | 예약됨 |
| BINARY | | 예약됨 |
| BIT | | |
| BLOB | | 예약됨 |
| BOOLEAN | | 예약됨 |
| BOTH | 예약됨 | 예약됨 |
| BREADTH | | |
| BY | 예약됨 | 예약됨 |
| C | | |
| CACHE | 예약됨 | |
| CALL | 예약됨 | 예약됨 |
| CALLED | | 예약됨 |
| CARDINALITY | 예약됨 | 예약됨 |
| CASCADE | | 예약됨 |
| CASCADED | | 예약됨 |
| CASE | 예약됨 | 예약됨 |
| CAST | 예약됨 | 예약됨 |
| CATALOG | | |
| CATALOG_NAME | | |
| CEIL | | |
| CEILING | 예약됨 | 예약됨 |
| CENTURY | | |
| CHAIN | | |
| CHAR | 예약됨 | 예약됨 |
| CHARACTER | 예약됨 | 예약됨 |
| CHARACTERISTICS | | |
| CHARACTERS | | |
| CHARACTER_LENGTH | 예약됨 | 예약됨 |
| CHARACTER_SET_CATALOG | | |
| CHARACTER_SET_NAME | | |
| CHARACTER_SET_SCHEMA | | |
| CHAR_LENGTH | 예약됨 | 예약됨 |
| CHECK | | 예약됨 |
| CLASSIFIER | | 예약됨 |
| CLASS_ORIGIN | | |
| CLOB | | 예약됨 |
| CLOSE | | 예약됨 |
| COALESCE | 예약됨 | 예약됨 |
| COBOL | | |
| COLLATE | | 예약됨 |
| COLLATION | | |
| COLLATION_CATALOG | | |
| COLLATION_NAME | | |
| COLLATION_SCHEMA | | |
| COLLECT | 예약됨 | 예약됨 |
| COLOCATE | | |
| COLUMN | 예약됨 | 예약됨 |
| COLUMN_NAME | | |
| COMMAND_FUNCTION | | |
| COMMAND_FUNCTION_CODE | | |
| COMMIT | | 예약됨 |
| COMMITTED | | |
| COMPUTE | | |
| CONDITION | | 예약됨 |
| CONDITIONAL | | 예약됨 |
| CONDITION_NUMBER | | |
| CONNECT | | 예약됨 |
| CONNECTION | | |
| CONNECTION_NAME | | |
| CONSISTENCY | | |
| CONSTRAINT | 예약됨 | 예약됨 |
| CONSTRAINTS | | |
| CONSTRAINT_CATALOG | | |
| CONSTRAINT_NAME | | |
| CONSTRAINT_SCHEMA | | |
| CONSTRUCTOR | | |
| CONTAINS | | 예약됨 |
| CONTAINS_SUBSTR | | |
| CONTINUE | | |
| CONVERT | 예약됨 | 예약됨 |
| CORR | | 예약됨 |
| CORRESPONDING | | 예약됨 |
| COUNT | 예약됨 | 예약됨 |
| COVAR_POP | 예약됨 | 예약됨 |
| COVAR_SAMP | 예약됨 | 예약됨 |
| CREATE | 예약됨 | 예약됨 |
| CROSS | 예약됨 | 예약됨 |
| CUBE | 예약됨 | 예약됨 |
| CUME_DIST | 예약됨 | 예약됨 |
| CURRENT | 예약됨 | 예약됨 |
| CURRENT_CATALOG | 예약됨 | 예약됨 |
| CURRENT_DATE | 예약됨 | 예약됨 |
| CURRENT_DEFAULT_TRANSFORM_GROUP | 예약됨 | 예약됨 |
| CURRENT_PATH | 예약됨 | 예약됨 |
| CURRENT_ROLE | 예약됨 | 예약됨 |
| CURRENT_ROW | 예약됨 | 예약됨 |
| CURRENT_SCHEMA | 예약됨 | 예약됨 |
| CURRENT_TIME | 예약됨 | 예약됨 |
| CURRENT_TIMESTAMP | 예약됨 | 예약됨 |
| CURRENT_TRANSFORM_GROUP_FOR_TYPE | 예약됨 | 예약됨 |
| CURRENT_USER | 예약됨 | 예약됨 |
| CURSOR | | 예약됨 |
| CURSOR_NAME | | |
| CYCLE | | 예약됨 |
| DATA | | |
| DATABASE | | |
| DATALINK | | 예약됨 |
| DATE | 예약됨 | 예약됨 |
| DATETIME | 예약됨 | |
| DATETIME_DIFF | | |
| DATETIME_INTERVAL_CODE | | |
| DATETIME_INTERVAL_PRECISION | | |
| DATETIME_TRUNC | | |
| DATE_DIFF | | |
| DATE_TRUNC | | |
| DAY | | 예약됨 |
| DAYOFWEEK | | |
| DAYOFYEAR | | |
| DAYS | | |
| DEALLOCATE | | 예약됨 |
| DEC | | 예약됨 |
| DECADE | | |
| DECFLOAT | | 예약됨 |
| DECIMAL | 예약됨 | 예약됨 |
| DECLARE | | 예약됨 |
| DEFAULT | 예약됨 | 예약됨 |
| DEFAULTS | | |
| DEFERRABLE | | |
| DEFERRED | | |
| DEFINE | | 예약됨 |
| DEFINED | | |
| DEFINER | | |
| DEGREE | | |
| DELETE | 예약됨 | 예약됨 |
| DENSE_RANK | 예약됨 | 예약됨 |
| DEPTH | | |
| DEREF | | 예약됨 |
| DERIVED | | |
| DESC | | |
| DESCRIBE | 예약됨 | 예약됨 |
| DESCRIPTION | | |
| DESCRIPTOR | | |
| DETERMINISTIC | | |
| DIAGNOSTICS | | |
| DISALLOW | | |
| DISCONNECT | | 예약됨 |
| DISPATCH | | |
| DISTINCT | 예약됨 | 예약됨 |
| DISTRIBUTION | | |
| DLNEWCOPY | | 예약됨 |
| DLPREVIOUSCOPY | | 예약됨 |
| DLURLCOMPLETE | | 예약됨 |
| DLURLCOMPLETEONLY | | 예약됨 |
| DLURLCOMPLETEWRITE | | 예약됨 |
| DLURLPATH | | 예약됨 |
| DLURLPATHONLY | | 예약됨 |
| DLURLPATHWRITE | | 예약됨 |
| DLURLSCHEME | | 예약됨 |
| DLURLSERVER | | 예약됨 |
| DLVALUE | | 예약됨 |
| DOMAIN | | |
| DOT | | |
| DOUBLE | | 예약됨 |
| DOW | | |
| DOWN | | |
| DOY | | |
| DROP | 예약됨 | 예약됨 |
| DYNAMIC | | 예약됨 |
| DYNAMIC_FUNCTION | | |
| DYNAMIC_FUNCTION_CODE | | |
| EACH | | 예약됨 |
| ELEMENT | 예약됨 | 예약됨 |
| ELSE | 예약됨 | 예약됨 |
| EMPTY | | 예약됨 |
| ENCODING | | |
| END | | 예약됨 |
| END-EXEC | | 예약됨 |
| END_FRAME | | 예약됨 |
| END_PARTITION | | 예약됨 |
| ENGINE | | |
| EPOCH | | |
| EQUALS | | 예약됨 |
| ERROR | | |
| ESCAPE | | 예약됨 |
| EVERY | 예약됨 | 예약됨 |
| EXCEPT | 예약됨 | 예약됨 |
| EXCEPTION | | |
| EXCLUDE | | |
| EXCLUDING | | |
| EXEC | | 예약됨 |
| EXECUTE | | 예약됨 |
| EXISTS | 예약됨 | 예약됨 |
| EXP | 예약됨 | 예약됨 |
| EXPLAIN | 예약됨 | |
| EXTEND | 예약됨 | |
| EXTERNAL | | 예약됨 |
| EXTRACT | 예약됨 | 예약됨 |
| FALSE | 예약됨 | 예약됨 |
| FETCH | 예약됨 | 예약됨 |
| FILTER | 예약됨 | 예약됨 |
| FINAL | | |
| FIRST | | |
| FIRST_VALUE | 예약됨 | 예약됨 |
| FLOAT | | 예약됨 |
| FLOOR | 예약됨 | 예약됨 |
| FOLLOWING | | |
| FOR | 예약됨 | 예약됨 |
| FOREIGN | | 예약됨 |
| FORMAT | | |
| FORTRAN | | |
| FOUND | | |
| FRAC_SECOND | | |
| FRAME_ROW | | 예약됨 |
| FREE | | 예약됨 |
| FRIDAY | 예약됨 | |
| FROM | 예약됨 | 예약됨 |
| FULL | 예약됨 | 예약됨 |
| FUNCTION | | 예약됨 |
| FUSION | 예약됨 | 예약됨 |
| G | | |
| GENERAL | | |
| GENERATED | | |
| GEOMETRY | | |
| GET | | 예약됨 |
| GLOBAL | | 예약됨 |
| GO | | |
| GOTO | | |
| GRANT | | 예약됨 |
| GRANTED | | |
| GROUP | 예약됨 | 예약됨 |
| GROUPING | 예약됨 | 예약됨 |
| GROUPS | | 예약됨 |
| GROUP_CONCAT | | |
| HASH | | |
| HAVING | 예약됨 | 예약됨 |
| HIERARCHY | | |
| HOLD | | 예약됨 |
| HOP | | |
| HOUR | 예약됨 | 예약됨 |
| HOURS | | |
| IDENTIFIED | 예약됨 | |
| IDENTITY | | 예약됨 |
| IF | 예약됨 | |
| IGNORE | | |
| ILIKE | | |
| IMMEDIATE | | |
| IMMEDIATELY | | |
| IMPLEMENTATION | | |
| IMPORT | | 예약됨 |
| IN | 예약됨 | 예약됨 |
| INCLUDE | | |
| INCLUDING | | |
| INCREMENT | | |
| INDEX | 예약됨 | |
| INDICATOR | | 예약됨 |
| INITIAL | | 예약됨 |
| INITIALLY | | 예약됨 |
| INNER | 예약됨 | 예약됨 |
| INOUT | | 예약됨 |
| INPUT | | |
| INSENSITIVE | | 예약됨 |
| INSERT | 예약됨 | 예약됨 |
| INSTANCE | | |
| INSTANTIABLE | | |
| INT | | 예약됨 |
| INTEGER | | 예약됨 |
| INTERSECT | 예약됨 | 예약됨 |
| INTERSECTION | 예약됨 | 예약됨 |
| INTERVAL | 예약됨 | 예약됨 |
| INTO | 예약됨 | 예약됨 |
| INVOKER | | |
| IS | 예약됨 | 예약됨 |
| ISODOW | | |
| ISOLATION | | |
| ISOYEAR | | |
| JAVA | | |
| JOIN | 예약됨 | 예약됨 |
| JSON | | 예약됨 |
| JSON_ARRAY | | 예약됨 |
| JSON_ARRAYAGG | | 예약됨 |
| JSON_EXISTS | | 예약됨 |
| JSON_OBJECT | | 예약됨 |
| JSON_OBJECTAGG | | 예약됨 |
| JSON_QUERY | | 예약됨 |
| JSON_SCOPE | 예약됨 | |
| JSON_TABLE | | 예약됨 |
| JSON_TABLE_PRIMITIVE | | 예약됨 |
| JSON_VALUE | | 예약됨 |
| K | | |
| KEY | | |
| KEY_MEMBER | | |
| KEY_TYPE | | |
| KILL | | |
| LABEL | | |
| LAG | 예약됨 | 예약됨 |
| LANGUAGE | | 예약됨 |
| LARGE | | 예약됨 |
| LAST | | |
| LAST_VALUE | 예약됨 | 예약됨 |
| LATERAL | | 예약됨 |
| LEAD | 예약됨 | 예약됨 |
| LEADING | 예약됨 | 예약됨 |
| LEFT | 예약됨 | 예약됨 |
| LENGTH | | |
| LEVEL | | |
| LIBRARY | | |
| LIKE | 예약됨 | 예약됨 |
| LIKE_REGEX | | 예약됨 |
| LIMIT | 예약됨 | |
| LISTAGG | | 예약됨 |
| LN | 예약됨 | 예약됨 |
| LOCAL | | 예약됨 |
| LOCALTIME | 예약됨 | 예약됨 |
| LOCALTIMESTAMP | 예약됨 | 예약됨 |
| LOCATOR | | |
| LOWER | 예약됨 | 예약됨 |
| M | | |
| MAP | | |
| MAPPING | | |
| MATCH | | 예약됨 |
| MATCHED | | |
| MATCHES | | 예약됨 |
| MATCH_CONDITION | 예약됨 | |
| MATCH_NUMBER | | 예약됨 |
| MATCH_RECOGNIZE | 예약됨 | 예약됨 |
| MAX | 예약됨 | 예약됨 |
| MAXVALUE | | |
| MEASURE | 예약됨 | |
| MEASURES | | |
| MEMBER | | 예약됨 |
| MERGE | 예약됨 | 예약됨 |
| MESSAGE_LENGTH | | |
| MESSAGE_OCTET_LENGTH | | |
| MESSAGE_TEXT | | |
| METHOD | | 예약됨 |
| MICROSECOND | | |
| MILLENNIUM | | |
| MILLISECOND | | |
| MIN | 예약됨 | 예약됨 |
| MINUS | 예약됨 | |
| MINUTE | 예약됨 | 예약됨 |
| MINUTES | | |
| MINVALUE | | |
| MOD | 예약됨 | 예약됨 |
| MODE | | |
| MODIFIES | | 예약됨 |
| MODULE | | 예약됨 |
| MONDAY | 예약됨 | |
| MONTH | 예약됨 | 예약됨 |
| MONTHS | | |
| MORE | | |
| MULTISET | 예약됨 | 예약됨 |
| MUMPS | | |
| NAME | | |
| NAMES | | |
| NANOSECOND | | |
| NATIONAL | | 예약됨 |
| NATURAL | 예약됨 | 예약됨 |
| NCHAR | | 예약됨 |
| NCLOB | | 예약됨 |
| NESTING | | |
| NEW | 예약됨 | 예약됨 |
| NEXT | 예약됨 | |
| NO | | 예약됨 |
| NODES | | |
| NONE | | 예약됨 |
| NORMALIZE | | 예약됨 |
| NORMALIZED | | |
| NOT | 예약됨 | 예약됨 |
| NTH_VALUE | 예약됨 | 예약됨 |
| NTILE | 예약됨 | 예약됨 |
| NULL | 예약됨 | 예약됨 |
| NULLABLE | | |
| NULLIF | 예약됨 | 예약됨 |
| NULLS | | |
| NUMBER | | |
| NUMERIC | | 예약됨 |
| OBJECT | | |
| OCCURRENCES_REGEX | | 예약됨 |
| OCTET_LENGTH | 예약됨 | 예약됨 |
| OCTETS | | |
| OF | | 예약됨 |
| OFF | | |
| OFFSET | 예약됨 | |
| OLD | | 예약됨 |
| OMIT | | 예약됨 |
| ON | 예약됨 | 예약됨 |
| ONE | | 예약됨 |
| ONLY | | 예약됨 |
| OPEN | | 예약됨 |
| OPTION | | |
| OPTIONS | | |
| OR | 예약됨 | 예약됨 |
| ORDER | 예약됨 | 예약됨 |
| ORDERING | | |
| ORDINAL | | |
| ORDINALITY | | |
| OTHERS | | |
| OUT | | 예약됨 |
| OUTER | 예약됨 | 예약됨 |
| OUTPUT | | |
| OVER | 예약됨 | 예약됨 |
| OVERLAPS | | 예약됨 |
| OVERLAY | | 예약됨 |
| OVERRIDING | | |
| PAD | | |
| PARAMETER | | 예약됨 |
| PARAMETER_MODE | | |
| PARAMETER_NAME | | |
| PARAMETER_ORDINAL_POSITION | | |
| PARAMETER_SPECIFIC_CATALOG | | |
| PARAMETER_SPECIFIC_NAME | | |
| PARAMETER_SPECIFIC_SCHEMA | | |
| PARTIAL | | |
| PARTITION | 예약됨 | 예약됨 |
| PARTITIONS | | |
| PASCAL | | |
| PASSING | | |
| PASSTHROUGH | | |
| PAST | | |
| PATH | | |
| PATTERN | | 예약됨 |
| PER | | 예약됨 |
| PERCENT | | 예약됨 |
| PERCENTILE_CONT | 예약됨 | 예약됨 |
| PERCENTILE_DISC | 예약됨 | 예약됨 |
| PERCENT_RANK | 예약됨 | 예약됨 |
| PERIOD | 예약됨 | 예약됨 |
| PERMUTE | 예약됨 | |
| PIVOT | | |
| PLACING | | |
| PLAN | | |
| PLI | | |
| PORTION | | 예약됨 |
| POSITION | | 예약됨 |
| POSITION_REGEX | | 예약됨 |
| POWER | 예약됨 | 예약됨 |
| PRECEDES | | 예약됨 |
| PRECEDING | | |
| PRECISION | 예약됨 | 예약됨 |
| PREPARE | | 예약됨 |
| PRESERVE | | |
| PREV | | |
| PRIMARY | 예약됨 | 예약됨 |
| PRIOR | | |
| PRIVILEGES | | |
| PROCEDURE | | 예약됨 |
| PROFILE | | |
| PROFILES | | |
| PTF | | 예약됨 |
| PUBLIC | | |
| QUALIFY | 예약됨 | |
| QUARTER | | |
| QUARTERS | | |
| QUERY | | |
| QUORUM | | |
| RANGE | | 예약됨 |
| RANK | 예약됨 | 예약됨 |
| READ | | |
| READS | | 예약됨 |
| REAL | | 예약됨 |
| RECURSIVE | | 예약됨 |
| REF | | 예약됨 |
| REFERENCES | | 예약됨 |
| REFERENCING | | 예약됨 |
| REGR_AVGX | | 예약됨 |
| REGR_AVGY | | 예약됨 |
| REGR_COUNT | 예약됨 | 예약됨 |
| REGR_INTERCEPT | | 예약됨 |
| REGR_R2 | | 예약됨 |
| REGR_SLOPE | | 예약됨 |
| REGR_SXX | 예약됨 | 예약됨 |
| REGR_SXY | | 예약됨 |
| REGR_SYY | 예약됨 | 예약됨 |
| RELATIVE | | |
| RELEASE | | 예약됨 |
| RENAME | 예약됨 | |
| REPEATABLE | | |
| REPLACE | | |
| REPLICAS | | |
| RESET | 예약됨 | |
| RESPECT | | |
| RESTART | | |
| RESTRICT | | |
| RESULT | | 예약됨 |
| RETURN | | 예약됨 |
| RETURNED_CARDINALITY | | |
| RETURNED_LENGTH | | |
| RETURNED_OCTET_LENGTH | | |
| RETURNED_SQLSTATE | | |
| RETURNING | | |
| RETURNS | | 예약됨 |
| REVOKE | | 예약됨 |
| RIGHT | 예약됨 | 예약됨 |
| RLIKE | | |
| ROLE | | |
| ROLLBACK | | 예약됨 |
| ROLLUP | 예약됨 | 예약됨 |
| ROUTINE | | |
| ROUTINE_CATALOG | | |
| ROUTINE_NAME | | |
| ROUTINE_SCHEMA | | |
| ROW | 예약됨 | 예약됨 |
| ROWS | | 예약됨 |
| ROW_COUNT | | |
| ROW_NUMBER | 예약됨 | 예약됨 |
| RUNNING | | 예약됨 |
| SAFE_CAST | | |
| SAFE_OFFSET | | |
| SAFE_ORDINAL | | |
| SATURDAY | 예약됨 | |
| SAVEPOINT | | 예약됨 |
| SCALAR | | |
| SCALE | | |
| SCHEMA | | |
| SCHEMA_NAME | | |
| SCOPE | | 예약됨 |
| SCOPE_CATALOGS | | |
| SCOPE_NAME | | |
| SCOPE_SCHEMA | | |
| SCROLL | | 예약됨 |
| SEARCH | | 예약됨 |
| SECOND | 예약됨 | 예약됨 |
| SECONDS | | |
| SECTION | | |
| SECURITY | | |
| SEEK | | |
| SELECT | 예약됨 | 예약됨 |
| SELF | | |
| SENSITIVE | | 예약됨 |
| SEPARATOR | | |
| SEQUENCE | | |
| SERIALIZABLE | | |
| SERVER | | |
| SERVER_NAME | | |
| SESSION | | |
| SESSION_USER | 예약됨 | 예약됨 |
| SET | 예약됨 | 예약됨 |
| SETS | | |
| SHOW | | 예약됨 |
| SIMILAR | | 예약됨 |
| SIMPLE | | |
| SIZE | | |
| SKIP | | 예약됨 |
| SMALLINT | | 예약됨 |
| SOME | 예약됨 | 예약됨 |
| SORTED | | |
| SOURCE | | |
| SPACE | | |
| SPECIFIC | 예약됨 | 예약됨 |
| SPECIFICTYPE | | 예약됨 |
| SPECIFIC_NAME | | |
| SQL | | 예약됨 |
| SQLEXCEPTION | | 예약됨 |
| SQLSTATE | | 예약됨 |
| SQLWARNING | | 예약됨 |
| SQL_BIGINT | | |
| SQL_BINARY | | |
| SQL_BIT | | |
| SQL_BLOB | | |
| SQL_BOOLEAN | | |
| SQL_CHAR | | |
| SQL_CLOB | | |
| SQL_DATE | | |
| SQL_DECIMAL | | |
| SQL_DOUBLE | | |
| SQL_FLOAT | | |
| SQL_INTEGER | | |
| SQL_INTERVAL_DAY | | |
| SQL_INTERVAL_DAY_TO_HOUR | | |
| SQL_INTERVAL_DAY_TO_MINUTE | | |
| SQL_INTERVAL_DAY_TO_SECOND | | |
| SQL_INTERVAL_HOUR | | |
| SQL_INTERVAL_HOUR_TO_MINUTE | | |
| SQL_INTERVAL_HOUR_TO_SECOND | | |
| SQL_INTERVAL_MINUTE | | |
| SQL_INTERVAL_MINUTE_TO_SECOND | | |
| SQL_INTERVAL_MONTH | | |
| SQL_INTERVAL_SECOND | | |
| SQL_INTERVAL_YEAR | | |
| SQL_INTERVAL_YEAR_TO_MONTH | | |
| SQL_LONGVARBINARY | | |
| SQL_LONGVARCHAR | | |
| SQL_LONGVARNCHAR | | |
| SQL_NCHAR | | |
| SQL_NCLOB | | |
| SQL_NUMERIC | | |
| SQL_NVARCHAR | | |
| SQL_REAL | | |
| SQL_SMALLINT | | |
| SQL_TIME | | |
| SQL_TIMESTAMP | | |
| SQL_TINYINT | | |
| SQL_TSI_DAY | | |
| SQL_TSI_FRAC_SECOND | | |
| SQL_TSI_HOUR | | |
| SQL_TSI_MICROSECOND | | |
| SQL_TSI_MINUTE | | |
| SQL_TSI_MONTH | | |
| SQL_TSI_QUARTER | | |
| SQL_TSI_SECOND | | |
| SQL_TSI_WEEK | | |
| SQL_TSI_YEAR | | |
| SQL_VARBINARY | | |
| SQL_VARCHAR | | |
| SQRT | 예약됨 | 예약됨 |
| START | | 예약됨 |
| STATE | | |
| STATEMENT | | |
| STATIC | | 예약됨 |
| STDDEV_POP | 예약됨 | 예약됨 |
| STDDEV_SAMP | 예약됨 | 예약됨 |
| STORAGE | | |
| STREAM | 예약됨 | |
| STRING_AGG | | |
| STRUCTURE | | |
| STYLE | | |
| SUBCLASS_ORIGIN | | |
| SUBMULTISET | | 예약됨 |
| SUBSET | | 예약됨 |
| SUBSTITUTE | | |
| SUBSTRING | 예약됨 | 예약됨 |
| SUBSTRING_REGEX | | 예약됨 |
| SUCCEEDS | | 예약됨 |
| SUM | 예약됨 | 예약됨 |
| SUNDAY | 예약됨 | |
| SYMMETRIC | 예약됨 | 예약됨 |
| SYSTEM | | 예약됨 |
| SYSTEM_TIME | 예약됨 | 예약됨 |
| SYSTEM_USER | 예약됨 | 예약됨 |
| TABLE | 예약됨 | 예약됨 |
| TABLESAMPLE | 예약됨 | 예약됨 |
| TABLE_NAME | | |
| TEMPORARY | | |
| THEN | 예약됨 | 예약됨 |
| THURSDAY | 예약됨 | |
| TIES | | |
| TIME | 예약됨 | 예약됨 |
| TIMESTAMP | 예약됨 | 예약됨 |
| TIMESTAMPADD | | |
| TIMESTAMPDIFF | | |
| TIMESTAMP_DIFF | | |
| TIMESTAMP_TRUNC | | |
| TIMEZONE_HOUR | | 예약됨 |
| TIMEZONE_MINUTE | | 예약됨 |
| TIME_DIFF | | |
| TIME_TRUNC | | |
| TINYINT | | |
| TO | 예약됨 | 예약됨 |
| TOP_LEVEL_COUNT | | |
| TRAILING | 예약됨 | 예약됨 |
| TRANSACTION | | |
| TRANSACTIONS_ACTIVE | | |
| TRANSACTIONS_COMMITTED | | |
| TRANSACTIONS_ROLLED_BACK | | |
| TRANSFORM | | |
| TRANSFORMS | | |
| TRANSLATE | | 예약됨 |
| TRANSLATE_REGEX | | 예약됨 |
| TRANSLATION | | 예약됨 |
| TREAT | | 예약됨 |
| TRIGGER | | 예약됨 |
| TRIGGER_CATALOG | | |
| TRIGGER_NAME | | |
| TRIGGER_SCHEMA | | |
| TRIM | | 예약됨 |
| TRIM_ARRAY | | 예약됨 |
| TRUE | 예약됨 | 예약됨 |
| TRUNCATE | 예약됨 | 예약됨 |
| TRY_CAST | | |
| TUESDAY | 예약됨 | |
| TUMBLE | | |
| TYPE | | |
| UESCAPE | 예약됨 | 예약됨 |
| UNBOUNDED | | |
| UNCOMMITTED | | |
| UNCONDITIONAL | | |
| UNDER | | |
| UNION | 예약됨 | 예약됨 |
| UNIQUE | | 예약됨 |
| UNKNOWN | 예약됨 | 예약됨 |
| UNNAMED | | |
| UNNEST | | 예약됨 |
| UNPIVOT | | |
| UP | | |
| UPDATE | 예약됨 | 예약됨 |
| UPPER | 예약됨 | 예약됨 |
| UPSERT | 예약됨 | |
| USAGE | | |
| USER | 예약됨 | 예약됨 |
| USER_DEFINED_TYPE_CATALOG | | |
| USER_DEFINED_TYPE_CODE | | |
| USER_DEFINED_TYPE_NAME | | |
| USER_DEFINED_TYPE_SCHEMA | | |
| USING | 예약됨 | 예약됨 |
| UTF16 | | |
| UTF32 | | |
| UTF8 | | |
| UUID | 예약됨 | |
| VALUE | 예약됨 | 예약됨 |
| VALUES | 예약됨 | 예약됨 |
| VALUE_OF | | 예약됨 |
| VARBINARY | | 예약됨 |
| VARCHAR | | 예약됨 |
| VARIANT | 예약됨 | |
| VARYING | | 예약됨 |
| VAR_POP | 예약됨 | 예약됨 |
| VAR_SAMP | 예약됨 | 예약됨 |
| VERSION | | |
| VERSIONING | | 예약됨 |
| VIEW | | |
| WAIT | | |
| WEDNESDAY | 예약됨 | |
| WEEK | | |
| WEEKS | | |
| WHEN | 예약됨 | 예약됨 |
| WHENEVER | | 예약됨 |
| WHERE | 예약됨 | 예약됨 |
| WIDTH_BUCKET | | |
| WINDOW | 예약됨 | 예약됨 |
| WITH | 예약됨 | 예약됨 |
| WITHIN | 예약됨 | 예약됨 |
| WITHOUT | | 예약됨 |
| WORK | | 예약됨 |
| WRAPPER | | |
| WRITE | | 예약됨 |
| XML | | 예약됨 |
| XMLAGG | | 예약됨 |
| XMLATTRIBUTES | | 예약됨 |
| XMLBINARY | | 예약됨 |
| XMLCAST | | 예약됨 |
| XMLCOMMENT | | 예약됨 |
| XMLCONCAT | | 예약됨 |
| XMLDOCUMENT | | 예약됨 |
| XMLELEMENT | | 예약됨 |
| XMLEXISTS | | 예약됨 |
| XMLFOREST | | 예약됨 |
| XMLITERATE | | 예약됨 |
| XMLNAMESPACES | | 예약됨 |
| XMLPARSE | | 예약됨 |
| XMLPI | | 예약됨 |
| XMLQUERY | | 예약됨 |
| XMLSERIALIZE | | 예약됨 |
| XMLTABLE | | 예약됨 |
| XMLTEXT | | 예약됨 |
| XMLVALIDATE | | 예약됨 |
| YEAR | 예약됨 | 예약됨 |
| YEARS | | |
| ZONE | | |
