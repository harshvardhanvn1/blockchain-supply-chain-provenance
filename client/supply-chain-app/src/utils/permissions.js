// Permission map for roles -> allowed frontend components
// UI shows forms based on role, but smart contract enforces actual permissions

const PERMISSIONS = {
  // Manufacturer: Can register products and transfer ownership
  Manufacturer: ['registerProduct', 'transferProduct', 'updateStatus', 'getBatch', 'productList'],
  
  // Distributor: Can transfer and update status
  Distributor: ['transferProduct', 'updateStatus', 'getBatch', 'productList'],
  
  // Retailer: Can transfer and update status (especially mark as Delivered)
  Retailer: ['transferProduct', 'updateStatus', 'getBatch', 'productList'],
  
  // Regulator: Can see EVERYTHING for auditing/oversight (including assign roles)
  Regulator: ['assignRole', 'registerProduct', 'transferProduct', 'updateStatus', 'getBatch', 'productList'],
  
  // Admin: Same as Regulator - full access
  Admin: ['assignRole', 'registerProduct', 'transferProduct', 'updateStatus', 'getBatch', 'productList'],
  
  // None/Consumer: Can only view
  None: ['getBatch', 'productList'],
};

export function getPermissionsForRole(roleName) {
  return PERMISSIONS[roleName] || PERMISSIONS['None'];
}

export function hasPermission(roleName, permissionKey) {
  const perms = getPermissionsForRole(roleName);
  return perms.includes(permissionKey);
}

export default PERMISSIONS;