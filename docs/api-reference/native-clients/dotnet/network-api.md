---
title: Network API
id: network-api
sidebar_position: 7
---

# Network API

Network API는 클러스터 토폴로지와 활성 클라이언트 연결 정보를 제공합니다. 이 API로 클러스터 노드를 검색하고 연결 상태를 확인하며 클러스터 구성을 파악할 수 있습니다.

## 핵심 개념 {#key-concepts}

클러스터 노드는 Ignite 클러스터에 속한 개별 서버 인스턴스를 나타냅니다. 각 노드는 고유 식별자와 네트워크 주소를 가집니다. 클라이언트는 클러스터 노드와의 연결을 유지하며 여러 노드에 작업을 분산합니다.

### 노드 식별 {#node-identity}

노드는 두 가지 식별자를 가집니다. 노드 ID는 재시작 후 바뀌며 현재 노드 인스턴스를 고유하게 식별합니다. 노드 이름(일관된 ID, consistent ID)은 재시작 후에도 유지되며 노드를 영구적으로 식별합니다.

### 연결 관리 {#connection-management}

클라이언트는 클러스터 노드와의 연결을 자동으로 관리합니다. 활성 연결을 조회하면 클라이언트가 현재 어떤 노드에 연결되어 있는지 확인하고 SSL 구성 같은 연결 속성을 점검할 수 있습니다.

## 사용 예시 {#usage-examples}

### 클러스터 노드 조회 {#getting-cluster-nodes}

```csharp
var client = await IgniteClient.StartAsync(configuration);

// Get all cluster nodes
var nodes = await client.GetClusterNodesAsync();

foreach (var node in nodes)
{
    Console.WriteLine($"Node: {node.Name}");
    Console.WriteLine($"  ID: {node.Id}");
    Console.WriteLine($"  Address: {node.Address}");
}
```

### 활성 연결 확인 {#inspecting-active-connections}

```csharp
var connections = client.GetConnections();

Console.WriteLine($"Active connections: {connections.Count}");

foreach (var conn in connections)
{
    Console.WriteLine($"Connected to: {conn.Node.Name}");
    Console.WriteLine($"  Node ID: {conn.Node.Id}");
    Console.WriteLine($"  Address: {conn.Node.Address}");

    if (conn.SslInfo != null)
    {
        Console.WriteLine($"  SSL: Enabled");
        Console.WriteLine($"  Protocol: {conn.SslInfo.SslProtocol}");
        Console.WriteLine($"  Cipher: {conn.SslInfo.NegotiatedCipherSuiteName}");
    }
}
```

### 특정 노드 찾기 {#finding-specific-nodes}

```csharp
var nodes = await client.GetClusterNodesAsync();

// Find by name
var targetNode = nodes.FirstOrDefault(n => n.Name == "node-01");
if (targetNode != null)
{
    Console.WriteLine($"Found node: {targetNode.Name} at {targetNode.Address}");
}

// Find by ID
var nodeId = Guid.Parse("550e8400-e29b-41d4-a716-446655440000");
var nodeById = nodes.FirstOrDefault(n => n.Id == nodeId);
```

### 연결 상태 모니터링 {#monitoring-connection-health}

```csharp
var checkInterval = TimeSpan.FromSeconds(30);

while (true)
{
    var connections = client.GetConnections();

    if (connections.Count == 0)
    {
        Console.WriteLine("WARNING: No active connections!");
    }
    else
    {
        Console.WriteLine($"Connected to {connections.Count} nodes:");
        foreach (var conn in connections)
        {
            Console.WriteLine($"  - {conn.Node.Name}");
        }
    }

    await Task.Delay(checkInterval);
}
```

### 작업 대상 지정에 노드 정보 사용 {#using-node-information-for-job-targeting}

```csharp
var nodes = await client.GetClusterNodesAsync();
var compute = client.Compute;

// Target specific node by name
var targetNode = nodes.FirstOrDefault(n => n.Name.StartsWith("compute"));
if (targetNode != null)
{
    var jobTarget = JobTarget.Node(targetNode);
    var execution = await compute.SubmitAsync(
        jobTarget, jobDescriptor, "input");
    var result = await execution.GetResultAsync();
}

// Target node by index (round-robin)
var nodeIndex = DateTime.UtcNow.Ticks % nodes.Count;
var selectedNode = nodes[(int)nodeIndex];
```

### 연결 상태 확인 {#connection-status-check}

```csharp
public async Task<bool> IsConnectedToCluster(IIgniteClient client)
{
    try
    {
        var connections = client.GetConnections();
        var nodes = await client.GetClusterNodesAsync();

        return connections.Count > 0 && nodes.Count > 0;
    }
    catch (Exception)
    {
        return false;
    }
}
```

### SSL 연결 정보 {#ssl-connection-information}

```csharp
var connections = client.GetConnections();

foreach (var conn in connections)
{
    if (conn.SslInfo != null)
    {
        Console.WriteLine($"Node: {conn.Node.Name}");
        Console.WriteLine($"  SSL Protocol: {conn.SslInfo.SslProtocol}");
        Console.WriteLine($"  Cipher Suite: {conn.SslInfo.NegotiatedCipherSuiteName}");
        Console.WriteLine($"  Target Host: {conn.SslInfo.TargetHostName}");
        Console.WriteLine($"  Mutually Authenticated: {conn.SslInfo.IsMutuallyAuthenticated}");

        var localCert = conn.SslInfo.LocalCertificate;
        var remoteCert = conn.SslInfo.RemoteCertificate;

        if (localCert != null)
        {
            Console.WriteLine($"  Local Certificate: {localCert.Subject}");
        }

        if (remoteCert != null)
        {
            Console.WriteLine($"  Remote Certificate: {remoteCert.Subject}");
            Console.WriteLine($"  Valid Until: {remoteCert.GetExpirationDateString()}");
        }
    }
    else
    {
        Console.WriteLine($"Node: {conn.Node.Name} (unencrypted)");
    }
}
```

### 클러스터 크기 모니터링 {#cluster-size-monitoring}

```csharp
public class ClusterMonitor
{
    private readonly IIgniteClient _client;
    private int _lastKnownSize;

    public ClusterMonitor(IIgniteClient client)
    {
        _client = client;
    }

    public async Task MonitorAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var nodes = await _client.GetClusterNodesAsync();
            var currentSize = nodes.Count;

            if (currentSize != _lastKnownSize)
            {
                if (_lastKnownSize > 0)
                {
                    if (currentSize > _lastKnownSize)
                    {
                        Console.WriteLine($"Cluster grew: {_lastKnownSize} -> {currentSize} nodes");
                    }
                    else
                    {
                        Console.WriteLine($"Cluster shrunk: {_lastKnownSize} -> {currentSize} nodes");
                    }
                }

                _lastKnownSize = currentSize;
            }

            await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);
        }
    }
}
```

### 노드 주소 파싱 {#node-address-parsing}

```csharp
var nodes = await client.GetClusterNodesAsync();

foreach (var node in nodes)
{
    var address = node.Address;

    if (address is IPEndPoint ipEndPoint)
    {
        Console.WriteLine($"Node: {node.Name}");
        Console.WriteLine($"  IP: {ipEndPoint.Address}");
        Console.WriteLine($"  Port: {ipEndPoint.Port}");
    }
    else if (address is DnsEndPoint dnsEndPoint)
    {
        Console.WriteLine($"Node: {node.Name}");
        Console.WriteLine($"  Host: {dnsEndPoint.Host}");
        Console.WriteLine($"  Port: {dnsEndPoint.Port}");
    }
}
```

## 참조 {#reference}

### IClusterNode 인터페이스 {#iclusternode-interface}

속성:

- **Id** - 노드 재시작 후 바뀌는 고유 노드 식별자(Guid)
- **Name** - 재시작 후에도 유지되는 일관된 노드 이름
- **Address** - 네트워크 엔드포인트(IPEndPoint 또는 DnsEndPoint)

노드 ID는 현재 노드 인스턴스에 고유하며 노드가 재시작되면 바뀝니다. 노드 이름은 재시작 후에도 일관되게 유지되며 노드의 안정적인 식별자 역할을 합니다.

### IConnectionInfo 인터페이스 {#iconnectioninfo-interface}

속성:

- **Node** - 이 연결이 대상으로 하는 클러스터 노드
- **SslInfo** - SSL 연결 세부 정보(SSL이 활성화되지 않은 경우 null)

연결 정보는 클러스터 노드에 대한 활성 클라이언트 연결을 나타냅니다. 클라이언트는 서로 다른 노드에 여러 연결을 동시에 유지할 수 있습니다.

### ISslInfo 인터페이스 {#isslinfo-interface}

속성:

- **SslProtocol** - SSL/TLS 프로토콜 버전(예: Tls12, Tls13)
- **NegotiatedCipherSuiteName** - 연결에 협상된 암호화 방식
- **TargetHostName** - 인증서 검증에 사용되는 서버 호스트 이름
- **IsMutuallyAuthenticated** - 클라이언트와 서버가 모두 인증되었는지 여부
- **LocalCertificate** - 클라이언트 인증서(제공된 경우)
- **RemoteCertificate** - 서버 인증서

SSL 정보는 IgniteClientConfiguration.SslStreamFactory로 SSL을 구성한 경우에만 제공됩니다. SSL이 활성화되지 않으면 IConnectionInfo.SslInfo는 null을 반환합니다.

### IIgniteClient 메서드 {#iigniteclient-methods}

노드 검색:

- **GetClusterNodesAsync()** - 모든 클러스터 노드 조회

연결 확인:

- **GetConnections()** - 클러스터 노드에 대한 활성 클라이언트 연결 조회

### 모범 사례 {#best-practices}

**가능하면 노드 목록을 캐시하세요.** 클러스터 토폴로지는 자주 바뀌지 않으므로 GetClusterNodesAsync를 반복 호출할 필요가 없을 수 있습니다.

**안정적인 대상 지정에는 노드 이름을 사용하세요.** 노드 ID는 재시작 시 바뀌지만 노드 이름은 유지됩니다. 노드 재시작 후에도 일관된 대상 지정이 필요하다면 이름을 사용하세요.

**연결 수를 모니터링해 연결 문제를 감지하세요.** 활성 연결 수가 급격히 줄어들면 네트워크 문제나 노드 장애를 나타낼 수 있습니다.

**운영 환경에서는 SSL 구성을 확인하세요.** ISslInfo 속성을 점검해 SSL이 올바르게 구성되었는지 확인하고 연결이 암호화되는지 검증하세요.

**노드 변경에 유연하게 대응하세요.** 노드가 클러스터에 참여하거나 떠나면서 클러스터 토폴로지가 바뀔 수 있습니다. 수동 개입 없이도 토폴로지 변경에 적응하도록 애플리케이션을 설계하세요.

**진단에 연결 정보를 활용하세요.** 연결 세부 정보는 네트워크 문제, SSL 문제, 노드 간 부하 분산 문제를 해결하는 데 도움이 됩니다.
