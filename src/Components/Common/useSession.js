// useSession.js
import { useMemo } from "react";

export const useSession = () => {
  const role = sessionStorage.getItem("role") || "staff";
  const email = sessionStorage.getItem("email") || "staff@gmail.com";
  const branchCode = sessionStorage.getItem("branchCode") || "BCH989";
  const instituteEmail = sessionStorage.getItem("instituteEmail") || "rushabhshete188@gmail.com";

  return useMemo(() => ({ role, email, branchCode,instituteEmail }), [role, email, branchCode,instituteEmail]);
};
