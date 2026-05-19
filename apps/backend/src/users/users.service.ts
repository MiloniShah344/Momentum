import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(data: {
    id: string;
    email: string;
    display_name?: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      id: data.id,
      email: data.email,
      display_name: data.display_name || '',
      onboarding_complete: false,
    });
    return this.usersRepository.save(user);
  }

  async findOrCreate(data: {
    id: string;
    email: string;
    display_name?: string;
  }): Promise<User> {
    const existing = await this.findById(data.id);
    if (existing) return existing;
    return this.create(data);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }
}
