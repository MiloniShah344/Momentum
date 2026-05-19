/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!url || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env',
      );
    }

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getUserClient(accessToken: string): SupabaseClient {
    const url = this.configService.get<string>('SUPABASE_URL') ?? '';
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY') ?? '';

    return createClient(url, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
