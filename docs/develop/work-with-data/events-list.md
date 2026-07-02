---
id: events-list
title: 사용 가능한 이벤트
---

이 섹션에서는 Apache Ignite 3에서 사용할 수 있는 이벤트 목록을 설명합니다.

## 연결 이벤트 {#connection-events}

클라이언트가 클러스터에 연결되거나 연결을 해제할 때마다 발생하는 이벤트입니다.

| 이벤트 유형 | 설명 |
|------------|-------------|
| CLIENT_CONNECTION_ESTABLISHED | 클라이언트와의 연결이 수립되었습니다. 연결 정보에는 클라이언트 정보가 담겨 있습니다. |
| CLIENT_CONNECTION_CLOSED | 클라이언트와의 연결이 종료되었습니다. 연결 정보에는 클라이언트 정보가 담겨 있습니다. |

## 인증 이벤트 {#authentication-events}

사용자가 인증이 필요한 작업을 수행할 때 발생하는 이벤트입니다.

| 이벤트 유형 | 설명 |
|------------|-------------|
| USER_AUTHENTICATION_SUCCESS | 사용자가 클러스터에서 인증되었습니다. |
| USER_AUTHENTICATION_FAILURE | 사용자가 클러스터 인증에 실패했습니다. 이벤트의 `identity` 필드에서 사용자 이름을 확인할 수 있습니다. |

## 인가 이벤트 {#authorization-events}

사용자가 인증이 필요한 작업을 수행할 때 발생하는 이벤트입니다. 각 이벤트 본문에는 `privileges` 목록이 있으며, 각 `privelege`는 `action`과 `selector`로 구성된 객체입니다. 자세한 내용은 [사용자 권한과 역할](/configure-and-operate/configuration/config-cluster-security) 섹션을 참고하세요.

| 이벤트 유형 | 설명 |
|------------|-------------|
| USER_AUTHORIZATION_SUCCESS | 특정 객체에 대한 사용자의 작업이 인가되었습니다. |
| USER_AUTHORIZATION_FAILURE | 특정 객체에 대한 사용자의 작업이 거부되었습니다. |

## 쿼리 이벤트 {#query-events}

사용자가 쿼리를 실행할 때 발생하는 이벤트입니다.

| 이벤트 유형 | 설명 |
|------------|-------------|
| QUERY_STARTED | 새 쿼리가 시작되었습니다. |
| QUERY_FINISHED | 쿼리 실행이 완료되었습니다. |

### 쿼리 이벤트 구조 {#query-event-structure}

각 쿼리 이벤트에는 다음 필드가 있습니다.

| 필드 이름 | 설명 |
|------------|-------------|
| initiator | 쿼리를 시작한 노드의 이름입니다. |
| id | 쿼리 ID입니다. |
| schema | 정규화되지 않은 객체 이름을 해석하는 데 사용된 스키마의 이름입니다. |
| sql | 원본 쿼리 문자열입니다. |
| parentId | 상위 쿼리가 있는 경우 그 ID입니다. |
| statementNumber | 해당하는 경우 스크립트 내 쿼리의 0부터 시작하는 인덱스입니다. 해당하지 않으면 -1을 반환합니다. |
| txId | 알려진 경우 트랜잭션의 ID입니다. |
| startTime | 쿼리가 서버에 나타난 시각입니다. `QUERY_FINISHED` 이벤트에만 적용됩니다. |
| type | **선택 사항** 알려진 경우 쿼리의 유형입니다. |
| error | **선택 사항** 실행 중 오류가 발생해 쿼리가 종료된 경우 그 오류입니다. |

## 컴퓨트 작업 이벤트 {#compute-job-events}

컴퓨트 작업이 거칠 수 있는 상태를 나타내는 이벤트입니다.

| 이벤트 유형 | 설명 |
|------------|-------------|
| COMPUTE_JOB_QUEUED | 컴퓨트 작업이 실행 대기열에 추가될 때 발생합니다. |
| COMPUTE_JOB_EXECUTING | 컴퓨트 작업 실행이 시작될 때 발생합니다. |
| COMPUTE_JOB_FAILED | 컴퓨트 작업이 실행 중 실패해 예외를 던질 때 발생합니다. |
| COMPUTE_JOB_COMPLETED | 컴퓨트 작업이 성공적으로 완료될 때 발생합니다. |
| COMPUTE_JOB_CANCELING | 컴퓨트 작업 취소가 요청될 때 발생합니다. |
| COMPUTE_JOB_CANCELED | 컴퓨트 작업이 취소되었을 때 발생합니다. |

### 컴퓨트 작업 이벤트 구조 {#compute-job-event-structure}

각 컴퓨트 작업 이벤트에는 다음 필드가 있습니다.

| 필드 이름 | 설명 |
|------------|-------------|
| type | 컴퓨트 작업의 유형입니다. `SINGLE`, `BROADCAST`, `MAP_REDUCE`, `DATA_RECEIVER` 중 하나입니다.<br/><br/>단일(Single) 작업은 가장 흔한 유형으로, 단일 노드에서 실행되는 작업에 부여됩니다. 브로드캐스트(Broadcast) 작업은 여러 노드에서 동시에 실행됩니다. 맵리듀스(Map reduce) 작업은 맵리듀스 태스크에서 제출되는 작업입니다. 데이터 수신기(Data receiver)는 데이터 스트리머 API를 사용할 때 쓰이는 내부 컴퓨트 작업입니다. |
| className | 작업의 클래스 이름입니다. |
| jobId | 컴퓨트 작업 ID입니다. |
| targetNode | 작업이 실행되는 노드의 이름입니다. |
| initiatorNode | 제출 요청이 처리되는 노드의 이름입니다. |
| taskId | **선택 사항** 단일 호출에서 제출된 모든 브로드캐스트 컴퓨트 작업에 공통되는 ID입니다. |
| tableName | **선택 사항** 콜로케이션된 작업이나 파티셔닝된 브로드캐스트 작업의 테이블 이름입니다. |
| clientAddress | **선택 사항** 작업을 제출한 씬 클라이언트의 소켓 주소입니다. |

## 맵리듀스 태스크 이벤트 {#map-reduce-task-events}

맵리듀스 태스크가 거칠 수 있는 상태를 나타내는 이벤트입니다.

| 이벤트 유형 | 설명 |
|------------|-------------|
| MAP_REDUCE_TASK_QUEUED | 맵리듀스 태스크가 실행 대기열에 추가될 때 발생합니다. |
| MAP_REDUCE_TASK_EXECUTING | 맵리듀스 태스크 실행이 시작될 때 발생합니다. |
| MAP_REDUCE_TASK_FAILED | 맵리듀스 태스크가 실행 중 실패해 예외를 던질 때 발생합니다. |
| MAP_REDUCE_TASK_COMPLETED | 맵리듀스 태스크가 성공적으로 완료될 때 발생합니다. |
| MAP_REDUCE_TASK_CANCELED | 맵리듀스 태스크가 취소되었을 때 발생합니다. |

### 맵리듀스 이벤트 구조 {#map-reduce-event-structure}

각 태스크 이벤트에는 다음 필드가 있습니다.

| 필드 이름 | 설명 |
|------------|-------------|
| type | 태스크의 유형입니다. 항상 `MAP_REDUCE` 이벤트 유형입니다. |
| className | 태스크의 클래스 이름입니다. |
| taskId | 맵리듀스 태스크의 ID입니다. |
| targetNode | 태스크가 실행되는 노드의 이름입니다. |
| clientAddress | **선택 사항** 태스크를 제출한 씬 클라이언트의 소켓 주소입니다. |

## REST API 이벤트 {#rest-api-events}

REST API 호출 시 발생하며 감사 목적으로 사용할 수 있는 이벤트입니다.

| 이벤트 유형                | 설명                                     |
|---------------------------|-------------------------------------------------|
| REST_API_REQUEST_STARTED  | REST API 요청을 수신할 때 발생합니다.  |
| REST_API_REQUEST_FINISHED | REST API 요청이 완료될 때 발생합니다. |

### REST API 이벤트 구조 {#rest-api-event-structure}

사용자 신원 정보는 표준 이벤트의 `user` [필드](developers-guide/events/overview#event-structure)에서 확인할 수 있습니다. 각 REST API 이벤트에는 다음 필드도 있습니다.

| 필드 이름 | 설명 |
|------------|-------------|
| method     | 요청의 HTTP 메서드입니다(예: `GET`, `POST`). |
| endpoint   | API 엔드포인트 경로입니다(예: `/management/v1/license`). |
| requestId  | 요청의 고유 식별자입니다. |
| nodeName   | 요청을 수신한 노드의 이름입니다.
| message    | 오류 메시지입니다. `REST_API_REQUEST_FINISHED` 이벤트에만 적용됩니다. |
| timestamp | 요청을 수신한 시각의 ISO-8601 타임스탬프입니다.
| status     | HTTP 응답 상태 코드입니다. `REST_API_REQUEST_FINISHED` 이벤트에만 적용됩니다. |
| durationMs | 밀리초 단위의 요청 소요 시간입니다. `REST_API_REQUEST_FINISHED` 이벤트에만 적용됩니다. |
