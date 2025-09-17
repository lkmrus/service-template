import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '../config/config';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(@Inject(ConfigService) configService: ConfigService<AppConfig>) {
    const url = configService.get<string>('supabaseUrl');
    const key = configService.get<string>('supabaseServiceRoleKey');

    if (!url || !key) {
      throw new Error(
        'Supabase configuration is missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)',
      );
    }

    this.client = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
