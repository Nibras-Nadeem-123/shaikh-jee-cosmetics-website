"use client"
import React, { useState, useEffect, useCallback } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Clock,
    RefreshCw,
    Server,
    Shield,
    TrendingUp,
    Users,
    Zap,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { apiService } from "../services/api";

interface SummaryData {
    totalRequests: number;
    totalRateLimited: number;
    uniqueVisitors: number;
    avgResponseTime: number;
    rateLimitRate: string;
    requestChange: number;
    visitorChange: number;
}

interface EndpointStat {
    endpoint: string;
    requests: number;
    rateLimited: number;
    avgResponseTime: number;
    errors: number;
    errorRate: string;
}

interface HourlyStat {
    hour: number;
    date: string;
    requests: number;
    rateLimited: number;
    avgResponseTime: number;
}

interface RateLimitConfig {
    id: string;
    name: string;
    windowMinutes: number;
    maxRequests: number;
    description: string;
}

interface SuspiciousIP {
    ip: string;
    totalRequests: number;
    rateLimited: number;
    endpoints: string[];
    severity: 'low' | 'medium' | 'high';
}

export const RateLimitDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'overview' | 'endpoints' | 'config' | 'security'>('overview');

    // Data states
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [endpointStats, setEndpointStats] = useState<EndpointStat[]>([]);
    const [hourlyStats, setHourlyStats] = useState<HourlyStat[]>([]);
    const [statusCodes, setStatusCodes] = useState<Record<string, number>>({});
    const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfig[]>([]);
    const [suspiciousIPs, setSuspiciousIPs] = useState<SuspiciousIP[]>([]);
    const [realtimeData, setRealtimeData] = useState<{
        requestsPerSecond: number;
        totalRequests: number;
        rateLimited: number;
        avgResponseTime: number;
        activeConnections: number;
    } | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No auth token');

            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all data in parallel
            const [overviewRes, configRes, suspiciousRes, realtimeRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rate-limits/overview`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rate-limits/config`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rate-limits/suspicious`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rate-limits/realtime`, { headers })
            ]);

            if (!overviewRes.ok) throw new Error('Failed to fetch overview data');

            const overview = await overviewRes.json();
            const config = await configRes.json();
            const suspicious = await suspiciousRes.json();
            const realtime = await realtimeRes.json();

            setSummary(overview.data.summary);
            setEndpointStats(overview.data.endpointStats);
            setHourlyStats(overview.data.hourlyStats);
            setStatusCodes(overview.data.statusCodes);
            setRateLimitConfig(config.data.limits);
            setSuspiciousIPs(suspicious.data.suspicious);
            setRealtimeData(realtime.data);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getEndpointColor = (endpoint: string) => {
        const colors: Record<string, string> = {
            'auth': 'bg-purple-100 text-purple-700',
            'api': 'bg-blue-100 text-blue-700',
            'order': 'bg-green-100 text-green-700',
            'payment': 'bg-amber-100 text-amber-700',
            'search': 'bg-cyan-100 text-cyan-700',
            'admin': 'bg-red-100 text-red-700',
            'review': 'bg-pink-100 text-pink-700',
            'global': 'bg-gray-100 text-gray-700'
        };
        return colors[endpoint] || 'bg-gray-100 text-gray-700';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <AlertCircle className="mx-auto mb-2 text-red-500" size={32} />
                <p className="text-red-700 font-medium">Error loading dashboard: {error}</p>
                <button onClick={handleRefresh} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    const maxHourlyRequests = Math.max(...hourlyStats.map(h => h.requests), 1);

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="text-primary" size={20} />
                        <span className="hidden sm:inline">API Rate Limit Dashboard</span>
                        <span className="sm:hidden">API Monitor</span>
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">Monitor API usage patterns and rate limiting</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} size={14} />
                    Refresh
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'endpoints', label: 'Endpoints', icon: Server },
                    { id: 'config', label: 'Configuration', icon: Zap },
                    { id: 'security', label: 'Security', icon: AlertTriangle }
                ].map(view => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                            activeView === view.id
                                ? 'bg-primary text-white'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        <view.icon size={14} />
                        {view.label}
                    </button>
                ))}
            </div>

            {/* Overview View */}
            {activeView === 'overview' && (
                <div className="space-y-6">
                    {/* Real-time Stats */}
                    {realtimeData && (
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/20">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <Activity className="text-primary animate-pulse" size={16} />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">Live Stats (Last 5 min)</span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                                <div className="text-center">
                                    <p className="text-lg sm:text-2xl font-bold text-primary">{realtimeData.requestsPerSecond}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">req/sec</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg sm:text-2xl font-bold">{realtimeData.totalRequests}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">requests</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg sm:text-2xl font-bold text-amber-600">{realtimeData.rateLimited}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">limited</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-lg sm:text-2xl font-bold">{realtimeData.avgResponseTime}ms</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">avg response</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className="text-lg sm:text-2xl font-bold text-green-600">{realtimeData.activeConnections}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">active IPs</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <Server className="text-blue-500" size={18} />
                                <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                                    (summary?.requestChange || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {(summary?.requestChange || 0) >= 0 ? '+' : ''}{summary?.requestChange || 0}%
                                </span>
                            </div>
                            <p className="text-xl sm:text-3xl font-bold">{summary?.totalRequests?.toLocaleString() || 0}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Requests</p>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <AlertTriangle className="text-amber-500" size={18} />
                                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-700">
                                    {summary?.rateLimitRate || 0}%
                                </span>
                            </div>
                            <p className="text-xl sm:text-3xl font-bold text-amber-600">{summary?.totalRateLimited || 0}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Rate Limited</p>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <Users className="text-green-500" size={18} />
                                <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                                    (summary?.visitorChange || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {(summary?.visitorChange || 0) >= 0 ? '+' : ''}{summary?.visitorChange || 0}%
                                </span>
                            </div>
                            <p className="text-xl sm:text-3xl font-bold">{summary?.uniqueVisitors || 0}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Unique Visitors</p>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <Clock className="text-purple-500" size={18} />
                            </div>
                            <p className="text-xl sm:text-3xl font-bold">{summary?.avgResponseTime || 0}ms</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Response</p>
                        </div>
                    </div>

                    {/* Status Code Breakdown */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Status Code Distribution</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                                <CheckCircle className="mx-auto mb-1 sm:mb-2 text-green-600" size={20} />
                                <p className="text-xl sm:text-2xl font-bold text-green-600">{statusCodes['2xx'] || 0}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">2xx Success</p>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                                <TrendingUp className="mx-auto mb-1 sm:mb-2 text-blue-600" size={20} />
                                <p className="text-xl sm:text-2xl font-bold text-blue-600">{statusCodes['3xx'] || 0}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">3xx Redirect</p>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-xl">
                                <AlertCircle className="mx-auto mb-1 sm:mb-2 text-amber-600" size={20} />
                                <p className="text-xl sm:text-2xl font-bold text-amber-600">{statusCodes['4xx'] || 0}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">4xx Client Error</p>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-xl">
                                <XCircle className="mx-auto mb-1 sm:mb-2 text-red-600" size={20} />
                                <p className="text-xl sm:text-2xl font-bold text-red-600">{statusCodes['5xx'] || 0}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">5xx Server Error</p>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Traffic Chart */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Traffic (Last 24 Hours)</h3>
                        <div className="flex items-end gap-0.5 sm:gap-1 h-28 sm:h-40 overflow-x-auto">
                            {hourlyStats.map((stat, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
                                        style={{ height: `${(stat.requests / maxHourlyRequests) * 100}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {stat.requests} requests
                                            {stat.rateLimited > 0 && <span className="text-amber-300"> ({stat.rateLimited} limited)</span>}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{stat.hour}h</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Endpoints View */}
            {activeView === 'endpoints' && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Endpoint Statistics (24h)</h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                                    <th className="py-3 text-left">Endpoint</th>
                                    <th className="py-3 text-right">Requests</th>
                                    <th className="py-3 text-right">Rate Limited</th>
                                    <th className="py-3 text-right">Errors</th>
                                    <th className="py-3 text-right">Avg Response</th>
                                    <th className="py-3 text-right">Error Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {endpointStats.map((stat, idx) => (
                                    <tr key={idx} className="border-b border-muted/50 hover:bg-muted/20 transition-colors">
                                        <td className="py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getEndpointColor(stat.endpoint)}`}>
                                                {stat.endpoint}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-bold">{stat.requests.toLocaleString()}</td>
                                        <td className="py-3 text-right">
                                            <span className={stat.rateLimited > 0 ? 'text-amber-600 font-bold' : ''}>
                                                {stat.rateLimited}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={stat.errors > 0 ? 'text-red-600 font-bold' : ''}>
                                                {stat.errors}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">{stat.avgResponseTime}ms</td>
                                        <td className="py-3 text-right">
                                            <span className={parseFloat(stat.errorRate) > 5 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                                {stat.errorRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Configuration View */}
            {activeView === 'config' && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">Rate Limit Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {rateLimitConfig.map((config) => (
                            <div key={config.id} className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold">{config.name}</span>
                                    <Zap className="text-primary" size={16} />
                                </div>
                                <p className="text-2xl font-bold text-primary">{config.maxRequests}</p>
                                <p className="text-xs text-muted-foreground">requests per {config.windowMinutes} min</p>
                                <div className="mt-3 pt-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground">{config.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Security View */}
            {activeView === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={16} />
                            Suspicious Activity (24h)
                        </h3>
                        {suspiciousIPs.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                <CheckCircle className="mx-auto mb-2 text-green-500" size={28} />
                                <p className="font-medium text-sm">No suspicious activity detected</p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {suspiciousIPs.map((ip, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border ${getSeverityColor(ip.severity)}`}>
                                                {ip.severity}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-mono font-bold text-sm truncate">{ip.ip}</p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                                    Endpoints: {ip.endpoints.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right pl-12 sm:pl-0">
                                            <p className="font-bold text-sm">{ip.totalRequests.toLocaleString()} requests</p>
                                            <p className="text-[10px] sm:text-xs text-amber-600">{ip.rateLimited} rate limited</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateLimitDashboard;
