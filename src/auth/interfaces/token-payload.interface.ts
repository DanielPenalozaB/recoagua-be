import { UserRole } from "src/users/enums/user-role.enum";

export interface TokenPayload {
  sub: number;
  email: string;
  name: string;
  role: UserRole;
  cityId?: number;
}
