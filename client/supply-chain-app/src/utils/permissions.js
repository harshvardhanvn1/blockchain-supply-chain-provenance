// Permission map based on ACTUAL smart contract enforcement
// Contract enforces: Manufacturer can register, Owner can transfer/update

const PERMISSIONS = {
  // Manufacturer: Can register products + transfer/update what they own
  Manufacturer: ['registerProduct', 'transferProduct', 'updateStatus', 'productList', 'statusHistory'],
  
  // Distributor: Can transfer/update products they own
  Distributor: ['transferProduct', 'updateStatus', 'productList', 'statusHistory'],
  
  // Retailer: Can transfer/update products they own (mark as Delivered)
  Retailer: ['transferProduct', 'updateStatus', 'productList', 'statusHistory'],
  
  // Regulator: Can view everything for auditing
  Regulator: ['productList', 'statusHistory'],
  
  // None/Consumer: Can only view products
  None: ['productList'],
};

export function getPermissionsForRole(roleName) {
  return PERMISSIONS[roleName] || PERMISSIONS['None'];
}

export function hasPermission(roleName, permissionKey) {
  const perms = getPermissionsForRole(roleName);
  return perms.includes(permissionKey);
}

export default PERMISSIONS;