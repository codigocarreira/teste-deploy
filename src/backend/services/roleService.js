const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const loginENSAddressContract = "0xF6Ce7079a975C304c588185ef4D15C8858A1b68C";

const abi = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function PLATFORM_ADMIN_ROLE() view returns (bytes32)",
  "function isInstitutionAdmin(uint256,address) view returns (bool)",
  "function isInstitutionOperator(uint256,address) view returns (bool)",
  "function isInstitutionValidator(uint256,address) view returns (bool)"
];

const login = new ethers.Contract(
  loginENSAddressContract,
  abi,
  provider
);

async function getRoles(address, institutionId = 0) {
  try {
    const userAddress = ethers.getAddress(address);

    const PLATFORM_ADMIN_ROLE = await login.PLATFORM_ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await login.DEFAULT_ADMIN_ROLE();

    const [admin, superadmin] = await Promise.all([
      login.hasRole(DEFAULT_ADMIN_ROLE, userAddress),
      login.hasRole(PLATFORM_ADMIN_ROLE, userAddress)
    ]);

    const roles = [];

    if (admin) roles.push("ADMIN");
    if (superadmin) roles.push("PLATFORM_ADMIN");

    if (institutionId !== 0) {
      const [operator, validator] = await Promise.all([
        login.isInstitutionOperator(institutionId, userAddress),
        login.isInstitutionValidator(institutionId, userAddress)
      ]);

      if (operator) roles.push("OPERATOR");
      if (validator) roles.push("VALIDATOR");
    }

    return roles;
  } catch (err) {
    console.error("roleService error:", err);
    return [];
  }
}

module.exports = { getRoles };