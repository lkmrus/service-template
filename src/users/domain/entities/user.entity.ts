import * as bcrypt from 'bcrypt';

export class User {
  id: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password ?? '');
  }
}
