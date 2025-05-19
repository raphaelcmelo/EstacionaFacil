const allRoles = {
  servidor: ["getServidor", "me", "manageUsers", "getUsers"],
  CITIZEN: ["me"],
  FISCAL: ["me"],
  MANAGER: ["me", "manageUsers", "getUsers"],
  ADMIN: ["me", "manageUsers", "getUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
