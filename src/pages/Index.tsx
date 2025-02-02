import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Calendar, CheckCircle } from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "156",
    icon: Users,
    color: "bg-primary",
  },
  {
    title: "Active Events",
    value: "12",
    icon: Calendar,
    color: "bg-secondary",
  },
  {
    title: "Completed Trainings",
    value: "1,234",
    icon: CheckCircle,
    color: "bg-tertiary",
  },
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to AS3 Driver Training</h1>
          <p className="text-muted-foreground">
            Manage your training programs and users from one place
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Index;