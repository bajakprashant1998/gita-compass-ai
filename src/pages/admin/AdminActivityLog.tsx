import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Tags, BookOpen, Bot } from 'lucide-react';
import { getActivityLog } from '@/lib/adminApi';
import type { AdminActivityLog, ActivityFilters } from '@/types/admin';
import { format } from 'date-fns';

const entityIcons = {
  shlok: FileText,
  problem: Tags,
  chapter: BookOpen,
  ai_rule: Bot,
  language: Bot,
};

const actionColors = {
  create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  publish: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    perPage: 50,
  });

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const { data, count } = await getActivityLog(filters);
        setLogs(data);
        setTotalCount(count);
      } catch (error) {
        console.error('Failed to load activity log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [filters]);

  return (
    <AdminLayout title="Activity Log" subtitle="Track all admin actions">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          value={filters.entity_type || 'all'}
          onValueChange={(value) => setFilters(prev => ({
            ...prev,
            entity_type: value === 'all' ? undefined : value,
            page: 1,
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="shlok">Shloks</SelectItem>
            <SelectItem value="problem">Problems</SelectItem>
            <SelectItem value="chapter">Chapters</SelectItem>
            <SelectItem value="ai_rule">AI Rules</SelectItem>
            <SelectItem value="language">Languages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found
          </div>
        ) : (
          logs.map((log) => {
            const Icon = entityIcons[log.entity_type as keyof typeof entityIcons] || FileText;
            const actionClass = actionColors[log.action as keyof typeof actionColors] || actionColors.update;

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 bg-card border rounded-lg"
              >
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={actionClass}>
                      {log.action}
                    </Badge>
                    <span className="font-medium capitalize">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.entity_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.created_at && format(new Date(log.created_at), 'PPp')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {logs.length < totalCount && (
        <div className="text-center mt-6">
          <button
            className="text-primary hover:underline"
            onClick={() => setFilters(prev => ({ ...prev, perPage: prev.perPage + 50 }))}
          >
            Load more ({totalCount - logs.length} remaining)
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
