// Simple permission map for roles -> allowed frontend components
// Permissions keys match component capability names used in App.js

const PERMISSIONS = {
  Manufacturer: ['registerProduct', 'transferProduct', 'getBatch', 'productList'],
  Distributor: ['transferProduct', 'getBatch', 'productList'],
  Retailer: ['updateStatus', 'transferProduct', 'getBatch', 'productList'],
  Regulator: ['assignRole', 'getBatch', 'productList'],
  Admin: ['assignRole', 'registerProduct', 'transferProduct', 'updateStatus', 'getBatch', 'productList'],
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
