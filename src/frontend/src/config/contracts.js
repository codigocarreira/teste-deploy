//Endereços dos contratos.
export const REGISTRY_ADDRESS = "0x4f9dEcef827c087b81371B22a4bB18183ee8555e";
export const VALIDATOR_ADDRESS = "0x652768444416F2D36fD1BA7993dA1AD0D44f0f3F";
export const USER_ACCESS = "0xF6Ce7079a975C304c588185ef4D15C8858A1b68C";

//ABI do contrato AxoloteRecordRegistry.sol
export const REGISTRY_ABI = [
  "function createAxolote(uint256 institutionId) returns (uint256)",
  "function submitRecord(uint256 axoloteId,string ipfsCid) returns (uint256)",
  "function getCurrentApprovedIpfsCid(uint256 axoloteId) view returns (string)",
  "function getRecord(uint256 recordId) view returns (uint256,uint256,uint256,string,uint64,uint8,address,uint64,address,uint64)",
  "event AxoloteCreated(uint256 indexed institutionId, uint256 indexed axoloteId, address indexed createdBy)",
  "event RecordSubmitted(uint256 indexed institutionId, uint256 indexed axoloteId, uint256 indexed recordId, uint256 previousRecordId, uint64 version, address submittedBy, string ipfsCid)",
];

//ABI do contrato AxoloteRecordValidator.sol
export const VALIDATOR_ABI = [
  "function approveRecord(uint256 recordId) returns (uint256)",
  "function rejectRecord(uint256 recordId) returns (uint256)",
  "function recordValidationId(uint256 recordId) view returns (uint256)",
  "function nextValidationId() view returns (uint256)",
];

//ABI do contrato AxoloteAccessManager.sol
export const USER_ACCESS_ABI = [
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function PLATFORM_ADMIN_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function ROLE_ADMIN() view returns (uint8)",
  "function ROLE_OPERATOR() view returns (uint8)",
  "function ROLE_VALIDATOR() view returns (uint8)",
  "function createInstitution(bytes32 parentNode,string displayName,address initialAdmin) returns (uint256)",
  "function institutionByParentNode(bytes32) view returns (uint256)",
  "function institutions(uint256) view returns (bool,bool,bytes32,string,address,uint64)",
  "function nextInstitutionId() view returns (uint256)",
  "function memberships(uint256,address) view returns (bytes32,bytes32,uint8,uint64,uint64)",
  "function isActiveMember(uint256,address) view returns (bool)",
  "function registerAccess(bytes32,bytes32) returns (uint256)",
  "function revalidateAccess(uint256,bytes32)",
  "function grantAdmin(uint256,address)",
  "function grantOperator(uint256,address)",
  "function grantValidator(uint256,address)",
  "function revokeRole(uint256,address,uint8)",
  "function isInstitutionAdmin(uint256,address) view returns (bool)",
  "function isInstitutionOperator(uint256,address) view returns (bool)",
  "function isInstitutionValidator(uint256,address) view returns (bool)",
  "function getRoleBits(uint256,address) view returns (uint8)",
  "function setInstitutionStatus(uint256,bool)",
  "function suspendMember(uint256,address)",
  "function revokeMember(uint256,address)",
];
