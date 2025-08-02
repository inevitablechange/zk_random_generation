# zk 랜덤 번호 생성기

이 프로젝트는 Noir 회로, Barretenberg/Honk 증명 시스템, Solidity 스마트 컨트랙트를 활용한 영지식(ZK) 기반의 검증 가능한 랜덤 추첨기 전체 스택 예제입니다. 사용자는 후보자 목록과 시드를 입력해, 추첨 결과가 온체인에서 공정하게 검증될 수 있도록 ZK 증명을 생성할 수 있습니다. 이 과정에서 시드나 전체 후보자 목록은 공개되지 않습니다.

## 주요 기능

- **ZK 랜덤 추첨**: Noir 회로 내부에서 Poseidon2 기반 Fisher-Yates 알고리즘으로 후보를 결정론적으로 셔플 및 추첨합니다.
- **증명 생성**: 사용자 입력(시드, 후보자 목록)에 따라 올바르게 추첨이 이루어졌음을 증명하는 ZK 증명을 생성합니다.
- **온체인 검증**: Solidity 검증 컨트랙트를 통해 누구나 이 증명의 유효성을 이더리움 등 블록체인에서 검증할 수 있습니다.
- **React 프론트엔드**: 후보자 입력, 시드 입력, 증명 생성/검증을 위한 직관적인 UI 제공
- **MetaMask 연동**: 필요시 온체인 검증을 위해 MetaMask 연결 가능

## 프로젝트 구조

```
zk_random_number_generator/
├── circuit/    # Noir 회로 및 증명 생성 스크립트
│   ├── src/main.nr      # 메인 Noir 회로
│   ├── build.sh         # 회로 빌드/생성 스크립트
│   └── ...
├── contract/  # Solidity 검증 컨트랙트 (자동 생성)
│   ├── src/Verifier.sol # Solidity 검증 컨트랙트
│   ├── compile.sh       # 컴파일 및 ABI 프론트엔드로 복사
│   └── ...
├── client/    # React + TypeScript 프론트엔드
│   ├── src/zk/generateProof.ts # ZK 증명 로직
│   ├── src/App.tsx      # 메인 UI 로직
│   └── ...
└── README.md  # 프로젝트 개요 (본 파일)
```

## 동작 원리

1. **입력**: 후보자 목록과 비밀 시드를 입력합니다.
2. **증명 생성**: Noir 회로가 후보를 셔플 및 추첨하고, Barretenberg/Honk를 통해 ZK 증명을 생성합니다(클라이언트에서 실행).
3. **검증**: 생성된 증명은 브라우저(로컬) 또는 Solidity 컨트랙트를 통해 온체인에서 검증할 수 있습니다.

## 시작하기

### 필요 환경

- Node.js (프론트엔드)
- Yarn 또는 npm
- [Foundry](https://book.getfoundry.sh/) (Solidity 컨트랙트)
- [Nargo](https://noir-lang.org/docs/getting_started/nargo/installation.html) (Noir 회로)
- [Barretenberg CLI](https://github.com/AztecProtocol/barretenberg) (회로 검증/증명 생성)

### 빌드 순서

#### 1. 회로

```bash
cd circuit
./build.sh
```

- Noir 회로 컴파일
- 증명/검증 키 생성
- Solidity 검증 컨트랙트 및 circuit.json 프론트엔드로 출력

#### 2. 컨트랙트

```bash
cd contract
./compile.sh
```

- Solidity 검증 컨트랙트 컴파일
- ABI를 프론트엔드로 복사

#### 3. 프론트엔드

```bash
cd client
npm install
npm run dev
```

- React 앱 로컬 실행

## 사용법

1. 후보자 이름과 비밀 시드를 입력하세요.
2. "Generate Proof" 버튼을 클릭하면 무작위 당첨자와 ZK 증명이 생성됩니다.
3. 필요하다면 MetaMask를 연결해 온체인에서 증명을 검증할 수 있습니다.

## 기술 스택

- **Noir**: 무작위 추첨을 위한 ZK 회로 언어
- **Barretenberg/Honk**: ZK 증명 시스템
- **Solidity**: 온체인 검증 컨트랙트
- **React + TypeScript + Vite**: 프론트엔드

## 참고 자료

- [Noir 공식 문서](https://noir-lang.org/)
- [Barretenberg](https://github.com/AztecProtocol/barretenberg)
- [Foundry](https://github.com/foundry-rs/foundry)

## 라이선스

MIT
