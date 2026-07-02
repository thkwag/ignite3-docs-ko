---
id: odbc-connection-string
title: ODBC 연결 문자열
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 연결 문자열 형식 {#connection-string-format}

ODBC 드라이버는 표준 연결 문자열(connection string) 형식을 지원합니다. 정식 문법은 다음과 같습니다.

```text
connection-string ::= empty-string[;] | attribute[;] | attribute; connection-string
empty-string ::=
attribute ::= attribute-keyword=attribute-value | DRIVER=[{]attribute-value[}]
attribute-keyword ::= identifier
attribute-value ::= character-string
```

쉽게 말해, ODBC 연결 URL은 원하는 매개변수를 세미콜론으로 구분해 나열한 문자열입니다.

## 지원하는 인수 {#supported-arguments}

ODBC 드라이버는 여러 연결 문자열/DSN 인수를 지원하고 사용합니다. 모든 매개변수 이름은 대소문자를 구분하지 않습니다. `ADDRESS`, `Address`, `address`는 모두 유효한 매개변수 이름이며 같은 매개변수를 가리킵니다. 인수를 지정하지 않으면 기본값이 사용됩니다. 이 규칙의 예외는 `ADDRESS` 속성입니다. `ADDRESS`를 지정하지 않으면 대신 `SERVER`와 `PORT` 속성이 사용됩니다.

| 속성 키워드 | 설명 | 기본값 |
|-------------------|-------------|---------------|
| `ADDRESS` | 연결할 원격 노드의 주소. 형식은 `<host>[:<port>]`입니다. 예: `localhost`, `example.com:12345`, `127.0.0.1`, `192.168.3.80:5893`. 이 속성을 지정하면 `SERVER`와 `PORT` 인수는 무시됩니다. | 없음. |
| `SERVER` | 연결할 노드의 주소. `ADDRESS` 인수를 지정하면 이 인수 값은 무시됩니다. | 없음. |
| `PORT` | 노드의 `OdbcProcessor`가 수신 대기하는 포트. `ADDRESS` 인수를 지정하면 이 인수 값은 무시됩니다. | `10800` |
| IDENTITY | 인증에 사용할 식별 정보. 서버 쪽에서 사용하는 인증기(authenticator)에 따라 사용자 이름일 수도 있고 다른 고유 식별자일 수도 있습니다. 자세한 내용은 [인증](/configure-and-operate/configuration/config-authentication) 항목을 참고하세요. | 없음. |
| SECRET | 인증에 사용할 비밀 정보. 서버 쪽에서 사용하는 인증기에 따라 사용자 비밀번호일 수도 있고 다른 유형의 사용자별 비밀 정보일 수도 있습니다. 자세한 내용은 [인증](/configure-and-operate/configuration/config-authentication) 항목을 참고하세요. | 없음. |
| `SCHEMA` | 스키마 이름. | `PUBLIC` |
| `PAGE_SIZE` | 데이터 소스에서 데이터를 가져오는 요청에 대한 응답으로 반환되는 행 수. 대부분의 경우 기본값이 적절합니다. 값을 낮게 잡으면 데이터 가져오기가 느려질 수 있고, 값을 높게 잡으면 드라이버의 메모리 사용량이 늘고 다음 페이지를 가져올 때 지연이 추가될 수 있습니다. | `1024` |
| `SSL_MODE` | 서버와 SSL 연결을 협상할지 여부를 결정합니다. 필요에 따라 `require` 또는 `disable` 모드를 사용하세요. | `disable` |
| `SSL_KEY_FILE` | SSL 서버 개인 키가 담긴 파일의 경로를 지정합니다. | 없음. |
| `SSL_CERT_FILE` | SSL 서버 인증서가 담긴 파일의 경로를 지정합니다. | 없음. |
| `SSL_CA_FILE` | SSL 서버 인증 기관(CA) 인증서가 담긴 파일의 경로를 지정합니다. | 없음. |

## 연결 문자열 예시 {#connection-string-samples}

아래에서 연결 문자열 예시를 확인할 수 있습니다. 이 문자열은 `SQLDriverConnect` ODBC 호출과 함께 사용해 노드와 연결을 수립할 수 있습니다.

<Tabs groupId="odbc-samples">
<TabItem value="schema" label="Specific schema">

```text
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;SCHEMA=yourSchemaName
```

</TabItem>
<TabItem value="default" label="Default schema">

```text
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800
```

</TabItem>
<TabItem value="auth" label="Authentication">

```text
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;IDENTITY=yourid;SECRET=yoursecret
```

</TabItem>
<TabItem value="pagesize" label="Custom page size">

```text
DRIVER={Apache Ignite 3};ADDRESS=localhost:10800;SCHEMA=yourSchemaName;PAGE_SIZE=4096
```

</TabItem>
</Tabs>
