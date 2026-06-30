import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Competition, CreateCompetitionDto } from '../models/competition.model';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  constructor(private supabase: SupabaseService) {}

  getAll(): Observable<Competition[]> {
    return from(
      this.supabase.from()('competitions')
        .select('*')
        .order('start_date', { ascending: false })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      })
    );
  }

  getById(id: string): Observable<Competition | null> {
    return from(
      this.supabase.from()('competitions')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  create(dto: CreateCompetitionDto): Observable<Competition> {
    return from(
      this.supabase.from()('competitions')
        .insert(dto)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }
}
