"use client";

import React, { createContext, useContext } from "react";

export const AdminMenuContext = createContext({ openMenu: () => {} });
export const useAdminMenu = () => useContext(AdminMenuContext);
export const useOutletContext = () => useContext(AdminMenuContext);
