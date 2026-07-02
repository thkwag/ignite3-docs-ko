---
title: Compute API
id: compute-api
sidebar_position: 5
---

# Compute API

Compute API는 클러스터 노드 전반에서 분산 컴퓨트 작업을 실행합니다. 단일 노드 실행, 다중 노드 실행, 콜로케이션 실행, 브로드캐스트 패턴을 지원합니다.

## 핵심 개념 {#key-concepts}

### 작업 실행 모델 {#job-execution-model}

작업은 클러스터 노드에 배포된 Java 클래스입니다. C++ 클라이언트는 바이너리 인수와 함께 작업 실행 요청을 제출합니다. 서버는 작업을 실행하고 결과를 바이너리 객체(binary object)로 반환합니다.

### 작업 대상 지정 {#job-targeting}

작업은 대상 지정 전략에 따라 특정 노드에서 실행됩니다:

- **단일 노드** - 특정 노드 하나에서 실행
- **임의 노드** - 집합에 속한 아무 노드에서 실행
- **콜로케이션** - 테이블 파티션 데이터가 있는 노드에서 실행
- **브로드캐스트** - 집합에 속한 모든 노드에서 실행

### 작업 디스크립터 {#job-descriptors}

작업 디스크립터(job descriptor)는 작업 클래스 이름, 배포 단위, 실행 옵션을 지정합니다. 배포 단위는 클러스터에서 코드가 있는 위치를 나타냅니다. 실행 옵션은 우선순위와 그 밖의 런타임 매개변수를 구성합니다.

### 실행 핸들 {#execution-handles}

작업을 제출하면 실행 핸들이 반환됩니다. 핸들은 작업 모니터링, 결과 조회, 우선순위 변경, 취소 기능을 제공합니다. 결과는 작업이 완료된 뒤에 사용할 수 있습니다.

### 브로드캐스트 실행 {#broadcast-execution}

브로드캐스트는 하나의 작업을 여러 노드에 제출합니다. 각 노드의 개별 실행 핸들을 담은 브로드캐스트 실행 핸들을 반환합니다.

## 기본 사용법 {#basic-usage}

### 클러스터 노드 가져오기 {#getting-cluster-nodes}

클러스터 토폴로지를 조회합니다:

```cpp
using namespace ignite;

auto nodes = client.get_cluster_nodes();

for (const auto& node : nodes) {
    std::cout << "Node: " << node.get_name() << std::endl;
    std::cout << "ID: " << node.get_id() << std::endl;
    std::cout << "Address: " << node.get_address().host
              << ":" << node.get_address().port << std::endl;
}
```

### 작업 제출 {#submitting-jobs}

임의 노드에 작업을 제출합니다:

```cpp
auto compute = client.get_compute();
auto nodes = client.get_cluster_nodes();

auto descriptor = job_descriptor::builder("com.example.MyJob").build();
auto target = job_target::any_node(nodes);

binary_object arg;  // Job argument
auto execution = compute.submit(target, descriptor, arg);

auto result = execution.get_result();
if (result.has_value()) {
    // Process result
}
```

### 비동기 제출 {#async-submission}

블로킹 없이 제출합니다:

```cpp
compute.submit_async(target, descriptor, arg,
    [](ignite_result<job_execution> result) {
        if (!result.has_error()) {
            auto execution = std::move(result).value();
            // Use execution handle
        }
    });
```

## 작업 대상 {#job-targets}

### 단일 노드 대상 {#single-node-target}

특정 노드에서 실행합니다:

```cpp
auto nodes = client.get_cluster_nodes();
auto target_node = nodes[0];

auto target = job_target::node(target_node);
auto execution = compute.submit(target, descriptor, arg);
```

### 임의 노드 대상 {#any-node-target}

집합에 속한 아무 노드에서 실행합니다:

```cpp
auto nodes = client.get_cluster_nodes();
auto target = job_target::any_node(nodes);

auto execution = compute.submit(target, descriptor, arg);
```

벡터로 생성합니다:

```cpp
std::vector<cluster_node> node_list = {node1, node2, node3};
auto target = job_target::any_node(node_list);
```

집합으로 생성합니다:

```cpp
std::set<cluster_node> node_set = {node1, node2, node3};
auto target = job_target::any_node(node_set);
```

### 콜로케이션 대상 {#colocated-target}

테이블 데이터가 있는 노드에서 실행합니다:

```cpp
ignite_tuple key{{"id", 42}};
auto target = job_target::colocated("accounts", key);

auto execution = compute.submit(target, descriptor, arg);
```

정규화된 테이블 이름을 사용합니다:

```cpp
qualified_name table_name = qualified_name::parse("my_schema.accounts");
auto target = job_target::colocated(table_name, key);
```

콜로케이션 실행은 데이터가 있는 위치에서 컴퓨트 작업을 실행해 네트워크 부하를 최소화합니다.

## 작업 디스크립터 {#job-descriptors-1}

### 디스크립터 만들기 {#building-descriptors}

기본 디스크립터를 생성합니다:

```cpp
auto descriptor = job_descriptor::builder("com.example.MyJob").build();
```

배포 단위를 추가합니다:

```cpp
std::vector<deployment_unit> units{
    {"my-app", "1.0.0"},
    {"my-lib", "2.1.0"}
};

auto descriptor = job_descriptor::builder("com.example.MyJob")
    .deployment_units(units)
    .build();
```

실행 옵션을 추가합니다:

```cpp
job_execution_options opts;
opts.priority(10);

auto descriptor = job_descriptor::builder("com.example.MyJob")
    .execution_options(opts)
    .build();
```

### 디스크립터 구성 요소 {#descriptor-components}

**작업 클래스 이름** - 컴퓨트 작업 인터페이스를 구현하는 정규화된 Java 클래스 이름

**배포 단위** - 작업 코드와 의존성을 담은 배포 단위 목록

**실행 옵션** - 우선순위와 그 밖의 런타임 구성

## 작업 실행 {#job-execution}

### 실행 모니터링 {#monitoring-execution}

작업 상태를 확인합니다:

```cpp
auto execution = compute.submit(target, descriptor, arg);

auto state = execution.get_state();
if (state.has_value()) {
    // Examine state
}
```

상태를 비동기로 가져옵니다:

```cpp
execution.get_state_async([](ignite_result<std::optional<job_state>> result) {
    if (!result.has_error()) {
        auto state = std::move(result).value();
        if (state.has_value()) {
            // Examine state
        }
    }
});
```

작업이 실행 이력에서 만료되었으면 상태를 사용하지 못할 수 있습니다.

### 결과 조회 {#retrieving-results}

결과를 가져옵니다(완료될 때까지 블로킹):

```cpp
auto result = execution.get_result();

if (result.has_value()) {
    auto data = result.value();
    // Process binary object
}
```

결과를 비동기로 가져옵니다:

```cpp
execution.get_result_async([](ignite_result<std::optional<binary_object>> result) {
    if (!result.has_error()) {
        auto obj = std::move(result).value();
        if (obj.has_value()) {
            // Process result
        }
    }
});
```

### 실행 정보 {#execution-information}

실행 메타데이터에 접근합니다:

```cpp
auto job_id = execution.get_id();
auto node = execution.get_node();

std::cout << "Job ID: " << job_id << std::endl;
std::cout << "Executing on: " << node.get_name() << std::endl;
```

## 작업 제어 {#job-control}

### 작업 취소 {#cancelling-jobs}

실행 중인 작업을 취소합니다:

```cpp
auto execution = compute.submit(target, descriptor, arg);

auto result = execution.cancel();

switch (result) {
    case job_execution::operation_result::SUCCESS:
        std::cout << "Job cancelled" << std::endl;
        break;
    case job_execution::operation_result::INVALID_STATE:
        std::cout << "Job already completed" << std::endl;
        break;
    case job_execution::operation_result::NOT_FOUND:
        std::cout << "Job not found" << std::endl;
        break;
}
```

비동기로 취소합니다:

```cpp
execution.cancel_async([](ignite_result<job_execution::operation_result> result) {
    if (!result.has_error()) {
        auto status = result.value();
        // Check status
    }
});
```

### 우선순위 변경 {#changing-priority}

작업 실행 우선순위를 변경합니다:

```cpp
auto execution = compute.submit(target, descriptor, arg);

auto result = execution.change_priority(5);

if (result == job_execution::operation_result::SUCCESS) {
    std::cout << "Priority changed" << std::endl;
}
```

우선순위를 비동기로 변경합니다:

```cpp
execution.change_priority_async(5,
    [](ignite_result<job_execution::operation_result> result) {
        // Handle result
    });
```

우선순위 값이 높은 작업이 큐에서 우선순위가 낮은 작업보다 먼저 실행됩니다.

## 브로드캐스트 실행 {#broadcast-execution-1}

### 여러 노드에 브로드캐스트 {#broadcasting-to-multiple-nodes}

집합에 속한 모든 노드에서 실행합니다:

```cpp
auto nodes = client.get_cluster_nodes();
std::set<cluster_node> node_set(nodes.begin(), nodes.end());

auto target = broadcast_job_target::nodes(node_set);
auto broadcast = compute.submit_broadcast(target, descriptor, arg);
```

단일 노드에 브로드캐스트합니다:

```cpp
auto target = broadcast_job_target::node(specific_node);
auto broadcast = compute.submit_broadcast(target, descriptor, arg);
```

### 비동기 브로드캐스트 {#async-broadcast}

블로킹 없이 브로드캐스트를 제출합니다:

```cpp
compute.submit_broadcast_async(target, descriptor, arg,
    [](ignite_result<broadcast_execution> result) {
        if (!result.has_error()) {
            auto broadcast = std::move(result).value();
            // Use broadcast execution
        }
    });
```

### 브로드캐스트 결과 처리 {#processing-broadcast-results}

개별 실행에 접근합니다:

```cpp
auto broadcast = compute.submit_broadcast(target, descriptor, arg);
auto executions = broadcast.get_job_executions();

for (auto& exec_result : executions) {
    if (exec_result.has_value()) {
        auto execution = exec_result.value();
        auto result = execution.get_result();

        if (result.has_value()) {
            std::cout << "Node " << execution.get_node().get_name()
                      << " result: " << /* process result */ << std::endl;
        }
    }
}
```

브로드캐스트의 각 실행은 독립적으로 동작합니다. 각 실행 핸들에서 결과를 개별적으로 조회하세요.

## 바이너리 인수 {#binary-arguments}

### 기본 타입 인수 전달 {#passing-primitive-arguments}

작업은 binary_object 인수를 받습니다. 기본 타입 값을 감쌉니다:

```cpp
binary_object arg(42);  // Integer argument
auto execution = compute.submit(target, descriptor, arg);
```

### 복합 인수 전달 {#passing-complex-arguments}

직렬화된 데이터로 바이너리 객체를 생성합니다:

```cpp
// Serialize your data structure to bytes
std::vector<std::byte> data = serialize_my_data(my_object);
binary_object arg(data);

auto execution = compute.submit(target, descriptor, arg);
```

### 인수 없는 작업 {#no-argument-jobs}

인수가 없는 작업에는 빈 바이너리 객체를 전달합니다:

```cpp
binary_object empty_arg;
auto execution = compute.submit(target, descriptor, empty_arg);
```

## 오류 처리 {#error-handling}

### 작업 오류 처리 {#handling-job-errors}

작업 실행 오류는 클라이언트로 전파됩니다:

```cpp
try {
    auto result = execution.get_result();
    // Process result
} catch (const ignite_error& e) {
    std::cerr << "Job failed: " << e.what_str() << std::endl;
}
```

비동기 작업의 경우:

```cpp
execution.get_result_async([](ignite_result<std::optional<binary_object>> result) {
    if (result.has_error()) {
        std::cerr << "Error: " << result.error().what_str() << std::endl;
    } else {
        // Process result
    }
});
```

### 제출 오류 처리 {#handling-submission-errors}

제출 실패를 처리합니다:

```cpp
try {
    auto execution = compute.submit(target, descriptor, arg);
} catch (const ignite_error& e) {
    std::cerr << "Submission failed: " << e.what_str() << std::endl;
}
```

흔한 오류로는 배포 단위 누락, 잘못된 작업 클래스 이름, 네트워크 장애가 있습니다.

## 사용 사례 {#use-cases}

### 맵리듀스 패턴 {#map-reduce-pattern}

여러 노드에 작업을 제출하고 결과를 집계합니다:

```cpp
auto nodes = client.get_cluster_nodes();
std::vector<job_execution> executions;

// Map: Submit jobs to all nodes
for (const auto& node : nodes) {
    auto target = job_target::node(node);
    executions.push_back(compute.submit(target, map_job, arg));
}

// Reduce: Collect and aggregate results
std::vector<binary_object> results;
for (auto& execution : executions) {
    auto result = execution.get_result();
    if (result.has_value()) {
        results.push_back(result.value());
    }
}

auto final_result = reduce(results);
```

### 콜로케이션 처리 {#colocated-processing}

데이터가 있는 위치에서 데이터를 처리합니다:

```cpp
// Execute compute job on the node containing this key
ignite_tuple key{{"customer_id", 12345}};
auto target = job_target::colocated("orders", key);

auto descriptor = job_descriptor::builder("com.example.OrderProcessor").build();
auto execution = compute.submit(target, descriptor, arg);

auto result = execution.get_result();
```

### 일괄 작업 제출 {#batch-job-submission}

여러 작업을 병렬로 제출합니다:

```cpp
std::vector<job_execution> executions;

for (const auto& work_item : work_items) {
    auto execution = compute.submit(target, descriptor, work_item);
    executions.push_back(std::move(execution));
}

// Wait for all to complete
for (auto& execution : executions) {
    execution.get_result();
}
```

## 참조 {#reference}

- [C++ API 문서](https://ignite.apache.org/releases/ignite3/cppdoc/)
- [컴퓨트 개념](../../../develop/work-with-data/compute)
- [Client API](./client-api)
- [Network API](./network-api)
