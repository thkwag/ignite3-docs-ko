---
title: Network API
id: network-api
sidebar_position: 6
---

# Network API

Network API는 클러스터 토폴로지 정보에 접근할 수 있게 합니다. 컴퓨트 작업 대상 지정과 클러스터 모니터링에 사용하는 클러스터 노드 메타데이터를 노출합니다.

## 핵심 개념 {#key-concepts}

### 클러스터 노드 {#cluster-nodes}

클러스터 노드는 Ignite 클러스터의 개별 서버 인스턴스를 나타냅니다. 각 노드에는 고유 식별자, 안정적인 이름, 네트워크 주소 정보가 있습니다.

### 노드 식별 {#node-identity}

노드에는 두 가지 식별 방식이 있습니다:

- **노드 ID** - 노드가 재시작하면 바뀌는 UUID
- **노드 이름** - 재시작해도 유지되는 안정적인 문자열 이름

안정적인 참조에는 노드 이름을 사용하세요. 런타임 식별에는 노드 ID를 사용하세요.

### 네트워크 주소 {#network-addresses}

각 노드는 호스트와 포트 정보를 담은 네트워크 엔드포인트를 노출합니다. 클라이언트는 이 주소로 작업에 필요한 연결을 수립합니다.

## 클러스터 노드 {#cluster-node}

### 노드 속성 {#node-properties}

클러스터 노드는 세 가지 주요 속성을 제공합니다:

```cpp
using namespace ignite;

auto nodes = client.get_cluster_nodes();
for (const auto& node : nodes) {
    // Unique ID (changes on restart)
    uuid id = node.get_id();

    // Stable name (persists across restarts)
    std::string name = node.get_name();

    // Network address
    end_point address = node.get_address();
}
```

### 노드 정보 접근 {#accessing-node-information}

노드 ID를 가져옵니다:

```cpp
uuid node_id = node.get_id();
std::cout << "Node ID: " << node_id << std::endl;
```

노드 이름을 가져옵니다:

```cpp
std::string node_name = node.get_name();
std::cout << "Node: " << node_name << std::endl;
```

네트워크 주소를 가져옵니다:

```cpp
end_point addr = node.get_address();
std::cout << "Host: " << addr.host << std::endl;
std::cout << "Port: " << addr.port << std::endl;
```

### 노드 비교 {#node-comparison}

클러스터 노드는 완전한 비교를 지원합니다:

```cpp
cluster_node node1 = nodes[0];
cluster_node node2 = nodes[1];

if (node1 == node2) {
    std::cout << "Same node" << std::endl;
}

if (node1 < node2) {
    std::cout << "node1 sorts before node2" << std::endl;
}
```

비교를 사용하면 정렬과 집합 연산을 수행할 수 있습니다:

```cpp
// Sort nodes by name
std::sort(nodes.begin(), nodes.end(),
    [](const auto& n1, const auto& n2) {
        return n1.get_name() < n2.get_name();
    });

// Create a set of nodes
std::set<cluster_node> node_set(nodes.begin(), nodes.end());
```

## 클러스터 노드 조회 {#retrieving-cluster-nodes}

### 동기 조회 {#synchronous-retrieval}

모든 클러스터 노드를 가져옵니다:

```cpp
auto nodes = client.get_cluster_nodes();

std::cout << "Cluster has " << nodes.size() << " nodes" << std::endl;

for (const auto& node : nodes) {
    std::cout << node.get_name() << " at "
              << node.get_address().host << ":"
              << node.get_address().port << std::endl;
}
```

### 비동기 조회 {#asynchronous-retrieval}

블로킹 없이 노드를 가져옵니다:

```cpp
client.get_cluster_nodes_async([](ignite_result<std::vector<cluster_node>> result) {
    if (!result.has_error()) {
        auto nodes = std::move(result).value();
        std::cout << "Found " << nodes.size() << " nodes" << std::endl;
    } else {
        std::cerr << "Error: " << result.error().what_str() << std::endl;
    }
});
```

## 사용 사례 {#use-cases}

### 컴퓨트를 위한 노드 선택 {#node-selection-for-compute}

작업 실행에 사용할 특정 노드를 선택합니다:

```cpp
auto nodes = client.get_cluster_nodes();

// Execute on first node
if (!nodes.empty()) {
    auto target = job_target::node(nodes[0]);
    auto execution = client.get_compute().submit(target, descriptor, arg);
}

// Execute on any node
auto target = job_target::any_node(nodes);
auto execution = client.get_compute().submit(target, descriptor, arg);
```

### 특정 노드 찾기 {#finding-specific-nodes}

이름으로 노드를 찾습니다:

```cpp
auto nodes = client.get_cluster_nodes();

auto it = std::find_if(nodes.begin(), nodes.end(),
    [](const auto& node) {
        return node.get_name() == "my-node-01";
    });

if (it != nodes.end()) {
    cluster_node target_node = *it;
    // Use node
}
```

### 클러스터 모니터링 {#cluster-monitoring}

클러스터 크기를 모니터링합니다:

```cpp
auto nodes = client.get_cluster_nodes();
size_t cluster_size = nodes.size();

if (cluster_size < 3) {
    std::cerr << "Warning: Cluster has only " << cluster_size << " nodes" << std::endl;
}
```

노드 주소를 추적합니다:

```cpp
std::map<std::string, end_point> node_map;

for (const auto& node : nodes) {
    node_map[node.get_name()] = node.get_address();
}

// Check if specific node is available
if (node_map.find("my-node-01") != node_map.end()) {
    std::cout << "Node my-node-01 is online" << std::endl;
}
```

### 모든 노드에 브로드캐스트 {#broadcasting-to-all-nodes}

모든 클러스터 노드에서 작업을 실행합니다:

```cpp
auto nodes = client.get_cluster_nodes();
std::set<cluster_node> node_set(nodes.begin(), nodes.end());

auto target = broadcast_job_target::nodes(node_set);
auto broadcast = client.get_compute().submit_broadcast(target, descriptor, arg);

auto executions = broadcast.get_job_executions();
std::cout << "Broadcast to " << executions.size() << " nodes" << std::endl;
```

### 노드 필터링 {#node-filtering}

기준에 따라 노드를 필터링합니다:

```cpp
auto nodes = client.get_cluster_nodes();

// Get nodes on specific host
std::vector<cluster_node> local_nodes;
std::copy_if(nodes.begin(), nodes.end(), std::back_inserter(local_nodes),
    [](const auto& node) {
        return node.get_address().host == "192.168.1.100";
    });

// Get nodes in port range
std::vector<cluster_node> dev_nodes;
std::copy_if(nodes.begin(), nodes.end(), std::back_inserter(dev_nodes),
    [](const auto& node) {
        return node.get_address().port >= 10800 && node.get_address().port < 10900;
    });
```

### 라운드 로빈 선택 {#round-robin-selection}

노드 전반에 작업을 분산합니다:

```cpp
auto nodes = client.get_cluster_nodes();
size_t current_index = 0;

for (const auto& task : tasks) {
    auto target = job_target::node(nodes[current_index]);
    compute.submit(target, descriptor, task);

    current_index = (current_index + 1) % nodes.size();
}
```

## 노드 라이프사이클 {#node-lifecycle}

### 노드 재시작의 영향 {#node-restart-impact}

노드가 재시작하면:

- 노드 ID가 새 UUID로 바뀝니다
- 노드 이름은 그대로 유지됩니다
- 네트워크 주소는 대개 그대로 유지됩니다

재시작 전후로 안정적으로 노드를 참조하려면 노드 이름을 사용하세요.

### 토폴로지 변경 {#topology-changes}

클러스터 토폴로지는 호출 사이에 바뀔 수 있습니다:

```cpp
// Initial topology
auto nodes1 = client.get_cluster_nodes();
size_t size1 = nodes1.size();

// Topology may change
std::this_thread::sleep_for(std::chrono::seconds(10));

// Updated topology
auto nodes2 = client.get_cluster_nodes();
size_t size2 = nodes2.size();

if (size2 != size1) {
    std::cout << "Topology changed: "
              << size1 << " -> " << size2 << " nodes" << std::endl;
}
```

노드별 작업을 수행하기 전에 항상 최신 토폴로지 정보를 조회하세요.

## 오류 처리 {#error-handling}

### 네트워크 오류 {#network-errors}

연결 실패를 처리합니다:

```cpp
try {
    auto nodes = client.get_cluster_nodes();
} catch (const ignite_error& e) {
    std::cerr << "Failed to get cluster nodes: " << e.what_str() << std::endl;
}
```

비동기 작업의 경우:

```cpp
client.get_cluster_nodes_async([](ignite_result<std::vector<cluster_node>> result) {
    if (result.has_error()) {
        std::cerr << "Error: " << result.error().what_str() << std::endl;
    } else {
        auto nodes = std::move(result).value();
        // Use nodes
    }
});
```

### 빈 토폴로지 {#empty-topology}

빈 클러스터인지 확인합니다:

```cpp
auto nodes = client.get_cluster_nodes();

if (nodes.empty()) {
    std::cerr << "Warning: No nodes available in cluster" << std::endl;
} else {
    // Proceed with operations
}
```

## Compute API 연동 {#integration-with-compute-api}

### 작업 대상 지정 {#job-targeting}

컴퓨트 대상 지정에 토폴로지 정보를 사용합니다:

```cpp
auto nodes = client.get_cluster_nodes();

// Target specific node
auto target = job_target::node(nodes[0]);

// Target any node from set
auto target = job_target::any_node(nodes);

// Broadcast to all nodes
std::set<cluster_node> node_set(nodes.begin(), nodes.end());
auto broadcast_target = broadcast_job_target::nodes(node_set);
```

### 노드 어피니티 {#node-affinity}

어피니티에 따라 노드를 선택합니다:

```cpp
auto nodes = client.get_cluster_nodes();

// Find preferred nodes (example: local datacenter)
std::vector<cluster_node> preferred_nodes;
std::copy_if(nodes.begin(), nodes.end(), std::back_inserter(preferred_nodes),
    [](const auto& node) {
        return node.get_address().host.find("dc1") != std::string::npos;
    });

// Use preferred nodes for execution
if (!preferred_nodes.empty()) {
    auto target = job_target::any_node(preferred_nodes);
    compute.submit(target, descriptor, arg);
}
```

## 모범 사례 {#best-practices}

### 토폴로지 정보 캐싱 {#cache-topology-information}

수명이 짧은 작업에는 노드 정보를 캐싱합니다:

```cpp
class compute_scheduler {
    std::vector<cluster_node> nodes_;
    std::chrono::steady_clock::time_point last_refresh_;
    std::chrono::seconds refresh_interval_{30};

public:
    void maybe_refresh_topology(ignite_client& client) {
        auto now = std::chrono::steady_clock::now();
        if (now - last_refresh_ > refresh_interval_) {
            nodes_ = client.get_cluster_nodes();
            last_refresh_ = now;
        }
    }

    std::vector<cluster_node> get_nodes() const {
        return nodes_;
    }
};
```

### 안정적인 참조 사용 {#use-stable-references}

영구적인 참조에는 노드 ID보다 노드 이름을 사용하세요:

```cpp
// Good: Use node name
std::string target_node_name = "my-node-01";
auto nodes = client.get_cluster_nodes();
auto it = std::find_if(nodes.begin(), nodes.end(),
    [&](const auto& n) { return n.get_name() == target_node_name; });

// Avoid: Using node ID (changes on restart)
uuid target_node_id = saved_id;  // May be stale after restart
```

### 동적 토폴로지 처리 {#handle-dynamic-topology}

노드의 합류와 이탈을 고려합니다:

```cpp
void execute_with_fallback(ignite_client& client,
                           std::shared_ptr<job_descriptor> descriptor,
                           const binary_object& arg) {
    auto nodes = client.get_cluster_nodes();

    if (nodes.empty()) {
        throw ignite_error("No nodes available");
    }

    // Try first node
    try {
        auto target = job_target::node(nodes[0]);
        compute.submit(target, descriptor, arg);
    } catch (const ignite_error& e) {
        // Fallback to any available node
        auto target = job_target::any_node(nodes);
        compute.submit(target, descriptor, arg);
    }
}
```

## 참조 {#reference}

- [C++ API 문서](https://ignite.apache.org/releases/ignite3/cppdoc/)
- [Compute API](./compute-api)
- [Client API](./client-api)
