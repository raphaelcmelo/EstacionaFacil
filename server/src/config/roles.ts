const allRoles = {
  servidor: ["getServidor", "me"],
  CITIZEN: ["me"],
  managerPontoEletr: ["manageUsers", "me"],
  admin: ["manageUsers", "getUsers", "me"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
