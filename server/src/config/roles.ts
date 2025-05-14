const allRoles = {
  servidor: ["getServidor"],
  cidadao: [],
  managerPontoEletr: ["manageUsers"],
  admin: ["manageUsers", "getUsers"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
