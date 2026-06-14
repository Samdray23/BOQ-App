import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import { Loading } from '@/components/common/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Phone, Globe, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: users, isLoading, error, refetch, isRefetching } = useQuery<UserData[]>({
    queryKey: ['usersList'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-destructive font-semibold">Failed to fetch dashboard data.</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">System Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Logged in as <span className="font-semibold text-foreground">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          isLoading={isRefetching}
          variant="outline"
          leftIcon={!isRefetching && <RefreshCw className="h-4 w-4" />}
          size="sm"
        >
          Refresh Data
        </Button>
      </div>

      <Card className="border border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-lg font-bold">Access Node Secured</CardTitle>
            <CardDescription className="text-xs">
              Role credentials: <span className="font-semibold">{user?.role}</span>. Secure communication active.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Active Remote Clients
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.slice(0, 6).map((item) => (
            <Card key={item.id} className="hover:border-primary/25 transition-all duration-300">
              <CardHeader className="pb-3 border-b border-border bg-card/30">
                <CardTitle className="text-base font-bold">{item.name}</CardTitle>
                <CardDescription className="text-xs truncate font-mono text-muted-foreground">
                  {item.company.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                  <span>{item.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary/70 shrink-0" />
                  <a
                    href={`https://${item.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary/95 font-medium"
                  >
                    {item.website}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
