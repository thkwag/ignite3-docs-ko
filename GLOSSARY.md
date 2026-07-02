# Apache Ignite 3 한국어 번역 용어사전

이 파일은 `docs/` 번역의 용어·표기 표준이다. 번역·검수·수정 작업은 반드시 이 파일을 먼저 읽고 진행한다.

- 표의 형식(열 구성·헤더)은 `scripts/check-glossary.mjs`가 파싱하므로 임의로 바꾸지 않는다.
- `금지 표기` 열과 `금지 표현` 표의 `금지` 열은 감사 스크립트가 검사한다. 항목은 `,`로 구분한다. `/pattern/` 형태는 정규식(lookahead 등 사용 가능), 그 외는 리터럴이다. 셀 안에 `|` 문자를 쓰지 않는다(정규식 alternation 대신 항목 분리 또는 문자 클래스 사용).
- `금지 표현`의 `수준` 열: `오류`는 발견 즉시 위반(감사 실패), `경고`는 검토 대상, `경고(N+)`는 한 문서에서 N회 이상일 때만 보고한다.
- 표준 번역을 변경하거나 금지 표기를 추가했다면, 같은 세션에서 번역 완료 문서 전체를 전수조사(`npm run check:glossary` + 구표기 검색)해 일괄 수정한다.

## 용어 대역표

번역 시 아래 표준 번역을 사용한다. 주요 개념어는 문서별 첫 등장 시 `한국어(English)` 형태로 병기하고, 이후에는 한국어만 쓴다.

| 영어 | 한국어 | 금지 표기 | 비고 |
| ---- | ------ | --------- | ---- |
| cluster | 클러스터 | | |
| node | 노드 | | |
| table | 테이블 | | |
| transaction | 트랜잭션 | 트랜젝션 | |
| partition | 파티션 | | partitioning(동명사)은 "파티셔닝" |
| partitioning | 파티셔닝 | | |
| replica | 복제본 | 레플리카, 리플리카 | |
| primary replica | 프라이머리 복제본 | 주 복제본, 기본 복제본 | |
| replication | 복제 | 레플리케이션 | |
| replication factor | 복제 계수 | 복제 팩터, 리플리케이션 팩터, 복제 인수 | 분산 영역의 복제본 수 |
| rebalancing | 리밸런싱 | 재균형, 리밸런스 | data rebalance → 데이터 리밸런싱 |
| scale-up | 확장 | 스케일 업, 스케일업 | 분산 영역에 노드가 추가될 때의 자동 조정 동작. `DATA_NODES_AUTO_ADJUST_SCALE_UP` 등 코드 요소는 원문 유지 |
| scale-down | 축소 | 스케일 다운, 스케일다운 | 분산 영역에서 노드가 제거될 때의 자동 조정 동작. `DATA_NODES_AUTO_ADJUST_SCALE_DOWN` 등 코드 요소는 원문 유지 |
| distribution zone | 분산 영역 | 배포 영역, 분산 존, 배포 존 | 첫 등장 시 "분산 영역(distribution zone)" 병기. SQL의 `ZONE` 등 코드 요소는 원문 유지 |
| colocation | 콜로케이션 | 코로케이션, 코-로케이션, 동일 배치 | 데이터 콜로케이션. 동사 맥락은 "함께 배치" 허용 |
| lease | 리스 | 임대, 임차 | |
| leaseholder | 리스홀더 | 리스 소유자, 임차인 | |
| placement driver | 배치 드라이버 | 플레이스먼트 드라이버, 배포 드라이버 | 프라이머리 복제본·리스 배치를 관리하는 컴포넌트 |
| quorum | 정족수 | 쿼럼 | RAFT 그룹에서 업데이트에 필요한 최소 투표 수 |
| consensus | 합의 | 컨센서스, 콘센서스 | RAFT 합의. consensus group → 합의 그룹 |
| peer | 피어 | 피어들, 동료 | RAFT 합의 그룹에서 투표에 참여하는 복제본 역할. learner와 대비되는 역할 |
| learner | 러너 | 학습자 | 데이터를 수동 수신만 하고 선출에 참여하지 않는 복제본 역할 |
| metastorage | 메타스토리지 | 메타 스토리지, 메타저장소 | 클러스터 메타데이터를 저장하는 컴포넌트. 코드 `Metastorage`·설정 키는 원문 유지 |
| storage engine | 스토리지 엔진 | 저장소 엔진, 저장 엔진 | |
| storage profile | 스토리지 프로파일 | 스토리지 프로필, 저장소 프로파일 | |
| data region | 데이터 영역 | 데이터 리전 | |
| compute job | 컴퓨트 작업 | 계산 작업, 컴퓨트 잡 | Compute API 등 API 명칭은 원문 유지 |
| coordinator node | 코디네이터 노드 | 조정자 노드 | |
| deployment unit | 배포 단위 | 배포 유닛 | |
| data streamer | 데이터 스트리머 | | |
| streaming | 스트리밍 | | |
| key-value | 키-값 | 키-밸류, 키밸류 | |
| record view | 레코드 뷰 | | |
| key-value view | 키-값 뷰 | | |
| system view | 시스템 뷰 | 시스템 view | |
| metric | 메트릭 | 매트릭, 지표 | |
| snapshot | 스냅샷 | 스넵샷 | |
| checkpoint | 체크포인트 | 검사점 | |
| thin client | 씬 클라이언트 | 신 클라이언트, 얇은 클라이언트 | |
| thick client | 씩 클라이언트 | 두꺼운 클라이언트, 시크 클라이언트 | Ignite 2 마이그레이션 맥락 |
| binary object | 바이너리 객체 | 바이너리 오브젝트, 이진 객체 | Ignite 2 데이터 형식 |
| baseline topology | 베이스라인 토폴로지 | 기준 토폴로지, 베이스라인 위상 | Ignite 2 마이그레이션 맥락 |
| affinity | 어피니티 | 친화도, 선호도 | affinity function → 어피니티 함수 |
| rendezvous hashing | 랑데부 해싱 | 랑데뷰 해싱, 랑데부 해시, 랑데부 해쉬 | 결정적 파티션 배치 알고리즘 |
| leader | 리더 | 지도자 | RAFT·복제 그룹 맥락 |
| follower | 팔로워 | 추종자, 팔로어 | RAFT·복제 그룹 맥락 |
| predicate | 조건자 | 술어, 프레디킷 | |
| partitioned | 파티셔닝된 | 파티션된 | |
| configuration | 구성 | | settings는 "설정", configure(동사)는 "구성하다" |
| command | 명령어 | 커맨드 | CLI 명령어 |
| low latency | 낮은 지연 | 저레이턴시 | |
| client connector | 클라이언트 커넥터 | | |
| embedded mode | 임베디드 모드 | 내장 모드 | |
| logical topology | 논리 토폴로지 | 논리 위상 | |
| physical topology | 물리 토폴로지 | 물리 위상 | |
| topology | 토폴로지 | 위상 | 단독 topology도 "토폴로지". 논리/물리 topology는 별도 항목 |
| failover | 장애 조치 | 페일오버, 절체 | |
| disaster recovery | 재해 복구 | 재난 복구 | |
| network segmentation | 네트워크 분할 | 네트워크 세그멘테이션, 네트워크 분리 | 클러스터가 네트워크로 갈라지는 상황(스플릿 브레인) |
| fault tolerance | 장애 허용성 | 내결함성, 결함 허용성 | 여러 노드에 복제해 장애에 대응하는 능력 |
| high availability | 고가용성 | | 비교급 "더 높은 가용성"(higher availability)은 별개 표현 |
| consistency | 일관성 | 정합성 | |
| strong consistency | 강한 일관성 | 강력한 일관성 | |
| serializable isolation | 직렬화 가능 격리 | 직렬성 격리, 시리얼라이저블 격리, 직렬화 격리 | 격리 수준(isolation level) |
| snapshot isolation | 스냅샷 격리 | 스냅샷 아이솔레이션, 스냅숏 격리 | 격리 수준(isolation level) |
| durability | 내구성 | | |
| persistence | 영속성 | 지속성 | persistent storage → 영속 스토리지 |
| in-memory | 인메모리 | /(?<![가-힣])인 메모리/, 메모리 내 | 서술격 "~인 메모리"와 구분하기 위한 정규식 |
| schema | 스키마 | | |
| schema evolution | 스키마 진화 | 스키마 에볼루션, 스키마 변화 | 스키마가 시간에 따라 바뀌는 것을 가리키는 개념어. Ignite 3는 추가 전용(append-only) 버전 관리로 구현한다 |
| catalog | 카탈로그 | 카달로그 | |
| query | 쿼리 | 질의 | |
| SQL statement | SQL 문 | SQL 구문, SQL 스테이트먼트 | "구문"은 syntax 번역에 예약 |
| data definition language | 데이터 정의어 | 데이터 정의 언어, 데이터 정의언어 | DDL의 정식 명칭. 약어 DDL은 원문 유지 |
| keyword | 키워드 | | DDL/DML 등 SQL 참조 문서의 "Keywords and parameters" 섹션에 반복 등장 |
| parameter | 매개변수 | 파라미터 | SQL 참조 문서의 "Keywords and parameters" 섹션 |
| data type | 데이터 타입 | 자료형, 데이타 타입 | |
| transition | 전환 | 트랜지션 | ALTER COLUMN의 데이터 타입·NULL 허용 여부 전환 맥락. "변환"은 일반 명사라 오탐 위험이 있어 금지 표기에서 제외(검수로 관리) |
| example | 예시 | 예제 | "Examples:" 섹션 제목 |
| execution plan | 실행 계획 | 수행 계획 | |
| index | 인덱스 | 색인 | |
| primary key | 기본 키 | 주 키, 프라이머리 키 | |
| collation | 콜레이션 | 콜라레이션, 컬레이션 | 정렬 기본 키·인덱스의 정렬 규칙을 가리키는 SQL 개념어 |
| nullable | NULL 허용 | 널러블, 눌러블 | non-nullable은 "NULL을 허용하지 않음"으로 옮긴다 |
| column | 컬럼 | | "열"은 감사 불가(오탐)이므로 검수로 관리 |
| precision | 정밀도 | | 숫자·시간 타입의 자릿수. DECIMAL(precision, scale) 등에 쓰인다 |
| scale | 스케일 | | DECIMAL 타입의 소수 자릿수. precision과 함께 쓰인다. scale-up/scale-down(확장/축소)과는 별개 |
| row | 행 | 로우 | |
| default value | 기본값 | 디폴트 값, 디폴트값 | |
| cache | 캐시 | 캐쉬 | |
| lock | 락 | 잠금 | |
| deadlock | 데드락 | 교착 상태, 교착상태 | |
| endpoint | 엔드포인트 | 종단점, 엔드 포인트 | |
| connection | 연결 | 커넥션 | connection pool → 연결 풀 |
| directory | 디렉터리 | 디렉토리 | 외래어 표기법 준수 |
| repository | 저장소 | 리포지토리, 레포지토리 | git 저장소 맥락 |
| release | 릴리스 | 릴리즈 | |
| license | 라이선스 | 라이센스 | |
| message | 메시지 | 메세지 | |
| application | 애플리케이션 | 어플리케이션 | |
| operating system | 운영 체제 | 운영체제 | 표준 띄어쓰기 |
| architecture | 아키텍처 | 아키텍쳐 | |
| interface | 인터페이스 | 인터훼이스 | |
| best practices | 모범 사례 | 베스트 프랙티스 | |
| prerequisites | 사전 요구 사항 | 전제 조건, 선행 조건, 사전 준비 사항 | 섹션 제목 관례 |
| getting started | 시작하기 | | 섹션 제목 관례 |
| overview | 개요 | | 섹션 제목 관례 |
| next steps | 다음 단계 | | 섹션 제목 관례 |
| concurrency control | 동시성 제어 | 병행 제어, 동시성 컨트롤 | MVCC = 다중 버전 동시성 제어 |
| two-phase locking | 2단계 락킹 | 2단계 잠금, 이단계 잠금, 투페이즈 락킹 | 첫 등장 시 "2단계 락킹(two-phase locking, 2PL)" 병기. lock은 "락" |
| growing phase | 확장 단계 | 성장 단계 | 2PL 단계 |
| shrinking phase | 수축 단계 | 축소 단계, 감소 단계 | 2PL 단계 |
| two-phase commit | 2단계 커밋 | 이단계 커밋, 투페이즈 커밋 | 첫 등장 시 "2단계 커밋(two-phase commit, 2PC)" 병기 |
| version chain | 버전 체인 | 버전 사슬, 버전 연쇄 | MVCC 버전 저장 구조 |
| write intent | 쓰기 인텐트 | 쓰기 의도, 라이트 인텐트 | 커밋 전 변경을 나타내는 마커 |
| hybrid logical clock | 하이브리드 논리 시계 | 혼합 논리 시계, 하이브리드 로지컬 클록 | 첫 등장 시 "하이브리드 논리 시계(hybrid logical clock, HLC)" 병기 |
| hybrid timestamp | 하이브리드 타임스탬프 | 혼합 타임스탬프 | HLC가 생성하는 타임스탬프 |
| timestamp | 타임스탬프 | 타임스템프, 타임 스탬프, 시각소인 | commit/read timestamp = 커밋/읽기 타임스탬프 |
| commit | 커밋 | 커밋트, 컴밋 | 동사·명사 모두. commit()은 코드로 원문 유지 |
| rollback | 롤백 | 롤 백 | rollback()은 코드로 원문 유지 |
| read-only | 읽기 전용 | 읽기전용, 리드온리, 읽기 온리 | read-only transaction = 읽기 전용 트랜잭션 |
| read-write | 읽기-쓰기 | 읽기쓰기, 리드라이트 | read-write transaction = 읽기-쓰기 트랜잭션 |
| commit partition | 커밋 파티션 | 확정 파티션 | 트랜잭션 상태를 저장하는 파티션 |
| low watermark | 하한 워터마크 | 낮은 워터마크, 저수위, 로우 워터마크 | 이보다 오래된 버전을 GC로 제거. row와 겹치는 "로우" 음차 금지 |
| garbage collection | 가비지 컬렉션 | 쓰레기 수집, 가비지 콜렉션 | garbage collector = 가비지 컬렉터. 약어 GC는 원문 유지 |
| tombstone | 툼스톤 | 묘비 | 삭제를 나타내는 빈 버전 |
| savepoint | 세이브포인트 | 저장점, 세이브 포인트 | 부분 롤백 지점 |
| B+ tree | B+ 트리 | B+트리, B플러스 트리, B 플러스 트리 | 데이터 구조명. mermaid 다이어그램 내 라벨은 원문 유지 |
| LSM tree | LSM 트리 | LSM트리, 엘에스엠 트리 | Log-Structured Merge 트리. 첫 등장 시 "Log-Structured Merge(LSM) 트리" |
| write-ahead log | 미리 쓰기 로그 | 라이트 어헤드 로그, 선행 기입 로그, 선행 기록 로그, 쓰기 전 로그 | 첫 등장 시 "미리 쓰기 로그(write-ahead log, WAL)". 약어 WAL 병기 |
| append-only | 추가 전용 | 어펜드 온리 | 기존 데이터를 수정하지 않고 새 항목만 뒤에 추가하는 저장 방식 |
| dirty page | 더티 페이지 | 더러운 페이지, 오염 페이지 | 캐시에서 변경됐지만 아직 디스크에 기록되지 않은 페이지 |
| page cache | 페이지 캐시 | | 인메모리 페이지 캐시. cache는 캐시 |
| zero-copy | 제로카피 | 제로 카피, 무복사 | 데이터를 복사하지 않고 읽고 쓰는 최적화 기법 |
| off-heap memory | 오프힙 메모리 | 힙 외부 메모리, 오프 힙, 오프-힙 | JVM 힙 밖에 할당하는 메모리 |
| volatile | 휘발성 | | 스토리지 지속성 구분(휘발성 vs 영속). non-volatile는 비휘발성 |
| workload | 워크로드 | 작업 부하 | write-heavy workload → 쓰기 위주 워크로드 |
| transaction coordinator | 트랜잭션 코디네이터 | 트랜잭션 조정자, 트랜잭션 조율자 | 트랜잭션을 시작한 노드가 맡는 역할. coordinator node(코디네이터 노드)와는 별개 표기 |
| version storage | 버전 저장 | 버전 스토리지, 버전 저장소 | MVCC 버전 체인을 보관하는 영역. understand/core-concepts/data-partitioning.md의 "버전 저장" 절을 가리킨다 |
| lifecycle | 라이프사이클 | 생명 주기, 생애 주기 | 클러스터·트랜잭션 등의 생성부터 종료까지의 흐름 |
| provider | 공급자 | 프로바이더, 제공자 | 인증 공급자(authentication provider), ID 공급자(identity provider) 등 인증 방식을 제공하는 컴포넌트를 가리키는 개념어 |
| credential | 자격 증명 | 크리덴셜 | 사용자 인증에 쓰이는 비밀 정보(사용자 이름, 비밀번호 등) |
| authorization | 인가 | 권한 부여, 어쏘라이제이션 | authentication(인증)과 구분되는 접근 권한 판단 |
| role-based access control | 역할 기반 접근 제어 | 롤 기반 접근 제어, 역할기반 접근제어 | 첫 등장 시 "역할 기반 접근 제어(role-based access control, RBAC)" 병기. 약어 RBAC는 원문 유지 |
| keystore | 키스토어 | 키 스토어, 키스토아 | 서버 인증서를 저장하는 SSL/TLS 저장소. 코드 속성 `keyStore`는 원문 유지 |
| truststore | 트러스트스토어 | 트러스트 스토어, 트러스트스토아 | 신뢰할 CA 인증서를 저장하는 SSL/TLS 저장소. 코드 속성 `trustStore`는 원문 유지 |
| cipher | 암호화 방식 | 사이퍼, 싸이퍼 | TLS cipher 목록 등에서 사용하는 암호화 알고리즘을 가리키는 보안 용어 |
| mutual TLS | 상호 TLS | 뮤추얼 TLS, 뮤추얼티엘에스 | 첫 등장 시 "상호 TLS(mutual TLS, mTLS)" 병기. 약어 mTLS는 원문 유지 |
| transport encryption | 전송 암호화 | 트랜스포트 암호화 | 클라이언트-서버·노드 간 통신을 암호화하는 보안 계층. authentication(인증)과 대비되는 개념 |

## 원문 유지 용어

아래 용어는 번역·음차하지 않고 원문 그대로 둔다.

| 용어 | 비고 |
| ---- | ---- |
| Apache Ignite, Ignite | 제품명. "이그나이트" 음차 금지 |
| RAFT | 합의 프로토콜 명칭. "RAFT 그룹"처럼 조합 사용 |
| GridGain | 회사·제품명 |
| Docker, Kubernetes, Helm | 제품명 |
| JDBC, ODBC, REST, CLI, API, SQL, DDL, DML, MVCC, ACID, SSL/TLS, JVM, JDK, GC, 2PC, 2PL, HLC | 약어는 원문 유지 |
| Java, JavaScript, .NET, C++, Python, Spring Boot, Spring Data, LINQ | 언어·프레임워크명 |
| Windows, Linux, macOS | 운영 체제명 |
| RocksDB, aimem, aipersist | 스토리지 엔진 식별자 |
| Compute API, Table API, Key-Value API, Catalog API, Criteria API, Client API | API 고유 명칭. 일반 명사 맥락(예: "컴퓨트 작업")과 구분 |
| 코드 식별자·설정 키·CLI 명령·SQL 키워드 | `ignite3-db`, `CREATE ZONE`, `storageProfiles` 등 코드로 표기되는 모든 것 |

## 금지 표현

번역투·음차·오표기 패턴. 발견 즉시 대체 표현으로 수정한다. 용어별 오표기는 위 대역표의 `금지 표기` 열에서 관리하고, 이 표에는 용어에 속하지 않는 일반 패턴만 둔다.

번역투 항목 일부는 [im-not-ai(Humanize KR, MIT)](https://github.com/epoko77-ai/im-not-ai)와 [k-skill korean-humanizer](https://github.com/NomaDamas/k-skill)의 AI 흔적 분류 체계를 기술 문서 번역에 맞게 선별·조정한 것이다.

| 금지 | 대체 | 수준 | 비고 |
| ---- | ---- | ---- | ---- |
| /것을 허용/ | ~할 수 있습니다 | 오류 | "allows you to" 직역 |
| /것을 가능하게/ | ~할 수 있게 합니다 | 오류 | "enables" 직역 |
| /할 수 있게 해줍니다/ | ~할 수 있습니다 | 오류 | "lets you" 직역 |
| /에 대한 지원을 제공/ | ~를 지원합니다 | 오류 | "provides support for" 직역 |
| /되어[지집]/ | ~됩니다, ~될 | 오류 | 이중 피동("되어진다", "되어집니다" 모두) |
| /보여[지집]/ | 보인다, 보입니다 | 오류 | 이중 피동 |
| 당신 | (생략 또는 문맥 재구성) | 오류 | "you" 직역 |
| 여러분 | (생략) | 오류 | "you" 직역 |
| 우리는, 우리가, 저희 | (생략 또는 문맥 재구성) | 오류 | "we" 직역 |
| 소비 | 사용, 사용량 | 오류 | "consume/consumption" 직역 |
| 방출 | 내보내기, 발생 | 오류 | "emit" 직역 |
| 레버리지 | 활용 | 오류 | "leverage" 음차 |
| 엔티티들, 노드들, 테이블들, 파티션들, 클러스터들, 컬럼들, 서버들, 클라이언트들 | 복수 접미사 제거 | 오류 | 복수형 "-들" 남발 |
| 디폴트 | 기본값, 기본 | 오류 | "default" 음차 |
| 표면 | 문서 구성, 영역 등 문맥에 맞게 | 오류 | "surface" 직역 |
| 본질적으로 | (삭제 또는 구체 서술) | 오류 | "essentially" 직역 |
| 이그나이트 | Ignite | 오류 | 제품명 음차 금지("아파치 이그나이트" 포함) |
| 쿠버네티스 | Kubernetes | 오류 | 제품명 음차 금지 |
| /도커(?!파일)/ | Docker | 오류 | 제품명 음차 금지(도커파일 표기도 Dockerfile로) |
| 데이타 | 데이터 | 오류 | 오표기 |
| 윈도우즈 | Windows | 오류 | 제품명 원문 유지 |
| 리눅스 | Linux | 오류 | 제품명 원문 유지 |
| /자바(?!스크립트)/ | Java | 오류 | 언어명 원문 유지 |
| /(?<![가-힣])존[은을이의에과로]/ | 영역 | 오류 | zone 단독 음차 금지("각 존은" → "각 영역은"). 분산 영역 참조 |
| 자바스크립트 | JavaScript | 오류 | 언어명 원문 유지 |
| /에 있어서?/ | ~에서, ~할 때 | 경고 | "in terms of" 직역 |
| /가지고 있/ | ~가 있습니다, ~를 제공합니다 | 경고 | "have" 직역 |
| 그것 | (생략 또는 명사 반복) | 경고 | "it" 직역 |
| 에서의, 으로의, 에의 | 절·구로 풀어쓰기 | 경고 | 이중 조사 |
| 할 것입니다 | ~합니다 | 경고 | "will" 직역. 사실 서술은 현재형 |
| /[를을] 통해/ | ~로, ~해서 | 경고(4+) | "via/through" 직역 남발 |
| /에 대[해한]/ | 목적격 조사로 직결 | 경고(6+) | "about/for" 직역 남발 |
| 에 의해 | 행위자를 주어로 | 경고(3+) | 피동 직역 남발 |
| 또한 | (삭제 또는 문장 재구성) | 경고(4+) | "also/additionally" 남발 |
| 강력한 | 구체적 특성 서술 | 경고(3+) | "powerful" 직역 남발 |
| 수 있습니다 | 단언 가능하면 "~합니다" | 경고(10+) | "can" 남발. 기능 설명 자체는 허용 |

## 문체·표기 규칙

감사 스크립트가 잡지 못하는 규칙. 번역·검수 시 직접 확인한다.

- 본문은 합니다체, 독자 지시는 "~하세요"를 사용한다.
- 주어 you/we는 번역하지 않고 문장을 재구성한다.
- 명사 나열식 영어 어순을 그대로 옮기지 않고 자연스러운 한국어 어순으로 재구성한다.
- will/would의 "~할 것입니다"를 남발하지 않는다. 사실 서술은 현재형 "~합니다"로 쓴다.
- 코드 블록, 인라인 코드, 설정 키, CLI 명령, SQL 키워드, 파일 경로, URL은 번역하지 않는다. 코드 블록 안 주석도 영어로 유지한다.
- 마크다운 구조(제목 수준, 링크 경로, 앵커, 이미지 경로, front matter 키, MDX 컴포넌트·import 문)는 변경하지 않는다. front matter의 `title` 값과 링크 텍스트는 번역한다.
- 번역한 제목에는 원문 앵커를 명시한다: `## 버전 저장 {#version-storage}`. 제목 번역으로 자동 생성 앵커가 바뀌면 들어오는 링크가 깨진다.
- Docusaurus admonition(`:::note` 등)의 지시어는 그대로 두고 내용만 번역한다.
- 영어 병기는 문서당 첫 등장 1회만 한다. 이후에는 한국어만 쓴다.
- 단위·숫자는 원문 형식을 유지한다(예: 8GB, x64).
- 조사(은/는, 이/가, 을/를, 과/와)는 앞 단어의 받침에 맞춘다. 영어 원문 유지 단어 뒤 조사는 실제 발음 기준으로 붙인다(예: "Ignite는", "RAFT 그룹은").
