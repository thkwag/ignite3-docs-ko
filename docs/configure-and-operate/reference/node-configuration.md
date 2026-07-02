---
id: node-configuration
title: 노드 구성 매개변수
sidebar_label: 노드 구성
---

노드 구성은 각 노드마다 개별적이며 클러스터 전체에 공유되지 않습니다.

Ignite 3에서는 HOCON 또는 JSON으로 구성을 생성하고 관리할 수 있습니다. 구성 파일에는 `ignite`라는 단일 루트 "노드"가 있습니다. 모든 구성 섹션은 이 노드 아래에 자식, 손자 형태로 계층을 이룹니다.

## 노드 구성 확인 {#checking-node-configuration}

노드 구성을 조회하려면 CLI 도구를 사용하세요.

- CLI 도구를 시작하고 노드에 연결하세요.
- `node config show` 명령어를 실행하세요.

CLI 도구는 전체 노드 구성을 출력합니다. 구성의 일부만 필요하다면 필요한 속성을 명령어 인수로 지정해 검색 범위를 좁힐 수 있습니다. 예를 들면 다음과 같습니다.

```shell
node config show ignite.clientConnector
```

## 노드 구성 변경 {#changing-node-configuration}

노드 구성은 CLI 도구에서 변경합니다. 구성을 변경하려면 다음을 수행하세요.

- CLI 도구를 시작하고 노드에 연결하세요. 이 노드가 이후 CLI 명령어의 "기본" 노드가 됩니다.
- 기본 노드의 구성을 업데이트하려면 `node config update` 명령어를 실행하고 업데이트할 내용을 명령어 인수로 지정하세요. 예를 들면 다음과 같습니다.

```shell
node config update ignite.clientConnector.connectTimeoutMillis=10000
```

- 기본 노드가 아닌 다른 노드의 구성을 업데이트하려면 대상 노드를 명시적으로 지정해 `node config update` 명령어를 실행하세요. 예를 들어 `node1`이라는 이름의 노드라면 다음과 같습니다.

```shell
node config update -n node1 ignite.nodeAttributes.nodeAttributes.clientConnector="10900"
```

- 구성 변경 사항을 적용하려면 노드를 재시작하세요.

## 노드 구성 내보내기 {#exporting-node-configuration}

노드 구성을 HOCON 형식 파일로 내보내려면 다음 명령어를 사용하세요.

```shell
bin/ignite3 node config show > node-config.conf
```

## 구성 매개변수 {#configuration-parameters}

### 클라이언트 커넥터 구성 {#client-connector-configuration}

클라이언트 커넥터 구성에 대한 정보는 [클라이언트](/develop/ignite-clients/) 섹션을 참고하세요.

### 컴퓨트 구성 {#compute-configuration}

```json
{
  "ignite" : {
    "compute" : {
      "queueMaxSize" : 2147483647,
      "statesLifetimeMillis" : 60000,
      "threadPoolSize" : 10
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| queueMaxSize | 2147483647 | 큐에 대기하는 컴퓨트 작업의 최대 개수입니다. | 예 | 예 | 1 - Integer.MAX_VALUE |
| statesLifetimeMillis | 60000 | 작업이 끝난 후 작업 상태가 유지되는 시간입니다(밀리초 단위). | 예 | 예 | 0 - inf |
| threadPoolSize | 10 | 컴퓨트 작업에 사용할 수 있는 스레드 수입니다. | 예 | 예 | 1 - Integer.MAX_VALUE |

### 코드 배포 구성 {#code-deployment-configuration}

```json
{
  "ignite" : {
    "deployment" : {
      "location" : "deployment"
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| location | deployment | 작업 디렉터리 내 폴더의 상대 경로입니다. 모든 배포 단위 콘텐츠가 여기에 저장됩니다. | 예 | 아니요 | 유효한 경로 |

### 장애 핸들러 구성 {#failure-handler-configuration}

```json
{
  "ignite" : {
    "failureHandler" : {
      "dumpThreadsOnFailure" : true,
      "dumpThreadsThrottlingTimeoutMillis" : 10000,
      "handler" : {
        "ignoredFailureTypes" : [
          "systemWorkerBlocked", "systemCriticalOperationTimeout"
        ],
        "type" : "noop"
      },
      "oomBufferSizeBytes" : 16384
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| dumpThreadsOnFailure | true | 한 번에 만료될 수 있는 항목의 수입니다. | 예 | 아니요 | true, false |
| dumpThreadsThrottlingTimeoutMillis | 10000 | 장애 처리 중 스레드 덤프 생성에 대한 스로틀링 타임아웃입니다(밀리초 단위). | 예 | 아니요 | 1 - inf |
| handler.ignoredFailureTypes | [systemWorkerBlocked, systemCriticalOperationTimeout] | 무시할 장애 유형입니다. | 예 | 아니요 | 1 - inf |
| handler.type | noop | 장애 핸들러 구성 유형입니다. | 예 | 아니요 | noop, stop, stopOrHalt |
| oomBufferSizeBytes | 16384 | 노드 시작 시 힙에 예약하는 메모리 양입니다(바이트 단위). | 예 | 아니요 | 1 - inf |

### 네트워크 구성 {#network-configuration}

Apache Ignite 3에서는 두 가지 노드 검색(node discovery) 유형 중에서 선택할 수 있습니다. `STATIC` 유형에서는 노드 주소를 수동으로 지정하고, `MULTICAST` 유형은 네트워크에서 노드를 자동으로 감지하므로 설정이 더 간단합니다.

`STATIC` 노드 파인더를 사용한 예시 구성:

```json
{
  "ignite" : {
    "network" : {
      "inbound" : {
        "soBacklog" : 128,
        "soKeepAlive" : true,
        "soLinger" : 0,
        "soReuseAddr" : true,
        "tcpNoDelay" : true
      },
      "listenAddresses" : [],
      "membership" : {
        "failurePingIntervalMillis" : 1000,
        "membershipSyncIntervalMillis" : 30000,
        "scaleCube" : {
          "failurePingRequestMembers" : 3,
          "gossipIntervalMillis" : 200,
          "gossipRepeatMult" : 3,
          "membershipSuspicionMultiplier" : 5,
          "metadataTimeoutMillis" : 3000
        }
      },
      "nodeFinder" : {
        "netClusterNodes" : [ "localhost:3344" ],
        "type" : "STATIC"
      },
      "outbound" : {
        "soKeepAlive" : true,
        "soLinger" : 0,
        "tcpNoDelay" : true
      },
      "port" : 3344,
      "shutdownQuietPeriodMillis" : 0,
      "shutdownTimeoutMillis" : 15000,
      "ssl" : {
        "ciphers" : "",
        "clientAuth" : "none",
        "enabled" : false,
        "keyStore" : {
          "password" : "********",
          "path" : "",
          "type" : "PKCS12"
        },
        "trustStore" : {
          "password" : "********",
          "path" : "",
          "type" : "PKCS12"
        }
      }
    }
  }
}
```

`MULTICAST` 노드 파인더로 전환하려면 구성 파일의 `nodeFinder` 섹션을 다음과 같이 업데이트하세요.

```json
{
  "ignite" : {
    "nodeFinder": {
      "type": "MULTICAST",
      "multicast" : {
        "group": "239.192.0.0",
        "port": 47401,
        "resultWaitTime": 500,
        "ttl": -1
      }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| inbound | | 서버 소켓 구성입니다. 자세한 내용은 [TCP 문서](https://man7.org/linux/man-pages/man7/tcp.7.html)와 [소켓 문서](https://man7.org/linux/man-pages/man7/socket.7.html)를 참고하세요. | | | |
| inbound.soBacklog | 128 | 백로그의 크기입니다. | 예 | 예 | 0 - Integer.MAX_VALUE |
| inbound.soKeepAlive | true | keep-alive 패킷을 허용할지 정의합니다. | 예 | 예 | true, false |
| inbound.soLinger | 0 | 닫힌 소켓이 얼마나 오래 대기(linger)해야 하는지 정의합니다. | 예 | 예 | 0 - 65535 |
| inbound.soReuseAddr | true | 주소를 재사용할 수 있는지 정의합니다. | 예 | 예 | true, false |
| inbound.tcpNoDelay | true | TCP no delay 옵션을 사용할지 정의합니다. | 예 | 예 | true, false |
| listenAddresses | | 수신 대기할 주소(IP 또는 호스트 이름) 목록입니다. 비어 있으면 모든 인터페이스에서 수신 대기합니다. 현재는 단일 주소만 지원됩니다. | 예 | 예 | 쉼표로 구분된 유효한 주소 목록 |
| membership | | 노드 구성원 구성입니다. | | | |
| membership.failurePingIntervalMillis | 1000 | 장애 감지기 핑 간격입니다. | 예 | 예 | 0 - inf |
| membership.membershipSyncIntervalMillis | 30000 | 주기적인 구성원 데이터 동기화 간격입니다. | 예 | 예 | 0 - inf |
| membership.scaleCube | | ScaleCube 전용 구성입니다. | | | |
| scaleCube.failurePingRequestMembers | 3 | 간접 핑 요청을 위해 클러스터 노드가 무작위로 선택하는 구성원 수입니다. | 예 | 예 | 1 - inf |
| scaleCube.gossipIntervalMillis | 200 | [Gossip](https://en.wikipedia.org/wiki/Gossip_protocol) 확산 간격입니다. | 예 | 예 | 1 - inf |
| scaleCube.gossipRepeatMult | 3 | Gossip 반복 배수입니다. | 예 | 예 | 1 - inf |
| scaleCube.membershipSuspicionMultiplier | 5 | 노드가 다운된 것으로 간주하기까지의 타임아웃을 계산하는 데 사용하는 배수입니다. | 예 | 예 | 1 - inf |
| scaleCube.metadataTimeoutMillis | 3000 | 메타데이터 업데이트 작업의 타임아웃입니다(밀리초 단위). | 예 | 예 | 1 - inf |
| nodeFinder | | 노드가 클러스터의 다른 노드를 찾는 방식에 대한 구성입니다. | | | |
| nodeFinder.netClusterNodes | | host:port 형식으로 표기한 클러스터 내 모든 노드의 주소입니다. `STATIC` 노드 파인더 유형을 사용할 때 적용됩니다. | 예 | 예 | 유효한 형식의 주소 |
| nodeFinder.type | STATIC | 노드 파인더 유형입니다. 노드 주소를 수동으로 구성하려면 `STATIC`을 사용하세요. | 예 | 예 | STATIC |
| nodeFinder.type | MULTICAST | 노드 파인더 유형입니다. 네트워크에서 노드를 자동으로 감지하려면 `MULTICAST`를 사용하세요. 이 유형을 사용할 때는 멀티캐스트 그룹 주소도 지정해야 합니다. | 예 | 예 | MULTICAST |
| nodeFinder.multicast.group | 239.192.0.0 | 노드 검색을 위한 멀티캐스트 그룹 주소입니다. | 예 | 예 | 유효한 형식의 멀티캐스트 주소 |
| nodeFinder.multicast.port | 47401 | 멀티캐스트에 사용하는 포트입니다. | 예 | 예 | 0 - 65535 |
| nodeFinder.multicast.resultWaitTime | 500 | 노드가 검색 요청 후 응답을 기다리는 시간입니다(밀리초 단위). | 예 | 예 | 1 - inf |
| nodeFinder.multicast.ttl | -1 | 멀티캐스트 패킷의 최대 네트워크 홉 수를 설정합니다. 기본값은 -1이며 시스템 기본 TTL을 사용합니다. | 예 | 예 | -1 - 255 |
| outbound | | 아웃바운드 요청 구성입니다. | | | |
| outbound.soKeepAlive | true | keep-alive 패킷을 허용할지 정의합니다. | 예 | 예 | true, false |
| outbound.soLinger | 0 | 닫힌 소켓이 얼마나 오래 대기(linger)해야 하는지 정의합니다. | 예 | 예 | 0 - 65535 |
| outbound.tcpNoDelay | true | TCP no delay 옵션을 사용할지 정의합니다. | 예 | 예 | true, false |
| port | 3344 | 노드 포트입니다. | 예 | 예 | 유효한 포트 번호 |
| shutdownQuietPeriodMillis | 0 | 노드가 종료되기 전에 Ignite가 어떤 작업도 제출되지 않도록 보장하는, 노드 종료 중의 기간입니다. 이 기간에 작업이 제출되면 반드시 수락됩니다. | 예 | 아니요 | 0 - inf |
| shutdownTimeoutMillis | 15000 | `shutdownQuietPeriodMillis` 동안 새 네트워크 메시지가 제출되었는지와 무관하게 노드가 종료되기까지의 최대 시간입니다. | 예 | 아니요 | 0 - inf |
| ssl.ciphers | "" | 활성화할 암호화 방식 목록입니다(쉼표로 구분). 비워 두면 암호화 방식을 자동으로 선택합니다. | 예 | 예 | TLS_AES_256_GCM_SHA384 등(표준 암호화 방식 ID) |
| ssl.clientAuth | | SSL 클라이언트 인증을 활성화할지, 그리고 필수인지 여부입니다. | 예 | 예 | none, optional, require |
| ssl.enabled | false | 노드에 SSL을 활성화할지 정의합니다. | 예 | 예 | true, false |
| ssl.keyStore | | SSL 키스토어 구성입니다. | | | |
| keyStore.password | ******** | 키스토어 비밀번호입니다. | 예 | 예 | 유효한 비밀번호 |
| keyStore.path | | 키스토어 경로입니다. | 예 | 예 | 유효한 경로 |
| keyStore.type | PKCS12 | 키스토어 유형입니다. | 예 | 예 | PKCS12, JKS |
| ssl.trustStore | | SSL 트러스트스토어 구성입니다. | | | |
| trustStore.password | ******** | 트러스트스토어 비밀번호입니다. | 예 | 예 | 유효한 비밀번호 |
| trustStore.path | | 트러스트스토어 경로입니다. | 예 | 예 | 유효한 경로 |
| trustStore.type | PKCS12 | 트러스트스토어 유형입니다. | 예 | 예 | PKCS12, JKS |

### 노드 속성 {#node-attributes}

```json
{
  "ignite" : {
    "nodeAttributes" : {
      "nodeAttributes" : { }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| nodeAttributes | | 지정된 속성 값을 가진 노드에만 데이터를 동적으로 분산하는 데 사용하는 노드 속성 모음입니다. | 예 | 예 | JSON 형식의 객체 |

### RAFT 구성 {#raft-configuration}

```json
{
  "ignite" : {
    "raft" : {
      "fsync" : false,
      "installSnapshotTimeoutMillis" : 300000,
      "logStripesCount" : 4,
      "logYieldStrategy" : false,
      "responseTimeoutMillis" : 3000,
      "retryDelayMillis" : 200,
      "retryTimeoutMillis" : 10000,
      "stripes" : 10,
      "volatileRaft" : {
        "logStorageBudget" : {
          "name" : "unlimited"
        }
      }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| fsync | false | 복제를 확정하기 전에 테이블 파티션 그룹의 Raft 로그 항목을 디스크에 안전하게 기록하는 데 `fsync`를 사용할지 지정합니다. `false`로 설정하면 OS 충돌 시 사용자 데이터가 손실될 수 있지만, Ignite 애플리케이션 충돌로는 데이터가 손실되지 않습니다. | 예 | 예 | true, false |
| installSnapshotTimeoutMillis | 300000 | RAFT 스냅샷을 수신자에게 전송하고 설치하는 데 허용되는 최대 기간입니다. | 예 | 예 | 1 - inf |
| logStripesCount | 4 | 로그 관리자의 Disruptor에 있는 스트라이프 수입니다 | 예 | 예 | 1 - inf |
| logYieldStrategy | false | true이면 로그 관리자의 Disruptor에서 논블로킹 전략을 사용합니다. | 예 | 예 | true, false |
| responseTimeoutMillis | 3000 | RAFT 클라이언트가 원격 피어로부터 응답을 받으려고 시도하는 기간입니다. | 예 | 아니요 | 0 - inf |
| retryDelayMillis | 200 | RAFT 클라이언트가 실패한 요청을 다시 보내는 사이의 지연 시간입니다. | 예 | 아니요 | 0 - inf |
| retryTimeoutMillis | 10000 | RAFT 클라이언트가 원격 피어로부터 성공 응답을 받으려고 시도하는 기간입니다. | 예 | 아니요 | 0 - inf |
| volatileRaft.logStorageBudget.name | unlimited | 노드가 사용하는 로그 스토리지 예산의 이름입니다. | 예 | 아니요, 단 새 값은 새 파티션에만 적용됩니다 | unlimited, entry-count |

### REST 구성 {#rest-configuration}

```json
{
  "ignite" : {
    "rest" : {
      "dualProtocol" : false,
      "httpToHttpsRedirection" : false,
      "port" : 10300,
      "ssl" : {
        "ciphers" : "",
        "clientAuth" : "none",
        "enabled" : false,
        "keyStore" : {
          "password" : "********",
          "path" : "",
          "type" : "PKCS12"
        },
        "port" : 10400,
        "trustStore" : {
          "password" : "********",
          "path" : "",
          "type" : "PKCS12"
        }
      }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| dualProtocol | false | 엔드포인트가 HTTP와 HTTPS 프로토콜을 모두 사용할지 정의합니다. | 예 | 예 | true, false |
| httpToHttpsRedirection | false | HTTP 엔드포인트로의 요청을 HTTPS로 리디렉션할지 정의합니다. | 예 | 예 | true, false |
| port | 10300 | 노드의 REST 엔드포인트 포트입니다. | 예 | 예 | 유효한 포트 |
| ssl.ciphers | | 노드 SSL 암호화 방식을 명시적으로 설정합니다. | 예 | 예 | [허용 값](https://www.java.com/en/configure_crypto.html) 참고 |
| ssl.clientAuth | | 노드가 사용하는 클라이언트 인가입니다(있는 경우). | 예 | 예 | none, optional, require |
| ssl.enabled | false | 노드에 SSL을 활성화할지 정의합니다. | 예 | 예 | true, false |
| ssl.keyStore | | SSL 키스토어 구성입니다. | | | |
| keyStore.password | ******** | 키스토어 비밀번호입니다. | 예 | 예 | 유효한 비밀번호 |
| keyStore.path | | 키스토어 경로입니다. | 예 | 예 | 유효한 경로 |
| keyStore.type | PKCS12 | 키스토어 유형입니다. | 예 | 예 | PKCS12, JKS |
| ssl.port | 10400 | SSL 연결에 사용하는 포트입니다. | 예 | 예 | 유효한 포트 |
| ssl.trustStore | | SSL 트러스트스토어 구성입니다. | | | |
| trustStore.password | ******** | 트러스트스토어 비밀번호입니다. | 예 | 예 | 유효한 비밀번호 |
| trustStore.path | | 트러스트스토어 경로입니다. | 예 | 예 | 유효한 경로 |
| trustStore.type | PKCS12 | 트러스트스토어 유형입니다. | 예 | 예 | PKCS12, JKS |

### SQL 구성 {#sql-configuration}

```json
{
  "ignite" : {
    "sql" : {
      "execution" : {
        "threadCount" : 4
      },
      "planner" : {
        "threadCount" : 4
      }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| execution.threadCount | 4 | 쿼리 실행에 사용하는 스레드 수입니다. | 예 | 예 | 1 - Integer.MAX_VALUE |
| planner.threadCount | 4 | 쿼리 계획 수립에 사용하는 스레드 수입니다. | 예 | 예 | 1 - Integer.MAX_VALUE |

### 스토리지 구성 {#storage-configuration}

Ignite Persistence는 빠르고 응답성 좋은 영속 스토리지를 제공하도록 설계되었습니다. 영속 스토리지를 사용하면 Ignite는 모든 데이터를 디스크에 저장하고, 처리를 위해 가능한 한 많은 데이터를 RAM에 로드합니다. 영속성이 활성화되면 Ignite는 각 파티션을 디스크의 별도 파일에 저장합니다. 데이터 파티션 외에도 Ignite는 인덱스와 메타데이터를 저장합니다.

각 Ignite 스토리지 엔진은 여러 스토리지 *프로파일*을 가질 수 있습니다.

*체크포인팅*은 더티 페이지를 RAM에서 디스크의 파티션 파일로 복사하는 과정입니다. 더티 페이지는 RAM에서 업데이트되었지만 해당 파티션 파일에는 기록되지 않은 페이지입니다. 체크포인트가 생성되면 모든 변경 사항이 디스크에 영속화되며, 노드가 충돌한 뒤 재시작되어도 사용할 수 있습니다. 체크포인팅은 데이터의 내구성과 노드 장애 시 복구를 보장하도록 설계되었습니다. 이 과정은 디스크에 페이지를 가장 최신 상태로 유지하므로 디스크 공간을 아껴 쓸 수 있습니다.

```json
{
 "ignite" : {
    "storage" : {
      "engines" : {
        "aimem" : {
          "pageSizeBytes" : 16384
        },
        "aipersist" : {
          "checkpoint" : {
            "checkpointDelayMillis" : 200,
            "checkpointThreads" : 4,
            "compactionThreads" : 4,
            "intervalMillis" : 180000,
            "intervalDeviationPercent" : 40,
            "logReadLockThresholdTimeout" : 0,
            "readLockTimeoutMillis" : 10000,
            "useAsyncFileIoFactory" : true
          },
          "pageSizeBytes" : 16384
        },
        "rocksdb" : {
          "flushDelayMillis" : 100
        }
      },
      "profiles" : [ {
        "engine" : "aipersist",
        "name" : "default",
        "replacementMode" : "CLOCK",
        "sizeBytes" : 268435456
      },
      {
        "engine" : "aimem",
        "name" : "default_aimem",
        "emptyPagesPoolSize" : 100,
        "initSizeBytes" : 268435456,
        "maxSizeBytes" : 268435456
      },
      {
        "engine" : "rocksdb",
        "name" : "default_rocksdb",
        "sizeBytes" : 268435456,
        "writeBufferSizeBytes" : 67108864
      } ]
   }
  }
 }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| engines.aimem | | Aimem 구성입니다. | | | |
| aimem.pageSizeBytes | 16384 | 스토리지 내 페이지 크기입니다(바이트 단위). | 예 | 예 | 1024-16384 |
| engines.aipersist | | Aipersist 구성입니다. | | | |
| aipersist.checkpoint.checkpointDelayMillis | 200 | 명령을 받은 후 체크포인트를 시작하기 전의 지연 시간입니다. | 예 | 아니요 | 0 - inf |
| aipersist.checkpoint.checkpointThreads | 4 | 체크포인팅에 전용으로 할당되는 CPU 스레드 수입니다. | 예 | 예 | 1 - inf |
| aipersist.checkpoint.compactionThreads | 4 | 데이터 컴팩션에 전용으로 할당되는 CPU 스레드 수입니다. | 예 | 예 | 1 - inf |
| aipersist.checkpoint.intervalMillis | 180000 | 체크포인트 사이의 간격입니다(밀리초 단위). | 예 | 아니요 | 0 - inf |
| aipersist.checkpoint.intervalDeviationPercent | 40 | 다음 예정된 체크포인트까지의 시간에 더하거나 뺄 지터입니다(백분율). | 예 | 아니요 | 0-100 |
| aipersist.checkpoint.logReadLockThresholdTimeoutMillis | 0 | 긴 읽기 락을 로깅하는 임계값입니다(밀리초 단위). | 예 | 예 | 0 - inf |
| aipersist.checkpoint.readLockTimeoutMillis | 10000 | 체크포인트 읽기 락 확보의 타임아웃입니다(밀리초 단위). | 예 | 예 | 0 - inf |
| aipersist.checkpoint.useAsyncFileIoFactory | true | Ignite가 비동기 파일 I/O 작업 공급자를 사용할지 여부입니다. | 예 | 예 | true, false |
| aipersist.pageSizeBytes | 16384 | 스토리지 내 페이지 크기입니다(바이트 단위). | 아니요 | 해당 없음 | 1024-16384 |
| engines.rocksdb | | Rocksdb 구성입니다. | | | |
| rocksdb.flushDelayMillis | 100 | RAFT가 트리거한 플러시를 실행하기 전의 지연 시간입니다. | 예 | 엔진 등록 시 갱신됨 | 0 - inf |
| profiles | | 사용 가능한 스토리지 프로파일 목록입니다. | | | |
| engine | | 스토리지 엔진입니다. | 아니요 | 해당 없음 | aimem, aipersist, rocksdb |
| name | | 사용자가 정의한 프로파일 이름입니다. | 아니요 | 해당 없음 | 유효한 이름 |
| replacementMode | CLOCK | 페이지 교체 알고리즘을 설정합니다. | 예 | 예 | CLOCK, RANDOM_LRU, SEGMENTED_LRU |
| size | 256Mb | 메모리(RAM) 영역 크기입니다. | 예 | 예 | 최소 256Mb, 최대는 OS의 주소 지정 가능 메모리 한도로 결정됨 |
| aipersist.sizeBytes | 268435456 | 메모리(오프힙) 영역 크기입니다. | 예 | 예 | 최소 268435456, 최대는 OS의 주소 지정 가능 메모리 한도로 결정됨 |
| aipersist.replacementMode | CLOCK | 페이지 교체 알고리즘을 설정합니다. | 예 | 예 | CLOCK, RANDOM_LRU, SEGMENTED_LRU |
| aimem.initSizeBytes | 268435456 | 초기 메모리 영역 크기입니다(바이트 단위). 사용된 메모리 크기가 이 값을 초과하면 새 메모리 청크가 할당됩니다. | 예 | 예 | 최소 256Mb, 최대는 OS의 주소 지정 가능 메모리 한도로 결정됨 |
| aimem.maxSizeBytes | 268435456 | 최대 메모리 영역 크기입니다(바이트 단위). | 예 | 예 | 최소 256Mb, 최대는 OS의 주소 지정 가능 메모리 한도로 결정됨 |
| rocksdb.sizeBytes | 268435456 | rocksdb 오프힙 캐시 크기입니다. | 예 | 예 | 최소 0, 최대는 OS의 주소 지정 가능 메모리 한도로 결정됨 |
| rocksdb.writeBufferSizeBytes | 67108864 | rocksdb 쓰기 버퍼 크기입니다. | 예 | 예 | 최소 1, 최대는 OS의 주소 지정 가능 메모리 한도로 결정됨 |

### 시스템 구성 {#system-configuration}

이 섹션에서는 Ignite 컴포넌트가 사용하는 내부 속성을 설명합니다. `node config update` CLI 명령어로 이 속성을 편집할 수 있지만, 변경하기 전에 Ignite 지원팀과 상의하는 것을 권장합니다. 이 속성은 특정 노드에 적용됩니다. 클러스터 전체에 적용되는 속성은 [클러스터 구성](/configure-and-operate/reference/cluster-configuration#system-configuration-internal)을 참고하세요.

:::note
속성 이름은 `camelCase`로 표기됩니다.
:::

```json
{
  "ignite" : {
    "system" : {
      "cmgPath" : "",
      "metastoragePath" : "",
      "partitionsBasePath" : "",
      "partitionsLogPath" : "",
      "properties":[],
      "criticalWorkers" : {
        "livenessCheckIntervalMillis" : 2000,
        "maxAllowedLagMillis" : 5000,
        "nettyThreadsHeartbeatIntervalMillis" : 1000
      }
    }
  }
}
```

| 속성 | 기본값 | 설명 | 변경 가능 여부 | 재시작 필요 여부 | 허용 값 |
|----------|---------|-------------|------------|------------------|-------------------|
| system.cmgPath | | 클러스터 관리 그룹 정보가 저장되는 경로입니다. 노드가 CMG의 일부인 경우에만 적용됩니다. 기본적으로 데이터는 `{IGNITE_HOME}/work/cmg`에 저장됩니다. 이 경로는 비어 있는 노드에서만 변경하는 것을 권장합니다. | 예 | 예 | 유효한 절대 경로. |
| system.metastoragePath | | 클러스터 메타 정보가 저장되는 경로입니다. 노드가 메타스토리지 그룹의 일부인 경우에만 적용됩니다. 기본적으로 데이터는 `{IGNITE_HOME}/work/metastorage`에 저장됩니다. 이 경로는 비어 있는 노드에서만 변경하는 것을 권장합니다. | 예 | 예 | 유효한 절대 경로. |
| system.partitionsBasePath | | 노드에서 데이터 파티션이 저장되는 경로입니다. 기본적으로 파티션은 `{IGNITE_HOME}/work/partitions`에 저장됩니다. 이 경로는 비어 있는 노드에서만 변경하는 것을 권장합니다. | 예 | 예 | 유효한 절대 경로. |
| system.partitionsLogPath | | 파티션의 RAFT 로그가 저장되는 경로입니다. 기본적으로 이 로그는 `{system.partitionsBasePath}/log`에 저장됩니다. 이 경로는 비어 있는 노드에서만 변경하는 것을 권장합니다. | 예 | 예 | 유효한 절대 경로. |
| system.properties | | Ignite 컴포넌트가 사용하는 시스템 속성입니다. | 예 | 예 | 속성 맵. |
| system.criticalWorkers.livenessCheckIntervalMillis | 2000 | 크리티컬 워커 인프라가 수행하는 활성 검사(liveness check) 사이의 간격입니다(ms). | 예 | 예 | 1 - inf(maxAllowedLagMillis의 절반 이하) |
| system.criticalWorkers.maxAllowedLagMillis | 5000 | 마지막 하트비트부터 현재 시각까지 허용되는 최대 지연입니다(ms). 초과하면 크리티컬 워커가 차단된 것으로 간주됩니다. | 예 | 아니요 | 1 - inf(livenessCheckInterval의 최소 두 배여야 함) |
| system.criticalWorkers.nettyThreadsHeartbeatIntervalMillis | 1000 | Netty 스레드의 하트비트 타임스탬프를 업데이트하는 데 사용하는 하트비트 사이의 간격입니다(ms). | 예 | 예 | 1 - inf |
