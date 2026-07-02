---
title: Network API
id: network-api
sidebar_position: 10
---

# Network API

Network API는 클러스터 토폴로지 정보에 접근하는 기능을 제공합니다. 애플리케이션은 이 API로 노드를 검색하고, 네트워크 주소를 확인하고, 노드 메타데이터에 접근합니다. 이 정보는 컴퓨트 작업 대상 지정, 모니터링, 클러스터 인식에 쓰입니다.

## 핵심 개념 {#key-concepts}

ClusterNode는 클러스터의 개별 노드를 나타냅니다. 각 노드는 고유 식별자, 일관된 이름, 네트워크 주소, 메타데이터를 가집니다. IgniteCluster 퍼사드는 모든 클러스터 구성원과 로컬 노드를 포함한 토폴로지 정보에 접근하는 기능을 제공합니다.

네트워크 주소는 호스트와 포트 조합으로 노드 엔드포인트를 식별합니다. 애플리케이션은 문자열에서 주소를 파싱하거나 프로그래밍 방식으로 직접 생성합니다.

## 클러스터 접근 {#cluster-access}

클러스터 퍼사드로 클러스터 토폴로지에 접근합니다:

```java
IgniteCluster cluster = ignite.cluster();

Collection<ClusterNode> nodes = cluster.nodes();
System.out.println("Cluster has " + nodes.size() + " nodes");

for (ClusterNode node : nodes) {
    System.out.println("Node: " + node.name() + " at " + node.address());
}
```

## 비동기 노드 검색 {#asynchronous-node-discovery}

노드를 비동기로 조회합니다:

```java
CompletableFuture<Collection<ClusterNode>> nodesFuture = cluster.nodesAsync();

nodesFuture.thenAccept(nodes -> {
    for (ClusterNode node : nodes) {
        System.out.println("Found node: " + node.name());
    }
});
```

비동기 접근은 토폴로지 정보 조회에 네트워크 호출이 필요한 경우 블로킹을 피합니다.

## 로컬 노드 정보 {#local-node-information}

로컬 노드에 접근합니다:

```java
ClusterNode local = ignite.cluster().localNode();

System.out.println("Local node ID: " + local.id());
System.out.println("Local node name: " + local.name());
System.out.println("Local address: " + local.address());
```

로컬 노드는 클러스터 내에서 현재 Ignite 인스턴스를 나타냅니다.

## 노드 식별 {#node-identification}

노드 식별자에 접근합니다:

```java
ClusterNode node = cluster.localNode();

UUID nodeId = node.id();
String nodeName = node.name();

System.out.println("Node ID: " + nodeId);
System.out.println("Node name: " + nodeName);
```

노드 ID는 노드를 고유하게 식별합니다. 노드 이름은 사람이 읽을 수 있는 일관된 식별자를 제공합니다.

## 네트워크 주소 {#network-addresses}

노드 네트워크 엔드포인트에 접근합니다:

```java
ClusterNode node = cluster.localNode();
NetworkAddress address = node.address();

String host = address.host();
int port = address.port();

System.out.println("Host: " + host);
System.out.println("Port: " + port);
```

NetworkAddress는 클라이언트 연결을 위한 노드 엔드포인트를 식별합니다.

## 주소 생성 {#address-construction}

네트워크 주소를 프로그래밍 방식으로 생성합니다:

```java
NetworkAddress address1 = new NetworkAddress("localhost", 10800);

NetworkAddress address2 = NetworkAddress.from("192.168.1.100:10800");

InetSocketAddress socketAddress = new InetSocketAddress("server.example.com", 10800);
NetworkAddress address3 = NetworkAddress.from(socketAddress);
```

from 메서드는 문자열이나 소켓 주소에서 주소를 파싱합니다.

## 노드 메타데이터 {#node-metadata}

노드 메타데이터에 접근합니다:

```java
ClusterNode node = cluster.localNode();
NodeMetadata metadata = node.nodeMetadata();

// Access metadata properties
// (specific metadata content depends on configuration)
```

노드 메타데이터는 클러스터 설정 중 구성된 노드별 추가 정보를 담고 있습니다.

## 클라이언트 연결 {#client-connections}

씬 클라이언트는 활성 연결에 접근할 수 있습니다:

```java
List<ClusterNode> connections = client.connections();

System.out.println("Connected to " + connections.size() + " servers");

for (ClusterNode node : connections) {
    System.out.println("Connected to: " + node.name() +
        " at " + node.address());
}
```

connections 목록은 클라이언트와 활성 연결 중인 서버를 보여줍니다.

## 노드 선택 {#node-selection}

작업에 사용할 특정 노드를 선택합니다:

```java
Collection<ClusterNode> allNodes = ignite.clusterNodes();

// Find node by name
ClusterNode targetNode = allNodes.stream()
    .filter(node -> node.name().equals("node-1"))
    .findFirst()
    .orElse(null);

if (targetNode != null) {
    System.out.println("Found node at " + targetNode.address());
}
```

## 다중 노드 선택 {#multiple-node-selection}

조건에 따라 노드를 필터링합니다:

```java
Collection<ClusterNode> allNodes = ignite.clusterNodes();

// Select nodes by port
List<ClusterNode> portFiltered = allNodes.stream()
    .filter(node -> node.address().port() == 10800)
    .collect(Collectors.toList());

// Select nodes by hostname pattern
List<ClusterNode> hostFiltered = allNodes.stream()
    .filter(node -> node.address().host().contains("prod"))
    .collect(Collectors.toList());
```

## 컴퓨트 작업 대상 지정 {#compute-job-targeting}

컴퓨트 작업에 노드 정보를 사용합니다:

```java
Collection<ClusterNode> nodes = ignite.clusterNodes();

JobDescriptor<String, Integer> descriptor =
    JobDescriptor.<String, Integer>builder("com.example.DataProcessor").build();

// Execute on all nodes
for (ClusterNode node : nodes) {
    CompletableFuture<JobExecution<Integer>> executionFuture =
        ignite.compute().submitAsync(
            JobTarget.node(node),
            descriptor,
            "input"
        );

    executionFuture.thenCompose(JobExecution::resultAsync)
        .thenAccept(result -> {
            System.out.println("Job result from " + node.name() + ": " + result);
        });
}
```

## 주소 파싱 {#address-parsing}

구성 문자열에서 주소를 파싱합니다:

```java
String[] serverAddresses = {
    "server1.example.com:10800",
    "server2.example.com:10800",
    "192.168.1.100:10800"
};

List<NetworkAddress> addresses = Arrays.stream(serverAddresses)
    .map(NetworkAddress::from)
    .collect(Collectors.toList());

for (NetworkAddress addr : addresses) {
    System.out.println("Server: " + addr.host() + ":" + addr.port());
}
```

## 주소 포맷팅 {#address-formatting}

주소를 표시용으로 포맷합니다:

```java
NetworkAddress address = node.address();

String formatted = address.host() + ":" + address.port();
System.out.println("Node endpoint: " + formatted);

// Address toString provides formatted output
String automatic = address.toString();
```

## 지원 중단된 API {#deprecated-api}

Ignite의 clusterNodes 메서드는 지원이 중단되었습니다:

```java
// Deprecated
Collection<ClusterNode> nodes1 = ignite.clusterNodes();

// Preferred
Collection<ClusterNode> nodes2 = ignite.cluster().nodes();
```

토폴로지에 접근하려면 클러스터 퍼사드를 사용하세요.

## 노드 비교 {#node-comparison}

식별자로 노드를 비교합니다:

```java
ClusterNode node1 = cluster.localNode();
ClusterNode node2 = nodes.iterator().next();

boolean same = node1.id().equals(node2.id());
if (same) {
    System.out.println("Same node");
}
```

노드는 UUID 식별자로 비교합니다.

## 참조 {#reference}

- 클러스터 퍼사드: `org.apache.ignite.network.IgniteCluster`
- 노드 표현: `org.apache.ignite.network.ClusterNode`
- 네트워크 주소: `org.apache.ignite.network.NetworkAddress`
- 노드 메타데이터: `org.apache.ignite.network.NodeMetadata`

### IgniteCluster 메서드 {#ignitecluster-methods}

- `Collection<ClusterNode> nodes()` - 모든 클러스터 노드 조회
- `CompletableFuture<Collection<ClusterNode>> nodesAsync()` - 노드를 비동기로 조회
- `ClusterNode localNode()` - 로컬 노드 조회

### ClusterNode 메서드 {#clusternode-methods}

- `UUID id()` - 노드 고유 식별자 조회
- `String name()` - 노드 이름 조회(일관된 ID)
- `NetworkAddress address()` - 네트워크 주소 조회
- `NodeMetadata nodeMetadata()` - 노드 메타데이터 조회

### NetworkAddress 메서드 {#networkaddress-methods}

- `String host()` - 호스트 이름 조회
- `int port()` - 포트 번호 조회

### NetworkAddress 생성 {#networkaddress-construction}

- `NetworkAddress(String host, int port)` - 구성 요소로부터 생성
- `static NetworkAddress from(String)` - "host:port" 형식 문자열에서 파싱
- `static NetworkAddress from(InetSocketAddress)` - 소켓 주소에서 변환

### IgniteClient 연결 메서드 {#igniteclient-connection-methods}

- `List<ClusterNode> connections()` - 활성 서버 연결 조회

### Ignite 노드 메서드 {#ignite-node-methods}

- `Collection<ClusterNode> clusterNodes()` - 모든 노드 조회(지원 중단됨, cluster().nodes() 사용)

### 토폴로지 사용 사례 {#topology-use-cases}

노드 정보는 여러 일반적인 패턴을 지원합니다:
- 노드 위치나 기능에 따른 컴퓨트 작업 대상 지정
- 클러스터 상태 모니터링 및 진단
- 씬 클라이언트 연결 관리
- 커스텀 로드 밸런싱 및 데이터 지역성 최적화
