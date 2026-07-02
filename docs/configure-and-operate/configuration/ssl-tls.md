---
id: config-ssl-tls
title: SSL/TLS
sidebar_label: SSL/TLS
---

이 페이지에서는 클러스터 노드(서버와 클라이언트) 간 통신, 그리고 클러스터에 연결하는 클라이언트와의 통신을 SSL/TLS로 암호화하도록 구성하는 방법을 설명합니다.

## 고려 사항 {#considerations}

클러스터 컨텍스트의 모든 내부 연결과 클러스터의 사용자 상호작용 인터페이스는 SSL을 사용할 수 있습니다. 통신 범주는 다음과 같습니다.

- 사용자와 클러스터(노드) 간: REST
- 사용자와 플랫폼 클라이언트 간
- 노드 간: 네트워크(메시징, Scalecube)

모든 SSL 구성 작업은 노드 수준에서 수행됩니다.

Apache Ignite는 SSL 인증서에 대한 직접 경로를 지원하지 않습니다. 대신 PKCS12와 JKS 키스토어를 사용합니다.

## REST {#rest}

REST용 SSL의 표준 구현 방식은 별도 포트에서 보안 연결을 구성하는 것입니다. Apache Ignite는 HTTP와 HTTPS를 각각 자신의 포트에서 지원합니다.

다음은 JSON 형식의 Apache Ignite 3 REST 보안 구성입니다.

:::note
Apache Ignite 3에서는 구성을 JSON 또는 HOCON 형식으로 작성하고 유지할 수 있습니다.
:::

```json
{
    "ignite" : {
        "rest" : {
            "dualProtocol" : false,
            "httpToHttpsRedirection" : false,
            "port" : 10300,
            "ssl" : {
                "ciphers" : "",
                "clientAuth" : "require",
                "enabled" : true,
                "keyStore" : {
                    "password" : "may be empty",
                    "path" : "must not be empty",
                    "type" : "PKCS12"
                },
                "port" : 10400,
                "trustStore" : {
                    "password" : "may be empty",
                    "path" : "must not be empty",
                    "type" : "PKCS12"
                }
            }
        }
    }
}
```

## 클라이언트와 JDBC {#clients-and-jdbc}

Apache Ignite 3 클라이언트 구현은 Netty 프레임워크를 기반으로 하며, `SSLContextBuilder`로 보안 연결 구성을 지원합니다.

### 서버 측 구성 {#server-side-configuration}

서버 측에서 SSL을 구성하는 기본 방법은 구성에 SSL 속성을 추가하는 것입니다. 아래 예시는 JSON 형식입니다.

:::note
Apache Ignite 3에서는 구성을 JSON 또는 HOCON 형식으로 작성하고 유지할 수 있습니다.
:::

```json
{
    "ignite" : {
        "clientConnector" : {
            "ssl" : {
                "ciphers" : "",
                "clientAuth" : "require",
                "enabled" : true,
                "keyStore" : {
                    "type" : "PKCS12",
                    "path" : "must not be empty",
                    "password" : "may be empty"
                },
                "trustStore" : {
                    "type" : "PKCS12",
                    "path" : "must not be empty",
                    "password" : "may be empty"
                }
            }
        }
    }
}
```

`clientConnector`에 SSL을 활성화했고 JDBC를 사용하려면 코드에서 해당 속성을 설정하세요.

```java
var url =
    "jdbc:ignite:thin://{address}:{port}"
        + "?sslEnabled=true"
        + "&trustStorePath=" + trustStorePath
        + "&trustStoreType=JKS"
        + "&trustStorePassword=" + password
        + "&clientAuth=require"
        + "&keyStorePath=" + keyStorePath
        + "&keyStoreType=PKCS12"
        + "&keyStorePassword=" + password;
        try (Connection conn = DriverManager.getConnection(url)) {
            // Other actions.
        }
```

## 클라이언트 구성 {#client-configuration}

### Java {#java}

Java 클라이언트에서 SSL을 활성화하려면 `IgniteClient` 클래스를 사용하고 SSL 구성을 전달하세요.

```java
var sslConfiguration = SslConfiguration.builder()
                        .enabled(true)
                        .ciphers("TLS_AES_256_GCM_SHA384")
                        .trustStorePath(trustStorePath)
                        .trustStorePassword(password)
                        .keyStorePath(keyStorePath)
                        .keyStorePassword(password)
                        .build();

try (IgniteClient client = IgniteClient.builder()
    .addresses("localhost:10800")
    .ssl(sslConfiguration)
    .build();
)
```

### .NET {#net}

`ISslStreamFactory` 타입의 `IgniteClientConfiguration.SslStreamFactory` 속성을 추가합니다.

[미리 정의된 구현](https://github.com/apache/ignite/blob/66f43a4bee163aadb3ad731f6eb9a6dfde9faa73/modules/platforms/dotnet/Apache.Ignite.Core/Client/SslStreamFactory.cs)을 사용하세요.

기본 클래스 라이브러리의 `SslStream`을 사용하세요.

클라이언트 인가 없이 사용하는 기본 예시입니다.

```csharp
var cfg = new IgniteClientConfiguration { SslStreamFactory = new() }
```

### CLI {#cli}

CLI 측에서 SSL을 사용하려면 `cli config set` 명령어를 사용하세요.

```shell
cli config set cli.trust-store.type=<type>
cli config set cli.trust-store.path=<path>
cli config set cli.trust-store.password=<password>
```

CLI 보안 구성은 무단 읽기/쓰기 작업으로부터 보호하는 권한 설정을 적용해 별도 파일에 저장하세요. 이 구성 파일은 공통 구성 파일의 프로파일과 일치해야 합니다.

## 네트워크 구성 {#network-configuration}

노드 네트워크는 Netty 프레임워크를 기반으로 합니다. 구성 방식은 Apache Ignite 3 구성을 지정하는 부분을 제외하면 Apache Ignite 클라이언트 부분에서 설명한 것과 동일합니다.

:::note
Apache Ignite 3에서는 구성을 JSON 또는 HOCON 형식으로 작성하고 유지할 수 있습니다.
:::

```json
{
    "ignite" : {
        "network" : {
            "ssl" : {
                "ciphers" : "",
                "enabled" : true,
                "keyStore" : {
                    "type" : "PKCS12",
                    "path" : "must not be empty",
                    "password" : "may be empty"
                },
                "trustStore" : {
                    "type" : "PKCS12",
                    "path" : "must not be empty",
                    "password" : "may be empty"
                }
            }
        }
    }
}
```

## SSL 클라이언트 인증(mTLS 지원) {#ssl-client-authentication-mtls-support}

필요하다면 사용하는 연결에서 클라이언트 인증 기능을 지원하도록 설정할 수 있습니다. 서버 측에서 각 연결마다 개별적으로 구성하세요.

양방향 인증에는 서버와 클라이언트 모두 서로 신뢰하는 인증서가 있어야 합니다. 클라이언트는 개인 키를 생성해 키스토어에 저장하고, 서버의 트러스트스토어가 신뢰하는 기관으로부터 서명을 받습니다.

클라이언트 인증을 지원하려면 연결에 `clientAuth`, `trustStore`, `keyStore` 속성을 포함해야 합니다. 다음은 가능한 클라이언트 구성 예시입니다. 아래 예시는 JSON 형식입니다.

:::note
Apache Ignite 3에서는 구성을 JSON 또는 HOCON 형식으로 작성하고 유지할 수 있습니다.
:::

```json
{
    "ignite" : {
        "clientConnector" : {
            "ssl" : {
                "ciphers" : "",
                "clientAuth" : "require",
                "enabled" : true,
                "keyStore" : {
                    "type" : "PKCS12",
                    "path" : "must not be empty",
                    "password" : "may be empty"
                },
                "trustStore" : {
                    "type" : "JKS",
                    "path" : "must not be empty",
                    "password" : "may be empty"
                }
            }
        }
    }
}
```
