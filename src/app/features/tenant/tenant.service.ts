import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TenantStatsApi {
  tenantId: string;
  globalPassRate: number;
  averageScorePerMonth: number;
  hardestCategories: Record<string, number>;
  studentPerformanceRanking: Record<string, number>;
}

export interface PaymentStatsApi {
  totalRevenue: number;
  numberOfPayments: number;
  averagePayment: number;
  studentsFullyPaid: number;
}

export interface UpcomingExam {
  id: string;
  studentName: string;
  date: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  constructor(private http: HttpClient) {}

  getTenantStats(): Observable<TenantStatsApi> {
    return this.http.get<TenantStatsApi>(`${environment.apiUrl}/stats/tenant`);
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/students`);
  }

  getMonitors(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/monitors`);
  }

  getUpcomingExams(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/exams/upcoming`);
  }

  getPaymentStats(): Observable<PaymentStatsApi> {
    return this.http.get<PaymentStatsApi>(`${environment.apiUrl}/admin/payments/stats`);
  }
}
