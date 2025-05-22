const allRoles = {
  servidor: ["getServidor", "me", "manageUsers", "getUsers"],
  CITIZEN: ["me"],
  FISCAL: ["me", "checkPermissao"],
  MANAGER: ["me", "checkPermissao", "manageUsers", "getUsers"],
  ADMIN: ["me", "checkPermissao", "manageUsers", "getUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
