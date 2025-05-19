const allRoles = {
  servidor: ["getServidor", "me", "manageUsers", "getUsers"],
  CITIZEN: ["me"],
  managerPontoEletr: ["manageUsers", "me", "getUsers"],
  admin: ["manageUsers", "getUsers", "me"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
